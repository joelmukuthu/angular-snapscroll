'use strict';

function easeInOutQuad(t, b, c, d) {
  t /= d/2;
  if (t < 1) {
    return c/2*t*t + b;
  }
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
}

angular
  .module('snapscroll', [
    'duScroll'
  ])
  .value('snapscrollEaseInOut', easeInOutQuad)
  .value('duScrollDuration', 800)
  .value('duScrollEasing', easeInOutQuad);