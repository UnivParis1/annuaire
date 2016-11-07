
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

    constructor(private $scope: angular.IRootScopeService, private $location:angular.ILocationService) {
        this.authenticated = this.$location.search().connected;
        console.log($location.search(), this.authenticated);
    }

    searchUser = (token) => {
        this.showTrombi=false;
        this.searchCrit.token = null;
        this.$location.path("/Recherche/" + token);
    }

  // Le web widget de recherche retourne des personnes ou des stcructures
  show=(item)=>{
    // recherche de personne
    if (item.category === 'users') {
      this.$location.url("");
      this.showUser(item.uid);
    } else {
      // recherche d'une structure
      var param=item.key.replace('structures-','');
      this.searchCrit.token = null;
      this.$location.path("/Recherche");
      this.$location.search("affectation",param);
    }
  }

  showUser=(id, showDetailPers = false)=>{
    this.searchCrit.token = null;
    this.$location.path("/Show/" + id);
  }

  setTrombi=(showTrombi:boolean)=>{
    this.showTrombi=showTrombi;
  }

}



class PersonController {
  resultSearch={};
  breadcrumbTotal=[];
  lastDiplomas=[];
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
  noShowUser;//Flag permettant de savoir s'il y a eu un clic sur mailto
  showDetailPers; //flag permettant de savoir s'il y eu une visualisation(clic) sur le détail d'une personne
  affiliation;
  affectation;
  affectationName;
  affiliationName;
  token;
  authenticated;
  manager;


  constructor(private personService: PersonService, private $q: angular.IQService, private $log: angular.ILogService, private $scope: angular.IRootScopeService, private $location:angular.ILocationService, $routeParams : {}, private $filter:angular.IFilterService) {
    /* PersonController gère les routings autre que la partie critère de recherche (MainController)
      - Recherche des personnels à partir du fil d'arianne (this.$location.search().affectation)
      - Filtrer sur le statut ( this.$location.search().affiliation)

    */
      this.affiliation = $routeParams['affiliation'] || '';
      this.affectation = $routeParams['affectation'] || '';
      this.token = $routeParams['token'] || '';
      if ($routeParams['id']) {
          this.showUser($routeParams['id']);
      } else {
          this.searchUser($routeParams['token'], null, $routeParams['affectation'], $routeParams['affiliation'], false);
      }
  }

  private _getSearchPersons = (text: {}) => {
    if (text) {
        return this.personService.searchPersons(text).then(
          (listUsers) => listUsers,
          (errfunction) => undefined
        );
    }
  };

  private getGroupFromStruct = (affectation: string) => {
    //debugger;
    return this.personService.getGroup("structures-" + affectation).then(
      (g) => g,
      (errfunction) => undefined
    );
  };

  private _getSearchCrumbUrl = (text: {}) => {
    return this.personService.searchCrumbUrl(text).then(
      (listStructures) => listStructures,
      (err) => undefined
    );
  };

  searchUser = (token, maxRows = null,affectation : string,filter_eduPersonAffiliation : string, showDetailPers = false) => {
    //Limiter le nombre d'affichage en fonction de l'authentification
    let authenticated = this.$scope.$parent.main.authenticated;
    if (!maxRows) maxRows = authenticated ? this.searchAuthMaxResult : this.searchNoauthMaxResult;
    let searchCrit = { token, maxRows,filter_eduPersonAffiliation, CAS: authenticated };
    if (this.affiliation) {
      var status = this.$filter('filter')(this.listStatus, { id: this.affiliation });
      this.affiliationName=status[0]['translationTag'];
    }

    if (affectation) {
        this.getGroupFromStruct(affectation).then((group : Array<{}>) => {
        // Récupérer le libellé de la structure
        this.affectationName=group['name'];
        //Lors de la recherche par structure, le webservice searchUser n'affiche que les personnels,
        //pour avoir les étudiants, il faut ensuite filtrer sur etudiant
        if (filter_eduPersonAffiliation === 'student' || filter_eduPersonAffiliation === 'alum') {
          searchCrit.filter_supannEntiteAffectation = affectation;
          this.searchUserFinal(searchCrit,showDetailPers, affectation);
        }else{
          // Dans le cas d'une recherche d'une structure et ensuite d'un filtre sur le user, calculer filter_member_of_group
          searchCrit.filter_member_of_group = "groups-employees." + group['businessCategory'] + "." + affectation;
          this.searchUserFinal(searchCrit,showDetailPers, affectation);
        }
        });

    } else {
      //Dans le cas d'une recherche simple (structure ou autre)sans filtre
      this.searchUserFinal(searchCrit,showDetailPers,'');
    }

  };

