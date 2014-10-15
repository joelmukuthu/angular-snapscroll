'use strict';

var scopeObject = {
  snapIndex: '=?',
  snapHeight: '=?',
  beforeSnap: '&',
  afterSnap: '&'
};

var watchSnapHeight = function (scope, element, callback) {
  scope.$watch('snapHeight', function (snapHeight) {
    if (angular.isUndefined(snapHeight)) {
      scope.snapHeight = element[0].offsetHeight;
      return;
    }
    if (!angular.isNumber(snapHeight)) {
      scope.snapHeight = element[0].offsetHeight;
      return;
    }
    element.css('height', snapHeight + 'px');
    if (angular.isFunction(callback)) {
      callback(snapHeight);
    }
  });
};

var watchSnapIndex = function (scope, callback) {
  scope.$watch('snapIndex', function (snapIndex) {
    if (angular.isUndefined(snapIndex)) {
      scope.snapIndex = 0;
      return;
    }
    if (!angular.isNumber(snapIndex)) {
      scope.snapIndex = 0;
      return;
    }
    if (angular.isFunction(callback)) {
      callback(snapIndex);
    }
  });
};

var snapscrollAsAnAttribute = [
  function () {
    return {
      restrict: 'A',
      scope: scopeObject,
      link: function (scope, element) {
        var snapTo = function (index) {
          element[0].scrollTop = index * scope.snapHeight;
        };
        
        watchSnapHeight(scope, element, function () {
          snapTo(scope.snapIndex);
        });
          
        watchSnapIndex(scope, function (snapIndex) {
          snapTo(snapIndex);
        });
      }
    };
  }
];

var snapscrollAsAnElement = [
  function () {
    return {
      restrict: 'E',
      scope: scopeObject,
      link: function (scope, element) {
        watchSnapHeight(scope, element);
        watchSnapIndex(scope);
      }
    };
  }
];

angular.module('snapscroll')
  .directive('snapscroll', snapscrollAsAnAttribute)
  .directive('snapscroll', snapscrollAsAnElement);