(function () {
  'use strict';

  var snapscroll = angular.module('snapscroll');

  snapscroll.factory('mousewheel', [function () {
    function onWheel(e, up, down) {
      var delta;

      if (e.originalEvent) {
        e = e.originalEvent;
      }

      delta = Math.max(-1, Math.min(1, (e.wheelDelta || -(e.deltaY || e.detail))));
      if (isNaN(delta) || delta === 0) {
        return;
      }

      if (delta > 0) {
        if (up) {
          up(e);
        }
      } else {
        if (down) {
          down(e);
        }
      }
    }

    return {
      bind: function (element, callbacks) {
        callbacks = callbacks || {};
        if (angular.isDefined(callbacks.up) && !angular.isFunction(callbacks.up)) {
          throw new Error('The \'up\' callback must be a function');
        }

        if (angular.isDefined(callbacks.down) && !angular.isFunction(callbacks.down)) {
          throw new Error('The \'down\' callback must be a function');
        }

        if (!angular.isDefined(callbacks.up) && !angular.isDefined(callbacks.down)) {
          throw new Error('At least one callback (\'up\' or \'down\') must be provided');
        }

        function bindWheel(e) {
          onWheel(e, callbacks.up, callbacks.down);
        }
        element.data('snapscroll-bindWheel', bindWheel);
        element.on('wheel mousewheel onmousewheel', bindWheel);
      },

      unbind: function (element) {
        var bindWheel = element.data('snapscroll-bindWheel');
        if (angular.isFunction(bindWheel)) {
          element.data('snapscroll-bindWheel', null);
          element.off('wheel mousewheel onmousewheel', bindWheel);
        }
      }
    };
  }]);

})();
