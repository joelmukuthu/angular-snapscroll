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

    function watchSnapIndex(scope, snapTo) {
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
                    scope.snapDirection = 'none'; // TODO: why?
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
                        scope.snapDirection = 'up';
                    } else if (snapIndex < previousSnapIndex) {
                        scope.snapDirection = 'down';
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
                    function getCurrentScrollTop() {
                        return element[0].scrollTop;
                    }

                    function getCurrentSnaps() {
                        return element.children();
                    }

                    function getSnapIndex(scrollTop) {
                        var snapIndex = -1,
                            snaps = getCurrentSnaps(),
                            lastSnapHeight;
                        while (scrollTop > 0) {
                            lastSnapHeight = snaps[++snapIndex].offsetHeight;
                            scrollTop -= lastSnapHeight;
                        }
                        if ((lastSnapHeight / 2) >= -scrollTop) {
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

                    var scrollPromise,
                        scrollDelay = attributes.scrollDelay;
                    function onScroll() {
                        scroll.stop(element);
                        if (scrollDelay === false) {
                            snapFromCurrentSrollTop();
                        } else {
                            $timeout.cancel(scrollPromise);
                            scrollPromise = $timeout(
                                snapFromCurrentSrollTop,
                                scrollDelay
                            );
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
                        // if the bindScroll timeout expires while snapping is
                        // ongoing, restart the timer
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
                        return scroll.to.apply(scroll, args).then(function () {
                            if (angular.isFunction(afterScroll)) {
                                afterScroll();
                            }
                            bindScrollAfterTimeout();
                        });
                    }

                    function snapTo(snapIndex, afterSnap) {
                        return scrollTo(getScrollTop(snapIndex), afterSnap);
                    }

                    var wheelBound;
                    function bindWheel() {
                        if (wheelBound) {
                            return;
                        }
                        wheelie.bind(element, {
                            up: function (e) {
                                e.preventDefault();
                                if (scope.snapDirection !== 'down') {
                                    var nextSnapIndex = scope.snapIndex - 1;
                                    if (nextSnapIndex >= scope.snapIndexMin()) {
                                        scope.$apply(function () {
                                            scope.snapIndex = nextSnapIndex;
                                        });
                                        e.stopPropagation();
                                    }
                                }
                            },
                            down: function (e) {
                                e.preventDefault();
                                if (scope.snapDirection !== 'up') {
                                    var nextSnapIndex = scope.snapIndex + 1;
                                    if (nextSnapIndex <= scope.scopeIndexMax()) {
                                        scope.$apply(function () {
                                            scope.snapIndex = nextSnapIndex;
                                        });
                                        e.stopPropagation();
                                    }
                                }
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
