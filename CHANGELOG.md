## next version

### Features
- Support ignoring wheel events from specified elements with
[`ignore-wheel-class`](DOCS.md#ignore-wheel-class)

## 1.0.2

### Fixes
- On trackpads with high sensitivity (e.g. Macs), swiping once does not lead to
a double snap anymore (thanks https://github.com/reco). There's a 1 second delay
that prevents the next snap, which can be changed (or disabled) with
[`prevent-double-snap-delay`](DOCS.md#prevent-double-snap-delay)

## 1.0.1

## Fixes
- Do not translate left/right scroll to up/down scroll
(https://github.com/joelmukuthu/angular-snapscroll/issues/37)

## 1.0.0

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
- Support for arrow keys using [`enable-arrow-keys`](DOCS.md#enable-arrow-keys)

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
