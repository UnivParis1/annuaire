import config from './config';

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

export const group_roles_remove_supannListeRouge = group => {
    if (group.roles) group.roles = group.roles.filter(u => u.uid !== "supannListeRouge");
    return group;   
};

export let getGroupFromStruct = (affectation) => (
    wsgroupsJsonp("/getGroup", { key: "structures-" + affectation, with_organization: true }).then(group_roles_remove_supannListeRouge)
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

export let getDiploma = (diploma) => (
    wsgroupsJsonp("/searchGroup", {filter_category:'diploma', token: diploma, maxRows: 1 }).then(l => l && l[0])
);

export async function compute_wsparams_user_filters ({ affiliation, affectation, diploma, role, activite }) {
    let wsparams = {};

    wsparams.filter_mail = '*';
    wsparams.filter_eduPersonAffiliation = affiliation;

    if (role) {
        wsparams.filter_supannRoleGenerique = role;
    }

    if (activite && activite.match(/^\{UAI:0751717J:ACT\}/)) {
        wsparams.filter_description = (await getActivite(activite)).name;
    }

    if (diploma) {
        wsparams.filter_member_of_group = "diploma-" + diploma;
        return wsparams;
    } else if (affectation){
      if (affiliation === 'student' || affiliation === 'alum') {
          wsparams.filter_supannEntiteAffectation = affectation;
          return wsparams;
      } else {
        const group = await getGroupFromStruct(affectation);
        wsparams.filter_member_of_group = "groups-employees." + group.businessCategory + "." + affectation;
        return wsparams;
      }
    } else {
        return wsparams;
    }
};

export const OrgChart = {
  getMembers(query, affectation) {
    if (!config.connected && !query.token || !affectation) {
        return Promise.resolve([]);
    }
    return searchPersons({
        CAS: config.connected,
        token: query.token,
        filter_eduPersonPrimaryAffiliation: query.affiliation || 'teacher|researcher|staff',
        filter_supannEntiteAffectation: affectation, attrs: 'uid,displayName,mail,info,description,eduPersonPrimaryAffiliation,employeeType,supannActivite-all',
    }).then(persons => persons.filter(u => !u.supannListeRouge));
  },
};
