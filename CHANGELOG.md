## next release

### Features
- Support overriding the next snapIndex by returning a number from
[`before-snap`](DOCS.md#before-snap)
- Support [disabling/enabling](DOCS.md#snapscroll-directive) snapscroll
programmatically

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
