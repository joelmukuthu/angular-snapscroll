'use strict';

describe('Module: snapscroll', function () {

  it('is created', function () {
    var app;

    expect(function () {
      app = angular.module('snapscroll');
    }).not.toThrow();

    expect(app).toBeDefined();
  });

  describe('registers the', function () {

    beforeEach(module('snapscroll'));

    it('defaultSnapscrollScrollEasing', inject(function (defaultSnapscrollScrollEasing) {
      expect(angular.isFunction(defaultSnapscrollScrollEasing)).toBe(true);
    }));

    it('defaultSnapscrollScrollDelay', inject(function (defaultSnapscrollScrollDelay) {
      expect(angular.isNumber(defaultSnapscrollScrollDelay)).toBe(true);
    }));

    it('defaultSnapscrollSnapDuration', inject(function (defaultSnapscrollSnapDuration) {
      expect(angular.isNumber(defaultSnapscrollSnapDuration)).toBe(true);
    }));

    it('defaultSnapscrollResizeDelay', inject(function (defaultSnapscrollResizeDelay) {
      expect(angular.isNumber(defaultSnapscrollResizeDelay)).toBe(true);
    }));

    it('defaultSnapscrollBindScrollTimeout', inject(function (defaultSnapscrollBindScrollTimeout) {
      expect(angular.isNumber(defaultSnapscrollBindScrollTimeout)).toBe(true);
    }));

  });

});
