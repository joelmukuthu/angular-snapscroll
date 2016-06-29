# angular-snapscroll
[![Build Status](https://travis-ci.org/joelmukuthu/angular-snapscroll.svg?branch=master)](https://travis-ci.org/joelmukuthu/angular-snapscroll) [![Dependency Status](https://david-dm.org/joelmukuthu/angular-snapscroll.svg)](https://david-dm.org/joelmukuthu/angular-snapscroll) [![Licence](https://img.shields.io/npm/l/angular-snapscroll.svg)](https://github.com/joelmukuthu/angular-snapscroll/blob/master/LICENSE.md) [![Coverage Status](https://coveralls.io/repos/joelmukuthu/angular-snapscroll/badge.svg)](https://coveralls.io/r/joelmukuthu/angular-snapscroll) [![Bower version](https://img.shields.io/bower/v/angular-snapscroll.svg)](https://github.com/joelmukuthu/angular-snapscroll) [![npm version](https://img.shields.io/npm/v/angular-snapscroll.svg)](https://www.npmjs.com/package/angular-snapscroll)

angular-snapscroll adds vertical scroll-and-snap functionality to angular. [Demo](http://joelmukuthu.github.io/angular-snapscroll/)

- JS-only implementation
- Only requires angular core
- 5.7kB when minified, 2.1kB when gzipped

### Installation
Install with bower:
```sh
bower install angular-snapscroll
```
Or with npm:
```sh
npm install angular-snapscroll
```
Or simply download the [latest release](https://github.com/joelmukuthu/angular-snapscroll/releases/latest).

### Usage
The pre-built files can be found in the `dist/` directory. `dist/angular-snapscroll.min.js` is minified and production-ready. Example usage:
```html
<script src="dist/angular-snapscroll.min.js"></script>
```
Add `snapscroll` to your app's module dependencies:
```javascript
angular.module('myapp', ['snapscroll']);
```
And now you can add a `snapscroll` attribute to any element to make it snap-scrollable! The element would have a scrollbar to begin with, the idea being that with the `snapscroll` attribute you're adding scroll-and-snap behaviour to an element that is otherwise already scrollable:
```html
<div style="height: 200px;" snapscroll="">
    <div style="height: 200px;"></div>
    <div style="height: 200px;"></div>
    <div style="height: 200px;"></div>
</div>

### Touch support
I recommend using [angular-swipe](https://github.com/marmorkuchen-net/angular-swipe) to add touch support but you can use any other library or module that recognizes vertical swipe gestures (e.g. hammer.js). Here's how to do it using angular-swipe:
```html
<div style="height: 200px;" ng-init="snapIndex=0" snapscroll="" snap-index="snapIndex" ng-swipe-up="snapIndex=snapIndex+1" ng-swipe-down="snapIndex=snapIndex-1">
    <div></div>
    <div></div>
    <div></div>
</div>
```
If you have nested snapscroll instances, remember to prevent the swipe events in a nested instance from bubbing up to the parents. See the [demo](http://joelmukuthu.github.io/angular-snapscroll/#1) for an example (the demo uses angular-swipe).

### Documentation
Have a look at the [docs](DOCS.md) for all the configuration options. For more examples, view the source on the [demo site](http://joelmukuthu.github.io/angular-snapscroll/).

### Known issue and workaround
Swiping on a trackpad with high sensitivity (i.e. on a Mac) may cause a snapscroll instance to snap twice in the same direction. The workaround for this is to set `defaultSnapscrollSnapDuration` or `snap-duration` to a higher value (try 1000ms or 1200ms).

### Todo's
- snapscroll as an element - would allow use of templates and ngAnimate for animations. Currently this repo has a (rather outdated) 'as-element' branch for this.
- more browser tests

### Contributing
Contributions are welcomed! Here are the [contribution guidelines](CONTRIBUTING.md).

This project uses [Grunt](http://gruntjs.com) for automation. Once you've forked the repo and cloned it to your machine, run this to install all the dependencies:
```sh
npm install
```
Then to continuously watch files and run tests as you write code, run:
```sh
grunt
```
Check out the [Gruntfile](Gruntfile.js) for more grunt tasks (`grunt test`, `grunt build` etc).

### License
[The MIT License](LICENSE.md)
