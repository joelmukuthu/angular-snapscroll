'use strict';

describe('Directive: snapToWindowHeight', function () {

  var $compile,
      $scope,
      snapHeightMock;
  
  beforeEach(module('snapscroll'));
  
  beforeEach(module(function ($provide) {
    // use $provide.factory() for mocking directives, not $provide.value() since directives are factories
    $provide.factory('snapscrollDirective', function () {
      // very important to return an array of directive definitions!! that's how angular works
      return [{
        restrict: 'A',
        name: 'snapscroll',
        controller: function () {
          this.setSnapHeight = function (height) {
            snapHeightMock = height;
          };
        }
      }];
    });
  }));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
  }));
  
  function compileElement(html) {
    var element = angular.element(html);
    element = $compile(element)($scope);
    $scope.$digest();
    return element;
  }
  
  function testSetsSnapHeight(html, $window) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    expect(snapHeightMock).toBe(400);
  }
  
  function testUpdatesSnapHeightOnWindowResize(html, $window, $timeout) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    expect(snapHeightMock).toBe(400);
    $timeout.flush();
    expect(snapHeightMock).toBe(200);
  }
  
  function testDefaultsResizeDelayToTheValueOfDefaulSnapscrollSnapToWindowHeightResizeDelay(html, $window, $timeout, defaulSnapscrollSnapToWindowHeightResizeDelay) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    $timeout.flush(defaulSnapscrollSnapToWindowHeightResizeDelay - 1);
    expect(snapHeightMock).toBe(400);
    $timeout.flush(1);
    expect(snapHeightMock).toBe(200);
  }
  
  function testAllowsSettingResizeDelay(html, $window, $timeout) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    $timeout.flush(499);
    expect(snapHeightMock).toBe(400);
    $timeout.flush(1);
    expect(snapHeightMock).toBe(200);
  }
  
  function testDoesNotAllowSettingResizeDelayWithAnExpression(html, $window, $timeout) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    $timeout.flush(499);
    expect(snapHeightMock).toBe(200);
    $timeout.flush(1);
    expect(snapHeightMock).toBe(200);
  }
  
  function testDefaultsResizeDelayToTheValueOfDefaulSnapscrollSnapToWindowHeightResizeDelayIfBadTimeoutIsProvided(html, $window, $timeout, defaulSnapscrollSnapToWindowHeightResizeDelay) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    $timeout.flush(defaulSnapscrollSnapToWindowHeightResizeDelay - 1);
    expect(snapHeightMock).toBe(400);
    $timeout.flush(1);
    expect(snapHeightMock).toBe(200);
  }
  
  function testAllowsTurningOffResizeDelay(html, $window, $timeout) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    expect(function () {
      $timeout.flush();
    }).toThrow();
    expect(snapHeightMock).toBe(200);
  }
  
  function testStopsListeningToResizeWhenScopeDestroyed(html, $window, $timeout) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $scope.$destroy();
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    expect(function () {
      $timeout.flush();
    }).toThrow();
    expect(snapHeightMock).toBe(400);
  }
  
  it('requires snapscroll', function () {
    var html = '<div snap-to-window-height=""></div>';
    expect(function () {
      compileElement(html);
    }).toThrow();
  });
  
  describe('when applied to snapscroll as an attribute', function () {
    
    it('sets the snapHeight to equal the window height', inject(function ($window) {
      testSetsSnapHeight('<div snapscroll="" snap-to-window-height=""></div>', $window);
    }));

    it('updates the snapHeight on window resize after a timeout', inject(function ($window, $timeout) {
      testUpdatesSnapHeightOnWindowResize('<div snapscroll="" snap-to-window-height=""></div>', $window, $timeout);
    }));

    it('defaults the resizeDelay to the value of defaulSnapscrollSnapToWindowHeightResizeDelay', inject(function ($window, $timeout, defaulSnapscrollSnapToWindowHeightResizeDelay) {
      testDefaultsResizeDelayToTheValueOfDefaulSnapscrollSnapToWindowHeightResizeDelay('<div snapscroll="" snap-to-window-height=""></div>', $window, $timeout, defaulSnapscrollSnapToWindowHeightResizeDelay);
    }));

    it('allows setting the resizeDelay', inject(function ($window, $timeout) {
      testAllowsSettingResizeDelay('<div snapscroll="" snap-to-window-height="" resize-delay="500"></div>', $window, $timeout);
    }));

    it('deos not allow setting the resizeDelay using an expression', inject(function ($window, $timeout) {
      testDoesNotAllowSettingResizeDelayWithAnExpression('<div snapscroll="" snap-to-window-height="" resize-delay="300 + 200"></div>', $window, $timeout);

    }));

    it('defaults the resizeDelay to the value of defaulSnapscrollSnapToWindowHeightResizeDelay if a bad timeout is provided', inject(function ($window, $timeout, defaulSnapscrollSnapToWindowHeightResizeDelay) {
      testDefaultsResizeDelayToTheValueOfDefaulSnapscrollSnapToWindowHeightResizeDelayIfBadTimeoutIsProvided('<div snapscroll="" snap-to-window-height="" resize-delay="bad"></div>', $window, $timeout, defaulSnapscrollSnapToWindowHeightResizeDelay);
    }));

    it('allows turning off the resizeDelay if passed \'false\'', inject(function ($window, $timeout) {
      testAllowsTurningOffResizeDelay('<div snapscroll="" snap-to-window-height="" resize-delay="false"></div>', $window, $timeout);
    }));

    it('stops listening to window resize when scope is destroyed', inject(function ($window, $timeout) {
      testStopsListeningToResizeWhenScopeDestroyed('<div snapscroll="" snap-to-window-height=""></div>', $window, $timeout);
    }));
  });
});