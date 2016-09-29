class personCtrl
 {
  constructor(public person : {}) {
  }
}

class MainController {
  /*
  Le MainController gère le routing de la partie saisie critère de recherche
  Deux recherches possibles:
    - En saisissant le crirère de rechche+Touche Enter (searchUser)
    - En saisissant le crirère de rechche+sélection dans la liste (show):
      La rechercher peut être faite, soit pour une personne soit pour une structure
      1- sélectionner une personne (showUser)
      2- sélectionner une structure (this.$location.path("/Recherche")+this.$location.search("affectation", param))
  Le MainController utilise routes.ts qui appel le controller PersonController pour exécuter les recherches en utilisant les web services
  */
  searchCrit={ token:'' };
  authenticated=true;
  showTrombi=false;
  selectedRow=0;
  businessCategory;

    constructor(private $scope: angular.IRootScopeService, private $location:angular.ILocationService) {
        this.authenticated = this.$location.search().connected;
        console.log($location.search(), this.authenticated);
    }

    searchUser = (token) => {
        this.showTrombi=false;
        this.selectedRow=0;
        this.$location.search('affiliation', '');
        this.$location.path("/Recherche/" + token);
    }

  // Le web widget de recherche retourne des personnes ou des stcructures
  show=(item)=>{
    // recherche de personne
    if (item.category === 'users') {
      this.showUser(item.uid);
    } else {
      // recherche d'une structure
      var param=item.key.replace('structures-','');
      this.businessCategory=item.businessCategory;
      this.$location.path("/Recherche");
      this.$location.search("affectation",param);
    }
  }

  showUser=(id, showDetailPers = false)=>{
    this.searchCrit.token = null;
    this.$location.path("/Show/" + id);
  }

}



class PersonController {
  resultSearch={};
  breadcrumbTotal=[];
  searchCrit={ maxRows: 2,token:'',filter_member_of_group:'',filter_eduPersonAffiliation:''};
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
      /* PersonController gère les routings autre que la partie critère de recherche (MainController)
        - Recherche des personnels à partir du fil d'arianne (this.$location.search().affectation)
        - Filtrer sur le statut ( this.$location.search().affiliation)

      */
        let affectation = this.$location.search().affectation;
        let affiliation = this.$location.search().affiliation;

        //filtrer sur le statut
        if (affectation && affiliation) {
          this.searchUser($routeParams['id'], null, $routeParams['affectation'],$routeParams['affiliation'], false);
        }
        // recherche sur la structure/composante
        else if (affectation && !affiliation && !$routeParams['id']) {
            this.searchUserFromBreadCrumb(affectation, $routeParams['id']);
        }
        else if ($routeParams['id']) {
            if (this.$location.path().match(/Show/)) {
                this.showUser($routeParams['id'], true);
            } else {
                this.searchUser($routeParams['id'], null, $routeParams['affectation'],$routeParams['affiliation'], false);
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

  searchUser = (token, maxRows = null,filter_member_of_group : string,filter_eduPersonAffiliation : string, showDetailPers = false) => {
    //Limiter le nombre d'affichage en fonction de l'authentification
    if (!maxRows) maxRows = this.$scope.$parent.main.authenticated ? this.searchAuthMaxResult : this.searchNoauthMaxResult;

      let searchCrit = { token, maxRows,filter_member_of_group,filter_eduPersonAffiliation, CAS: this.$scope.$parent.main.authenticated };
    this._getSearchPersons(searchCrit).then((returnResult : Array<{}>) => {
      //Parcourrir la liste des personnes trouvées dans returnResult et affecter dans objet person
        // puis retourne une liste de type person.
        this.resultSearch = returnResult.map(e => new personCtrl(e));
      // Si l'utilisateur veut voir le détail d'une personne ou si la recherche ne ramène qu'un résultat rediriger vers la page détail
        this.showDetailPers = showDetailPers || returnResult.length ==1;
        if (this.showDetailPers) {
            this.compute_breadcrumbTotal(returnResult[0]);
            this.$location.path("/Show/" + returnResult[0]['mail']);
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
    this.searchUser(id, 1,null,null, showDetailPers);
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


  searchUserFromBreadCrumb=(param:string, token)=>{
    if(param!=null){
    // si param ne contient pas 'structures-''
      if (param.indexOf("structures-")> -1){
        param=param.replace('structures-','') ;
      }
      var businessCategory= this.$scope.$parent.main.businessCategory;
      param="groups-employees."+businessCategory+"."+param;
      this.searchUser(token,null,param,null,false);
   }

 }

  searchCrumbUrl=(param:string)=>{
    // si param ne contient pas 'structures-''
    if (param.indexOf("structures-")== -1){param='structures-'+param}
    let searchCritStructure = angular.copy(this.searchCritStructure);
    searchCritStructure.key = param;
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

  goAffiliation = (param:string) => {
    //Modifier l'url: ajouter à l'URL précédent (exp:) le filtre eduPersonAffiliation
    this.$location.search('affiliation', param);
  };

  setTrombi=(showTrombi:boolean)=>{
    this.$scope.$parent.main.showTrombi=showTrombi;
  }

  setClickedRow=(index)=>{
    this.$scope.$parent.main.selectedRow=index;
  }




}
