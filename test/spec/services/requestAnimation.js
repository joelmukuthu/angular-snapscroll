'use strict';

describe('Services: requestAnimation & cancelAnimation', function () {
  var windowMock,
      timeoutMockObject;

  beforeEach(function() {
    var timeoutCancel;
    timeoutMockObject = {};
    timeoutMockObject.timeout = {};
    timeoutMockObject.timeout.cancel = jasmine.createSpy('timeoutCancelMock');
    timeoutCancel = timeoutMockObject.timeout.cancel;
    timeoutMockObject.timeout = jasmine.createSpy('timeoutMock');
    timeoutMockObject.timeout.cancel = timeoutCancel;
    
    windowMock = {
      requestAnimationFrame: function () {
        return 'requestAnimationFrame';
      },
      cancelAnimationFrame: function () {
        return 'cancelAnimationFrame';
      },
      webkitRequestAnimationFrame: function () {
        return 'webkitRequestAnimationFrame';
      },
      webkitCancelAnimationFrame: function () {
        return 'webkitCancelAnimationFrame';
      },
      webkitCancelRequestAnimationFrame: function () {
        return 'webkitCancelRequestAnimationFrame';
      },
      mozRequestAnimationFrame: function () {
        return 'mozRequestAnimationFrame';
      },
      mozCancelAnimationFrame: function () {
        return 'mozCancelAnimationFrame';
      },
      navigator: {
        userAgent: ''
      }
    };
    
    module('snapscroll');

    module(function ($provide) {
      $provide.value('$window', windowMock);
      $provide.value('$timeout', timeoutMockObject.timeout);
    });    
  });
  
  describe('on modern browsers', function () {
    beforeEach(function () {
    });
    
    it('return the unprefixed functions', inject(function (requestAnimation, cancelAnimation) {
      expect(requestAnimation()).toBe('requestAnimationFrame');
      expect(cancelAnimation()).toBe('cancelAnimationFrame');
      expect(timeoutMockObject.timeout).not.toHaveBeenCalled();
      expect(timeoutMockObject.timeout.cancel).not.toHaveBeenCalled();
    }));
  });
  
  describe('on old webkit browsers', function () {
    beforeEach(function () {
      windowMock.requestAnimationFrame = undefined;
      windowMock.cancelAnimationFrame = undefined;
    });
  
    it('return the legacy webkit functions', inject(function (requestAnimation, cancelAnimation) {
      expect(requestAnimation()).toBe('webkitRequestAnimationFrame');
      expect(cancelAnimation()).toBe('webkitCancelAnimationFrame');
      expect(timeoutMockObject.timeout).not.toHaveBeenCalled();
      expect(timeoutMockObject.timeout.cancel).not.toHaveBeenCalled();
    }));
  });
  
  describe('on old webkit browsers, cancelAnimation', function () {
    beforeEach(function () {
      windowMock.cancelAnimationFrame = undefined;
      windowMock.mozCancelAnimationFrame = undefined;
      windowMock.webkitCancelAnimationFrame = undefined;
    });
  
    it('may also return webkitCancelRequestAnimationFrame', inject(function (cancelAnimation) {
      expect(cancelAnimation()).toBe('webkitCancelRequestAnimationFrame');
      expect(timeoutMockObject.timeout).not.toHaveBeenCalled();
      expect(timeoutMockObject.timeout.cancel).not.toHaveBeenCalled();
    }));
  });
  
  describe('on old mozilla browsers', function () {
    beforeEach(function () {
      windowMock.requestAnimationFrame = undefined;
      windowMock.cancelAnimationFrame = undefined;
      windowMock.webkitRequestAnimationFrame = undefined;
      windowMock.webkitCancelAnimationFrame = undefined;
      windowMock.webkitCancelRequestAnimationFrame = undefined;
    });
  
    it('return the legacy mozilla functions', inject(function (requestAnimation, cancelAnimation) {
      expect(requestAnimation()).toBe('mozRequestAnimationFrame');
      expect(cancelAnimation()).toBe('mozCancelAnimationFrame');
      expect(timeoutMockObject.timeout).not.toHaveBeenCalled();
      expect(timeoutMockObject.timeout.cancel).not.toHaveBeenCalled();
    }));
  });
  
  describe('on old browsers', function () {
    beforeEach(function () {
      windowMock.requestAnimationFrame = undefined;
      windowMock.cancelAnimationFrame = undefined;
      windowMock.webkitRequestAnimationFrame = undefined;
      windowMock.webkitCancelAnimationFrame = undefined;
      windowMock.webkitCancelRequestAnimationFrame = undefined;
      windowMock.mozRequestAnimationFrame = undefined;
      windowMock.mozCancelAnimationFrame = undefined;
    });

    it('return a timeout promise and cancel function respectively', inject(function (requestAnimation, cancelAnimation) {
      requestAnimation();
      expect(timeoutMockObject.timeout).toHaveBeenCalled();
      expect(timeoutMockObject.timeout.cancel).not.toHaveBeenCalled();
      cancelAnimation();
      expect(timeoutMockObject.timeout.cancel).toHaveBeenCalled();
    }));
  });

  describe('on iOS 6', function () {
    beforeEach(function () {
      windowMock.navigator.userAgent = 'iPhone OS 6';
    });

    it('return a timeout promise and cancel function respectively', inject(function (requestAnimation, cancelAnimation) {
      requestAnimation();
      expect(timeoutMockObject.timeout).toHaveBeenCalled();
      expect(timeoutMockObject.timeout.cancel).not.toHaveBeenCalled();
      cancelAnimation();
      expect(timeoutMockObject.timeout.cancel).toHaveBeenCalled();
    }));
  });

  describe('on iOS 7', function () {
    beforeEach(function () {
      windowMock.navigator.userAgent = 'iPhone OS 7';
    });
    
    it('return the unprefixed functions', inject(function (requestAnimation, cancelAnimation) {
      expect(requestAnimation()).toBe('requestAnimationFrame');
      expect(cancelAnimation()).toBe('cancelAnimationFrame');
      expect(timeoutMockObject.timeout).not.toHaveBeenCalled();
      expect(timeoutMockObject.timeout.cancel).not.toHaveBeenCalled();
    }));
  });
});