import config from './config';
import * as sortUsers from './sortUsers';

let cache = {};

const realPromiseWrap = (p) => (
    new Promise((resolve, reject) => p.then(resolve, reject))
);

let cachedJsonp = (url, params) => {
      let hashParams = JSON.stringify(params);
      let v = cache[url + hashParams];
      if (v) {
          //console.log("using cached value for " + url + " " + hashParams);
          return Promise.resolve(JSON.parse(v));
      } else {
          return realPromiseWrap(jQuery.ajax(url + "?callback=?", { dataType: "jsonp", data: params })).then(r => {
              cache[url + hashParams] = JSON.stringify(r);
              return r;
          });
      }
};

let wsgroupsJsonp = (name, params) => (
    cachedJsonp(config.wsgroupsURL + name, params)
);

// if you users for role XX have same gender, we can use "supannRoleGenerique" name
// otherwise we fallback on non-gendered name
const group_roles_handle_gender = (roles, opts) => {
  const to_name = (all, gendered) => opts.prefer_short_name && all[gendered ? 'name-gender-short' : 'name-short'] || all[gendered ? 'name-gender' : 'name']
  const to_category = (all) => (all.weight || '') + ':' + to_name(all)
  let c2gname = {}
  for (const user of roles) {
    for (const all of user['supannRoleGenerique-all']) {
      const gender_name = to_name(all, 'gendered');
      const category = to_category(all)
      if (c2gname[category] && c2gname[category] !== gender_name) {
        c2gname[category] = to_name(all) // fallback on non-gendered name
      } else {
        c2gname[category] = gender_name;
      }
    }
  }
  // c2gname is computed, set all names to the computed values
  for (const user of roles) {
    user.supannRoleGenerique = user['supannRoleGenerique-all'].map(all => c2gname[to_category(all)])
  }
}

export const group_roles_remove_supannListeRouge_and_handle_gender = (group, opts = {}) => {
    if (group.roles) {
      group.roles = group.roles.filter(u => u.uid !== "supannListeRouge");
      group_roles_handle_gender(group.roles, opts);
    }
    return group;
};

export const simple_structureKey = (key) => (
    key.replace(/^structures-/, '')
)

export let getGroupFromStruct = (affectation) => (
    wsgroupsJsonp("/getGroup", {
        CAS: config.connected,
        key: "structures-" + affectation,
        with_organization: true,
        attrs: 'roles,roles.supannRoleGenerique-all',
    }).then(group_roles_remove_supannListeRouge_and_handle_gender)
);

export let getRoleGenerique = (role) => (
    wsgroupsJsonp("/search", { token: role, kinds: 'supannRoleGenerique', maxRows: 1 }).then(r => r.supannRoleGenerique[0])
);

export let getActivite = (key) => (
    wsgroupsJsonp("/search", { token: key, kinds: 'supannActivite', maxRows: 1 }).then(r => r.supannActivite[0])
);

export let searchPersons = (wsparams) => (
    wsgroupsJsonp("/searchUser", wsparams).then(persons => (
      persons.map(p => {
          p.supannListeRouge = p.supannCivilite === 'supannListeRouge';
          if (p.supannListeRouge) {
            p = { supannListeRouge: true };
          }
          p = sortUsers.sortRoles(p);
          return p;
      })
    ))
);

export const searchPerson = (wsparams) => (
    searchPersons({ maxRows: 1, ...wsparams }).then(persons => persons[0])
)

//exemple url https://wsgroups.univ-paris1.fr/getSuperGroups?key=structures-DGHA&depth=10
export let parentGroups = (pkey) => (
    wsgroupsJsonp("/getSuperGroups", pkey)
);

export let getSubGroups = (wsparams) => (
    wsgroupsJsonp("/getSubGroups", wsparams)
);

export let getSubAndSuperGroups = (wsparams) => (
    wsgroupsJsonp("/getSubAndSuperGroups", wsparams)
);

