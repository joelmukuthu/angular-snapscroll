'use strict';

describe('Service: mousewheel', function () {
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

  it('provides a \'bind\' function and an \'unbind\' function', inject(function (mousewheel) {
    expect(angular.isFunction(mousewheel.bind)).toBe(true);
    expect(angular.isFunction(mousewheel.unbind)).toBe(true);
  }));

  describe('.bind', function () {
    var mousewheel;

    beforeEach(inject(function (_mousewheel_) {
      mousewheel = _mousewheel_;
    }));

    it('throws an error if an \'up\' callback is provided but is not a function', function () {
      expect(function () {
          mousewheel.bind(element, {
            up: 1
          });
      }).toThrowError('The \'up\' callback must be a function');
    });

    it('throws an error if a \'down\' callback is provided but is not a function', function () {
      expect(function () {
          mousewheel.bind(element, {
            down: ''
          });
      }).toThrowError('The \'down\' callback must be a function');
    });

    it('throws an error if neither \'up\' or \'down\' callbacks are provided', function () {
      expect(function () {
          mousewheel.bind(element, {});
      }).toThrowError('At least one callback (\'up\' or \'down\') must be provided');
    });

    it('does not throw an error if only an \'up\' callback is provided', function () {
      expect(function () {
          mousewheel.bind(element, {
            up: function () {}
          });
      }).not.toThrow();
    });

    it('does not throw an error if only a \'down\' callback is provided', function () {
      expect(function () {
          mousewheel.bind(element, {
            down: function () {}
          });
      }).not.toThrow();
    });

    it('stores a reference to the \'bindWheel\' function in the element\'s data', function () {
      mousewheel.bind(element, {
        down: function () {},
        up: function () {}
      });
      expect(angular.isFunction(element.data('snapscroll-bindWheel'))).toBe(true);
    });
  });

  describe('when bound to an element', function () {
      var upSpy,
          downSpy;

      beforeEach(inject(function (_mousewheel_) {
        upSpy = jasmine.createSpy('mousewheelUp');
        downSpy = jasmine.createSpy('mousewheelDown');

        _mousewheel_.bind(element, {
          up: upSpy,
          down: downSpy
        });
      }));

      it('calls the \'up\' callback on mousewheel up', function () {
        element.triggerHandler({
          type: 'wheel',
          wheelDelta: 120,
          detail: -120,
          deltaY: -120
        });
        expect(upSpy).toHaveBeenCalled();
        expect(upSpy.calls.count()).toBe(1);
      });

      it('calls the \'down\' callback on mousewheel down', function () {
        element.triggerHandler({
          type: 'wheel',
          wheelDelta: -120,
          detail: 120,
          deltaY: 120
        });
        expect(downSpy).toHaveBeenCalled();
        expect(downSpy.calls.count()).toBe(1);
      });

      it('does not call the \'up\' callback on mousewheel down', function () {
        element.triggerHandler({
          type: 'wheel',
          wheelDelta: -120,
          detail: 120,
          deltaY: 120
        });
        expect(upSpy).not.toHaveBeenCalled();
      });

      it('does not call the \'down\' callback on mousewheel up', function () {
        element.triggerHandler({
          type: 'wheel',
          wheelDelta: 120,
          detail: -120,
          deltaY: -120
        });
        expect(downSpy).not.toHaveBeenCalled();
      });

      // from a bug report: https://github.com/joelmukuthu/angular-snapscroll/issues/16
      it('does not call any callback if mousewheel delta is 0', function () {
        element.triggerHandler({
          type: 'wheel',
          wheelDelta: 0,
          detail: 0,
          deltaY: 0
        });
        expect(upSpy).not.toHaveBeenCalled();
        expect(downSpy).not.toHaveBeenCalled();
      });

      it('does not call any callback if mousewheel delta is NaN', function () {
        element.triggerHandler({
          type: 'wheel',
          wheelDelta: NaN,
          detail: NaN,
          deltaY: NaN
        });
        expect(upSpy).not.toHaveBeenCalled();
        expect(downSpy).not.toHaveBeenCalled();
      });

      it('uses event.originalEvent to get the mousewheel delta if the property is set', function () {
        element.triggerHandler({
          type: 'wheel',
          // this represents mousewheel up
          deltaY: -120,

          // but this represents mousewheel down
          originalEvent: {
            deltaY: 120,
          }
        });

        expect(upSpy).not.toHaveBeenCalled();
        expect(downSpy).toHaveBeenCalled();
      });
  });

  describe('.unbind', function () {
    var upSpy,
        downSpy,
        mousewheel;

    beforeEach(inject(function (_mousewheel_) {
      mousewheel = _mousewheel_;
      upSpy = jasmine.createSpy('mousewheelUp');
      downSpy = jasmine.createSpy('mousewheelDown');

      mousewheel.bind(element, {
        up: upSpy,
        down: downSpy
      });
    }));

    it('unsets the reference to the \'bindWheel\' function in the element\'s data', function () {
      mousewheel.unbind(element);
      expect(element.data('snapscroll-bindWheel')).toBe(null);
    });

    it('prevents further calling of the \'up\' and \'down\' callbacks', function () {
      element.triggerHandler({
        type: 'wheel',
        deltaY: -120
      });
      expect(upSpy).toHaveBeenCalled();

      element.triggerHandler({
        type: 'wheel',
        deltaY: 120
      });
      expect(downSpy).toHaveBeenCalled();

      upSpy.calls.reset();
      downSpy.calls.reset();
      mousewheel.unbind(element);

      element.triggerHandler({
        type: 'wheel',
        deltaY: -120
      });
      expect(upSpy).not.toHaveBeenCalled();

      element.triggerHandler({
        type: 'wheel',
        deltaY: 120
      });
      expect(downSpy).not.toHaveBeenCalled();
    });

    it('does not unbind if the reference to the \'bindWheel\' function in the element\'s data does not exist', function () {
      element.data('snapscroll-bindWheel', null);
      mousewheel.unbind(element);

      element.triggerHandler({
        type: 'wheel',
        deltaY: -120
      });
      expect(upSpy).toHaveBeenCalled();
    });

    it('does not unbind if the reference to the \'bindWheel\' function in the element\'s data is not a function', function () {
      element.data('snapscroll-bindWheel', true);
      mousewheel.unbind(element);

      element.triggerHandler({
        type: 'wheel',
        deltaY: -120
      });
      expect(upSpy).toHaveBeenCalled();
    });
  });
});
