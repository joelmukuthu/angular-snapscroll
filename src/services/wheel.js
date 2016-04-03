(function () {
  'use strict';

  var snapscroll = angular.module('snapscroll');

  snapscroll.factory('wheel', [function () {
    function onWheel(e, up, down) {
      var delta;

      if (e.originalEvent) {
        e = e.originalEvent;
      }
      e.preventDefault();

      delta = Math.max(-1, Math.min(1, (e.wheelDelta || -(e.deltaY || e.detail))));
      if (isNaN(delta) || delta === 0) {
        return;
      }

      if (delta < 0) {
        down(e);
      } else {
        up(e);
      }
    }

    return {
      bind: function (element, callbacks) {
        function bindWheel(e) {
          onWheel(e, callbacks.up, callbacks.down);
        }
        element.data('snapscroll-bindWheel', bindWheel);
        element.on('wheel mousewheel onmousewheel', bindWheel);
      },

      unbind: function (element) {
        var bindWheel = element.data('snapscroll-bindWheel');
        if (bindWheel) {
          element.data('snapscroll-bindWheel', null);
          element.off('wheel mousewheel onmousewheel', bindWheel);
        }
      }
    };
  }]);

})();
