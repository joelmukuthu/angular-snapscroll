'use strict';

describe('Module: snapscroll', function () {
  
  it('is created', function () {
    var app;
    
    expect(function () {
      app = angular.module('snapscroll');
    }).not.toThrow();
    
    expect(app).toBeDefined();
  });
  
  describe('', function () {
    
    beforeEach(module('snapscroll'));
    
    it('registers the defaultSnapscrollScrollEasing', inject(function (defaultSnapscrollScrollEasing) {
      expect(angular.isFunction(defaultSnapscrollScrollEasing)).toBe(true);
    }));
    
    it('registers the defaultSnapscrollScrollDelay', inject(function (defaultSnapscrollScrollDelay) {
      expect(angular.isNumber(defaultSnapscrollScrollDelay)).toBe(true);
    }));
    
    it('registers the defaultSnapscrollSnapDuration', inject(function (defaultSnapscrollSnapDuration) {
      expect(angular.isNumber(defaultSnapscrollSnapDuration)).toBe(true);
    }));
    
    it('registers the defaultSnapscrollSnapToWindowHeightResizeDelay', inject(function (defaultSnapscrollSnapToWindowHeightResizeDelay) {
      expect(angular.isNumber(defaultSnapscrollSnapToWindowHeightResizeDelay)).toBe(true);
    }));
    
    it('registers the defaultSnapscrollBindScrollTimeout', inject(function (defaultSnapscrollBindScrollTimeout) {
      expect(angular.isNumber(defaultSnapscrollBindScrollTimeout)).toBe(true);
    }));
    
  });
  
});
