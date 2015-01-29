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
    if (snapIndex % 1 !== 0) {
      scope.snapIndex = Math.round(snapIndex);
      return;
    }
    if (scope.ignoreThisSnapIndexChange) {
      scope.ignoreThisSnapIndexChange = undefined;
      return;
    }
    if (!scope.isValid(snapIndex)) {
      scope.ignoreThisSnapIndexChange = true;
      scope.snapIndex = oldSnapIndex;
      scope.snapDirection = 0;
      return;
    }
    if (scope.beforeSnap({snapIndex: snapIndex}) === false) {
      scope.ignoreThisSnapIndexChange = true;
      scope.snapIndex = oldSnapIndex;
      return;
    }
    if (angular.isFunction(snapIndexChangedCallback)) {
      if (snapIndex > oldSnapIndex) {
        scope.snapDirection = 1;
      } else {
        scope.snapDirection = -1;
      }
      snapIndexChangedCallback(snapIndex, function () {
        scope.snapDirection = 0;
        scope.afterSnap({snapIndex: snapIndex});
      });
    }
  });
};

var initWheelEvents = function (scope, element) {
  var onWheel,
      bindWheel,
      unbindWheel;
        
  onWheel = function (e) {
    var bubbleUp,
        delta = Math.max(-1, Math.min(1, (e.wheelDelta || -(e.deltaY || e.detail))));

    e.preventDefault();

    if (isNaN(delta)) {
      return;
    }
    
    if (delta < 0) {
      if (scope.snapDirection !== 1) {
        if (scope.snapIndex + 1 > scope.max()) {
          bubbleUp = true;
        } else {
          bubbleUp = false;
          scope.$apply(function () {
            scope.snapIndex += 1;
          });
        }
      }
    } else {
      if (scope.snapDirection !== -1) {
        if (scope.snapIndex - 1 < scope.min()) {
          bubbleUp = true;
        } else {
          bubbleUp = false;
          scope.$apply(function () {
            scope.snapIndex -= 1;
          });
        }
      }
    }
    
    if (!bubbleUp) {
      e.stopPropagation();
    }
  };
        
  bindWheel = function () {
    element.on('wheel mousewheel onmousewheel', onWheel);
  };

  unbindWheel = function () {
    element.off('wheel mousewheel onmousewheel', onWheel);
  };
  
  bindWheel();
  scope.$on('$destroy', unbindWheel);
};

var snapscrollAsAnAttribute = ['$timeout', 'scroll', 'defaultSnapscrollScrollDelay', 'defaultSnapscrollSnapDuration', 'defaultSnapscrollBindScrollTimeout',
  function ($timeout, scroll, defaultSnapscrollScrollDelay, defaultSnapscrollSnapDuration, defaultSnapscrollBindScrollTimeout) {
    return {
      restrict: 'A',
      scope: scopeObject,
      controller: controller,
      link: function (scope, element, attributes) {
        var init,
            snapTo,
            onScroll,
            bindScroll,
            scrollBound,
            unbindScroll,
            scrollPromise,
            oneTimeAfterSnap,
            bindScrollPromise,
            snapEasing = attributes.snapEasing,
            scrollDelay = attributes.scrollDelay,
            snapDuration = attributes.snapDuration,
            preventSnappingAfterManualScroll = angular.isDefined(attributes.preventSnappingAfterManualScroll);
        
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
          if (!preventSnappingAfterManualScroll && scrollBound) {
            unbindScroll();
          }
          scroll.to.apply(scroll, args).then(function () {
            if (angular.isDefined(oneTimeAfterSnap)) {
              oneTimeAfterSnap.call();
              oneTimeAfterSnap = undefined;
            }
            if (!preventSnappingAfterManualScroll) {
              // bind scroll after a timeout
              $timeout.cancel(bindScrollPromise);
              bindScrollPromise = $timeout(bindScroll, defaultSnapscrollBindScrollTimeout);
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
          // if the bindScroll timeout expires while snapping is ongoing, restart the timer
          if (scope.snapDirection !== 0) {
            bindScrollPromise = $timeout(bindScroll, defaultSnapscrollBindScrollTimeout);
            return;
          }
          element.on('scroll', onScroll);
          scrollBound = true;
        };
        
        unbindScroll = function () {
          element.off('scroll', onScroll);
          scrollBound = false;
        };
        
        init = function () {
          if (scrollDelay === 'false') {
            scrollDelay = false;
          } else {
            scrollDelay = parseInt(scrollDelay, 10);
            if (isNaN(scrollDelay)) {
              scrollDelay = defaultSnapscrollScrollDelay;
            }
          }
        
          if (angular.isDefined(snapEasing)) {
            snapEasing = scope.$parent.$eval(snapEasing);
          }
          
          snapDuration = parseInt(snapDuration, 10);
          if (isNaN(snapDuration)) {
            snapDuration = defaultSnapscrollSnapDuration;
          }
          
          scope.$watch('snapAnimation', function (animation) {
            if (animation === undefined) {
              scope.snapAnimation = true;
            }
          });
          
          scope.defaultSnapHeight = element[0].offsetHeight;

          // snapIndex min
          scope.min = function () {
            return 0;
          };

          // snapIndex max
          scope.max = function () {
            return element.children().length - 1;
          };

          scope.isValid = function (snapIndex) {
            return snapIndex >= scope.min() && snapIndex <= scope.max();
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
          
          if (!preventSnappingAfterManualScroll) {
            bindScroll();
            scope.$on('$destroy', unbindScroll);
          }
          
          initWheelEvents(scope, element);
        };
        
        init();
      }
    };
  }
];

angular.module('snapscroll')
  .directive('snapscroll', snapscrollAsAnAttribute);