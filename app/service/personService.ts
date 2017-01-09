import { wsparams, filters } from "../types";
import Person from "../service/person";

export default class PersonService {
  constructor(private $http: angular.IHttpService, private $q) {
  }

  // rechercher les données d'une personne
  private static searchPersonsUrl = "https://wsgroups.univ-paris1.fr/searchUser?&callback=JSON_CALLBACK";
  //Fil ariane
  //private static searchGroupUrl="https://wsgroups.univ-paris1.fr/getSuperGroups?key=groups-employees.administration.DGHA&depth=44&callback=JSON_CALLBACK";
  private static searchCrumbUrl="https://wsgroups.univ-paris1.fr/getSuperGroups?&callback=JSON_CALLBACK";
  // Rechercher businessCategory d'une structure
  private static getGroup="https://wsgroups.univ-paris1.fr/getGroup?&callback=JSON_CALLBACK";
  //private static searchBusinessCategFromStruct="https://wsgroups.univ-paris1.fr/getGroup?key=structures-DGH";
  private static getDiplomaLib="https://wsgroups-test.univ-paris1.fr/searchGroup?&callback=JSON_CALLBACK";
  //private static getDiplomaLib="https://wsgroups-test.univ-paris1.fr/searchGroup?maxRows=20&filter_category=diploma&token=U6CU01";

  private cache = {};

  cachedJsonp = (url, params) => {
      let hashParams = JSON.stringify(params);
      let v = this.cache[url + hashParams];
      if (v) {
          //console.log("using cached value for " + url + " " + hashParams);
          return this.$q.resolve(v);
      } else {
          return this.$http.jsonp(url, { params }).then(r => {
              this.cache[url + hashParams] = r.data;
              return r.data
          });
      }
  };

  getGroupFromStruct = (affectation: string)  : angular.IPromise<string[]> => {
    //debugger;
    return this.getGroup("structures-" + affectation).then(
      (g) => g,
      (errfunction) => undefined
    );
  };

  searchPersons = (wsparams : wsparams) : angular.IPromise<Array<Person>> => {
    //console.log(ptoken);
    return this.cachedJsonp(PersonService.searchPersonsUrl, wsparams)
  };
  //exemple url https://wsgroups.univ-paris1.fr/getSuperGroups?key=structures-DGHA&depth=10
  searchCrumbUrl = (pkey :{}) : angular.IPromise<Array<{}>> => {
    return this.cachedJsonp(PersonService.searchCrumbUrl, pkey);
  };

  getGroup = (key : {}) : angular.IPromise<Array<{}>> => {
    return this.cachedJsonp(PersonService.getGroup, {key});
  };

  getDiplomaLib= (diploma : string) : angular.IPromise<Array<{}>> => {
    return this.cachedJsonp(PersonService.getDiplomaLib, {filter_category:'diploma',token: diploma});
  };

  set_wsparams = (wsparams: wsparams, { affiliation, affectation, diploma } : filters) : angular.IPromise<void> => {
    wsparams.filter_eduPersonAffiliation = affiliation;

    // ensure both are not set
    wsparams.filter_supannEntiteAffectation = '';
    wsparams.filter_member_of_group = '';
    if (diploma) {
        wsparams.filter_member_of_group = "diploma-" + diploma;
        return this.$q.resolve();
    } else if (affectation){
      if (affiliation === 'student' || affiliation === 'alum') {
          wsparams.filter_supannEntiteAffectation = affectation;
          return this.$q.resolve();
      } else {
        return this.getGroupFromStruct(affectation).then((group : {}) => {
            wsparams.filter_member_of_group = "groups-employees." + group['businessCategory'] + "." + affectation;
        });
      }
    } else {
        return this.$q.resolve();
    }
  }

}
