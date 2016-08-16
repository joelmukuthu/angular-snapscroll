describe('Directive: snapscroll', function () {

    var $compile,
        $scope,
        scrollMock = {},
        defaultSnapscrollScrollEasingMock = jasmine.createSpy('easing');

    beforeEach(module('snapscroll'));

    beforeEach(module(function ($provide) {
        $provide.value('scrollie', scrollMock);
        $provide.value('defaultSnapscrollScrollEasing', defaultSnapscrollScrollEasingMock);
    }));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $scope = _$rootScope_.$new();
    }));

    afterEach(function () {
        angular.element(document).find('body').empty();
    });

    function compileElement(html, appendToBody) {
        var body,
            element = angular.element(html);

        if (!angular.isDefined(appendToBody)) {
            appendToBody = false;
        }

        if (appendToBody) {
            body = angular.element(document).find('body');
            body.append(element);
        }

        element = $compile(element)($scope);
        $scope.$digest();

        return element;
    }

    function testBeforeSnap(html) {
        var test = 0;
        $scope.beforeSnap = function () {
            test = 1;
        };
        compileElement(html);
        $scope.snapIndex = 1;
        $scope.$apply();
        expect(test).toBe(1);
    }

    function testExecutesBeforeSnapOnInitialSnap(html) {
        var test = 0;
        $scope.beforeSnap = function () {
            test = 1;
        };
        compileElement(html);
        expect(test).toBe(1);
    }

    function testCorrectSnapIndexPassedToBeforeSnap(html) {
        var first = true,
            second = false;
        $scope.snapIndex = 0;
        $scope.beforeSnap = function (snapIndex) {
            // this would work, but isn't very transparent
            // expect(snapIndex).toEqual($scope.snapIndex);
            if (first) {
                expect(snapIndex).toBe(0);
            } else if (second) {
                expect(snapIndex).toBe(1);
            }
        };
        compileElement(html);
        first = false;
        second = true;
        $scope.snapIndex = 1;
        $scope.$apply();
    }

    function testAllowsPreventingSnapping(html) {
        var prevent,
            test = 0;
        $scope.beforeSnap = function () {
            if (prevent) {
                return false;
            }
            test += 1;
        };
        expect(test).toBe(0);
        compileElement(html);
        expect(test).toBe(1);
        $scope.$apply(function () {
            $scope.snapIndex = 1;
        });
        expect(test).toBe(2);
        prevent = true;
        $scope.$apply(function () {
            $scope.snapIndex = 0;
        });
        expect($scope.snapIndex).toBe(1);
        expect(test).toBe(2);
    }

    function testAllowsSnappingToADifferentSnapIndex(html) {
        var snapIndexOverride;
        $scope.beforeSnap = function () {
            if (snapIndexOverride) {
                return snapIndexOverride;
            }
        };
        compileElement(html);
        expect($scope.snapIndex).toBe(0);
        snapIndexOverride = 2;
        $scope.$apply(function () {
            $scope.snapIndex = 1;
        });
        expect($scope.snapIndex).toBe(2);
    }

    function testIgnoresSnapIndexOverrideIfNotANumber(html) {
        var snapIndexOverride;
        $scope.beforeSnap = function () {
            if (snapIndexOverride !== undefined) {
                return snapIndexOverride;
            }
        };
        compileElement(html);
        expect($scope.snapIndex).toBe(0);
        snapIndexOverride = 'meh';
        $scope.$apply(function () {
            $scope.snapIndex = 1;
        });
        snapIndexOverride = NaN;
        $scope.$apply(function () {
            $scope.snapIndex = 0;
        });
        expect($scope.snapIndex).toBe(0);
    }

    function testIgnoresInvalidSnapIndexOverride(html) {
        var snapIndexOverride;
        $scope.beforeSnap = function () {
            if (snapIndexOverride) {
                return snapIndexOverride;
            }
        };
        compileElement(html);
        expect($scope.snapIndex).toBe(0);
        snapIndexOverride = 10;
        $scope.$apply(function () {
            $scope.snapIndex = 1;
        });
        expect($scope.snapIndex).toBe(1);
    }

    function testResetsSnapIndexIfSnappingPrevented(html) {
        var prevent = false;
        $scope.beforeSnap = function () {
            if (prevent) {
                return false;
            }
        };
        compileElement(html);
        $scope.snapIndex = 1;
        $scope.$apply();
        expect($scope.snapIndex).toBe(1);
        prevent = true;
        $scope.snapIndex = 2;
        $scope.$apply();
        expect($scope.snapIndex).toBe(1);
    }

    function testAfterSnap(html) {
        var test = 0;
        $scope.afterSnap = function () {
            test = 1;
        };
        compileElement(html);
        $scope.snapIndex = 1;
        $scope.$apply();
        expect(test).toBe(1);
    }

    function testExecutesAfterSnapOnInitialSnap(html) {
        var test = 0;
        $scope.afterSnap = function () {
            test = 1;
        };
        compileElement(html);
        expect(test).toBe(1);
    }

    function testCorrectSnapIndexPassedToAfterSnap(html) {
        $scope.snapIndex = 0;
        $scope.afterSnap = function (snapIndex) {
            // see note on: testCorrectSnapIndexPassedToBeforeSnap()
            expect(snapIndex).toEqual($scope.snapIndex);
        };
        compileElement(html);
        $scope.snapIndex = 1;
        $scope.$apply();
    }

    function triggerThreeMousewheelEvents(element, preventDefault) {
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120,
            preventDefault: preventDefault
        }); // mousewheel down
        element.triggerHandler({
            type: 'mousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120,
            preventDefault: preventDefault
        }); // mousewheel up
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120,
            preventDefault: preventDefault
        }); // mousewheel down
    }

    function testPreventsNormalScrollingUsingMousewheel(html) {
        var element,
            preventDefault = jasmine.createSpy('preventDefault');
        element = compileElement(html, true);
        triggerThreeMousewheelEvents(element, preventDefault);
        expect(preventDefault).toHaveBeenCalled();
        expect(preventDefault.calls.count()).toBe(3);
    }

    function testAllowsNormalScrollingUsingMousewheelWhenDisabled(html) {
        var element,
            preventDefault = jasmine.createSpy('preventDefault');
        element = compileElement(html, true);
        triggerThreeMousewheelEvents(element, preventDefault);
        expect(preventDefault).not.toHaveBeenCalled();
    }

    function testPreventsNormalScrollingUsingMousewheelWhenReEnabled(html) {
        var element,
            preventDefault = jasmine.createSpy('preventDefault');
        $scope.enabled = false;
        element = compileElement(html, true);
        triggerThreeMousewheelEvents(element, preventDefault);
        expect(preventDefault).not.toHaveBeenCalled();
        $scope.$apply(function () {
            $scope.enabled = true;
        });
        triggerThreeMousewheelEvents(element, preventDefault);
        expect(preventDefault).toHaveBeenCalled();
        expect(preventDefault.calls.count()).toBe(3);
    }

    function testPreventsBubblingUpOfMousewheelEventsIfElementIsStillScrollable(html) {
        var stopPropagation = jasmine.createSpy('stopPropagation');
        var element = compileElement(html, true);
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120,
            stopPropagation: stopPropagation
        }); // try to snap up
        expect(stopPropagation).not.toHaveBeenCalled();
        $scope.$apply(function () {
            $scope.index = 2;
        });
        element.triggerHandler({
            type: 'mousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120,
            stopPropagation: stopPropagation
        }); // try to snap down
        expect(stopPropagation).not.toHaveBeenCalled();
        $scope.$apply(function () {
            $scope.index = 1;
        });
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120,
            stopPropagation: stopPropagation
        }); // try to snap up
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120,
            stopPropagation: stopPropagation
        }); // then down
        expect(stopPropagation).toHaveBeenCalled();
        expect(stopPropagation.calls.count()).toBe(2);
    }

    function testSnapsDownOnMousewheelDown(html) {
        var element;
        element = compileElement(html, true);
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(50);
        element.triggerHandler({
            type: 'mousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(2);
        expect(element[0].scrollTop).toBe(100);
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(3);
        expect(element[0].scrollTop).toBe(150);
    }

    function testSnapsUpOnMousewheelUp(html) {
        var element;
        $scope.index = 3;
        element = compileElement(html, true);
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(2);
        expect(element[0].scrollTop).toBe(100);
        element.triggerHandler({
            type: 'mousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(50);
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(0);
        expect(element[0].scrollTop).toBe(0);
    }

    function testShowsRestOfBigSnapOnMousewheelDown(html) {
        var element;
        element = compileElement(html, true);
        expect($scope.index).toBe(0);
        expect(element[0].scrollTop).toBe(0);
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(50);
        element.triggerHandler({
            type: 'mousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(100);
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(125);
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(2);
        expect(element[0].scrollTop).toBe(175);
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(3);
        expect(element[0].scrollTop).toBe(225);
    }

    function testShowsRestOfBigSnapOnMousewheelUp(html) {
        var element;
        $scope.index = 3;
        element = compileElement(html, true);
        expect($scope.index).toBe(3);
        expect(element[0].scrollTop).toBe(225);
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(2);
        expect(element[0].scrollTop).toBe(175);
        element.triggerHandler({
            type: 'mousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(125);
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(75);
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(50);
        element.triggerHandler({
            type: 'onmousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(0);
        expect(element[0].scrollTop).toBe(0);
    }

    function testDoesntSnapDownOnNewDownMousewheelIfAlreadyScrolledToBottom(html) {
        var element;
        $scope.index = 3;
        element = compileElement(html, true);
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(3);
        expect(element[0].scrollTop).toBe(150);
        // try to wheel up then..
        element.triggerHandler({
            type: 'mousewheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(2);
        expect(element[0].scrollTop).toBe(100);
    }

    function testDoesntSnapUpOnNewDownMousewheelIfAlreadyScrolltopIsZero(html) {
        var element;
        element = compileElement(html, true);
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: 120,
            detail: -120,
            deltaY: -120
        });
        expect($scope.index).toBe(0);
        expect(element[0].scrollTop).toBe(0);
        // try to wheel down then..
        element.triggerHandler({
            type: 'mousewheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(50);
    }

    function testStopsListeningToMousewheelWhenScopeIsDestroyed(html) {
        var element;
        element = compileElement(html, true);
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(50);
        $scope.$destroy();
        element.triggerHandler({
            type: 'wheel',
            wheelDelta: -120,
            detail: 120,
            deltaY: 120
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(50);
    }

    function testUsesTheOriginalBrowserMousewheelEvents(html) {
        var element;
        $scope.index = 3;
        element = compileElement(html, true);
        element.triggerHandler({
            type: 'wheel',
            originalEvent: {
                wheelDelta: 120,
                detail: -120,
                deltaY: -120,
                preventDefault: angular.noop,
                stopPropagation: angular.noop
            }
        });
        expect($scope.index).toBe(2);
        expect(element[0].scrollTop).toBe(100);
        element.triggerHandler({
            type: 'mousewheel',
            originalEvent: {
                wheelDelta: 120,
                detail: -120,
                deltaY: -120,
                preventDefault: angular.noop,
                stopPropagation: angular.noop
            }
        });
        expect($scope.index).toBe(1);
        expect(element[0].scrollTop).toBe(50);
        element.triggerHandler({
            type: 'onmousewheel',
            originalEvent: {
                wheelDelta: 120,
                detail: -120,
                deltaY: -120,
                preventDefault: angular.noop,
                stopPropagation: angular.noop
            }
        });
        expect($scope.index).toBe(0);
        expect(element[0].scrollTop).toBe(0);
    }

    describe('as an attribute', function () {
        beforeEach(function () {
            var failureCallback;
            scrollMock.to = jasmine.createSpy('scroll.to').and.callFake(function (element, top) {
                element[0].scrollTop = top;
                return {
                    then: function (success, error) {
                        failureCallback = error;
                        if (angular.isFunction(success)) {
                            success();
                        }
                        return this;
                    }
                };
            });
            scrollMock.stop = jasmine.createSpy('scroll.stop').and.callFake(function () {
                if (angular.isFunction(failureCallback)) {
                    failureCallback();
                }
            });
        });

        it('can be declared as an attribute', function () {
            expect(function () {
                compileElement('<div snapscroll=""></div>');
            }).not.toThrow();
        });

        it('sets overflow-y on the element to auto if it\'s not set', function () {
            var element = compileElement('<div snapscroll=""></div>');
            expect(element.css('overflowY')).toBe('auto');
        });

        it('changes overflow-y to auto if it\'s set to visible', function () {
            var element = compileElement('<div snapscroll="" style="overflow-y: visible;"></div>');
            expect(element.css('overflowY')).toBe('auto');
        });

        it('changes overflow-y to auto if it\'s set to hidden', function () {
            var element = compileElement('<div snapscroll="" style="overflow-y: hidden;"></div>');
            expect(element.css('overflowY')).toBe('auto');
        });

        it('does not change overflow-y if it\'s set to scroll', function () {
            var element = compileElement('<div snapscroll="" style="overflow-y: scroll;"></div>');
            expect(element.css('overflowY')).toBe('scroll');
        });

        it('does not set overflow-y to auto if overflow is set to scroll', function () {
            var element = compileElement('<div snapscroll="" style="overflow: scroll;"></div>');
            expect(element.css('overflowY')).toBe('scroll');
        });

        it('defaults snapIndex to zero', function () {
            compileElement('<div snapscroll="" snap-index="snapIndex"></div>');
            expect($scope.snapIndex).toBe(0);
        });

        it('converts a snapIndex to a scrollTop (simple)', function () {
            var element = compileElement('<div snapscroll=""></div>');
            expect(element[0].scrollTop).toBe(0);
        });

        it('converts a snapIndex to a scrollTop (functional)', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.index = 1;
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(50);
        });

        it('doesn\'t snap to a snapIndex less than zero', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.index = 1;
            element = compileElement(html, true);
            $scope.$apply(function () {
                $scope.index = -1;
            });
            expect($scope.index).toBe(1);
            expect(element[0].scrollTop).toBe(50);
        });

        it('doesn\'t snap to a snapIndex greater than the number of available snaps (i.e. total - 1 since snapIndex is zero-based)', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.index = 1;
            element = compileElement(html, true);
            $scope.$apply(function () {
                $scope.index = 3;
            });
            expect($scope.index).toBe(1);
            expect(element[0].scrollTop).toBe(50);
        });

        it('casts any non-integer snapIndex to its nearest integer value', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.index = 0.0000005;
            element = compileElement(html, true);
            expect($scope.index).toBe(0);
            expect(element[0].scrollTop).toBe(0);
            $scope.$apply(function () {
                $scope.index = 1.499995;
            });
            expect($scope.index).toBe(1);
            expect(element[0].scrollTop).toBe(50);
            $scope.$apply(function () {
                $scope.index = 1.5;
            });
            expect($scope.index).toBe(2);
            expect(element[0].scrollTop).toBe(100);
        });

        it('doesn\'t fire before and afterSnap callbacks while resetting the scrollTop', inject(function ($timeout) {
            var element,
                test = 0,
                html = [
                    '<div snapscroll="" snap-index="index" after-snap="afterSnap()" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.afterSnap = function () {
                test += 1;
            };
            element = compileElement(html, true);
            expect($scope.index).toBe(0);
            expect(test).toBe(1);
            element[0].scrollTop = 24;
            element.triggerHandler('scroll');
            $timeout.flush();
            expect($scope.index).toBe(0);
            expect(test).toBe(1);
        }));

        it('allows setting an initial snapIndex as an integer', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="1" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(50);
        });

        it('allows setting an initial snapIndex using an expression', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="1 + 1" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(100);
        });

        it('allows setting an initial snapIndex using an angular expression', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index + 1" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.index = 1;
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(100);
        });

        it('does not snap to the initial index when it is disabled', function () {
            var element,
                html = [
                    '<div snapscroll="false" snap-index="1" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(0);
        });

        it('defaults snapIndex to zero if a non-number value is provided', function () {
            var html = [
                '<div snapscroll="" snap-index="snapIndex" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            $scope.snapIndex = 'bad';
            compileElement(html, true);
            expect($scope.snapIndex).toBe(0);
        });

        it('defaults snapIndex to zero if NaN is provided as snapIndex', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.index = NaN;
            element = compileElement(html, true);
            expect($scope.index).toBe(0);
            expect(element[0].scrollTop).toBe(0);
        });

        it('ignores changes to snapIndex if a non-number value is provided', function () {
            var html = [
                '<div snapscroll="" snap-index="snapIndex" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            $scope.snapIndex = 1;
            compileElement(html, true);
            expect($scope.snapIndex).toBe(1);
            $scope.$apply(function () {
                $scope.snapIndex = 'bad';
            });
            expect($scope.snapIndex).toBe(1);
        });

        it('updates the element\'s scrollTop if snapIndex is changed externally', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(0);
            $scope.$apply(function () {
                $scope.index = 1;
            });
            expect(element[0].scrollTop).toBe(50);
        });

        it('allows disabling snapscroll by passing a binding as the snapscroll attribute value', function () {
            var element,
                html = [
                    '<div snapscroll="enabled" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.enabled = false;
            $scope.index = 1;
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(0);
        });

        it('allows disabling snapscroll by passing false as the snapscroll attribute value', function () {
            var element,
                html = [
                    '<div snapscroll="false" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.index = 1;
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(0);
        });

        it('does not disable snapscroll by passing 0 as the snapscroll attribute value', function () {
            var element,
                html = [
                    '<div snapscroll="0" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.index = 1;
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(50);
        });

        it('allows re-enabling snapscroll using a binding passed as the snapscroll attribute value', function () {
            var element,
                html = [
                    '<div snapscroll="enabled" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.enabled = false;
            element = compileElement(html, true);
            $scope.enabled = true;
            $scope.$apply(function () {
                $scope.index = 1;
            });
            expect(element[0].scrollTop).toBe(50);
        });

        it('does not set snapIndex when disabled', function () {
            compileElement('<div snapscroll="false" snap-index="snapIndex"></div>');
            expect($scope.snapIndex).toBe(undefined);
        });

        it('sets snapIndex when snapscroll is re-enabled', function () {
            $scope.enabled = false;
            compileElement('<div snapscroll="enabled" snap-index="snapIndex"></div>');
            $scope.$apply(function () {
                $scope.enabled = true;
            });
            expect($scope.snapIndex).toBe(0);
        });

        it('automatically snaps to the current snapIndex when snapscroll is re-enabled', function () {
            var element,
                html = [
                    '<div snapscroll="enabled" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.enabled = false;
            element = compileElement(html, true);
            $scope.index = 1;
            $scope.$apply(function () {
                $scope.enabled = true;
            });
            expect(element[0].scrollTop).toBe(50);
        });

        it('automatically snaps to the initial snap-index when snapscroll is re-enabled', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="1" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.enabled = false;
            element = compileElement(html, true);
            $scope.$apply(function () {
                $scope.enabled = true;
            });
            expect(element[0].scrollTop).toBe(50);
        });

        it('updates snapIndex from the current scrollTop when snapscroll is re-enabled', function () {
            var element,
                html = [
                    '<div snapscroll="enabled" snap-index="index" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.enabled = false;
            element = compileElement(html, true);
            element[0].scrollTop = 50;
            $scope.$apply(function () {
                $scope.enabled = true;
            });
            expect($scope.index).toBe(1);
        });

        it('does not update snapIndex from the current scrollTop when snapscroll is re-enabled if prevent-snapping-after-manual-scroll is also set', function () {
            var element,
                html = [
                    '<div snapscroll="enabled" snap-index="index" prevent-snapping-after-manual-scroll="true" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.enabled = false;
            element = compileElement(html, true);
            element[0].scrollTop = 50;
            $scope.$apply(function () {
                $scope.enabled = true;
            });
            expect($scope.index).toBe(0);
        });

        it('calculates the scrollTop from the combined heights of the snaps', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="2" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(100);
        });

        it('allows snaps of varied heights', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="2" style="height: 50px; overflow: auto">',
                    '<div style="height: 200px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(250);
        });

        it('allows setting an initial snapHeight', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-height="50" style="overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
        });

        it('allows setting an initial snapHeight using an expression', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-height="20 + 30" style="overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
        });

        it('allows setting an initial snapHeight using an angular expression', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-height="h + 30" style="overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.h = 20;
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
        });

        it('does not change the element\'s height if a non-number snapHeight is provided', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-height="height" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.height = 'bad';
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
        });

        it('does not change the element\'s height if NaN is provided as snapHeight', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-height="height" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            $scope.height = NaN;
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
        });

        it('ignores changes to snapHeight if a non-number snapHeight is provided', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-height="height" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
            $scope.$apply(function () {
                $scope.height = 100;
            });
            expect(element[0].offsetHeight).toBe(100);
            $scope.$apply(function () {
                $scope.height = 'bad';
            });
            expect(element[0].offsetHeight).toBe(100);
        });

        it('updates the element\'s height when snapHeight is changed externally', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index" snap-height="height" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
            $scope.$apply(function () {
                $scope.height = 70;
            });
            expect(element[0].offsetHeight).toBe(70);
        });

        it('updates the heights of the element\'s children when snapHeight is changed externally', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="index" snap-height="height" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element.children()[0].offsetHeight).toBe(50);
            $scope.$apply(function () {
                $scope.height = 70;
            });
            expect(element.children()[0].offsetHeight).toBe(70);
        });

        it('can (therefore) function without heights set on the element or it\'s children, as long as snapHeight is provided', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="1" snap-height="height" style="overflow: auto">',
                    '<div></div>',
                    '<div></div>',
                    '</div>'
                ].join('');
            $scope.height = 50;
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(50);
            expect(element[0].offsetHeight).toBe(50);
            expect(element.children()[0].offsetHeight).toBe(50);
        });

        it('updates the scrollTop when snapHeight is changed so that the current snap is fully visible', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-index="1" snap-height="height" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(50);
            $scope.$apply(function () {
                $scope.height = 70;
            });
            expect(element[0].scrollTop).toBe(70);
        });

        it('does not update the scrollTop when snapHeight is changed and snapscroll is disabled', function () {
            var element,
                html = [
                    '<div snapscroll="false" snap-index="1" snap-height="height" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].scrollTop).toBe(0);
            $scope.$apply(function () {
                $scope.height = 70;
            });
            expect(element[0].scrollTop).toBe(0);
        });

        it('stays snapped to the current snapIndex when snapHeight is changed', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-height="height" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            $scope.index = 1;
            compileElement(html, true);
            expect($scope.index).toBe(1);
            $scope.$apply(function () {
                $scope.height = 100;
            });
            expect($scope.index).toBe(1);
        });

        it('does not change the element\'s or the snaps\' heights if the snapHeight attribute is not provided', function () {
            var element,
                html = [
                    '<div snapscroll="" style="height: 50px; overflow: auto">',
                    '<div style="height: 150px"></div>',
                    '<div style="height: 25px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
            var snaps = element.children();
            expect(snaps[0].offsetHeight).toBe(150);
            expect(snaps[1].offsetHeight).toBe(25);
        });

        it('does not change the element\'s or the snaps\' heights if snapscroll is disabled', function () {
            var element,
                html = [
                    '<div snapscroll="false" style="height: 50px; overflow: auto" snap-height="50">',
                    '<div style="height: 150px"></div>',
                    '<div style="height: 25px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
            var snaps = element.children();
            expect(snaps[0].offsetHeight).toBe(150);
            expect(snaps[1].offsetHeight).toBe(25);
        });

        it('changes the element\'s and the snaps\' heights if snapscroll is re-enabled', function () {
            var element,
                html = [
                    '<div snapscroll="enabled" style="height: 50px; overflow: auto" snap-height="height">',
                    '<div style="height: 150px"></div>',
                    '<div style="height: 25px"></div>',
                    '</div>'
                ].join('');
            $scope.enabled = false;
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
            var snaps = element.children();
            expect(snaps[0].offsetHeight).toBe(150);
            expect(snaps[1].offsetHeight).toBe(25);
            $scope.enabled = true;
            $scope.$apply(function () {
                $scope.height = 70;
            });
            expect(element[0].offsetHeight).toBe(70);
            expect(snaps[0].offsetHeight).toBe(70);
            expect(snaps[1].offsetHeight).toBe(70);
        });

        it('updates the element\'s and the snaps\' heights automatically when snapscroll is re-enabled', function () {
            var element,
                html = [
                    '<div snapscroll="enabled" style="height: 50px; overflow: auto" snap-height="70">',
                    '<div style="height: 150px"></div>',
                    '<div style="height: 25px"></div>',
                    '</div>'
                ].join('');
            $scope.enabled = false;
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(50);
            var snaps = element.children();
            expect(snaps[0].offsetHeight).toBe(150);
            expect(snaps[1].offsetHeight).toBe(25);
            $scope.$apply(function () {
                $scope.enabled = true;
            });
            expect(element[0].offsetHeight).toBe(70);
            expect(snaps[0].offsetHeight).toBe(70);
            expect(snaps[1].offsetHeight).toBe(70);
        });

        it('allows setting the snapHeight to zero', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-height="0" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect(element[0].offsetHeight).toBe(0);
            var snaps = element.children();
            expect(snaps[0].offsetHeight).toBe(0);
            expect(snaps[1].offsetHeight).toBe(0);
        });

        it('exposes a controller function setSnapHeight() for setting snapHeight from other directives', function () {
            var element,
                html = [
                    '<div snapscroll="" snap-height="snapHeight" style="height: 50px; overflow: auto">',
                    '<div style="height: 50px"></div>',
                    '<div style="height: 50px"></div>',
                    '</div>'
                ].join('');
            element = compileElement(html, true);
            expect($scope.snapHeight).toBe(undefined);
            $scope.$apply(function () {
                element.controller('snapscroll').setSnapHeight(100);
            });
            expect($scope.snapHeight).toBe(100);
        });

        it('can execute a beforeSnap callback', function () {
            testBeforeSnap('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div></div>');
        });

        it('executes the beforeSnap callback on the initial snap', function () {
            testExecutesBeforeSnapOnInitialSnap('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div></div>');
        });

        it('passes the incoming snapIndex to the beforeSnap callback', function () {
            testCorrectSnapIndexPassedToBeforeSnap('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap(snapIndex)"></div>');
        });

        it('allows preventing snapping by returning \'false\' from the beforeSnap callback', function () {
            testAllowsPreventingSnapping('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div><div></div></div>');
        });

        it('allows snapping to a different index by returning a number from the beforeSnap callback', function () {
            testAllowsSnappingToADifferentSnapIndex('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div><div></div><div></div></div>');
        });

        it('does not snap to a different snapIndex if the beforeSnap return value is not a number', function () {
            testIgnoresSnapIndexOverrideIfNotANumber('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div><div></div><div></div></div>');
        });

        it('does not snap to a different snapIndex if the beforeSnap return value is not a valid snapIndex', function () {
            testIgnoresInvalidSnapIndexOverride('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div><div></div><div></div></div>');
        });

        it('resets the snapIndex if snapping is prevented', function () {
            testResetsSnapIndexIfSnappingPrevented('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div><div></div></div>');
        });

        it('can execute an afterSnap callback', function () {
            testAfterSnap('<div snapscroll="" snap-index="snapIndex" after-snap="afterSnap()"><div></div></div>');
        });

        it('executes the afterSnap callback on the initial snap', function () {
            testExecutesAfterSnapOnInitialSnap('<div snapscroll="" snap-index="snapIndex" after-snap="afterSnap()"><div></div></div>');
        });

        it('passes the new snapIndex to the afterSnap callback', function () {
            testCorrectSnapIndexPassedToAfterSnap('<div snapscroll="" snap-index="snapIndex" after-snap="afterSnap(snapIndex)"></div>');
        });

        it('prevents normal scrolling using the mousewheel', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testPreventsNormalScrollingUsingMousewheel(html);
        });

        it('allows normal scrolling using the mousewheel when snapscroll is disabled', function () {
            var html = [
                '<div snapscroll="false" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testAllowsNormalScrollingUsingMousewheelWhenDisabled(html);
        });

        it('prevents normal scrolling using the mousewheel when snapscroll is re-enabled', function () {
            var html = [
                '<div snapscroll="enabled" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testPreventsNormalScrollingUsingMousewheelWhenReEnabled(html);
        });

        it('prevents bubbling up of the mousewheel events if the element is still scrollable (to allow nesting of snapscroll elements)', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testPreventsBubblingUpOfMousewheelEventsIfElementIsStillScrollable(html);
        });

        it('snaps down on mouseheel down', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testSnapsDownOnMousewheelDown(html);
        });

        it('snaps up on mouseheel up', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testSnapsUpOnMousewheelUp(html);
        });

        it('shows the rest of a snap instead of snapping down if it\'s greater than the snapHeight on mouseheel down', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 125px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testShowsRestOfBigSnapOnMousewheelDown(html);
        });

        it('shows the rest of a snap instead of snapping up if it\'s greater than the snapHeight on mouseheel up', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 125px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testShowsRestOfBigSnapOnMousewheelUp(html);
        });

        it('doens\'t snap down on a new down-mousewheel event if the element is already scrolled to the end', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testDoesntSnapDownOnNewDownMousewheelIfAlreadyScrolledToBottom(html);
        });

        it('doens\'t snap up on a new up-mousewheel event if the element\'s scrollTop is 0', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testDoesntSnapUpOnNewDownMousewheelIfAlreadyScrolltopIsZero(html);
        });

        it('stops listening to mousewheel events when scope is destroyed', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testStopsListeningToMousewheelWhenScopeIsDestroyed(html);
        });

        it('uses the browser mousewheel events in case the events are overwritten by some external library (i.e. jquery)', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testUsesTheOriginalBrowserMousewheelEvents(html);
        });

        // new test suite for tests to do with manual scrolling
        describe('', function () {
            var $timeout;

            beforeEach(inject(function (_$timeout_) {
                $timeout = _$timeout_;
            }));

            // override compileElement()
            function compileElement2(html, appendToBody) {
                // after the element is compiled, snapscroll does an initial snap after which bindScroll() is called (after a timeout).
                // to prevent that timeout, we need to call $timeout.flush()
                var element = compileElement(html, appendToBody); // call the regular compileElement() first
                $timeout.flush(); // then flush the timeout on bindScroll() so that scroll is bound synchronously
                return element;
            }

            it('converts a scrollTop to a snapIndex after a timeout (i.e. listens to scroll on the element)', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                expect($scope.index).toBe(0);
                element[0].scrollTop = 50;
                element.triggerHandler('scroll');
                $timeout.flush();
                expect($scope.index).toBe(1);
            });

            // TODO: this isn't really true since the scroll listeners are disabled while snapping
            it('stops scrollTop animation if there\'s a manual scroll on the element)', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                element.triggerHandler('scroll');
                expect(scrollMock.stop).toHaveBeenCalled();
            });

            it('defaults the scrollDelay timeout to the value of defaultSnapscrollScrollDelay', inject(function (defaultSnapscrollScrollDelay) {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                expect($scope.index).toBe(0);
                element[0].scrollTop = 50;
                element.triggerHandler('scroll');
                $timeout.flush(defaultSnapscrollScrollDelay - 1);
                expect($scope.index).toBe(0);
                $timeout.flush(1);
                expect($scope.index).toBe(1);
            }));

            it('allows setting the scrollDelay timeout', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" scroll-delay="400" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                expect($scope.index).toBe(0);
                element[0].scrollTop = 50;
                element.triggerHandler('scroll');
                $timeout.flush(399);
                expect($scope.index).toBe(0);
                $timeout.flush(1);
                expect($scope.index).toBe(1);
            });

            it('does not allow setting the scrollDelay timeout using expressions', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" scroll-delay="200 + 200" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                expect($scope.index).toBe(0);
                element[0].scrollTop = 50;
                element.triggerHandler('scroll');
                // TODO: not the best test for this. scrollDelay is set to 200 in this case
                $timeout.flush(250);
                expect($scope.index).toBe(1);
                $timeout.flush(150);
                expect($scope.index).toBe(1);
            });

            it('allows turning off the scrollDelay timeout if passed \'false\'', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" scroll-delay="false" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                expect($scope.index).toBe(0);
                element[0].scrollTop = 50;
                element.triggerHandler('scroll');
                // flush the timeout on bindScroll() first
                $timeout.flush();
                expect(function () {
                    $timeout.flush();
                }).toThrow();
                expect($scope.index).toBe(1);
            });

            it('defaults the the scrollDelay timeout to the value of defaultSnapscrollScrollDelay if a non-number scrollDelay is provided', inject(function (defaultSnapscrollScrollDelay) {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" scroll-delay="\'bad\'" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                expect($scope.index).toBe(0);
                element[0].scrollTop = 50;
                element.triggerHandler('scroll');
                $timeout.flush(defaultSnapscrollScrollDelay - 1);
                expect($scope.index).toBe(0);
                $timeout.flush(1);
                expect($scope.index).toBe(1);
            }));

            it('resets (rounds up/down) the scrollTop after a scroll event so that a snap is always fully visible', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 150px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                expect($scope.index).toBe(0);
                element[0].scrollTop = 25;
                element.triggerHandler('scroll');
                $timeout.flush();
                expect($scope.index).toBe(1);
                expect(element[0].scrollTop).toBe(50);
                // flush the timeout on bindScroll() first
                $timeout.flush();
                element[0].scrollTop = 126;
                element.triggerHandler('scroll');
                $timeout.flush();
                expect($scope.index).toBe(2);
                expect(element[0].scrollTop).toBe(200);
                // flush the timeout on bindScroll() first
                $timeout.flush();
                element[0].scrollTop = 24;
                element.triggerHandler('scroll');
                $timeout.flush();
                expect($scope.index).toBe(0);
                expect(element[0].scrollTop).toBe(0);
            });

            it('stays snapped to the current snapIndex when the element\'s height is changed', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" snap-height="height" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                $scope.index = 1;
                element = compileElement2(html, true);
                expect($scope.index).toBe(1);
                expect(element[0].scrollTop).toBe(50);
                $scope.$apply(function () {
                    element.css('height', '100px');
                });
                // on the browser, an element resize triggers a scroll
                element.triggerHandler('scroll');
                $timeout.flush();
                expect($scope.index).toBe(1);
                expect(element[0].scrollTop).toBe(50);
            });

            it('stays snapped to the current snapIndex when a child element\'s height is changed', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" snap-height="height" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                $scope.index = 1;
                element = compileElement2(html, true);
                expect($scope.index).toBe(1);
                expect(element[0].scrollTop).toBe(50);
                $scope.$apply(function () {
                    var children = element.children();
                    angular.element(children[0]).css('height', '100px');
                });
                // on the browser, an element resize triggers a scroll
                element.triggerHandler('scroll');
                $timeout.flush();
                expect($scope.index).toBe(1);
                expect(element[0].scrollTop).toBe(100);
            });

            it('stops listening on scroll event when scope is destroyed', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement2(html, true);
                $scope.$destroy();
                element[0].scrollTop = 50;
                element.triggerHandler('scroll');
                $timeout.verifyNoPendingTasks();
                expect(function () {
                    $timeout.flush();
                }).toThrow();
            });

            it('allows preventing the automatic snapping which happens after a manual scroll', function () {
                var element,
                    html = [
                        '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto" prevent-snapping-after-manual-scroll="">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                element = compileElement(html, true); // use the regular compileElement()
                expect(function () {
                    $timeout.flush();
                }).toThrow(); // test that no timeout was registered after the initial snap
                expect($scope.index).toBe(0);
                element[0].scrollTop = 25;
                element.triggerHandler('scroll');
                expect(function () {
                    $timeout.flush();
                }).toThrow(); // test that no timeout was registered after scroll was triggered
                expect($scope.index).toBe(0);
                expect(element[0].scrollTop).toBe(25);
            });

            it('does not snap reset scrollTop after a manual scroll when snapscroll has been disabled', function () {
                var element,
                    html = [
                        '<div snapscroll="enabled" snap-index="index" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 150px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                $scope.enabled = false;
                element = compileElement(html, true); // use the regular compileElement()
                expect(function () {
                    $timeout.flush();
                }).toThrow(); // test that no timeout was registered after the initial snap
                element[0].scrollTop = 25;
                element.triggerHandler('scroll');
                expect(function () {
                    $timeout.flush();
                }).toThrow(); // test that no timeout was registered after scroll was triggered
                expect(element[0].scrollTop).toBe(25);
            });

            it('resets scrollTop automatically so that the current snap is fully visible when snapscroll is re-enabled', function () {
                var element,
                    html = [
                        '<div snapscroll="enabled" snap-index="index" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 150px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                $scope.enabled = false;
                element = compileElement(html, true); // use the regular compileElement()
                expect(function () {
                    $timeout.flush();
                }).toThrow(); // test that no timeout was registered after the initial snap
                element[0].scrollTop = 25;
                element.triggerHandler('scroll');
                expect(function () {
                    $timeout.flush();
                }).toThrow(); // test that no timeout was registered after scroll was triggered
                expect(element[0].scrollTop).toBe(25);
                $scope.$apply(function () {
                    $scope.enabled = true;
                });
                $timeout.flush();
                expect($scope.index).toBe(1);
                expect(element[0].scrollTop).toBe(50);
            });

            it('resets scrollTop after a manual scroll when snapscroll is re-enabled', function () {
                var element,
                    html = [
                        '<div snapscroll="enabled" snap-index="index" style="height: 50px; overflow: auto">',
                        '<div style="height: 50px"></div>',
                        '<div style="height: 150px"></div>',
                        '<div style="height: 50px"></div>',
                        '</div>'
                    ].join('');
                $scope.enabled = false;
                element = compileElement(html, true); // use the regular compileElement()
                expect(function () {
                    $timeout.flush();
                }).toThrow(); // test that no timeout was registered after the initial snap
                element[0].scrollTop = 25;
                element.triggerHandler('scroll');
                expect(function () {
                    $timeout.flush();
                }).toThrow(); // test that no timeout was registered after scroll was triggered
                expect(element[0].scrollTop).toBe(25);
                $scope.$apply(function () {
                    $scope.enabled = true;
                });
                $timeout.flush();
                expect($scope.index).toBe(1);
                expect(element[0].scrollTop).toBe(50);
                element[0].scrollTop = 24;
                element.triggerHandler('scroll');
                $timeout.flush();
                expect($scope.index).toBe(0);
                expect(element[0].scrollTop).toBe(0);
            });
        });
    });

    // different test suite for animations
    describe('as an attribute', function () {
        var snapDurationMock,
            snapEasingMock;

        beforeEach(inject(function ($q) {
            var deferred = $q.defer();

            snapDurationMock = undefined;
            snapEasingMock = undefined;

            scrollMock.to = jasmine.createSpy('scroll.to').and.callFake(function (element, top, duration, easing) {
                if (angular.isDefined(duration)) {
                    snapDurationMock = duration;
                } else {
                    snapDurationMock = undefined;
                }
                if (angular.isFunction(easing)) {
                    easing.call();
                    snapEasingMock = 1;
                } else {
                    snapEasingMock = undefined;
                }
                element[0].scrollTop = top;
                deferred.resolve();
                return deferred.promise;
            });

            scrollMock.stop = jasmine.createSpy('scroll.stop').and.callFake(function () {
                deferred.reject();
            });
        }));

        it('animates the snapping by default', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.$apply(function () {
                $scope.index = 1;
            });
            expect(scrollMock.to).toHaveBeenCalled();
            expect(snapDurationMock).toBeDefined();
            expect(snapDurationMock).not.toBe(0);
        });

        it('allows disabling snapAnimation on initialisation', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-animation="animation" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            $scope.animation = false;
            compileElement(html, true);
            $scope.$apply(function () {
                $scope.index = 1;
            });
            expect(snapDurationMock).toBeUndefined();
        });

        it('allows enabling snapAnimation on initialisation (useless though as it\'s enabled by default)', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-animation="true" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.$apply(function () {
                $scope.index = 1;
            });
            expect(snapDurationMock).toBeDefined();
        });

        it('allows disabling snapAnimation on initialisation by passing a falsy value', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-animation="false" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.$apply(function () {
                $scope.index = 1;
            });
            expect(snapDurationMock).toBeUndefined();
        });

        it('allows enabling/disabling snapAnimation after initialisation i.e. creates a two-way bind to snapAnimation', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-animation="animation" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            $scope.index = 0;
            $scope.animation = false;
            compileElement(html, true);
            $scope.index = 1;
            $scope.animation = true;
            $scope.$apply();
            expect(snapDurationMock).toBeDefined();
            expect(snapDurationMock).not.toBe(0);
            $scope.index = 2;
            $scope.animation = false;
            $scope.$apply();
            expect(snapDurationMock).toBeUndefined();
        });

        it('allows setting the snapAnimation duration (snapDuration)', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-duration="10" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(snapDurationMock).toBe(10);
        });

        it('allows setting the snapDuration to zero', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-duration="0" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(snapDurationMock).toBeDefined();
            expect(snapDurationMock).toBe(0);
        });

        it('doesn\'t allow setting snapDuration using angular expressions', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-duration="bad" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            $scope.bad = 10;
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(snapDurationMock).toBeDefined();
            expect(snapDurationMock).not.toBe(10);
        });

        it('doesn\'t allow setting snapDuration using non-integer expressions', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-duration="\'bad\'" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(snapDurationMock).toBeDefined();
            expect(snapDurationMock).not.toBe('bad');
        });

        it('defaults snapDuration to the value of defaultSnapscrollSnapDuration', inject(function (defaultSnapscrollSnapDuration) {
            var html = [
                '<div snapscroll="" snap-index="index" snap-duration="\'bad\'" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(snapDurationMock).toBe(defaultSnapscrollSnapDuration);
        }));

        it('initializes snapDuration to the value of defaultSnapscrollSnapDuration', inject(function (defaultSnapscrollSnapDuration) {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(snapDurationMock).toBe(defaultSnapscrollSnapDuration);
        }));

        // TODO: is this functionality really necessary??
        it('allows setting the snapAnimation easing (snapEasing)', function () {
            var html = [
                '<div snapscroll="" snap-index="index" snap-easing="easing" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            $scope.easing = function () {};
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(snapEasingMock).toBe(1);
        });

        it('uses whichever snapEasing is provided', function () {
            var easing = jasmine.createSpy('easing');
            var html = [
                '<div snapscroll="" snap-index="index" snap-easing="easing" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            $scope.easing = easing;
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(easing).toHaveBeenCalled();
        });

        it('uses the defaultSnapscrollScrollEasing if set', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            compileElement(html, true);
            $scope.index = 1;
            $scope.$apply();
            expect(defaultSnapscrollScrollEasingMock).toHaveBeenCalled();
        });
    });

    // different test suite for tests requiring scroll.to() to be asynchronous
    describe('as an attribute', function () {
        var $timeout;

        function testDoesntSnapInTheSameDirectionOnNewMousewheelIfCurrentlySnapping(html) {
            var element;
            element = compileElement(html, true);
            $timeout.flush(); // flush timeout for initial snap
            element.triggerHandler({
                type: 'wheel',
                wheelDelta: -120,
                detail: 120,
                deltaY: 120
            });
            expect(element[0].scrollTop).toBe(0); // because animation is in progress
            element.triggerHandler({
                type: 'wheel',
                wheelDelta: -120,
                detail: 120,
                deltaY: 120
            });
            $timeout.flush(); // flush all animations
            expect(element[0].scrollTop).toBe(50); // because second wheel event was ignored
        }

        function testAllowsSnapingInTheOppositeDirectionOnNewMousewheelIfCurrentlySnapping(html) {
            var element;
            element = compileElement(html, true);
            $timeout.flush(); // flush timeout for initial snap
            element.triggerHandler({
                type: 'wheel',
                wheelDelta: -120,
                detail: 120,
                deltaY: 120
            });
            expect(element[0].scrollTop).toBe(0); // because animation is in progress
            element.triggerHandler({
                type: 'wheel',
                wheelDelta: 120,
                detail: -120,
                deltaY: -120
            });
            $timeout.flush(); // flush all animations
            expect(element[0].scrollTop).toBe(0); // because second wheel event was in the opposite direction
        }

        beforeEach(inject(function (_$timeout_) {
            $timeout = _$timeout_;
        }));

        beforeEach(function () {
            scrollMock.to = function (element, top, duration) {
                var currentAnimation = element.data('current-animation');
                if (currentAnimation) {
                    $timeout.cancel(currentAnimation);
                }
                currentAnimation = $timeout(function () {
                    element[0].scrollTop = top;
                }, duration);
                element.data('current-animation', currentAnimation);
                return {
                    then: angular.noop
                };
            };
            scrollMock.stop = function (element) {
                var currentAnimation = element.data('current-animation');
                if (currentAnimation) {
                    $timeout.cancel(currentAnimation);
                }
            };
        });

        it('doesn\'t snap in the same direction as a new mousewheel event if currently snapping', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testDoesntSnapInTheSameDirectionOnNewMousewheelIfCurrentlySnapping(html);
        });

        it('allows snapping in the opposite direction as a new mousewheel event if currently snapping', function () {
            var html = [
                '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '</div>'
            ].join('');
            testAllowsSnapingInTheOppositeDirectionOnNewMousewheelIfCurrentlySnapping(html);
        });
    });
});
