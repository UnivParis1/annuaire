export function initRoutes($routeProvider) {

        // route for the home page
        $routeProvider.when('/Recherche', {
            templateUrl : 'template/resultSearch.html',
            controller  : 'PersonController',
            controllerAs: 'p',
        })
        $routeProvider.when('/Recherche/:token', {
            templateUrl : 'template/resultSearch.html',
            controller  : 'PersonController',
            controllerAs: 'p',
        })
        $routeProvider.when('/Show/:id', {
            templateUrl : 'template/resultSearch.html',
            controller  : 'PersonController',
            controllerAs: 'p',
        })
      /*  $routeProvider.when('/Organigramme', {
            templateUrl : 'template/index-organigramme-inc.html',
            controller  : 'personController'
        })*/

        // route for the Preference page
      /*  $routeProvider.when('/Preference', {
            templateUrl : 'template/index-preference-inc.html',
        })*/
        // route for the Apropos page
        $routeProvider.when('/Apropos', {
            templateUrl : 'template/index-about-inc.html',
        });
        $routeProvider.when('/error', {
            templateUrl : 'template/index-error-inc.html',
        });
}