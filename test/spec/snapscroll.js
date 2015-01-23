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
    
    it('registers the defaulSnapscrollScrollDelay', inject(function (defaulSnapscrollScrollDelay) {
      expect(angular.isNumber(defaulSnapscrollScrollDelay)).toBe(true);
    }));
    
    it('registers the defaulSnapscrollSnapDuration', inject(function (defaulSnapscrollSnapDuration) {
      expect(angular.isNumber(defaulSnapscrollSnapDuration)).toBe(true);
    }));
    
    it('registers the defaulSnapscrollSnapToWindowHeightResizeDelay', inject(function (defaulSnapscrollSnapToWindowHeightResizeDelay) {
      expect(angular.isNumber(defaulSnapscrollSnapToWindowHeightResizeDelay)).toBe(true);
    }));
    
  });
  
});
