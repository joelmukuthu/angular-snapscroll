'use strict';

describe('Module: snapscroll', function () {
  
  it('is created', function () {
    var app;
    
    expect(function () {
      app = angular.module('snapscroll');
    }).not.toThrow();
    
    expect(app).toBeDefined();
  });
  
  describe('as an attribute', function () {
    it('requires duScroll', function () {
      var app;

      expect(function () {
        app = angular.module('duScroll');
      }).not.toThrow();

      expect(app).toBeDefined();
    });
  });
});
