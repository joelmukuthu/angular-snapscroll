(function () {
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t + b;
        }
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    angular
        .module('snapscroll', ['wheelie'])
        .value('defaultSnapscrollScrollEasing', easeInOutQuad)
        .value('defaultSnapscrollScrollDelay', 250)
        .value('defaultSnapscrollSnapDuration', 800)
        .value('defaultSnapscrollResizeDelay', 400)
        .value('defaultSnapscrollBindScrollTimeout', 400);
})();
