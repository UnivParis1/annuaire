
function initRoutes($routeProvider) {

        // route for the home page
        $routeProvider.when('/RechercheSimple', {
            templateUrl : 'index-simpleSearch-inc.html',
            controller  : 'personController'
        })
        // route for the showListPers page
        $routeProvider.when('/showListPers', {
            templateUrl : 'index-listPers-inc.html',
            controller  : 'personController'
        });
        // route for the showDetailPers page
        $routeProvider.when('/showDetailPers', {
            templateUrl : 'index-detailPers-inc.html',
            controller  : 'personController'
        });
      /*  $routeProvider.when('/Organigramme', {
            templateUrl : 'index-organigramme-inc.html',
            controller  : 'personController'
        })*/

        // route for the Preference page
        $routeProvider.when('/Preference', {
            templateUrl : 'index-preference-inc.html',
            controller  : 'personController'
        })
        // route for the Apropos page
        $routeProvider.when('/Apropos', {
            templateUrl : 'index-about-inc.html',
            controller  : 'personController'
        });
        $routeProvider.when('/error', {
            templateUrl : 'index-error-inc.html',
            controller  : 'personController'
        });
}
