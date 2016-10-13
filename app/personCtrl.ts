
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
  managerName;
  affiliation;
  authenticated;
  displayFilter=[];

  constructor(private personService: PersonService, private $q: angular.IQService, private $log: angular.ILogService, private $scope: angular.IRootScopeService, private $location:angular.ILocationService, $routeParams : {}) {
    /* PersonController gère les routings autre que la partie critère de recherche (MainController)
      - Recherche des personnels à partir du fil d'arianne (this.$location.search().affectation)
      - Filtrer sur le statut ( this.$location.search().affiliation)

    */
      this.affiliation = $routeParams['affiliation'] || '';
      
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

    private getBusinessCategFromStruct = (affectation: string) => {
        debugger;
        return this.personService.getGroup("structures-" + affectation).then(
          (g) => g['businessCategory'],
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
    this.addDisplayFilter(searchCrit);

    // Dans le cas d'une recherche d'une structure et ensuite d'un filtre sur le user
    if (affectation) {
        if (filter_eduPersonAffiliation === 'student' || filter_eduPersonAffiliation === 'alum') {
            searchCrit.filter_supannEntiteAffectation = affectation;
            this.searchUserFinal(searchCrit,showDetailPers, affectation);
        } else {
            this.getBusinessCategFromStruct(affectation).then(businessCategory => {
                searchCrit.filter_member_of_group = "groups-employees." + businessCategory + "." + affectation;
                this.searchUserFinal(searchCrit,showDetailPers, affectation);
            });
        }
    } else {
      this.searchUserFinal(searchCrit,showDetailPers);
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

     //Parcourrir la liste des personnes trouvées dans returnResult et affecter dans objet person
     // puis retourne une liste de type person.
     this.resultSearch = persons;

     // Récupérer le chef de la structure recherché
     if (affectation && persons.length && persons[0]['supannRoleEntite-all']) {
         this.managerName = this.findRole(persons[0], affectation);
     }
     // Si l'utilisateur veut voir le détail d'une personne ou si la recherche ne ramène qu'un résultat rediriger vers la page détail
     if (showDetailPers) this.compute_breadcrumbTotal(persons[0]);

   });
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
    this.displayFilter.push(param);
    this.$location.search('affiliation', param);
  }

  goDeletedFilter=(param:{})=>{
    // Clear the current search
    this.$location.search({});
    this.$location.path("/Recherche");
  }

  findRole=(person, affectation) => {
    var supannRoleEntiteAll=person['supannRoleEntite-all'];
    for (let it of supannRoleEntiteAll) {
      if (it['structure']['key'] === affectation){
        return person['displayName'] +" - "+it['role'];
      }
    }
  }

  addDisplayFilter=(param)=>{
    this.displayFilter.push(param);
  }


}
