'use strict';

var scopeObject = {
  snapIndex: '=?',
  snapHeight: '=?',
  beforeSnap: '&',
  afterSnap: '&'
};

var controller = ['$scope', function ($scope) {
  this.setSnapHeight = function (height) {
    $scope.snapHeight = height;
  };
}];

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
  scope.$watch('snapIndex', function (snapIndex, oldSnapIndex) {
    if (angular.isUndefined(snapIndex)) {
      scope.snapIndex = 0;
      return;
    }
    if (!angular.isNumber(snapIndex)) {
      scope.snapIndex = 0;
      return;
    }
    if (scope.ignoreThisSnapIndexChange) {
      scope.ignoreThisSnapIndexChange = undefined;
      return;
    }
    if (scope.beforeSnap({snapIndex: snapIndex}) === false) {
      scope.ignoreThisSnapIndexChange = true;
      scope.snapIndex = oldSnapIndex;
      return;
    }
    if (angular.isFunction(callback)) {
      callback(snapIndex, function () {
        scope.afterSnap({snapIndex: snapIndex});
      });
    }
  });
};

var snapscrollAsAnAttribute = ['$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      scope: scopeObject,
      controller: controller,
      link: function (scope, element, attributes) {
        var snapTo,
            onScroll,
            bindScroll,
            unbindScroll,
            snapIndexChanged,
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
              snapIndexChanged(newSnapIndex);
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
        
        snapIndexChanged = function (snapIndex, afterSnap) {
          snapTo(snapIndex);
          if (angular.isFunction(afterSnap)) {
            afterSnap.call();
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
        
        watchSnapIndex(scope, snapIndexChanged);
        
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
      controller: controller,
      link: function (scope, element) {
        watchSnapHeight(scope, element);
        watchSnapIndex(scope, function (snapIndex, afterSnap) {
          // TBD
          if (angular.isFunction(afterSnap)) {
            afterSnap.call();
          }
        });
      }
    };
  }
];

angular.module('snapscroll')
  .directive('snapscroll', snapscrollAsAnAttribute)
  .directive('snapscroll', snapscrollAsAnElement);