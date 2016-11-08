function autocompleteUserAndGroup (globals) {
  //let globals={ wsgroupsURL:'https://wsgroups.univ-paris1.fr'};
  //var searchUserURL = globals.wsgroupsURL + '/searchUserCAS';
  var searchURL = globals.wsgroupsURL + '/search';


  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope : ng.IScope, el, attr, ngModel : ng.INgModelController) {
	  var select = function (event, ui) {
	    // NB: this event is called before the selected value is set in the "input"

	    ui.item.id = ui.item.value;
	    ui.item.name = ui.item.label;
      // afficher prénom et nom de la personne sélectionnée sur le input
	    jQuery(el).val(ui.item.label);
      //Mettre a jour la valeur de ngModel par la valeur saisie
      scope.$apply(function () {
          ngModel.$setViewValue(ui.item);
      });
      //Ajouter un attribut onSelect, qui sera utilisé pour initialier le token ( voir on-select de index.html )
	    scope.$apply(attr['onSelect']);
      //scope.$apply(attr['onBlur']);
	    return false;
  };
  var params = { select: select, wsParams: { filter_category: "structures", group_attrs: "businessCategory", CAS: !!location.href.match(/connected/) } };
  // autocompleteUser de jQuery gère l'autocomplétion
  jQuery(el)['autocompleteUserAndGroup'](searchURL, params);
}
};
}

function showFocus($timeout) {
  return {
    restrict: 'A',
    link : function($scope, $element) {
      $timeout(function() {
        $element[0].focus();
      });
    }
  }
}
