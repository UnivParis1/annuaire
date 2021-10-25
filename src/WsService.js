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
const group_roles_handle_gender = (roles) => {
  let code2name = {}
  for (const user of roles) {
    for (const all of user['supannRoleGenerique-all']) {
      const gender_name = all['name-gender'];
      if (code2name[all.code] && code2name[all.code] !== gender_name) {
        code2name[all.code] = all.name // fallback on non-gendered name
      } else {
        code2name[all.code] = gender_name;
      }
    }
  }
  // code2name is computed, set all names to the computed values
  for (const user of roles) {
    user.supannRoleGenerique = user['supannRoleGenerique-all'].map(({code}) => code2name[code])
  }
}

export const group_roles_remove_supannListeRouge_and_handle_gender = group => {
    if (group.roles) {
      group.roles = group.roles.filter(u => u.uid !== "supannListeRouge");
      group_roles_handle_gender(group.roles);
    }
    return group;
};

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

export const getSubStructuresFlat = (key) => (
  getSubStructures(key).then(l => getAllSubStructures({ key, subGroups: l }))
)

export const getAllSubStructures = (tree) => {
  let r = {};
  function getSubs(tree) {
    r[tree.key.replace(/^structures-/, '')] = true;
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
  role: query.role && await getRoleGenerique(query.role),
  activite: query.activite && await getActivite(query.activite),
  diploma: query.diploma && await getDiploma(query.diploma),
});

export function compute_wsparams_user_many_filters(queryO) {
    const { affiliation, affectation, diploma, role, activite } = queryO.query;
    let wsparams = {};

    wsparams.filter_mail = '*';
    wsparams.filter_eduPersonAffiliation = affiliation || !config.connected && config.usefulAffiliations.join('|') || undefined;

    if (role) {
        wsparams.filter_supannRoleGenerique = role;
    }

    if (activite && activite.match(/^\{UAI:0751717J:ACT\}/)) {
        wsparams.filter_description = queryO.activite.name;
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
        filter_eduPersonPrimaryAffiliation: query.affiliation || 'teacher|researcher|staff',
        filter_not_employeeType: 'Personnel en activité ponctuelle',
        filter_supannEntiteAffectation: affectation,
        profile_supannEntiteAffectation: affectation,
        attrs: 'uid,displayName,mail,info,description,eduPersonPrimaryAffiliation,employeeType,supannActivite-all',
    }).then(persons => persons.filter(u => !u.supannListeRouge));
  },
};