export const getSubAndSuperStructures = (key) => (
    getSubAndSuperGroups({
        CAS: config.connected,
        key: 'structures-' + key,
        depth: 9,
        filter_category: 'structures',
        with_organization: true,
    })
  );
  
export const getSubStructures = (key) => (
  getSubGroups({
      CAS: config.connected,
      key: 'structures-' + key,
      depth: 9,
      filter_category: 'structures',
      with_organization: true,
      attrs: 'roles,roles.supannRoleGenerique-all',
  })
);

export const getSubAndSuperStructuresFlat = async (key) => {
  let { subGroups, superGroups } = await getSubAndSuperStructures(key)
  let r = getAllSubStructures({ key, subGroups })
  for (key in superGroups) {
      r[simple_structureKey(key)] = true
  }
  return r
}
export const getManySubAndSuperStructuresFlat = async (keys) => (
    Object.assign({}, ...await Promise.all(keys.map(getSubAndSuperStructuresFlat)))
)

export const getAllSubStructures = (tree) => {
  let r = {};
  function getSubs(tree) {
    r[simple_structureKey(tree.key)] = true;
    (tree.subGroups || []).forEach(getSubs);
  }
  getSubs(tree);
  return r;
}

export let getDiploma = (diploma) => (
    wsgroupsJsonp("/searchGroup", {filter_category:'diploma', token: diploma, maxRows: 1 }).then(l => l && l[0])
);

export const getQueryO = async (query) => ({
  query,
  affectation: query.affectation && await getGroupFromStruct(query.affectation),
  site: query.site && await getGroupFromStruct(query.site),
  role: query.role && await getRoleGenerique(query.role),
  activite: query.activite && await getActivite(query.activite),
  diploma: query.diploma && await getDiploma(query.diploma),
});

export function compute_wsparams_user_many_filters(queryO) {
    const { affiliation, affectation, diploma, site, role, activite } = queryO.query;
    let wsparams = {};

    wsparams.filter_mail = '*';
    wsparams.filter_eduPersonAffiliation = affiliation || !config.connected && config.usefulAffiliations.join('|') || undefined;

    if (role) {
        wsparams.filter_supannRoleGenerique = role;
    }

    if (site) {
        wsparams.filter_buildingName = queryO.site.name;
    }

    if (activite) {
        if (activite.match(/^\{UAI:0751717J:ACT\}/)) {
            wsparams.filter_description = queryO.activite.name;
        } else {
            wsparams.filter_supannActivite = queryO.activite.key;
        }
    }

    if (diploma) {
        wsparams.filter_member_of_group = "diploma-" + diploma;
        return [wsparams];
    } else if (affectation){
      if (affiliation === 'student' || affiliation === 'alum') {
          wsparams.filter_supannEntiteAffectation = affectation;
          return [wsparams];
      } else {
        const group = queryO.affectation;

        return [
          { ...wsparams, filter_member_of_group: "groups-employees." + group.businessCategory + "." + affectation },
          { ...wsparams, filter_uid: group.roles.map(u => u.uid).join('|') },
        ]
      }
    } else {
        return [wsparams];
    }
}

export const compute_wsparams_user_filters = (queryO) => (
  compute_wsparams_user_many_filters(queryO)[0]
)

export const OrgChart = {
  getMembers(query, affectation) {
    if (!config.connected && !query.token || !affectation) {
        return Promise.resolve([]);
    }
    return searchPersons({
        CAS: config.connected,
        token: query.token,
        filter_eduPersonPrimaryAffiliation: query.affiliation || 'teacher|researcher|staff|emeritus',
        filter_not_employeeType: 'Personnel en activité ponctuelle',
        filter_supannEntiteAffectation: affectation,
        profile_supannEntiteAffectation: affectation,
        attrs: 'uid,displayName,mail,info,description,eduPersonPrimaryAffiliation,supannCivilite,employeeType,supannActivite-all',
    }).then(persons => persons.filter(u => !u.supannListeRouge));
  },
};
