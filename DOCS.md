# angular-snapscroll docs

## snapscroll directive
Adds scroll-and-snap behaviour to any element that has a vertical scrollbar (fixed height and child elements):
```html
<div style="height: 200px;" snapscroll="">
    <div></div>
    <div></div>
    <div></div>
</div>
```

Other attributes that can be added are:

##### snap-index
provides a two-way bind to the current index of the visible child element. indeces are zero-based.
```html
<!-- setting an initial snapIndex to automatically seek to on page load -->
<div snapscroll="" snap-index="1"> ... </div>
```
```html
<div ng-init="snapIndex=0">
    <button ng-click="snapIndex=1">Go to index 1</button>
    <div snapscroll="" snap-index="snapIndex"> ... </div>
</div>
```

#### before-snap
is a callback executed before snapping occurs. the callback is passed a `snapIndex` parameter, which is the index being snapped to. returning `false` from this callback will prevent snapping.
```javascript
angular.controller('MainCtrl', function ($scope) {
    $scope.log = function (snapIndex) {
        console.log('snapping to', snapIndex);
        if (snapIndex > 1) {
            return false; // prevent snapping
        }
    };
});
```
```html
<div ng-controller="MainCtrl">
  <div snapscroll="" before-snap="log(snapIndex)"> ... </div>
</div>
```

#### after-snap
is a callback executed after snapping occurs. the callback is passed a `snapIndex` parameter, which is the index just snapped to. any return value from this callback is ignored.
```javascript
angular.controller('MainCtrl', function ($scope) {
    $scope.log = function (snapIndex) {
        console.log('just snapped to', snapIndex);
    };
});
```
```html
<div ng-controller="MainCtrl">
  <div snapscroll="" after-snap="log(snapIndex)"> ... </div>
</div>
```

#### snap-animation
allows turning the snap animation on/off. this is a two-way bind.
```javascript
angular.controller('MainCtrl', function ($scope) {
    $scope.index = 1;
    $scope.animation = false;
    $scope.enableAnimation = function () {
        if (!$scope.animation) {
            $scope.animation = true;
        }
    };
});
```
```html
<!-- prevent animation for the initial snap on page load -->
<div ng-controller="MainCtrl">
  <div snapscroll="" snap-index="index" snap-animation="animation" after-snap="enableAnimation()"> ... </div>
</div>
```

#### snap-duration
integer value indicating the length of the snap animation in milliseconds. a value of 0 disables the snap-animation as well. default is 800ms.
```html
<div snapscroll="" snap-duration="1200"> ... </div>
```
the snap-duration can also be changed for all snapscroll instances by changing the default value:
```javascript
angular.module('myapp', ['snapscroll'])
    .value('defaultSnapscrollSnapDuration', 1200);
```

#### snap-easing
function reference that allows overriding the default easing of the snap animation. note that this is not a regular angular callback but rather a function reference. the default easing is easeInOutQuad. any of the javascript easing functions can be provided.
```javascript
angular.controller('MainCtrl', function ($scope) {
    $scope.linearEasing = function () {
        // easing code
    };
});
```
```html
<div ng-controller="MainCtrl">
  <div snapscroll="" snap-easing="linearEasing"> ... </div>
</div>
```
the snap-easing can also be changed for all snapscroll instances by changing the default value:
```javascript
angular.module('myapp', ['snapscroll'])
    .value('defaultSnapscrollScrollEasing', function () {
        // ... easing code
    });
```

#### prevent-snapping-after-manual-scroll
snapscroll listens to the `scroll` event on the element that it's bound to and automatically resets the current snap after a manual scroll so that it's always fully visible. this behaviour can be prevented by adding this attribute.

#### scroll-delay
the `scroll` listener described above is throttled using a `scroll-delay`. this delay can be changed by providig a value in milliseconds. it can also be turned off by providin `false`.
```html
<div snapscroll="" scroll-delay="400"> ... </div>
```
the scroll-delay can also be changed for all snapscroll instances by changing the default value:
```javascript
angular.module('myapp', ['snapscroll'])
    .value('defaultSnapscrollScrollDelay', 400);
```

#### resize-delay
the `resize` listener used by `fit-window-height` is throttled using a `resize-delay`. this delay can be changed by providig a value in milliseconds. it can also be turned off by providin `false`.
```html
<div snapscroll="" fit-window-height="" resize-delay="400"> ... </div>
```
the scroll-delay can also be changed for all snapscroll instances by changing the default value:
```javascript
angular.module('myapp', ['snapscroll'])
    .value('defaultSnapscrollResizeDelay', 400);
```

## scroll service
Snapscroll also provides a `scroll` service that can be used to animate `scrollTop`, or simply to set it. It exposes two functions, `scroll.to()` and `scroll.stop()`

#### scroll.to(element, top, [duration], [easing])
animates the scrollTop of `element` from it's current scrollTop to the value of `top` in a time-frame of `duration` and using the provided `easing` function. if duration is not provided or is not valid, then it sets the scrollTop without animating.

it returns a `$q` promise object which is resolved when the animation is complete and is rejected if the animation is stopped.

the default easing can be changed during module instantiation:
```javascript
angular.module('myapp', ['snapscroll'])
    .value('defaultSnapscrollScrollEasing', function () {
        // easing function
    });
```

#### scroll.stop(element)
stops any currently-running animation on scrollTop of `element`. stopping the animation results in rejecting the promise returned by `scroll.to()`.
