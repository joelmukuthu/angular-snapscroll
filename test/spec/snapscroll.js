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
    it('requires duScroll.scrollHelpers', function () {
      var app;

      expect(function () {
        // app = angular.module('snapscroll', ['duScroll.scrollHelpers']);
        app = angular.module('duScroll.scrollHelpers');
      }).not.toThrow();

      expect(app).toBeDefined();
    });
    
    it('sets the duScrollEasing to ease-in-out (snapscrollEaseInOut)', function () {
      expect(angular.value('duScrollEasing')).toBe(angular.value('snapscrollEaseInOut'));
    });

    it('sets the duScrollDuration to 400', function () {
      expect(angular.value('duScrollDuration')).toBe(angular.value(400));
    });
  });
});
