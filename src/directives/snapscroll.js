'use strict';

var scopeObject = {
  snapIndex: '=?',
  snapHeight: '=?',
  beforeSnap: '&',
  afterSnap: '&'
};

var registerWatchers = function (scope) {
  scope.$watch('snapIndex', function (snapIndex) {
    if (angular.isUndefined(snapIndex)) {
      scope.snapIndex = 0;
      return;
    }
  });
};

var snapscrollAsAnAttribute = [
  function () {
    return {
      restrict: 'E',
      scope: scopeObject,
      link: function (scope) {
        registerWatchers(scope);
      }
    };
  }
];

var snapscrollAsAnElement = [
  function () {
    return {
      restrict: 'A',
      scope: scopeObject,
      link: function (scope) {
        registerWatchers(scope);
      }
    };
  }
];

angular.module('snapscroll')
  .directive('snapscroll', snapscrollAsAnAttribute)
  .directive('snapscroll', snapscrollAsAnElement);