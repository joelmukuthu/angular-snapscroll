(function () {
  'use strict';

  var snapscroll = angular.module('snapscroll');

  snapscroll.factory('mousewheel', [function () {
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
          if (e.originalEvent) {
            e = e.originalEvent;
          }

          var delta;
          delta = Math.max(-1, Math.min(1, (e.wheelDelta || -(e.deltaY || e.detail))));
          if (isNaN(delta) || delta === 0) {
            return;
          }

          if (delta > 0) {
            if (callbacks.up) {
              callbacks.up(e);
            }
          } else {
            if (callbacks.down) {
              callbacks.down(e);
            }
          }
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
