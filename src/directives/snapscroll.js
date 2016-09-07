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
                    function isNumber(value) {
                        return angular.isNumber(value) && !isNaN(value);
                    }

                    function getChildren() {
                        return element.children();
                    }

                    function getHeight(domElement) {
                        return domElement.offsetHeight;
                    }

                    function getChildHeight(snapIndex) {
                        return getHeight(getChildren()[snapIndex]);
                    }

                    function getSnapHeight() {
                        return getHeight(element[0]);
                    }

                    function getScrollTop(innerSnapIndex, snapIndex) {
                        var scrollTop = 0;
                        var children = getChildren();
                        for (var i = 0; i < snapIndex; i++) {
                            scrollTop += getHeight(children[i]);
                        }
                        if (innerSnapIndex === 0) {
                            return scrollTop;
                        }
                        var snapHeight = getSnapHeight();
                        var childHeight = getHeight(children[snapIndex]);
                        var innerScrollTop;
                        if (angular.isDefined(scope.previousInnerSnapIndex) &&
                            innerSnapIndex < scope.previousInnerSnapIndex) {
                            innerScrollTop = childHeight;
                            for (var j = innerSnapIndex; j >= 0; j--) {
                                innerScrollTop -= snapHeight;
                            }
                        } else {
                            innerScrollTop = 0;
                            for (var k = 0; k < innerSnapIndex; k++) {
                                innerScrollTop += snapHeight;
                            }
                            var overflow = innerScrollTop + snapHeight - childHeight;
                            if (overflow > 0) {
                                innerScrollTop -= overflow;
                            }
                        }
                        return scrollTop + innerScrollTop;
                    }

                    function triggerSnapping() {
                        if (scope.snapIndexChanged) {
                            var returnValue = scope.beforeSnap({
                                snapIndex: scope.snapIndex
                            });
                            if (returnValue === false) {
                                if (angular.isDefined(scope.previousSnapIndex)) {
                                    scope.ignoreSnapIndexChange = true;
                                    scope.snapIndex = scope.previousSnapIndex;
                                }
                                return;
                            }
                            if (isNumber(returnValue)) {
                                scope.snapIndex = returnValue;
                                return;
                            }
                        }
                        return scrollTo(getScrollTop(
                            scope.innerSnapIndex,
                            scope.snapIndex
                        )).then(function () {
                            if (scope.snapIndexChanged) {
                                scope.afterSnap({
                                    snapIndex: scope.snapIndex
                                });
                            }
                            scope.snapIndexChanged = undefined;
                            scope.previousSnapIndex = undefined;
                            scope.previousInnerSnapIndex = undefined;
                        });
                    }

                    function getCurrentScrollTop() {
                        return element[0].scrollTop;
                    }

                    function scrollTo(scrollTop) {
                        var args;
                        if (!scope.snapAnimation) {
                            args = [
                                element,
                                scrollTop
                            ];
                        } else if (angular.isUndefined(scope.snapEasing)) {
                            // TODO: add tests for this. Will require refactoring
                            // the default values into an object, which is a good
                            // change anyway
                            args = [
                                element,
                                scrollTop,
                                scope.snapDuration
                            ];
                        } else {
                            args = [
                                element,
                                scrollTop,
                                scope.snapDuration,
                                scope.snapEasing
                            ];
                        }
                        var currentScrollTop = getCurrentScrollTop();
                        if (scrollTop > currentScrollTop) {
                            scope.snapDirection = 'down';
                        } else if (scrollTop < currentScrollTop) {
                            scope.snapDirection = 'up';
                        } else {
                            scope.snapDirection = 'same';
                        }
                        unbindScroll();
                        return scrollie.to.apply(scrollie, args).then(function () {
                            scope.snapDirection = undefined;
                            bindScrollAfterDelay();
                        });
                    }

                    function isScrollable() {
                        var snapHeight = getSnapHeight();
                        if (!snapHeight) {
                            return false;
                        }
                        var children = getChildren();
                        if (!children.length) {
                            return false;
                        }
                        var totalHeight = 0;
                        angular.forEach(children, function (child) {
                            totalHeight += getHeight(child);
                        });
                        if (totalHeight < snapHeight) {
                            return false;
                        }
                        return true;
                    }

                    function isSnapIndexValid(snapIndex) {
                        return snapIndex >= 0 &&
                               snapIndex <= getChildren().length - 1;
                    }

                    function trackSnapIndexChange(previous) {
                        scope.previousSnapIndex = previous;
                        scope.snapIndexChanged = true;
                    }

                    function updateIndeces(innerSnapIndex, snapIndex) {
                        if (scope.snapIndex !== snapIndex) {
                            trackSnapIndexChange(scope.snapIndex);
                            scope.ignoreSnapIndexChange = true;
                            scope.snapIndex = snapIndex;
                        }
                        if (scope.innerSnapIndex === innerSnapIndex) {
                            return;
                        }
                        scope.innerSnapIndex = innerSnapIndex;
                        return true;
                    }

                    function triggerSnappingTo(innerSnapIndex, snapIndex) {
                        if (updateIndeces(innerSnapIndex, snapIndex)) {
                            return;
                        }
                        triggerSnapping();
                    }

                    function snapIndexChanged(current, previous) {
                        if (!isScrollable()) {
                            return;
                        }
                        if (angular.isUndefined(current)) {
                            scope.snapIndex = 0;
                            return;
                        }
                        if (!isNumber(current)) {
                            if (isNumber(previous)) {
                                scope.snapIndex = previous;
                            } else {
                                scope.snapIndex = 0;
                            }
                            return;
                        }
                        if (current % 1 !== 0) {
                            scope.snapIndex = Math.round(current);
                            return;
                        }
                        if (scope.ignoreSnapIndexChange === true) {
                            scope.ignoreSnapIndexChange = undefined;
                            return;
                        }
                        if (!isSnapIndexValid(current)) {
                            if (!isSnapIndexValid(previous)) {
                                previous = 0;
                            }
                            scope.ignoreSnapIndexChange = true;
                            scope.snapIndex = previous;
                            return;
                        }
                        trackSnapIndexChange(previous);
                        triggerSnappingTo(0, current);
                    }

                    function watchSnapIndex() {
                        scope.unwatchSnapIndex = scope.$watch(
                            'snapIndex',
                            snapIndexChanged
                        );
                    }

                    function unwatchSnapIndex() {
                        if (!angular.isFunction(scope.unwatchSnapIndex)) {
                            return;
                        }
                        scope.unwatchSnapIndex();
                        scope.unwatchSnapIndex = undefined;
                    }

                    function getMaxInnerSnapIndex(snapIndex) {
                        var snapHeight = getSnapHeight();
                        var childHeight = getChildHeight(snapIndex);
                        if (childHeight <= snapHeight) {
                            return 0;
                        }
                        var max = parseInt((childHeight / snapHeight), 10);
                        if (childHeight % snapHeight === 0) {
                            max -= 1;
                        }
                        return max;
                    }

                    function isInnerSnapIndexValid(innerSnapIndex) {
                        if (innerSnapIndex < 0) {
                            return isSnapIndexValid(scope.snapIndex - 1);
                        }
                        if (innerSnapIndex > getMaxInnerSnapIndex(scope.snapIndex)) {
                            return isSnapIndexValid(scope.snapIndex + 1);
                        }
                        return true;
                    }

                    function innerSnapIndexChanged(current, previous) {
                        if (angular.isUndefined(current)) {
                            return;
                        }
                        var newInnerSnapIndex, newSnapIndex;
                        if (current < 0) {
                            newInnerSnapIndex = getMaxInnerSnapIndex(
                                scope.snapIndex - 1
                            );
                            newSnapIndex = scope.snapIndex - 1;
                        } else if (current > getMaxInnerSnapIndex(scope.snapIndex)) {
                            newInnerSnapIndex = 0;
                            newSnapIndex = scope.snapIndex + 1;
                        }
                        if (angular.isDefined(newInnerSnapIndex) &&
                            angular.isDefined(newSnapIndex)) {
                            updateIndeces(newInnerSnapIndex, newSnapIndex);
                            return;
                        }
                        scope.previousInnerSnapIndex = previous;
                        triggerSnapping();
                    }

                    function watchInnerSnapIndex() {
                        scope.unwatchInnerSnapIndex = scope.$watch(
                            'innerSnapIndex',
                            innerSnapIndexChanged
                        );
                    }

                    function unwatchInnerSnapIndex() {
                        if (!angular.isFunction(scope.unwatchInnerSnapIndex)) {
                            return;
                        }
                        scope.unwatchInnerSnapIndex();
                        scope.unwatchInnerSnapIndex = undefined;
                    }

                    function snap(direction) {
                        if (!isScrollable()) {
                            return;
                        }
                        if (scope.snapDirection === direction) {
                            return true;
                        }
                        var newInnerSnapIndex;
                        if (direction === 'up') {
                            newInnerSnapIndex = scope.innerSnapIndex - 1;
                        }
                        if (direction === 'down') {
                            newInnerSnapIndex = scope.innerSnapIndex + 1;
                        }
                        if (!isInnerSnapIndexValid(newInnerSnapIndex)) {
                            return;
                        }
                        scope.$apply(function () {
                            scope.innerSnapIndex = newInnerSnapIndex;
                        });
                        return true;
                    }

                    function snapUp() {
                        return snap('up');
                    }

                    function snapDown() {
                        return snap('down');
                    }

                    function bindWheel() {
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
                    }

                    function unbindWheel() {
                        wheelie.unbind(element);
                    }

                    function setHeight(angularElement, height) {
                        angularElement.css('height', height + 'px');
                    }

                    function snapHeightChanged(current, previous) {
                        if (angular.isUndefined(current)) {
                            return;
                        }
                        if (!isNumber(current)) {
                            if (isNumber(previous)) {
                                scope.snapHeight = previous;
                            }
                            return;
                        }
                        setHeight(element, current);
                        angular.forEach(getChildren(), function (child) {
                            setHeight(angular.element(child), current);
                        });
                        if (angular.isDefined(scope.snapIndex)) {
                            var innerSnapIndex = scope.innerSnapIndex;
                            if (angular.isUndefined(innerSnapIndex)) {
                                innerSnapIndex = 0;
                            }
                            triggerSnappingTo(innerSnapIndex, scope.snapIndex);
                        }
                    }

                    function watchSnapHeight() {
                        scope.unwatchSnapHeight = scope.$watch(
                            'snapHeight',
                            snapHeightChanged
                        );
                    }

                    function unwatchSnapHeight() {
                        if (!angular.isFunction(scope.unwatchSnapHeight)) {
                            return;
                        }
                        scope.unwatchSnapHeight();
                        scope.unwatchSnapHeight = undefined;
                    }

                    function getIndeces(scrollTop) {
                        var snapIndex = 0;
                        var innerSnapIndex = 0;

                        if (scrollTop > 0) {
                            snapIndex = -1;
                            var children = getChildren();
                            var childHeight;
                            while (scrollTop > 0) {
                                childHeight = getHeight(children[++snapIndex]);
                                scrollTop -= childHeight;
                            }
                            var snapHeight = getSnapHeight();
                            if (childHeight > snapHeight) {
                                scrollTop += childHeight - snapHeight;
                                if (scrollTop >= snapHeight) {
                                    innerSnapIndex++;
                                }
                                while (scrollTop > 0) {
                                    innerSnapIndex++;
                                    scrollTop -= snapHeight;
                                }
                                if ((snapHeight / 2) >= -scrollTop) {
                                    innerSnapIndex += 1;
                                }
                            } else if ((childHeight / 2) >= -scrollTop) {
                                snapIndex += 1;
                            }
                        }

                        return {
                            snapIndex: snapIndex,
                            innerSnapIndex: innerSnapIndex
                        };
                    }

                    function onScroll() {
                        function snapFromSrollTop() {
                            var indeces = getIndeces(getCurrentScrollTop());
                            triggerSnappingTo(
                                indeces.innerSnapIndex,
                                indeces.snapIndex
                            );
                        }
                        scrollie.stop(element);
                        if (scope.scrollDelay === false) {
                            snapFromSrollTop();
                        } else {
                            $timeout.cancel(scope.scrollPromise);
                            scope.scrollPromise = $timeout(
                                function () {
                                    snapFromSrollTop();
                                    scope.scrollPromise = undefined;
                                },
                                scope.scrollDelay
                            );
                        }
                    }

                    function bindScroll() {
                        if (scope.preventSnappingAfterManualScroll ||
                            scope.scrollBound) {
                            return;
                        }
                        if (angular.isDefined(scope.snapDirection)) { // still snapping
                            // TODO: add tests for this
                            bindScrollAfterDelay();
                            return;
                        }
                        element.on('scroll', onScroll);
                        scope.scrollBound = true;
                    }

                    function unbindScroll() {
                        if (!scope.scrollBound) {
                            return;
                        }
                        element.off('scroll', onScroll);
                        scope.scrollBound = false;
                    }

                    function bindScrollAfterDelay() {
                        if (scope.preventSnappingAfterManualScroll) {
                            return;
                        }
                        if (scope.bindScrollPromise) {
                            $timeout.cancel(scope.bindScrollPromise);
                        }
                        scope.bindScrollPromise = $timeout(
                            function () {
                                bindScroll();
                                scope.bindScrollPromise = undefined;
                            },
                            defaultSnapscrollBindScrollTimeout
                        );
                    }

                    function init() {
                        var scrollDelay = attributes.scrollDelay;
                        if (scrollDelay === 'false') {
                            scope.scrollDelay = false;
                        } else {
                            scrollDelay = parseInt(scrollDelay, 10);
                            if (isNaN(scrollDelay)) {
                                scrollDelay = defaultSnapscrollScrollDelay;
                            }
                            scope.scrollDelay = scrollDelay;
                        }

                        var snapEasing = attributes.snapEasing;
                        if (angular.isDefined(snapEasing)) {
                            scope.snapEasing = scope.$parent.$eval(snapEasing);
                        } else if (angular.isFunction(defaultSnapscrollScrollEasing)) {
                            scope.snapEasing = defaultSnapscrollScrollEasing;
                        }

                        var snapDuration = parseInt(attributes.snapDuration, 10);
                        if (isNaN(snapDuration)) {
                            snapDuration = defaultSnapscrollSnapDuration;
                        }
                        scope.snapDuration = snapDuration;

                        // TODO: perform initial snap without animation
                        if (angular.isUndefined(scope.snapAnimation)) {
                            scope.snapAnimation = true;
                        }

                        scope.preventSnappingAfterManualScroll = angular.isDefined(
                            attributes.preventSnappingAfterManualScroll
                        );

                        if (element.css('overflowY') !== 'scroll') {
                            element.css('overflowY', 'auto');
                        }

                        scope.$watch('enabled', function (current, previous) {
                            function updateIndecesFromScrollTop() {
                                if (scope.preventSnappingAfterManualScroll) {
                                    return;
                                }
                                var indeces = getIndeces(getCurrentScrollTop());
                                updateIndeces(
                                    indeces.innerSnapIndex,
                                    indeces.snapIndex
                                );
                            }
                            if (current !== false) {
                                if (previous === false) {
                                    updateIndecesFromScrollTop();
                                }
                                watchInnerSnapIndex();
                                watchSnapIndex();
                                watchSnapHeight();
                                bindScroll();
                                bindWheel();
                            } else {
                                unwatchInnerSnapIndex();
                                unwatchSnapIndex();
                                unwatchSnapHeight();
                                unbindScroll();
                                unbindWheel();
                            }
                        });

                        scope.$on('$destroy', function () {
                            if (scope.enabled !== false) {
                                unbindScroll();
                                unbindWheel();
                            }
                        });
                    }

                    init();
                }
            };
        }
    ];

    angular.module('snapscroll')
        .directive('snapscroll', snapscrollAsAnAttribute);
})();
