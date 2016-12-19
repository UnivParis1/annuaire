/// <reference path="../typings/main.d.ts" />
import "./style/annuaire.css";
import * as angular from "angular";
import "angular-translate";
import "angular-route";
import "angular-ui-bootstrap";
import PersonService from "./service/personService";
import * as personCtrl from "./controller/personCtrl";
import * as translations from "./translations";
import * as routes from "./routes";
import * as directives from "./directives";

// pascalprecht.translate est le nom associé au module angular-translate.min.js
// et doit être appelé une fois au début de l'application
//var app = angular.module('myApp', ['pascalprecht.translate','ui.bootstrap']);
var app = angular.module('myApp', ['pascalprecht.translate','ngRoute','ui.bootstrap']);

app.service('personService', PersonService);
app.controller('MainController', personCtrl.MainController);
app.controller('PersonController', personCtrl.PersonController);
app.controller('WelcomeController', personCtrl.WelcomeController);
app.controller('EmptyCtrl', function($scope) {});
app.config(translations.initTranslations);
app.config(routes.initRoutes);
app.directive('autocompleteUserAndGroup', directives.autocompleteUserAndGroup);
app.directive('showFocus', directives.showFocus);
app.directive('focusOut', directives.focusOut);

app.service('globals', function () {
  return { wsgroupsURL:'https://wsgroups.univ-paris1.fr' };
})
