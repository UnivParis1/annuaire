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

export let getGroupFromStruct = (affectation) => (
    wsgroupsJsonp("/getGroup", { key: "structures-" + affectation, with_organization: true })
);

export let getRoleGenerique = (role) => (
    wsgroupsJsonp("/search", { token: role, kinds: 'supannRoleGenerique', maxRows: 1 }).then(r => r.supannRoleGenerique[0])
);

export let searchPersons = (wsparams) => (
    wsgroupsJsonp("/searchUser", wsparams)
);

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

export let compute_wsparams_user_filters = ({ affiliation, affectation, diploma, role }) => {
    let wsparams = {};

    wsparams.filter_eduPersonAffiliation = affiliation;

    if (role) {
        wsparams.filter_supannRoleGenerique = role;
    }

    if (diploma) {
        wsparams.filter_member_of_group = "diploma-" + diploma;
        return Promise.resolve(wsparams);
    } else if (affectation){
      if (affiliation === 'student' || affiliation === 'alum') {
          wsparams.filter_supannEntiteAffectation = affectation;
          return Promise.resolve(wsparams);
      } else {
        return getGroupFromStruct(affectation).then(group => {
            wsparams.filter_member_of_group = "groups-employees." + group.businessCategory + "." + affectation;
            return wsparams;
        });
      }
    } else {
        return Promise.resolve(wsparams);
    }
};

export const OrgChart = {
  getMembers(query, affectation) {
    if (!query.connected && !query.token || !affectation) {
        return Promise.resolve([]);
    }
    return searchPersons({
        CAS: query.connected,
        token: query.token,
        filter_eduPersonPrimaryAffiliation: query.affiliation || 'teacher|researcher|staff',
        filter_supannEntiteAffectation: affectation, attrs: 'uid,displayName,mail,info,eduPersonPrimaryAffiliation',
    });
  },
};
