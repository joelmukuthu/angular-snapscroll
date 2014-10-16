'use strict';

angular.module('snapscroll')
  .directive('snapToWindowHeight', ['$window', '$timeout', function ($window, $timeout) {
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
            resizeDelay = parseInt(resizeDelay);
            if (isNaN(resizeDelay)) {
              resizeDelay = 400;
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