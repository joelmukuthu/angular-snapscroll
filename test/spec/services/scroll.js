describe('Service: scroll', function () {
    var element,
        requestAnimationMock,
        cancelAnimationMock;

    beforeEach(module('snapscroll'));

    beforeEach(module(function ($provide) {
        $provide.value('requestAnimation', requestAnimationMock);
        $provide.value('cancelAnimation', cancelAnimationMock);
    }));

    beforeEach(function () {
        var html = [
            '<div style="height: 100px; overflow: auto">',
            '<div style="height: 1000px"></div>',
            '</div>'
        ].join('');
        element = angular.element(html);
        angular.element(document).find('body').append(element);
    });

    afterEach(function () {
        angular.element(document).find('body').empty();
    });

    it('provides a \'to\' function and a \'stop\' function', inject(function (scroll) {
        expect(angular.isFunction(scroll.to)).toBe(true);
        expect(angular.isFunction(scroll.stop)).toBe(true);
    }));

    describe('.to', function () {
        var scroll;

        beforeEach(function () {
            // create a mock requestAnimation that calls the animation function syncronously
            requestAnimationMock = jasmine.createSpy('requestAnimationMock').and.callFake(function (animate) {
                animate();
            });
            cancelAnimationMock = jasmine.createSpy('cancelAnimationMock');
        });

        // this inject() call has to come after the beforeEach above so that the mock variables are replaced BEFORE the injector is initialised
        beforeEach(inject(function (_scroll_) {
            scroll = _scroll_;
        }));

        it('sets the scrollTop without animating if duration is not provided', function () {
            scroll.to(element, 10);
            expect(element[0].scrollTop).toBe(10);
            expect(requestAnimationMock).not.toHaveBeenCalled();
        });

        it('sets the scrollTop without animating if duration provided is zero', function () {
            scroll.to(element, 10, 0);
            expect(element[0].scrollTop).toBe(10);
            expect(requestAnimationMock).not.toHaveBeenCalled();
        });

        it('sets the scrollTop without animating if duration provided is not a number', function () {
            scroll.to(element, 10, 'bad');
            expect(element[0].scrollTop).toBe(10);
            expect(requestAnimationMock).not.toHaveBeenCalled();
        });

        it('sets the scrollTop without animating if duration provided is <= 20ms', function () {
            scroll.to(element, 10, 20);
            expect(element[0].scrollTop).toBe(10);
            expect(requestAnimationMock).not.toHaveBeenCalled();
        });

        it('does nothing if the new scrollTop is not provided', function () {
            scroll.to(element);
            expect(requestAnimationMock).not.toHaveBeenCalled();
        });

        it('does nothing if the new scrollTop is not a number', function () {
            scroll.to(element, 'bad');
            expect(requestAnimationMock).not.toHaveBeenCalled();
        });

        it('does nothing if element is not provided', function () {
            scroll.to();
            expect(requestAnimationMock).not.toHaveBeenCalled();
        });

        it('does nothing if element is not an angular element', function () {
            scroll.to('bad');
            expect(requestAnimationMock).not.toHaveBeenCalled();
        });

        it('animates scrollTop if a duration is provided', function () {
            scroll.to(element, 400, 400);
            expect(requestAnimationMock.calls.count()).toBeGreaterThan(1); // i.e. requestAnimationMock should be called more than once if there was animation
            expect(element[0].scrollTop).toBe(400);
        });

        it('animates scrollTop in increments of 20ms', function () {
            scroll.to(element, 41, 400);
            expect(requestAnimationMock.calls.count()).toEqual(19); // i.e. toEqual((400/20) - 1) since requestAnimationMock won't be called when duration equals 20ms (the last animation cycle)
            expect(element[0].scrollTop).toBe(41);
        });

        it('returns a promise object', function () {
            expect(angular.isFunction(scroll.to(element, 10).then)).toBe(true);
        });

        it('resolves the promise when animation is complete', inject(function ($rootScope) {
            var success = jasmine.createSpy('success');
            scroll.to(element, 400, 20).then(success);
            expect(element[0].scrollTop).toBe(400);
            // the 'then' function is not called synchronously since the promise API is designed to be async, whether or not it was called synchronously (from the Angular docs)
            expect(success).not.toHaveBeenCalled();
            // propagate resolution to the 'then' function
            $rootScope.$apply();
            expect(success).toHaveBeenCalled();
        }));

        it('resolves the promise even if the provided scrollTop is the same as the current scrollTop', inject(function ($rootScope) {
            var success1 = jasmine.createSpy('success1'),
                success2 = jasmine.createSpy('success2');
            scroll.to(element, 400, 40).then(success1);
            expect(element[0].scrollTop).toBe(400);
            scroll.to(element, 400, 40).then(success2);
            expect(element[0].scrollTop).toBe(400);
            $rootScope.$apply();
            expect(success1).toHaveBeenCalled();
            expect(success2).toHaveBeenCalled();
        }));

        it('resolves the promise immediately if not animating (e.g. when duration is zero or not provided or less than 20ms)', inject(function ($rootScope) {
            var success = jasmine.createSpy('success');
            scroll.to(element, 400).then(success);
            expect(element[0].scrollTop).toBe(400);
            expect(requestAnimationMock).not.toHaveBeenCalled();
            $rootScope.$apply();
            expect(success).toHaveBeenCalled();
        }));

        it('allows changing the default easing', function () {
            var easing = jasmine.createSpy('easing');
            scroll.to(element, 400, 40, easing);
            expect(easing).toHaveBeenCalled();
        });

        it('ignores the easing param if duration is zero', function () {
            var easing = jasmine.createSpy('easing');
            scroll.to(element, 400, 0, easing);
            expect(easing).not.toHaveBeenCalled();
        });

        it('only accepts functions as easing', function () {
            var easing = jasmine.createSpy('easing');
            scroll.to(element, 400, 40, { bad: easing });
            expect(easing).not.toHaveBeenCalled();
        });

    });

    describe('', function () {
        var scroll,
            $timeout;

        beforeEach(function () {
            requestAnimationMock = jasmine.createSpy('requestAnimationMock2').and.callFake(function (animate, delay) {
                return $timeout(animate, delay); // some arbitrary delay that we can rely on for tests
            });
            cancelAnimationMock = jasmine.createSpy('cancelAnimationMock2').and.callFake(function (timeout) {
                $timeout.cancel(timeout);
            });
        });

        beforeEach(inject(function (_scroll_, _$timeout_) {
            scroll = _scroll_;
            $timeout = _$timeout_;
        }));

        it('.to does not queue up animations', function () {
            scroll.to(element, 200, 100);
            expect(element[0].scrollTop).not.toBe(200); // to ensure that at this point the animation is still ongoing
            expect(cancelAnimationMock).not.toHaveBeenCalled();
            scroll.to(element, 400); // call scroll.to() without animation so we're able to assert the scrollTop in the same tick
            expect(cancelAnimationMock).toHaveBeenCalled(); // previous animation should have been cancelled
            expect(element[0].scrollTop).toBe(400);
        });

        it('.stop stops any currently running animation', function () {
            scroll.to(element, 200, 100);
            expect(element[0].scrollTop).not.toBe(200);
            expect(cancelAnimationMock).not.toHaveBeenCalled();
            scroll.stop(element);
            expect(cancelAnimationMock).toHaveBeenCalled();
            expect(function () {
                $timeout.flush();
            }).toThrow(); // there shouldn't be any animations running
        });

        it('.stop rejects the promise object', inject(function ($rootScope) {
            var rejected = jasmine.createSpy('rejected');
            scroll.to(element, 200, 100).catch(rejected);
            scroll.stop(element);
            $rootScope.$apply();
            expect(rejected).toHaveBeenCalled();
        }));

        it('.stop does nothing if there\'s no animation running', function () {
            scroll.stop(element);
            expect(cancelAnimationMock).not.toHaveBeenCalled();
        });
    });
});
