## next release

### Breaking changes
- Dependency on [angular-scrollie](https://github.com/joelmukuthu/angular-scrollie)
- [`before-snap`](DOCS.md#before-snap) and [`after-snap`](DOCS.md#after-snap) are
now only called if snapIndex changes

### Features
- Support overriding the next snapIndex by returning a number from
[`before-snap`](DOCS.md#before-snap)
- Support [disabling/enabling](DOCS.md#snapscroll-directive) snapscroll
programmatically
- Support child elements whose height is greater than the snapscroll element

### Fixes
- [`snap-index`](DOCS.md#snap-index) is not initialized if the element is not
scrollable
- Ensure snapscroll never tries to set scrollTop to a value that is out of bounds

## 0.3.0

### Breaking changes
- Dependency on [angular-wheelie](https://github.com/joelmukuthu/angular-wheelie)

### Features
- Support children elements (slides) of unequal heights, but have to be smaller
or equal to the snapscroll element

### Fixes
- [`snap-height`](DOCS.md#snap-height) is now an opt-in feature
- If `overflow-y` on the snapscroll element is set to `scroll`, then it is not
changed to `auto`
- Change angular dep version to the lowest supported version (`1.2.24`)
