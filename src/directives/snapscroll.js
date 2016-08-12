(function () {
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

    function unwatchSnapHeight(scope) {
        if (scope.unwatchSnapHeight) {
            scope.unwatchSnapHeight();
        }
    }

    function watchSnapHeight(scope, callback) {
        scope.unwatchSnapHeight = scope.$watch('snapHeight',
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

    function unwatchSnapIndex(scope) {
        if (scope.unwatchSnapIndex) {
            scope.unwatchSnapIndex();
        }
    }

    function watchSnapIndex(scope, snapTo) {
        scope.unwatchSnapIndex = scope.$watch('snapIndex',
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
                    return;
                }
                var beforeSnapReturnValue = scope.beforeSnap({
                    snapIndex: snapIndex
                });
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
                if (angular.isFunction(snapTo)) {
                    if (snapIndex > previousSnapIndex) {
                        scope.snapDirection = 'down';
                    } else if (snapIndex < previousSnapIndex) {
                        scope.snapDirection = 'up';
                    }
                    snapTo(snapIndex, function () {
                        scope.snapDirection = 'none';
                        scope.afterSnap({
                            snapIndex: snapIndex
                        });
                    });
                }
            }
        );
    }

    var snapscrollAsAnAttribute = [
        '$timeout',
        'wheelie',
        'scrollie',
        'defaultSnapscrollScrollEasing',
        'defaultSnapscrollScrollDelay',
        'defaultSnapscrollSnapDuration',
        'defaultSnapscrollBindScrollTimeout',
        function (
            $timeout,
            wheelie,
            scrollie,
            defaultSnapscrollScrollEasing,
            defaultSnapscrollScrollDelay,
            defaultSnapscrollSnapDuration,
            defaultSnapscrollBindScrollTimeout
        ) {
            return {
                restrict: 'A',
                scope: scopeObject,
                controller: controller,
                link: function (scope, element, attributes) {
                    function getCurrentScrollTop() {
                        return element[0].scrollTop;
                    }

                    function getCurrentSnaps() {
                        return element.children();
                    }

                    function getSnapIndex(scrollTop) {
                        var snapIndex = -1,
                            snaps = getCurrentSnaps(),
                            snapHeight;
                        while (scrollTop > 0) {
                            snapHeight = snaps[++snapIndex].offsetHeight;
                            scrollTop -= snapHeight;
                        }
                        if ((snapHeight / 2) >= -scrollTop) {
                            snapIndex += 1;
                        }
                        return snapIndex;
                    }

                    function getScrollTop(snapIndex) {
                        var snaps = getCurrentSnaps(),
                            combinedHeight = 0;
                        for (var i = 0; i < snapIndex; i++) {
                            combinedHeight += snaps[i].offsetHeight;
                        }
                        return combinedHeight;
                    }

                    function snapFromCurrentSrollTop() {
                        var newSnapIndex = getSnapIndex(getCurrentScrollTop());
                        if (scope.snapIndex === newSnapIndex) {
                            snapTo(newSnapIndex);
                        } else {
                            scope.$apply(function () {
                                scope.snapIndex = newSnapIndex;
                            });
                        }
                    }

                    var scrollDelay = attributes.scrollDelay;
                    function onScroll() {
                        scrollie.stop(element);
                        if (scrollDelay === false) {
                            snapFromCurrentSrollTop();
                        } else {
                            $timeout.cancel(scope.scrollPromise);
                            scope.scrollPromise = $timeout(
                                snapFromCurrentSrollTop,
                                scrollDelay
                            );
                        }
                    }

                    var preventSnappingAfterManualScroll = angular.isDefined(
                          attributes.preventSnappingAfterManualScroll
                        );
                    function bindScroll() {
                        if (preventSnappingAfterManualScroll || scope.scrollBound) {
                            return;
                        }
                        // if the bindScroll timeout expires while snapping is
                        // ongoing, restart the timer
                        if (scope.snapDirection !== 'none') {
                            scope.bindScrollPromise = $timeout(
                                bindScroll,
                                defaultSnapscrollBindScrollTimeout
                            );
                            return;
                        }
                        element.on('scroll', onScroll);
                        scope.scrollBound = true;
                    }

                    function unbindScroll() {
                        if (scope.scrollBound) {
                            element.off('scroll', onScroll);
                            scope.scrollBound = false;
                        }
                    }

                    function bindScrollAfterTimeout() {
                        if (!preventSnappingAfterManualScroll) {
                            // bind scroll after a timeout
                            $timeout.cancel(scope.bindScrollPromise);
                            scope.bindScrollPromise = $timeout(
                                bindScroll,
                                defaultSnapscrollBindScrollTimeout
                            );
                        }
                    }

                    var snapEasing = attributes.snapEasing,
                        snapDuration = attributes.snapDuration;
                    function scrollTo(scrollTop, afterScroll) {
                        var args;
                        if (scope.snapAnimation) {
                            if (angular.isDefined(snapEasing)) {
                                args = [
                                    element,
                                    scrollTop,
                                    snapDuration,
                                    snapEasing
                                ];
                            } else {
                                args = [
                                    element,
                                    scrollTop,
                                    snapDuration
                                ];
                            }
                        } else {
                            args = [
                                element,
                                scrollTop
                            ];
                        }
                        unbindScroll();
                        return scrollie.to.apply(scrollie, args).then(function () {
                            if (angular.isFunction(afterScroll)) {
                                afterScroll();
                            }
                            bindScrollAfterTimeout();
                        });
                    }

                    function snapTo(snapIndex, afterSnap) {
                        return scrollTo(getScrollTop(snapIndex), afterSnap);
                    }

                    function getCurrentSnapHeight() {
                        var snaps = getCurrentSnaps();
                        return snaps[scope.snapIndex].offsetHeight;
                    }

                    function getSnapscrollHeight() {
                        return element[0].offsetHeight;
                    }

                    function snapUp() {
                        if (scope.snapDirection === 'up') {
                            return;
                        }

                        var currentScrollTop = getCurrentScrollTop();
                        if (currentScrollTop <= 0) {
                            return;
                        }

                        var snapscrollHeight = getSnapscrollHeight();
                        var currentSnapHeight = getCurrentSnapHeight();
                        var newScrollTop;
                        var newSnapIndex;
                        if (currentSnapHeight > snapscrollHeight) {
                            var startingScrollTop = getScrollTop(scope.snapIndex);
                            var remaining = currentScrollTop - startingScrollTop;
                            if (remaining > 0) {
                                newScrollTop = currentScrollTop - Math.min(remaining, snapscrollHeight);
                            }
                        }

                        if (angular.isUndefined(newScrollTop)) {
                            newSnapIndex = scope.snapIndex - 1;
                            newScrollTop = currentScrollTop - snapscrollHeight;
                        }

                        if (newScrollTop < 0) {
                            return;
                        }

                        if (angular.isDefined(newSnapIndex)) {
                            scope.$apply(function () {
                                scope.ignoreThisSnapIndexChange = true;
                                scope.snapIndex = newSnapIndex;
                            });
                        }

                        scope.snapDirection = 'up';
                        return scrollTo(newScrollTop, function () {
                            scope.snapDirection = 'none';
                        });
                    }

                    function snapDown() {
                        if (scope.snapDirection === 'down') {
                            return;
                        }

                        var currentScrollTop = getCurrentScrollTop();
                        var snapscrollHeight = getSnapscrollHeight();
                        var scrollHeight = element[0].scrollHeight;

                        if (currentScrollTop >= scrollHeight - snapscrollHeight) {
                            return;
                        }

                        var currentSnapHeight = getCurrentSnapHeight();
                        var newScrollTop;
                        var newSnapIndex;
                        if (currentSnapHeight > snapscrollHeight) {
                            var startingScrollTop = getScrollTop(scope.snapIndex);
                            var remaining = startingScrollTop + currentSnapHeight - currentScrollTop - snapscrollHeight;
                            if (remaining > 0) {
                                newScrollTop = currentScrollTop + Math.min(remaining, snapscrollHeight);
                            }
                        }

                        if (angular.isUndefined(newScrollTop)) {
                            newSnapIndex = scope.snapIndex + 1;
                            newScrollTop = currentScrollTop + snapscrollHeight;
                        }

                        if (newScrollTop >= scrollHeight) {
                            return;
                        }

                        if (angular.isDefined(newSnapIndex)) {
                            scope.$apply(function () {
                                scope.ignoreThisSnapIndexChange = true;
                                scope.snapIndex = newSnapIndex;
                            });
                        }

                        scope.snapDirection = 'down';
                        return scrollTo(newScrollTop, function () {
                            scope.snapDirection = 'none';
                        });
                    }

                    function bindWheel() {
                        if (scope.wheelBound) {
                            return;
                        }
                        wheelie.bind(element, {
                            up: function (e) {
                                e.preventDefault();
                                if (snapUp()) {
                                    e.stopPropagation();
                                }
                            },
                            down: function (e) {
                                e.preventDefault();
                                if (snapDown()) {
                                    e.stopPropagation();
                                }
                            }
                        });
                        scope.wheelBound = true;
                    }

                    function unbindWheel() {
                        if (scope.wheelBound) {
                            wheelie.unbind(element);
                            scope.wheelBound = false;
                        }
                    }

                    function updateSnapHeight(snapHeight) {
                        element.css('height', snapHeight + 'px');
                        var snaps = getCurrentSnaps();
                        if (snaps.length) {
                            angular.forEach(snaps, function (snap) {
                                angular.element(snap).css(
                                    'height',
                                    snapHeight + 'px'
                                );
                            });
                        }
                        snapTo(scope.snapIndex);
                    }

                    function updateSnapIndexFromScrollTop() {
                        if (preventSnappingAfterManualScroll) {
                            return;
                        }
                        var currentScrollTop = getCurrentScrollTop();
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
                        } else if (angular.isFunction(defaultSnapscrollScrollEasing)) {
                            snapEasing = defaultSnapscrollScrollEasing;
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
                            return getCurrentSnaps().length - 1;
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
                                unwatchSnapHeight(scope);
                                unwatchSnapIndex(scope);
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