  searchUserFinal = (searchCrit,showDetailPers, affectation) => {
     this._getSearchPersons(searchCrit).then((persons : Array<{}>) => {
     if (!showDetailPers && persons.length === 1 && !affectation) {
       this.$location.path("/Show/" + persons[0]['mail']);
       return;
     }
     persons.forEach(p => {
         p.supannListeRouge = p.supannCivilite === 'supannListeRouge';
     });
     this.resultSearch = persons;

     if (affectation) {
       // Récupérer le chef de la structure recherché
       var chef=null;
       if (searchCrit.token||searchCrit.filter_eduPersonAffiliation) {
         let search=angular.copy(searchCrit);
         search.token = '';
         search.filter_eduPersonAffiliation = '';
         search.maxRows = 1;
         chef = this._getSearchPersons(search).then(persons => persons[0]);
       } else {
         chef = this.$q.resolve(persons[0]);
      }
      chef.then(chef => {
          if (chef['supannRoleEntite-all']) this.manager=this.getManager(chef, affectation);
      });
     }

     // Si l'utilisateur veut voir le détail d'une personne ou si la recherche ne ramène qu'un résultat rediriger vers la page détail
     if (showDetailPers) {
        var arrayEtuInscription=persons[0]['supannEtuInscription-all'];
        if (arrayEtuInscription) {
         var anneeInscMax = Math.max.apply(null, arrayEtuInscription.map(item => item.anneeinsc));
         this.lastDiplomas = this.getLastDiplomas(arrayEtuInscription,anneeInscMax);
      }
      this.compute_breadcrumbTotal(persons[0]);
     }

   });
 }
  getLastDiplomas=(ltEtuInscription, anneeMax) =>{
    var l1 = [];
    ltEtuInscription.forEach(p => {
        if (p.anneeinsc==anneeMax){
          var test=p.anneeinsc;
          l1.push(p);}
    });
    return l1;
  }


  //Rechercher une personne
  showUser=(id)=>{
    //Sur la page resultSearch, le clic sur l'ensemble de cette page déclenche l'affichage du détail, sauf sur celui du mailTo qui n'ouvre que la fenetre de mail
    if (this.noShowUser) {
      this.noShowUser = false;
      return;
    }
    this.showDetailPers = true;
    this.searchUser(id, 1,null,null, true);
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

  private objectValues = (o) => Object.keys(o).map(key => o[key]);

  searchCrumbUrl=(param:string)=>{
    // si param ne contient pas 'structures-''
    if (param.indexOf("structures-")== -1){param='structures-'+param}
    let searchCritStructure = angular.copy(this.searchCritStructure);
    searchCritStructure.key = param;
    return this._getSearchCrumbUrl(searchCritStructure).then((returnResultGroup : Array<{}>) => {
       let breadcrumbApp= this.objectValues(returnResultGroup);
       return breadcrumbApp.reverse();
    })
  }

  goConnected = () => {
    this.$location.search('connected', true);
    location.hash = this.$location.url();
    location.reload();
  };

  goAffiliation = (param:string) => {
    this.$location.search('affiliation', param);
  }

  goDeletedFilter=(param)=>{
    this.$location.search(param,null);
    if (param==='token') this.$location.path("/Recherche");
    //Ne pas lancer la recherche (afficher les 5 premieres personnes par défaut) lorsque tous les filtres ont été supprimés
    if(this.$location.url()==='/Recherche') this.$location.path("");
  }

  getManager=(person, affectation) => {
    var supannRoleEntiteAll=person['supannRoleEntite-all'];
    for (let it of supannRoleEntiteAll) {
      if (it['structure']['key'] === affectation){
        it['displayName']=person['displayName'];
        return it;
      }
    }
  }



}
