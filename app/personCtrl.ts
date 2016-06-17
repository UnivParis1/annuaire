class personCtrl
 {
  constructor(public person : {}) {
  }
}

class PersonController {
  resultSearch={};
  breadcrumbApp=[];
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
  authenticated=true;
  searchNoauthMaxResult=5;// Résultat maximal à afficher si pas authentifié
  searchAuthMaxResult=100;// Résultat maximal à afficher si authentifié
  routeProviderParam='/showListPers';
  noShowUser;//Flag permettant de savoir s'il y a eu un clic sur mailto
  showDetailPers; //flag permettant de savoir s'il y eu une visualisation(clic) sur le détail d'une personne
  IsMobile=false;
  test;

  constructor(private personService: PersonService, private $q: angular.IQService, private $log: angular.ILogService, private $scope: angular.IRootScopeService, private $location:angular.ILocationService) {
  }

  private _getSearchPersons = (text: {}) => {
    if (text!=null) {
        return this.personService.searchPersons(text).then(
        // Si listUsers est != null prendre toute la liste listUsres
        (listUsers) => listUsers,
        (errfunction) => undefined

      //).then((listUsers) =>
      //  (listUsers)
      );

    }
  };

  searchUser = (token, maxRows = null,filter_supannEntiteAffectation ) => {
    //Limiter le nombre d'affichage en fonction de l'authentification
    if (!maxRows) maxRows =  this.authenticated ? this.searchAuthMaxResult : this.searchNoauthMaxResult;
    this.isMobile();
    let searchCrit = { token, maxRows,filter_supannEntiteAffectation};
    this._getSearchPersons(searchCrit).then((returnResult : Array<{}>) => {
      //Parcourrir la liste des personnes trouvées dans returnRessult et affecter dans objet person
      // puis retourne une liste de type person.
      this.resultSearch = returnResult.map(e => new personCtrl(e));
      // Si l'utilisateur veut voir le détail d'une personne ou si la recherche ne ramène qu'un résultat rediriger vers la page détail
      if((this.showDetailPers) || Object.keys(this.resultSearch).length ==1){
        this.showDetailPers = false;
        var supannEntiteAffectation;
        var mailTo;
        for (let item of returnResult) {
            mailTo=item['mail'];
            supannEntiteAffectation=  item['supannEntiteAffectation'];
            break;
        }
        // Si la personne possède plusieurs affecttations, afficher autant de fil d'ariane que d'affectation
        /*this.$q.all(supannEntiteAffectation.map(it => this.searchCrumbUrl(it))).then(breadcrumbTotal =>
          this.breadcrumbTotal = breadcrumbTotal
        );*/
        if (supannEntiteAffectation!=null){
          let breadcrumbTotal = this.breadcrumbTotal = [];
          for (let it of supannEntiteAffectation) {
            this.searchCrumbUrl(it).then(breadcrumb =>
               breadcrumbTotal.push(breadcrumb)
            );
          }
      }

        //Envoi vers URL détail en passant en paramètre le mail
        this.routeProviderParam='/showDetailPers/'+mailTo;
      }
      else this.routeProviderParam='/showListPers';
      this.$location.path(this.routeProviderParam);
    })
  }

  //Rechercher une personne
  showUser=(id)=>{
    //Sur la page index-listPers-inc, le clic sur l'ensemble de cette page déclanche l'affichage du détail, sauf sur celui du mailTo qui n'ouvre que la fenetre de mail
    if (this.noShowUser) {
      this.noShowUser = false;
      return;
    }
    this.searchCrit.token = null;
    this.searchUser(id, 1,null);
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

  searchUserFromBreadCrumb=(param:String)=>{
    if(param!=null){
    // si param ne contient pas 'structures-''
      if (param.indexOf("structures-")> -1){param=param.replace('structures-','')}
      this.searchCrit.token=null;
      this.searchCrit.filter_supannEntiteAffectation=''+param;
      this.searchUser(null,null,param);
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

  //Initialiser le key avec la structure sélectionné (Saisie rapide), puis lancer la recherche de la structure
  initTokenStruture=(param:String)=>{
    /*exemple url https://wsgroups-test.univ-paris1.fr/getSuperGroups?key=structures-DGHA&depth=10*/
    // supprimer structures- du paramètre, à revoir si nouvelle URL sans structures
    var paramStruct=param.replace('structures-','');
    let searchCritStructure = angular.copy(this.searchCritStructure);
    this.searchCritStructure.key=''+param;
    //this.searchCrumbUrl(param);
    this.searchUser(null,null, paramStruct);
  }

  isMobile=()=>{
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      // You are in mobile browser
      this.IsMobile=true;
    }
  }


}
