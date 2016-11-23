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

  /*getUserInfo = (ptoken : string) : angular.IPromise<string[]> => {
    return this.$http.jsonp(
      PersonService.townsSearchUrl,
      {params:{maxRows:10,token:ptoken}}
    ).then(r => r.data);
  };*/

  /*Retourne la liste des personnes répondant aux critères recherchés
  En entrée: ptoken---> liste de paramètres entre {} ex:{"maxRows":5,"token":"sar"}
  En sortie: angular.IPromise<string[]> --> Liste de personnes
  */

  private cache = {};

  cachedJsonp = (url, params) => {
      let hashParams = JSON.stringify(params);
      let v = this.cache[url + hashParams];
      if (v) {
          console.log("using cached value for " + url + " " + hashParams);
          return this.$q.resolve(v);
      } else {
          return this.$http.jsonp(url, { params }).then(r => {
              this.cache[url + hashParams] = r.data;
              return r.data
          });
      }
  };

  searchPersons = (ptoken :{}) : angular.IPromise<Array<Person>> => {
    console.log(ptoken);
    return this.cachedJsonp(PersonService.searchPersonsUrl, ptoken)
  };
  //exemple url https://wsgroups.univ-paris1.fr/getSuperGroups?key=structures-DGHA&depth=10
  searchCrumbUrl = (pkey :{}) : angular.IPromise<string[]> => {
    return this.cachedJsonp(PersonService.searchCrumbUrl, pkey);
  };

  getGroup = (key : {}) : angular.IPromise<string[]> => {
      return this.cachedJsonp(PersonService.getGroup, {key});
  };


}