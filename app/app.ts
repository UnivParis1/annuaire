/// <reference path="../typings/tsd.d.ts" />


// pascalprecht.translate est le nom associé au module angular-translate.min.js
// et doit être appelé une fois au début de l'application
//var app = angular.module('myApp', ['pascalprecht.translate','ui.bootstrap']);
var app = angular.module('myApp', ['pascalprecht.translate','ngRoute']);

app.service('personService', PersonService);
app.controller('MainController', MainController);
app.controller('PersonController', PersonController);
app.controller('EmptyCtrl', function($scope) {});
app.config(initTranslations);
app.config(initRoutes);
app.directive('autocompleteUserAndGroup', autocompleteUserAndGroup);
