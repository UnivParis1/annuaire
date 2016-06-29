
function initRoutes($routeProvider) {

        // route for the home page
        $routeProvider.when('/Recherche', {
            templateUrl : 'resultSearch.html',
            controller  : 'PersonController',
            controllerAs: 'p',
        })
        $routeProvider.when('/Recherche/:id', {
            templateUrl : 'resultSearch.html',
            controller  : 'PersonController',
            controllerAs: 'p',
        })
        $routeProvider.when('/Show/:id', {
            templateUrl : 'resultSearch.html',
            controller  : 'PersonController',
            controllerAs: 'p',
        })
      /*  $routeProvider.when('/Organigramme', {
            templateUrl : 'index-organigramme-inc.html',
            controller  : 'personController'
        })*/

        // route for the Preference page
        $routeProvider.when('/Preference', {
            templateUrl : 'index-preference-inc.html',
        })
        // route for the Apropos page
        $routeProvider.when('/Apropos', {
            templateUrl : 'index-about-inc.html',
        });
        $routeProvider.when('/error', {
            templateUrl : 'index-error-inc.html',
        });
}
