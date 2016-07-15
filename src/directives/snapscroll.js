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

  var isNumber = function(value) {
    return angular.isNumber(value) && !isNaN(value);
  };

  var watchSnapHeight = function (scope, callback) {
    scope.$watch('snapHeight', function (snapHeight, previousSnapHeight) {
      if (angular.isUndefined(snapHeight)) {
        return;
      }
      if (!isNumber(snapHeight)) {
        if (isNumber(previousSnapHeight)) {
          scope.snapHeight = previousSnapHeight;
        }
        return;
      }
      if (angular.isFunction(callback)) {
        callback(snapHeight);
      }
    });
  };

  var watchSnapIndex = function (scope, callback) {
    scope.$watch('snapIndex', function (snapIndex, previousSnapIndex) {
      if (angular.isUndefined(snapIndex)) {
        scope.snapIndex = 0;
        return;
      }
      if (!isNumber(snapIndex)) {
        if (isNumber(previousSnapIndex)) {
          scope.snapIndex = previousSnapIndex;
        } else {
          scope.snapIndex = 0;
        }
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
        scope.snapIndex = previousSnapIndex;
        scope.snapDirection = 'none';
        return;
      }
      if (scope.beforeSnap({snapIndex: snapIndex}) === false) {
        scope.ignoreThisSnapIndexChange = true;
        scope.snapIndex = previousSnapIndex;
        return;
      }
      if (angular.isFunction(callback)) {
        if (snapIndex > previousSnapIndex) {
          scope.snapDirection = 'up';
        } else if (snapIndex < previousSnapIndex) {
          scope.snapDirection = 'down';
        }
        callback(snapIndex, function () {
          scope.snapDirection = 'none';
          scope.afterSnap({snapIndex: snapIndex});
        });
      }
    });
  };

  var initWheelEvents = function (wheelie, scope, element) {
    function maybePreventBubbling(e, bubbleUp) {
      if (!bubbleUp) {
        e.stopPropagation();
      }
    }

    wheelie.bind(element, {
      up: function (e) {
        e.preventDefault();

        var bubbleUp;
        if (scope.snapDirection !== 'down') {
          if (scope.snapIndex - 1 < scope.snapIndexMin()) {
            bubbleUp = true;
          } else {
            bubbleUp = false;
            scope.$apply(function () {
              scope.snapIndex -= 1;
            });
          }
        }

        maybePreventBubbling(e, bubbleUp);
      },
      down: function (e) {
        e.preventDefault();

        var bubbleUp;
        if (scope.snapDirection !== 'up') {
          if (scope.snapIndex + 1 > scope.scopeIndexMax()) {
            bubbleUp = true;
          } else {
            bubbleUp = false;
            scope.$apply(function () {
              scope.snapIndex += 1;
            });
          }
        }

        maybePreventBubbling(e, bubbleUp);
      }
    });

    scope.$on('$destroy', function () {
      wheelie.unbind(element);
    });
  };

  var snapscrollAsAnAttribute = ['$timeout', 'scroll', 'wheelie', 'defaultSnapscrollScrollDelay', 'defaultSnapscrollSnapDuration', 'defaultSnapscrollBindScrollTimeout',
    function ($timeout, scroll, wheelie, defaultSnapscrollScrollDelay, defaultSnapscrollSnapDuration, defaultSnapscrollBindScrollTimeout) {
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
              bindScrollPromise,
              snapEasing = attributes.snapEasing,
              scrollDelay = attributes.scrollDelay,
              snapDuration = attributes.snapDuration,
              preventSnappingAfterManualScroll = angular.isDefined(attributes.preventSnappingAfterManualScroll);

          function getScrollTop(index) {
              var snaps = element.children();
              var combinedHeight = 0;
              for (var i = 0; i < index; i++) {
                  combinedHeight += parseInt(snaps[i].offsetHeight, 10);
              }
              return combinedHeight;
          }

          snapTo = function (index, afterSnap) {
            var args,
                top = getScrollTop(index);
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
              if (angular.isFunction(afterSnap)) {
                afterSnap();
              }
              if (!preventSnappingAfterManualScroll) {
                // bind scroll after a timeout
                $timeout.cancel(bindScrollPromise);
                bindScrollPromise = $timeout(bindScroll, defaultSnapscrollBindScrollTimeout);
              }
            });
          };

          function getSnapIndex(scrollTop) {
            var snapIndex = -1,
                snaps = element.children(),
                lastSnapHeight;
            while (scrollTop > 0) {
              scrollTop -= lastSnapHeight = snaps[++snapIndex].offsetHeight;
            }
            if ((lastSnapHeight / 2) >= -scrollTop) {
              snapIndex += 1;
            }
            return snapIndex;
          }

          onScroll = function () {
            var snap = function () {
              var newSnapIndex = getSnapIndex(element[0].scrollTop);
              if (scope.snapIndex === newSnapIndex) {
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
            if (scope.snapDirection !== 'none') {
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

            scope.snapIndexMin = function () {
              return 0;
            };

            scope.scopeIndexMax = function () {
              return element.children().length - 1;
            };

            scope.isValid = function (snapIndex) {
              return snapIndex >= scope.snapIndexMin() && snapIndex <= scope.scopeIndexMax();
            };

            if (element.css('overflowY') !== 'scroll') {
              element.css('overflowY', 'auto');
            }

            watchSnapHeight(scope, function (snapHeight) {
              element.css('height', snapHeight + 'px');
              var snaps = element.children();
              if (snaps.length) {
                angular.forEach(snaps, function (snap) {
                  angular.element(snap).css('height', snapHeight + 'px');
                });
              }
              snapTo(scope.snapIndex);
            });

            watchSnapIndex(scope, snapTo);

            if (!preventSnappingAfterManualScroll) {
              bindScroll();
              scope.$on('$destroy', unbindScroll);
            }

            initWheelEvents(wheelie, scope, element);
          };

          init();
        }
      };
    }
  ];

  angular.module('snapscroll')
    .directive('snapscroll', snapscrollAsAnAttribute);
})();
