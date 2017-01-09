import { wsparams, filters } from "../types";
import Person from "../service/person";
import PersonService from "../service/personService";

export class MainController {
  /*
  Le MainController gère le routing de la partie saisie critère de recherche
  Deux recherches possibles:
    - En saisissant le crirère de rechche+Touche Enter (showUsers)
    - En saisissant le crirère de rechche+sélection dans la liste (show):
      La rechercher peut être faite, soit pour une personne soit pour une structure
      1- sélectionner une personne (showUser)
      2- sélectionner une structure (this.$location.path("/Recherche")+this.$location.search("affectation", param))
  Le MainController utilise routes.ts qui appel le controller PersonController pour exécuter les recherches en utilisant les web services
  */
  searchCrit={ token:'' };
  //alimenté dans la directive autocompleteUserAndGroup (onSearchSuccess)
  searchResults : { users: {}[], groups: {}[] };
  authenticated=true;
  showTrombi=false;
  wsparams : wsparams;
  listStatus=[{id: 'teacher', translationTag: "STATUS_TEACHER"},
              {id: 'researcher', translationTag: "STATUS_RESEARCHER"},
              {id: 'staff', translationTag: "STATUS_STAFF"},
              {id: 'emeritus', translationTag: "STATUS_EMERITUS"},
              {id: 'student', translationTag: "STATUS_STUDENT"},
              {id: 'alum', translationTag: "STATUS_ALUM"}

            ];

  constructor(private personService: PersonService,private $scope: angular.IRootScopeService, private $location:angular.ILocationService) {
      this.authenticated = this.$location.search().connected;
      this.$scope = $scope;
      //console.log($location.search(), this.authenticated);
      this.wsparams = { filter_category: "structures", group_attrs: "businessCategory", CAS: !!location.href.match(/connected/) };
  }

  showUsers = (token) => {
    // Si aucune donnée renseignée(ex Critère vide+Enter) ou le resultat de la recherche (webwidget) ne contient que des structures, ne pas lancer la recherche(bloqué le Enter)
    if (!token || !this.searchResults || this.searchResults.users.length === 0) return;
      this.clearSearchCrit();
      this.$location.path("/Recherche/");
      this.$location.search("token",token);
  }

  // Le web widget de recherche retourne des personnes ou des structures
  showUserOrStructure = (item) => {
    // recherche de personne
    if (item.category === 'users') {
        this.showUser(item.mail);
    } else {
      // recherche d'une structure
      var param=item.key.replace('structures-','');
      this.clearSearchCrit();
      this.$location.path("/Recherche");
      this.$location.search("affectation",param);
    }
  }

  showUser=(id, showDetailPers = false)=>{
    this.clearSearchCrit();
    //Initialiser tous les paramètres de l'URL a null, permettant de rechercher n'importe quelle personne dans écran détail
    //sans tenir compte des critères précédemment saisis de l'écran liste
    this.$location.search({});
    this.$location.path("/Show/" + id);
  }

  setTrombi=(showTrombi:boolean)=>{
    this.showTrombi=showTrombi;
  }

  clearSearchCrit = () => {
    //initialiser le champs de recherche a vide
    this.searchCrit.token = null;
    this.$scope.$broadcast('focusOut', 'mainSearch');
  }

  set_autocomplete_wsparams = (filters) => {
    this.personService.set_wsparams(this.wsparams, filters);
  };

  goAffiliation = (param:string) => {
    this.$location.path("/Recherche");
    this.$location.search('affiliation', param);
  }

}

export class WelcomeController {
  constructor(private $scope: angular.IRootScopeService, $routeParams : {}) {
      this.$scope.$parent['main'].set_autocomplete_wsparams(this);
      this.$scope.$parent['main'].showTrombi=false;
  }
}

export class PersonController {
  resultSearch=[];
  breadcrumbTotal=[];
  lastDiplomas=[];

  searchCritStructure={depth:10,key:''};
  searchNoauthMaxResult=5;// Résultat maximal à afficher si pasa uthentifié
  searchAuthMaxResult=100;// Résultat maximal à afficher si authentifié
  noShowUser;//Flag permettant de savoir s'il y a eu un clic sur mailto
  showDetailPers; //flag permettant de savoir s'il y eu une visualisation(clic) sur le détail d'une personne
  affectationName;
  affiliationName;
  token;
  authenticated;
  manager;
  diplomaName;
  goConnectedUrl : string;
  statusPers=[];


  constructor(private personService: PersonService, private $q: angular.IQService, private $log: angular.ILogService, private $scope: angular.IRootScopeService, private $location:angular.ILocationService, $routeParams : {}, private $filter:angular.IFilterService) {
    /* PersonController gère les routings autre que la partie critère de recherche (MainController)
      - Recherche des personnels à partir du fil d'arianne (this.$location.search().affectation)
      - Filtrer sur le statut ( this.$location.search().affiliation)
    */
      this.token = $routeParams['token'] || '';
      this.goConnectedUrl = $location.url() + "&connected";

      let filters = <filters> $routeParams;

      this.$scope.$parent['main'].set_autocomplete_wsparams(filters);

      if ($routeParams['id']) {
          this.showUser($routeParams['id']);
      } else {
          this.showUsers(filters, null, false);
      }
  }

  private _getSearchPersons = (wsparams: wsparams, filters: filters) : angular.IPromise<Array<Person>> => {
    wsparams.token = filters.token;
    return this.personService.set_wsparams(wsparams, filters).then(() =>
      this.personService.searchPersons(wsparams).then(
        (listUsers) => listUsers,
        (errfunction) => undefined
      )
    );
  };

  private _getSearchCrumbUrl = (text: {}) => {
    return this.personService.searchCrumbUrl(text).then(
      (listStructures) => listStructures,
      (err) => undefined
    );
  };

