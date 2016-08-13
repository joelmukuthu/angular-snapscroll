(function () {
    angular
        .module('snapscroll', ['wheelie'])
        .value('defaultSnapscrollScrollEasing', undefined)
        .value('defaultSnapscrollScrollDelay', 250)
        .value('defaultSnapscrollSnapDuration', 800)
        .value('defaultSnapscrollResizeDelay', 400)
        .value('defaultSnapscrollBindScrollTimeout', 400);
})();
