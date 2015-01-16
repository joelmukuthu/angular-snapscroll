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
    
    it('registers the defaultSnapscrollEasing', inject(function (defaultSnapscrollEasing) {
      expect(angular.isFunction(defaultSnapscrollEasing)).toBe(true);
    }));
    
  });
  
});