  showUsers = (filters: filters, maxRows = null, showDetailPers = false) : angular.IPromise<Array<Person>> => {
    //Limiter le nombre d'affichage en fonction de l'authentification
    let authenticated = this.$scope.$parent['main'].authenticated;

    if (!maxRows) maxRows = authenticated ? this.searchAuthMaxResult : this.searchNoauthMaxResult;

    return this._getSearchPersons({ maxRows, CAS: authenticated }, filters).then((persons) => {
      persons.forEach(p => {
         p.supannListeRouge = p.supannCivilite === 'supannListeRouge';
      });
      this.resultSearch = persons;
      this.setSearchVariousNames(filters, persons);
      return persons;
    });
  };

  setSearchVariousNames = (filters : filters, persons: Array<Person>) => {
      if (filters.affiliation) {
        var status = this.$filter('filter')(this.$scope.$parent['main'].listStatus, { id: filters.affiliation });
        this.affiliationName=status[0]['translationTag'];
      }

     if (filters.affectation) {
         this.getManager_(filters, persons).then(manager => {
            this.manager = manager;
         });
        this.personService.getGroupFromStruct(filters.affectation).then((group) => {
          // Récupérer le libellé de la structure
          this.affectationName=group['name'];
        });
      } else if(filters.diploma){
        this.personService.getDiplomaLib(filters.diploma).then((dip) => {
          // Récupérer le libellé du diplome
          this.diplomaName=dip[0]['name'];
        });
      }
  };

  getManager_ = (filters: filters, persons: Array<Person>) : angular.IPromise<string> => {
      let affectation = filters.affectation;
       // Récupérer le chef de la structure recherché
       let pChef : angular.IPromise<Person> =null;
       if (filters.token||filters.affiliation) {
         pChef = this._getSearchPersons({ token: '', maxRows: 1, CAS: false }, { affectation }).then(persons => persons[0]);
       } else {
         // optimisation: pas besoin d'appeler le web-service
         pChef = this.$q.resolve(persons[0]);
      }
      return pChef.then(chef => {
          return chef['supannRoleEntite-all'] ? this.getManager(chef, affectation) : '';
      });
  };

  getLastDiplomas_ = (person: Person) => {
    var arrayEtuInscription=person['supannEtuInscription-all'];
    if (arrayEtuInscription) {
       var anneeInscMax = Math.max.apply(null, arrayEtuInscription.map(item => item.anneeinsc));
       return this.getLastDiplomas(arrayEtuInscription,anneeInscMax);
    }
  };

  getLastDiplomas=(ltEtuInscription, anneeMax) => {
    var l1 = [];
    ltEtuInscription.forEach(p => {
        if (p.anneeinsc==anneeMax){
          // Récupérer le code etape, utilisé dans fiche detail, et l'affecter dans attribut etapeCode de l'objet p
          var array=p.etape.split('-');
          p.etapeCode=array[0].trim()||'';
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
    this.showUsers({ token: id }, 1, true).then((persons) => persons[0]).then(person => {
        //Récupérer les diplomes de l'étudiant
        this.lastDiplomas = this.getLastDiplomas_(person);
        this.statusPers = this.computeStatusPers(person);
        // async!
        this.breadcrumbTotal = this.compute_breadcrumbTotal(person);
    });
  }

   computeStatusPers = (person: Person) => {
       let statusPers = [];
        //Récupérer les translationTag des affiliations d'une personne
        var ltAffiliation=person.eduPersonAffiliation;
        for (let it of ltAffiliation) {
          var status = this.$filter('filter')(this.$scope.$parent['main'].listStatus, { id: it });
          if (status[0]){statusPers.push(status[0]['translationTag']);}
        }
        return statusPers;
   };

 // computes breadcrumbTotal, async !!
 compute_breadcrumbTotal = (item: Person) => {
   let breadcrumbTotal = [];
   var supannEntiteAffectation = item.supannEntiteAffectation;
   // Si la personne possède plusieurs affecttations, afficher autant de fil d'ariane que d'affectation
   if (supannEntiteAffectation!=null){
     for (let it of supannEntiteAffectation) {
       this.searchCrumbUrl(it).then(breadcrumb =>
          breadcrumbTotal.push(breadcrumb)
       );
     }
   }
   return breadcrumbTotal;
 };

  private objectValues = (o) => Object.keys(o).map(key => o[key]);

  searchCrumbUrl=(param:string)=>{
    // si param ne contient pas 'structures-''
    if (param.indexOf("structures-")== -1){param='structures-'+param}
    let searchCritStructure = angular.copy(this.searchCritStructure);
    searchCritStructure.key = param;
    return this._getSearchCrumbUrl(searchCritStructure).then((returnResultGroup : Array<{}>) => {
       let breadcrumbApp= this.objectValues(returnResultGroup);
       return breadcrumbApp;
    })
  }

  goConnected = () => {
    location.hash = this.goConnectedUrl;
    location.reload();
  };

  goDeletedFilter=(param)=>{
    this.$location.search(param,null);
    if (param==='token') this.$location.path("/Recherche");
    //Ne pas lancer la recherche (afficher les 5 premieres personnes par défaut) lorsque tous les filtres ont été supprimés
    if(this.$location.url()==='/Recherche' || this.$location.url()==='/Recherche?connected') this.$location.path("/");
  }

  getManager=(person : Person, affectation: string) => {
    var supannRoleEntiteAll=person['supannRoleEntite-all'];
    for (let it of supannRoleEntiteAll) {
      if (it['structure']['key'] === affectation){
        it['displayName']=person['displayName'];
        it['mail']=person['mail'];
        return it;
      }
    }
  }



}
