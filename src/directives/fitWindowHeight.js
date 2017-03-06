angular.module('snapscroll').directive('fitWindowHeight', [
    '$window',
    '$timeout',
    'defaultSnapscrollResizeDelay',
    function (
        $window,
        $timeout,
        defaultSnapscrollResizeDelay
    ) {
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
                            resizeDelay = defaultSnapscrollResizeDelay;
                        }
                    }

                    // set initial snapHeight
                    snapscroll.setSnapHeight($window.innerHeight);

                    // update snapHeight on window resize
                    windowElement = angular.element($window);
                    windowElement.on('resize', onWindowResize);
                    scope.$on('$destroy', function () {
                        windowElement.off('resize');
                    });
                }

                init();
            }
        };
    }
]);
