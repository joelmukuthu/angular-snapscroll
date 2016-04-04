'use strict';

describe('Service: wheel', function () {
  var element;

  beforeEach(module('snapscroll'));

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

  it('provides a \'bind\' function and an \'unbind\' function', inject(function (wheel) {
    expect(angular.isFunction(wheel.bind)).toBe(true);
    expect(angular.isFunction(wheel.unbind)).toBe(true);
  }));

  describe('.bind', function () {
    var wheel;

    beforeEach(inject(function (_wheel_) {
      wheel = _wheel_;
    }));

    it('throws an error if up() and down() callbacks are not provided', function () {
      expect(function () {
          wheel.bind(element, {});
      }).toThrowError('No callbacks provided');
    });

    it('prevents the default wheel event in one direction if a callback for the same direction is provided', function () {
    });

    it('does not prevents the default wheel event in one direction if a callback for that direction is not provided', function () {
    });
  });
});
