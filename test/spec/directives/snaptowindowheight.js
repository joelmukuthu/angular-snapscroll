'use strict';

describe('Directive: snapToWindowHeight', function () {

  beforeEach(module('snapscroll'));

  var $compile,
      $scope,
      snapHeightMock;

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
  
  function createSnapHeightMock(snapscrollDirective) {
    // http://stackoverflow.com/a/23064313/1004406
    // mock snapscroll directive, create a fake setSnapHeight method on it's 
    // controller that just updates a local variable
    var setSnapHeightMock = 
      jasmine.createSpy('setSnapHeight')
        .andCallFake(function (height) {
          snapHeightMock = height;
        });
    snapscrollDirective.controller = function () {
      this.setSnapHeight = setSnapHeightMock;
    };
    // remove the link function of the original snapscroll directive, not needed here
    snapscrollDirective.link = angular.noop;
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
  
  function testDefaultsResizeDelayTo400(html, $window, $timeout) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    $timeout.flush(399);
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
  
  function testDefaultsResizeDelayTo400IfBadTimeoutIsProvided(html, $window, $timeout) {
    var element;
    $window.innerHeight = 400;
    element = compileElement(html);
    $window.innerHeight = 200;
    angular.element($window).triggerHandler('resize');
    $timeout.flush(399);
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
    beforeEach(inject(function (snapscrollDirective) {
      var snapscroll;
      snapHeightMock = undefined;
      // filter through the directive definitions and find the one
      // that matches snapscroll as an attribute
      for (var i = 0, l = snapscrollDirective.length; i < l; i++) {
        snapscroll = snapscrollDirective[i];
        if (snapscroll.restrict === 'A') {
          createSnapHeightMock(snapscroll);
          break;
        }
      }
    }));
    
    it('sets the snapHeight to equal the window height', inject(function ($window) {
      testSetsSnapHeight('<div snapscroll="" snap-to-window-height=""></div>', $window);
    }));

    it('updates the snapHeight on window resize after a timeout', inject(function ($window, $timeout) {
      testUpdatesSnapHeightOnWindowResize('<div snapscroll="" snap-to-window-height=""></div>', $window, $timeout);
    }));

    it('defaults the resizeDelay to 400', inject(function ($window, $timeout) {
      testDefaultsResizeDelayTo400('<div snapscroll="" snap-to-window-height=""></div>', $window, $timeout);
    }));

    it('allows setting the resizeDelay', inject(function ($window, $timeout) {
      testAllowsSettingResizeDelay('<div snapscroll="" snap-to-window-height="" resize-delay="500"></div>', $window, $timeout);
    }));

    it('deos not allow setting the resizeDelay using an expression', inject(function ($window, $timeout) {
      testDoesNotAllowSettingResizeDelayWithAnExpression('<div snapscroll="" snap-to-window-height="" resize-delay="300 + 200"></div>', $window, $timeout);

    }));

    it('defaults the resizeDelay to 400 if a bad timeout is provided', inject(function ($window, $timeout) {
      testDefaultsResizeDelayTo400IfBadTimeoutIsProvided('<div snapscroll="" snap-to-window-height="" resize-delay="bad"></div>', $window, $timeout);
    }));

    it('allows turning off the resizeDelay if passed \'false\'', inject(function ($window, $timeout) {
      testAllowsTurningOffResizeDelay('<div snapscroll="" snap-to-window-height="" resize-delay="false"></div>', $window, $timeout);
    }));

    it('stops listening to window resize when scope is destroyed', inject(function ($window, $timeout) {
      testStopsListeningToResizeWhenScopeDestroyed('<div snapscroll="" snap-to-window-height=""></div>', $window, $timeout);
    }));
  });
  
  describe('when applied to snapscroll as an element', function () {
    beforeEach(inject(function (snapscrollDirective) {
      var snapscroll;
      snapHeightMock = undefined;
      // filter through the directive definitions and find the one
      // that matches snapscroll as an element
      for (var i = 0, l = snapscrollDirective.length; i < l; i++) {
        snapscroll = snapscrollDirective[i];
        if (snapscroll.restrict === 'E') {
          createSnapHeightMock(snapscroll);
          break;
        }
      }
    }));
    it('sets the snapHeight to equal the window height', inject(function ($window) {
      testSetsSnapHeight('<snapscroll snap-to-window-height=""></snapscroll>', $window);
    }));

    it('updates the snapHeight on window resize after a timeout', inject(function ($window, $timeout) {
      testUpdatesSnapHeightOnWindowResize('<snapscroll snap-to-window-height=""></snapscroll>', $window, $timeout);
    }));

    it('defaults the resizeDelay to 400', inject(function ($window, $timeout) {
      testDefaultsResizeDelayTo400('<snapscroll snap-to-window-height=""></snapscroll>', $window, $timeout);
    }));

    it('allows setting the resizeDelay', inject(function ($window, $timeout) {
      testAllowsSettingResizeDelay('<snapscroll snap-to-window-height="" resize-delay="500"></snapscroll>', $window, $timeout);
    }));

    it('deos not allow setting the resizeDelay using an expression', inject(function ($window, $timeout) {
      testDoesNotAllowSettingResizeDelayWithAnExpression('<snapscroll snap-to-window-height="" resize-delay="300 + 200"></snapscroll>', $window, $timeout);

    }));

    it('defaults the resizeDelay to 400 if a bad timeout is provided', inject(function ($window, $timeout) {
      testDefaultsResizeDelayTo400IfBadTimeoutIsProvided('<snapscroll snap-to-window-height="" resize-delay="bad"></snapscroll>', $window, $timeout);
    }));

    it('allows turning off the resizeDelay if passed \'false\'', inject(function ($window, $timeout) {
      testAllowsTurningOffResizeDelay('<snapscroll snap-to-window-height="" resize-delay="false"></snapscroll>', $window, $timeout);
    }));

    it('stops listening to window resize when scope is destroyed', inject(function ($window, $timeout) {
      testStopsListeningToResizeWhenScopeDestroyed('<snapscroll snap-to-window-height=""></snapscroll>', $window, $timeout);
    }));
  });
});