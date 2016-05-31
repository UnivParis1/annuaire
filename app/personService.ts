class PersonService {
  constructor(private $http: angular.IHttpService) {
  }

  // rechercher les données d'une personne
  private static searchPersonsUrl = "https://wsgroups-test.univ-paris1.fr/searchUser?&callback=JSON_CALLBACK";
  //Fil ariane
  //private static searchGroupUrl="https://wsgroups-test.univ-paris1.fr/getSuperGroups?key=groups-employees.administration.DGHA&depth=44&callback=JSON_CALLBACK";
  private static searchCrumbUrl="https://wsgroups-test.univ-paris1.fr/getSuperGroups?&callback=JSON_CALLBACK";
  // Rechercher les personnes d'une structure
  private static searchPersonsFromStructure="https://wsgroups-test.univ-paris1.fr/searchUser?maxRows=10&filter_supannEntiteAffectation=dgha";
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

 /*  searchGroups = (ptoken :{}) : angular.IPromise<string[]> => {
    return this.$http.jsonp(
      PersonService.searchPersonsFromStructure
    ).then(r => r.data);
  };*/






}
