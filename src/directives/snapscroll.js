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

var snapscrollAsAnAttribute = ['$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      scope: scopeObject,
      link: function (scope, element, attributes) {
        var snapTo,
            onScroll,
            bindScroll,
            unbindScroll,
            scrollPromise = 0,
            scrollDelay = attributes.scrollDelay;
        
        if (scrollDelay === 'false') {
          scrollDelay = false;
        } else {
          scrollDelay = parseInt(scrollDelay);
          if (isNaN(scrollDelay)) {
            scrollDelay = 250;
          }
        }
        
        snapTo = function (index) {
          unbindScroll();
          element[0].scrollTop = index * scope.snapHeight;
          bindScroll();
        };
        
        onScroll = function () {
          var snap = function () {
            var top = element[0].scrollTop,
                previousSnapIndex = scope.snapIndex,
                newSnapIndex = Math.round(top / scope.snapHeight);
            if (previousSnapIndex === newSnapIndex) {
              snapTo(newSnapIndex);
            } else {
              scope.$apply(function () {
                scope.snapIndex = newSnapIndex;
              });
            }
          };
          if (scrollDelay === false) {
            snap();
          } else {
            $timeout.cancel(scrollPromise);
            scrollPromise = $timeout(snap, scrollDelay);
          }
        };
        
        bindScroll = function () {
          element.on('scroll', onScroll);
        };
        
        unbindScroll = function () {
          element.off('scroll', onScroll);
        };
        
        watchSnapHeight(scope, element, function () {
          snapTo(scope.snapIndex);
        });
        
        watchSnapIndex(scope, function (snapIndex) {
          snapTo(snapIndex);
        });
        
        bindScroll();
        scope.$on('$destroy', unbindScroll);
        
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