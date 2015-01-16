// this is built upon http://stackoverflow.com/a/16136789/1004406

'use strict';

var snapscroll = angular.module('snapscroll');

snapscroll.factory('scroll', ['$q', 'requestAnimation', 'cancelAnimation', 'defaultSnapscrollEasing',
  function ($q, requestAnimation, cancelAnimation, defaultSnapscrollEasing) {
    
    function cleanUp(element, animation) {
      animation = null;
      element.data('snapscroll-animation', null);
      element.data('snapscroll-animation-deferred', null);
    }
    
    return {
      to: function (element, top, duration, easing) {
        var start,
            change,
            animate,
            deferred,
            animation,
            increment,
            currentTime;
        
        animate = function () {
          currentTime += increment;
          element[0].scrollTop = easing(currentTime, start, change, duration);
          if(currentTime < duration) {
            animation = requestAnimation(animate, increment);
            element.data('snapscroll-animation', animation);
          } else {
            cleanUp(element, animation);
            deferred.resolve();
          }
        };
        
        if (!angular.isElement(element) || !angular.isNumber(top)) {
          return;
        }
        
        deferred = $q.defer();
        duration = parseInt(duration);
        animation = element.data('snapscroll-animation');
        
        if (animation) {
          cancelAnimation(animation);
          // TODO: should the promise be rejected at this point since this is just cleaning up? 
          // element.data('snapscroll-animation-deferred').reject();
          cleanUp(element, animation);
        }
        
        if (duration === 0 || isNaN(duration)) {
          element[0].scrollTop = top;
          deferred.resolve();
        } else {
          if (typeof easing !== 'function') {
            easing = defaultSnapscrollEasing;
          }
          start = element[0].scrollTop;
          change = top - start;
          currentTime = 0;
          increment = 20;
          animate();
        }
        
        element.data('snapscroll-animation-deferred', deferred);
        return deferred.promise;
      },
      
      stop: function (element) {
        var animation = element.data('snapscroll-animation');
        if (animation) {
          cancelAnimation(animation);
          element.data('snapscroll-animation-deferred').reject();
          cleanUp(element, animation);
        }
      }
    };
}]);