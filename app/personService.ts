class PersonService {
  constructor(private $http: angular.IHttpService) {
  }

  // rechercher les données d'une personne
  private static searchPersonsUrl = "https://wsgroups-test.univ-paris1.fr/searchUser?&callback=JSON_CALLBACK";
  //Fil ariane
  //private static searchGroupUrl="https://wsgroups-test.univ-paris1.fr/getSuperGroups?key=groups-employees.administration.DGHA&depth=44&callback=JSON_CALLBACK";
  private static searchCrumbUrl="https://wsgroups-test.univ-paris1.fr/getSuperGroups?&callback=JSON_CALLBACK";
  // Rechercher businessCategory d'une structure
  private static searchBusinessCategFromStruct="https://wsgroups.univ-paris1.fr/getGroup?&callback=JSON_CALLBACK";
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
    searchPersons = (ptoken :{}) : angular.IPromise<string[]> => {
    console.log(ptoken);
    return this.$http.jsonp(
      PersonService.searchPersonsUrl,
      {params:ptoken}
    ).then(r => r.data);
  };
  //exemple url https://wsgroups-test.univ-paris1.fr/getSuperGroups?key=structures-DGHA&depth=10
  searchCrumbUrl = (pkey :{}) : angular.IPromise<string[]> => {
    return this.$http.jsonp(
      PersonService.searchCrumbUrl,
      {params:pkey}
    ).then(r => r.data);
  };

  searchBusinessCategFromStruct = (pkey :{}) : angular.IPromise<string[]> => {
    return this.$http.jsonp(
      PersonService.searchBusinessCategFromStruct,
      {params:pkey}
    ).then(r => r.data);
  };


}
