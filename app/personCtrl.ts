class personCtrl
 {
  constructor(public person : {}) {
  }
}

class MainController {
  searchCrit={ token:'' };
  authenticated=true;

    constructor(private $scope: angular.IRootScopeService, private $location:angular.ILocationService) {
        this.authenticated = this.$location.search().connected;
        console.log($location.search(), this.authenticated);
    }

    searchUser = (token) => {
        this.$location.path("/Recherche/" + token);
    }

  // Le web widget de recherche retourne des personnes ou des stcructures
  show=(item)=>{
    // recherche de personne
    if (item.category === 'users') {
      this.showUser(item.uid);
    } else {
      var param=item.key.replace('structures-','');
        this.$location.path("/Recherche");
        this.$location.search("filter", param);
    }
  }

  //Rechercher une personne
  showUser=(id, showDetailPers = false)=>{
    //Sur la page resultSearch, le clic sur l'ensemble de cette page déclanche l'affichage du détail, sauf sur celui du mailTo qui n'ouvre que la fenetre de mail
    this.searchCrit.token = null;
    this.$location.path("/Show/" + id);
  }

}



class PersonController {
  resultSearch={};
  breadcrumbTotal=[];
  searchCrit={ maxRows: 2,token:'',filter_supannEntiteAffectation:''};
  listStatus=[{id: '', translationTag: "STATUS_ALL"},
              {id: 'teacher', translationTag: "STATUS_TEACHER"},
              {id: 'researcher', translationTag: "STATUS_RESEARCHER"},
              {id: 'staff', translationTag: "STATUS_STAFF"},
              {id: 'emeritus', translationTag: "STATUS_EMERITUS"},
              {id: 'student', translationTag: "STATUS_STUDENT"},
              {id: 'alum', translationTag: "STATUS_ALUM"}

            ];
  searchCritStructure={depth:10,key:''};
  searchNoauthMaxResult=5;// Résultat maximal à afficher si pasa uthentifié
  searchAuthMaxResult=100;// Résultat maximal à afficher si authentifié
  routeProviderParam='/showListPers';
  noShowUser;//Flag permettant de savoir s'il y a eu un clic sur mailto
  showDetailPers; //flag permettant de savoir s'il y eu une visualisation(clic) sur le détail d'une personne

    constructor(private personService: PersonService, private $q: angular.IQService, private $log: angular.ILogService, private $scope: angular.IRootScopeService, private $location:angular.ILocationService, $routeParams : {}) {
      console.log("PersonController constructor");

        let filter = this.$location.search().filter;
        if (filter) {
            this.searchUserFromBreadCrumb(filter, $routeParams.id);
        } else if ($routeParams.id) {
            if (this.$location.path().match(/Show/)) {
                this.showUser($routeParams.id, true);
            } else {
                this.searchUser($routeParams.id, null, null, false);
            }
        }
    }

  private _getSearchPersons = (text: {}) => {
    if (text!=null) {
        return this.personService.searchPersons(text).then(
          // Si listUsers est != null prendre toute la liste listUsres
          (listUsers) => listUsers,
          (errfunction) => undefined
        );
    }
  };

  searchUser = (token, maxRows = null,filter_supannEntiteAffectation, showDetailPers = false) => {
    //Limiter le nombre d'affichage en fonction de l'authentification
    if (!maxRows) maxRows = this.authenticated ? this.searchAuthMaxResult : this.searchNoauthMaxResult;

      let searchCrit = { token, maxRows,filter_supannEntiteAffectation, CAS: this.$scope.$parent.main.authenticated };
    this._getSearchPersons(searchCrit).then((returnResult : Array<{}>) => {
      //Parcourrir la liste des personnes trouvées dans returnResult et affecter dans objet person
        // puis retourne une liste de type person.
        this.resultSearch = returnResult.map(e => new personCtrl(e));
      // Si l'utilisateur veut voir le détail d'une personne ou si la recherche ne ramène qu'un résultat rediriger vers la page détail
        this.showDetailPers = showDetailPers || returnResult.length ==1;
        if (this.showDetailPers) {
            this.compute_breadcrumbTotal(returnResult[0]);
            this.$location.path("/Show/" + returnResult[0].mail);
        }
    })
  }

    compute_breadcrumbTotal = (item) => {
        var supannEntiteAffectation = item['supannEntiteAffectation'];

        // Si la personne possède plusieurs affecttations, afficher autant de fil d'ariane que d'affectation
        if (supannEntiteAffectation!=null){
          let breadcrumbTotal = this.breadcrumbTotal = [];
          for (let it of supannEntiteAffectation) {
            this.searchCrumbUrl(it).then(breadcrumb =>
               breadcrumbTotal.push(breadcrumb)
            );
          }
        }
    }

  //Rechercher une personne
  showUser=(id, showDetailPers = false)=>{
    //Sur la page resultSearch, le clic sur l'ensemble de cette page déclenche l'affichage du détail, sauf sur celui du mailTo qui n'ouvre que la fenetre de mail
    if (this.noShowUser) {
      this.noShowUser = false;
      return;
    }
    this.searchCrit.token = null;
    this.searchUser(id, 1,null, showDetailPers);
  }

  private _getSearchCrumbUrl = (text: {}) => {
    if (text!=null) {
        return this.personService.searchCrumbUrl(text).then(
        (listStructures) => listStructures && listStructures,
        (err) => undefined
      ).then((listStructures) =>
        (listStructures)
      );
    }
  };


  searchUserFromBreadCrumb=(param:String, token)=>{
    if(param!=null){
    // si param ne contient pas 'structures-''
      if (param.indexOf("structures-")> -1){param=param.replace('structures-','')}
      //this.searchCrit.token=null;
      //this.searchCrit.filter_member_of_group = 'employees.administration.' + param;
      //this.searchCrit.filter_supannEntiteAffectation=''+param;
      this.searchUser(token,null,param,false);
   }

 }

  searchCrumbUrl=(param:String)=>{
    // si param ne contient pas 'structures-''
    if (param.indexOf("structures-")== -1){param='structures-'+param}
    let searchCritStructure = angular.copy(this.searchCritStructure);
    searchCritStructure.key=''+param;
    return this._getSearchCrumbUrl(searchCritStructure).then((returnResultGroup : Array<{}>) => {
       let breadcrumbApp=Object.keys(returnResultGroup).map(key => returnResultGroup[key]);
       return breadcrumbApp.reverse();
    })
  }

  goConnected = () => {
    this.$location.search('connected', true);
    location.hash = this.$location.url();
    location.reload();
  };


}
