(function () {
  'use strict';
  
  // all this is adapted from https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js
  // ngAnimate does have $$animateReflow, but that was not built to be a wrapper around requestAnimationFrame, hence this.

  var getWithVendorPrefix = function (funcName, $window) {
    var vendors = ['webkit', 'moz'],
        func;
    for (var i = 0; i < vendors.length && !func; ++i) {
      var vp = vendors[i];
      func = $window[vp + funcName];
    }
    return func;
  };

  var iOS6 = function ($window) {
    return /iP(ad|hone|od).*OS 6/.test($window.navigator.userAgent);
  };

  if (!Date.now) {
    Date.now = function() {
      return new Date().getTime();
    };
  }

  var snapscroll = angular.module('snapscroll');

  snapscroll.factory('requestAnimation', ['$timeout', '$window', 
    function ($timeout, $window) {
      var lastTime,
          requestAnimation = $window.requestAnimationFrame || getWithVendorPrefix('RequestAnimationFrame', $window);

      if (!requestAnimation || iOS6($window)) { // iOS6 is buggy
        requestAnimation = function(callback) {
          var now = Date.now();
          var nextTime = Math.max(lastTime + 16, now);
          return $timeout(function() {
            callback(lastTime = nextTime);
          }, nextTime - now);
        };
      }

      return requestAnimation;
  }]);

  snapscroll.factory('cancelAnimation', ['$timeout', '$window', 
    function ($timeout, $window) {
      var cancelAnimation = $window.cancelAnimationFrame || getWithVendorPrefix('CancelAnimationFrame', $window) || getWithVendorPrefix('CancelRequestAnimationFrame', $window);

      if (!cancelAnimation || iOS6($window)) { // iOS6 is buggy
        cancelAnimation = $timeout.cancel;
      }

      return cancelAnimation;
    }]);
  
})();