(function () {
  'use strict';

  var scopeObject = {
    enabled: '=snapscroll',
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

  function isNumber(value) {
    return angular.isNumber(value) && !isNaN(value);
  }

  var _unwatchSnapHeight;
  function unwatchSnapHeight() {
    if (_unwatchSnapHeight) {
      _unwatchSnapHeight();
    }
  }

  function watchSnapHeight(scope, callback) {
    _unwatchSnapHeight = scope.$watch('snapHeight',
      function (snapHeight, previousSnapHeight) {
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
      }
    );
  }

  var _unwatchSnapIndex;
  function unwatchSnapIndex() {
    if (_unwatchSnapIndex) {
      _unwatchSnapIndex();
    }
  }

  function watchSnapIndex(scope, callback) {
    _unwatchSnapIndex = scope.$watch('snapIndex',
      function (snapIndex, previousSnapIndex) {
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
        var beforeSnapReturnValue = scope.beforeSnap({snapIndex: snapIndex});
        if (beforeSnapReturnValue === false) {
          scope.ignoreThisSnapIndexChange = true;
          scope.snapIndex = previousSnapIndex;
          return;
        }
        if (isNumber(beforeSnapReturnValue) &&
          scope.isValid(beforeSnapReturnValue)) {
            scope.snapIndex = beforeSnapReturnValue;
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
      }
    );
  }

  var snapscrollAsAnAttribute = [
    '$timeout',
    'scroll',
    'wheelie',
    'defaultSnapscrollScrollDelay',
    'defaultSnapscrollSnapDuration',
    'defaultSnapscrollBindScrollTimeout',
    function (
      $timeout,
      scroll,
      wheelie,
      defaultSnapscrollScrollDelay,
      defaultSnapscrollSnapDuration,
      defaultSnapscrollBindScrollTimeout
    ) {
      return {
        restrict: 'A',
        scope: scopeObject,
        controller: controller,
        link: function (scope, element, attributes) {
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

          var snapTo; // damn it jshint
          function snapFromCurrentSrollTop() {
            var newSnapIndex = getSnapIndex(element[0].scrollTop);
            if (scope.snapIndex === newSnapIndex) {
              snapTo(newSnapIndex);
            } else {
              scope.$apply(function () {
                scope.snapIndex = newSnapIndex;
              });
            }
          }

          var scrollPromise,
              scrollDelay = attributes.scrollDelay;
          function onScroll() {
            scroll.stop(element);
            if (scrollDelay === false) {
              snapFromCurrentSrollTop();
            } else {
              $timeout.cancel(scrollPromise);
              scrollPromise = $timeout(snapFromCurrentSrollTop, scrollDelay);
            }
          }


          var scrollBound,
              bindScrollPromise,
              preventSnappingAfterManualScroll = angular.isDefined(
                attributes.preventSnappingAfterManualScroll
              );
          function bindScroll() {
            if (preventSnappingAfterManualScroll || scrollBound) {
              return;
            }
            // if the bindScroll timeout expires while snapping is ongoing,
            // restart the timer
            if (scope.snapDirection !== 'none') {
              bindScrollPromise = $timeout(
                bindScroll,
                defaultSnapscrollBindScrollTimeout
              );
              return;
            }
            element.on('scroll', onScroll);
            scrollBound = true;
          }

          function unbindScroll() {
            if (scrollBound) {
              element.off('scroll', onScroll);
              scrollBound = false;
            }
          }

          function bindScrollAfterTimeout() {
            if (!preventSnappingAfterManualScroll) {
              // bind scroll after a timeout
              $timeout.cancel(bindScrollPromise);
              bindScrollPromise = $timeout(
                bindScroll,
                defaultSnapscrollBindScrollTimeout
              );
            }
          }

          function getScrollTop(snapIndex) {
              var snaps = element.children();
              var combinedHeight = 0;
              for (var i = 0; i < snapIndex; i++) {
                  combinedHeight += snaps[i].offsetHeight;
              }
              return combinedHeight;
          }

          var snapEasing = attributes.snapEasing,
              snapDuration = attributes.snapDuration;
          snapTo = function(snapIndex, afterSnap) {
            var args,
                top = getScrollTop(snapIndex);
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
              if (angular.isFunction(afterSnap)) {
                afterSnap();
              }
              bindScrollAfterTimeout();
            });
          };

          var wheelBound;
          function bindWheel() {
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
            wheelBound = true;
          }

          function unbindWheel() {
            if (wheelBound) {
              wheelie.unbind(element);
              wheelBound = false;
            }
          }

          function updateSnapHeight(snapHeight) {
            element.css('height', snapHeight + 'px');
            var snaps = element.children();
            if (snaps.length) {
              angular.forEach(snaps, function (snap) {
                angular.element(snap).css('height', snapHeight + 'px');
              });
            }
            snapTo(scope.snapIndex);
          }

          function updateSnapIndexFromScrollTop() {
            if (preventSnappingAfterManualScroll) {
              return;
            }
            var currentScrollTop = element[0].scrollTop;
            if (currentScrollTop !== 0) {
              scope.snapIndex = getSnapIndex(currentScrollTop);
            }
          }

          function init() {
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
              return snapIndex >= scope.snapIndexMin() &&
                     snapIndex <= scope.scopeIndexMax();
            };

            if (element.css('overflowY') !== 'scroll') {
              element.css('overflowY', 'auto');
            }

            scope.$watch('enabled', function (enabled) {
              if (enabled === false) {
                unwatchSnapHeight();
                unwatchSnapIndex();
                unbindScroll();
                unbindWheel();
              } else {
                updateSnapIndexFromScrollTop();
                watchSnapHeight(scope, updateSnapHeight);
                watchSnapIndex(scope, snapTo);
                bindScroll();
                bindWheel();
              }
            });

            scope.$on('$destroy', unbindScroll);
            scope.$on('$destroy', unbindWheel);
          }

          init();
        }
      };
    }
  ];

  angular.module('snapscroll')
    .directive('snapscroll', snapscrollAsAnAttribute);
})();
