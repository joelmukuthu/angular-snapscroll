'use strict';

function easeInOutQuad(t, b, c, d) {
  t /= d/2;
  if (t < 1) {
    return c/2*t*t + b;
  }
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
}

angular
  .module('snapscroll', [])
  .value('defaultSnapscrollScrollEasing', easeInOutQuad)
  .value('defaultSnapscrollScrollDelay', 250)
  .value('defaultSnapscrollSnapDuration', 800)
  .value('defaultSnapscrollSnapToWindowHeightResizeDelay', 400)
  .value('defaultSnapscrollBindScrollTimeout', 400);

(function () {
  'use strict';

  angular.module('snapscroll')
    .directive('fitWindowHeight', ['$window', '$timeout', 'defaultSnapscrollSnapToWindowHeightResizeDelay',
      function ($window, $timeout, defaultSnapscrollSnapToWindowHeightResizeDelay) {
        return {
          restrict: 'A',
          require: 'snapscroll',
          link: function (scope, element, attributes, snapscroll) {
            var windowElement,
                resizePromise,
                resizeDelay = attributes.resizeDelay;

            function onWindowResize() {
              if (resizeDelay === false) {
                snapscroll.setSnapHeight($window.innerHeight);
              } else {
                $timeout.cancel(resizePromise);
                resizePromise = $timeout(function () {
                  snapscroll.setSnapHeight($window.innerHeight);
                }, resizeDelay);
              }
            }

            function init() {
              if (resizeDelay === 'false') {
                resizeDelay = false;
              } else {
                resizeDelay = parseInt(resizeDelay, 10);
                if (isNaN(resizeDelay)) {
                  resizeDelay = defaultSnapscrollSnapToWindowHeightResizeDelay;
                }
              }

              // set initial snapHeight
              snapscroll.setSnapHeight($window.innerHeight);

              // update snapHeight on window resize
              windowElement = angular.element($window);
              windowElement.on('resize', onWindowResize);
              scope.$on('$destroy', function () {
                windowElement.off('resize', onWindowResize);
              });
            }

            init();
          }
        };
    }]);
  
})();
(function () {
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
  
})();
(function () {
  'use strict';
  
  // all this is adapted from https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js
  // ngAnimate does have $$animateReflow, but that was not built to be a wrapper around requestAnimationFrame, hence this.

  var getWithVendorPrefix = function (funcName, $window) {
    var vendors = ['webkit', 'moz'],
        func;
    for (var i = 0; i < vendors.length && !func; ++i) {
      var vp = vendors[i];
      func = $window[vp + funcName];
    }
    return func;
  };

  var iOS6 = function ($window) {
    return /iP(ad|hone|od).*OS 6/.test($window.navigator.userAgent);
  };

  if (!Date.now) {
    Date.now = function() {
      return new Date().getTime();
    };
  }

  var snapscroll = angular.module('snapscroll');

  snapscroll.factory('requestAnimation', ['$timeout', '$window', 
    function ($timeout, $window) {
      var lastTime,
          requestAnimation = $window.requestAnimationFrame || getWithVendorPrefix('RequestAnimationFrame', $window);

      if (!requestAnimation || iOS6($window)) { // iOS6 is buggy
        requestAnimation = function(callback) {
          var now = Date.now();
          var nextTime = Math.max(lastTime + 16, now);
          return $timeout(function() {
            callback(lastTime = nextTime);
          }, nextTime - now);
        };
      }

      return requestAnimation;
  }]);

  snapscroll.factory('cancelAnimation', ['$timeout', '$window', 
    function ($timeout, $window) {
      var cancelAnimation = $window.cancelAnimationFrame || getWithVendorPrefix('CancelAnimationFrame', $window) || getWithVendorPrefix('CancelRequestAnimationFrame', $window);

      if (!cancelAnimation || iOS6($window)) { // iOS6 is buggy
        cancelAnimation = $timeout.cancel;
      }

      return cancelAnimation;
    }]);
  
})();
(function () {
  'use strict';
  
  // this is built upon http://stackoverflow.com/a/16136789/1004406

  var snapscroll = angular.module('snapscroll');

  snapscroll.factory('scroll', ['$q', 'requestAnimation', 'cancelAnimation', 'defaultSnapscrollScrollEasing',
    function ($q, requestAnimation, cancelAnimation, defaultSnapscrollScrollEasing) {

      function cleanUp(element, animation) {
        animation = null;
        element.data('snapscroll-animation', null);
        element.data('snapscroll-animation-deferred', null);
      }

      return {
        to: function (element, top, duration, easing) {
          var start,
              change,
              animate,
              deferred,
              animation,
              increment,
              currentTime;

          animate = function () {
            currentTime += increment;
            element[0].scrollTop = easing(currentTime, start, change, duration);
            if(currentTime < duration) {
              animation = requestAnimation(animate, increment);
              element.data('snapscroll-animation', animation);
            } else {
              cleanUp(element, animation);
              deferred.resolve();
            }
          };

          if (!angular.isElement(element) || !angular.isNumber(top)) {
            return;
          }

          deferred = $q.defer();
          duration = parseInt(duration);
          animation = element.data('snapscroll-animation');

          if (animation) {
            cancelAnimation(animation);
            // TODO: should the promise be rejected at this point since this is just cleaning up? 
            // element.data('snapscroll-animation-deferred').reject();
            cleanUp(element, animation);
          }

          if (duration === 0 || isNaN(duration)) {
            element[0].scrollTop = top;
            deferred.resolve();
          } else {
            if (typeof easing !== 'function') {
              easing = defaultSnapscrollScrollEasing;
            }
            start = element[0].scrollTop;
            change = top - start;
            currentTime = 0;
            increment = 20;
            animate();
          }

          element.data('snapscroll-animation-deferred', deferred);
          return deferred.promise;
        },

        stop: function (element) {
          var animation = element.data('snapscroll-animation');
          if (animation) {
            cancelAnimation(animation);
            element.data('snapscroll-animation-deferred').reject();
            cleanUp(element, animation);
          }
        }
      };
  }]);
  
})();