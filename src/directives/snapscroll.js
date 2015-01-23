'use strict';

var scopeObject = {
  snapIndex: '=?',
  snapHeight: '=?',
  beforeSnap: '&',
  afterSnap: '&',
  snapAnimation: '=?'
};

var controller = ['$scope', function ($scope) {
  this.setSnapHeight = function (height) {
    $scope.snapHeight = height;
  };
}];

var watchSnapHeight = function (scope, callback) {
  scope.$watch('snapHeight', function (snapHeight) {
    if (angular.isUndefined(snapHeight)) {
      scope.snapHeight = scope.defaultSnapHeight;
      return;
    }
    if (!angular.isNumber(snapHeight)) {
      scope.snapHeight = scope.defaultSnapHeight;
      return;
    }
    if (angular.isFunction(callback)) {
      callback(snapHeight);
    }
  });
};

var watchSnapIndex = function (scope, snapIndexChangedCallback) {
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
    if (!scope.snapIndexIsValid()) {
      scope.ignoreThisSnapIndexChange = true;
      scope.snapIndex = oldSnapIndex;
      return;
    }
    if (scope.beforeSnap({snapIndex: snapIndex}) === false) {
      scope.ignoreThisSnapIndexChange = true;
      scope.snapIndex = oldSnapIndex;
      return;
    }
    if (angular.isFunction(snapIndexChangedCallback)) {
      snapIndexChangedCallback(snapIndex, function () {
        scope.afterSnap({snapIndex: snapIndex});
      });
    }
  });
};

var snapscrollAsAnAttribute = ['$timeout', 'scroll', 'defaulSnapscrollScrollDelay', 'defaulSnapscrollSnapDuration',
  function ($timeout, scroll, defaulSnapscrollScrollDelay, defaulSnapscrollSnapDuration) {
    return {
      restrict: 'A',
      scope: scopeObject,
      controller: controller,
      link: function (scope, element, attributes) {
        var init,
            snapTo,
            onScroll,
            bindScroll,
            unbindScroll,
            oneTimeAfterSnap,
            scrollPromise = 0,
            snapEasing = attributes.snapEasing,
            scrollDelay = attributes.scrollDelay,
            snapDuration = attributes.snapDuration;
        
        snapTo = function (index) {
          var args,
              top = index * scope.snapHeight;
          if (scope.snapAnimation) {
            if (angular.isDefined(snapEasing)) {
              args = [element, top, snapDuration, snapEasing];
            } else {
              args = [element, top, snapDuration];
            }
          } else {
            args = [element, top];
          }
          unbindScroll();
          scroll.to.apply(scroll, args).then(function () {
            bindScroll();
            if (angular.isDefined(oneTimeAfterSnap)) {
              oneTimeAfterSnap.call();
              oneTimeAfterSnap = undefined;
            }
          });
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
          scroll.stop(element);
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
        
        init = function () {
          if (scrollDelay === 'false') {
            scrollDelay = false;
          } else {
            scrollDelay = parseInt(scrollDelay, 10);
            if (isNaN(scrollDelay)) {
              scrollDelay = defaulSnapscrollScrollDelay;
            }
          }
        
          if (angular.isDefined(snapEasing)) {
            snapEasing = scope.$parent.$eval(snapEasing);
          }
          
          snapDuration = parseInt(snapDuration, 10);
          if (isNaN(snapDuration)) {
            snapDuration = defaulSnapscrollSnapDuration;
          }
          
          scope.$watch('snapAnimation', function (animation) {
            if (animation === undefined) {
              scope.snapAnimation = true;
            }
          });
          
          
          scope.defaultSnapHeight = element[0].offsetHeight;

          scope.snapIndexIsValid = function () {
            return scope.snapIndex >= 0 && scope.snapIndex < element.children().length;
          };

          element.css('overflowY', 'auto');

          watchSnapHeight(scope, function () {
            var snaps = element.children();
            element.css('height', scope.snapHeight + 'px');
            if (snaps.length) {
              angular.forEach(snaps, function (snap) {
                angular.element(snap).css('height', scope.snapHeight + 'px');
              });
            }
            snapTo(scope.snapIndex);
          });

          watchSnapIndex(scope, function (snapIndex, afterSnap) {
            oneTimeAfterSnap = afterSnap;
            snapTo(snapIndex);
          });
          
          bindScroll();
          scope.$on('$destroy', unbindScroll);
        };
        
        init();
      }
    };
  }
];

angular.module('snapscroll')
  .directive('snapscroll', snapscrollAsAnAttribute);