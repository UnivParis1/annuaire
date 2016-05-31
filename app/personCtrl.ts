class personCtrl
 {
  constructor(public person : {}) {
  }
}

class PersonController {
  resultSeach={};
  breadcrumbApp=[];
  searchCrit={ maxRows: 2,token:'',filter_supannEntiteAffectation:''};
  listStatus=[{id: '', translationTag: "STATUS_ALL"},
              {id: 'teacher', translationTag: "STATUS_TEACHER"},
              {id: 'researcher', translationTag: "STATUS_RESEARCHER"},
              {id: 'staff', translationTag: "STATUS_STAFF"},
              {id: 'emeritus', translationTag: "STATUS_EMERITUS"},
              {id: 'student', translationTag: "STATUS_STUDENT"},
              {id: 'alum', translationTag: "STATUS_ALUM"}

            ];
  //urlJpegPhoto="https://photo-ldap.univ-paris1.fr/ldap.php?test=1&uid=";
  searchCritStructure={depth:10,key:''};
  authenticated=true;
  searchNoauthMaxResult=5;// Résultat maximal à afficher si pas authentifié
  searchAuthMaxResult=100;// Résultat maximal à afficher si authentifié
  routeProviderParam='/showListPers';
  noShowUser;//Flag permettant de savoir s'il y a eu un clic sur mailto
  showDetailPers; //flag permettant de savoir s'il y eu une visualisation(clic) sur le détail d'une personne

  constructor(private personService: PersonService, private $q: angular.IQService, private $log: angular.ILogService, private $scope: angular.IRootScopeService, private $location:angular.ILocationService) {
  }
  /*
  */
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
    let searchCrit = { token, maxRows,filter_supannEntiteAffectation };

    this._getSearchPersons(searchCrit).then((returnResult : Array<{}>) => {
    //Parcourrir la liste des personnes trouvées dans returnRessult et affecter dans objet person
    // puis retourne une liste de type person.
    this.resultSeach = returnResult.map(e => new personCtrl(e));
    if (this.showDetailPers){
      this.showDetailPers = false;
      this.routeProviderParam='/showDetailPers';
      var supannEntiteAffectationPrincipale;
      for (let item of returnResult) {
        Object.keys(item).map(function(e) {
          supannEntiteAffectationPrincipale=item['supannEntiteAffectationPrincipale'];
          return supannEntiteAffectationPrincipale;
          }
        );
      }
      this.searchCrumbUrl(supannEntiteAffectationPrincipale);
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

  searchUserFromBreadCrumb=(param:Object)=>{
    var key;
    //Récupérer la valeur supannEntiteAffectation contenu dans le champs key
    Object.keys(param).map(function(e) {
      key=param['key'];
      return key;
      }
    );
    if(key!=null){
    // si param ne contient pas 'structures-''
      if (key.indexOf("structures-")> -1){key=key.replace('structures-','')}
      this.searchCrit.token=null;
      this.searchCrit.filter_supannEntiteAffectation=key;
      //ajouter la propriété filter_supannEntiteAffectation dans searchCrit
    //  Object.defineProperty(this.searchCrit, 'filter_supannEntiteAffectation', {value : key,writable : true,enumerable : true,configurable : true});
     this.searchUser(null,null,key);
   }

  }

  searchCrumbUrl=(param:String)=>{
    // si param ne contient pas 'structures-''
    if (param.indexOf("structures-")== -1){param='structures-'+param}
    this.searchCritStructure.key=''+param;
    this._getSearchCrumbUrl(this.searchCritStructure).then((returnResultGroup : Array<{}>) => {
    this.breadcrumbApp=Object.keys(returnResultGroup).map(key => returnResultGroup[key]);
    this.breadcrumbApp.reverse();
    })
  }


  //Initialiser le key avec la structure sélectionné (Saisie rapide), puis lancer la recherche de la structure
  initTokenStruture=(param:String)=>{
    /*exemple url https://wsgroups-test.univ-paris1.fr/getSuperGroups?key=structures-DGHA&depth=10*/
    // supprimer structures- du paramètre, à revoir si nouvelle URL sans structures
    var paramStruct=param.replace('structures-','');
    this.searchCritStructure.key=''+param;
    this.searchCrumbUrl(param);
    this.searchUser(null,null, paramStruct);
  }



}
