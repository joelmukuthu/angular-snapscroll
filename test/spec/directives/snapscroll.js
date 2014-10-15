'use strict';

describe('Directive: snapscroll', function () {

  beforeEach(module('snapscroll'));

  var $compile,
      $scope;
  
  function compileELement(html, appendToBody) {
    var body,
        element = angular.element(html);
    
    if (!angular.isDefined(appendToBody)) {
      appendToBody = false;
    }
    
    if (appendToBody) {
      body = angular.element(document).find('body');
      body.append(element);
    }
    
    element = $compile(element)($scope);
    $scope.$digest();
    
    return element;
  }

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
  }));
  
  afterEach(function () {
    angular.element(document).find('body').empty();
  });
  
  it('can be declared as an attribute', function () {
    compileELement('<div snapscroll="" snap-index="snapIndex"></div>');
    expect($scope.snapIndex).toBeDefined();
  });
  
  describe('as an attribute', function () {
    it('defaults snapIndex to zero', function () {
      compileELement('<div snapscroll="" snap-index="snapIndex"></div>');
      expect($scope.snapIndex).toBe(0);
    });
    
    it('converts a snapIndex to a scrollTop (simple)', function () {
      var element = compileELement('<div snapscroll=""></div>');
      expect(element[0].scrollTop).toBe(0);
    });
    
    it('converts a snapIndex to a scrollTop (functional)', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.index = 1;
      element = compileELement(html, true);
      expect(element[0].scrollTop).toBe(50);
    });
    
    it('allows setting an initial snapIndex as an integer', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="1" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect(element[0].scrollTop).toBe(50);
    });
    
    it('allows setting an initial snapIndex using an expression', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="1 + 1" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect(element[0].scrollTop).toBe(100);
    });
    
    it('allows setting an initial snapIndex using an angular expression', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="index + 1" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.index = 1;
      element = compileELement(html, true);
      expect(element[0].scrollTop).toBe(100);
    });
    
    it('throws an exception if a bad snapIndex is provided', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="\'bad\'" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      expect(function () {
        element = compileELement(html, true);
      }).toThrow();
    });
    
    it('defaults snapIndex to zero if a non-number value is provided', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="bad" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.bad = 'bad';
      element = compileELement(html, true);
      expect(element[0].scrollTop).toBe(0);
    });
    
    it('updates the element\'s scrollTop if snapIndex is changed externally', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect(element[0].scrollTop).toBe(0);
      $scope.$apply(function () {
        $scope.index = 1;
      });
      expect(element[0].scrollTop).toBe(50);
    });
    
    it('defaults the snapHeight to the height of the element', function () {
      var element,
          html = [
            '<div snapscroll="" snap-height="height" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      expect($scope.height).toBeUndefined();
      element = compileELement(html, true);
      expect($scope.height).toBe(50);
    });
    
    it('allows setting an initial snapHeight', function () {
      var element,
          html = [
            '<div snapscroll="" snap-height="50" style="overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect(element[0].offsetHeight).toBe(50);
    });
    
    it('allows setting an initial snapHeight using an expression', function () {
      var element,
          html = [
            '<div snapscroll="" snap-height="20 + 30" style="overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect(element[0].offsetHeight).toBe(50);
    });
    
    it('allows setting an initial snapHeight using an angular expression', function () {
      var element,
          html = [
            '<div snapscroll="" snap-height="h + 30" style="overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.h = 20;
      element = compileELement(html, true);
      expect(element[0].offsetHeight).toBe(50);
    });
    
    it('throws an exception if a bad snapHeight is provided', function () {
      var element,
          html = [
            '<div snapscroll="" snap-height="\'bad\'" style="overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      expect(function () {
        element = compileELement(html, true);
      }).toThrow();
    });
    
    it('defaults snapHeight to the element\'s height if a non-number snapHeight is provided', function () {
      var element,
          html = [
            '<div snapscroll="" snap-height="height" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.height = 'bad';
      element = compileELement(html, true);
      expect(element[0].offsetHeight).toBe(50);
    });
    
    it('updates the element\'s height when snapHeight is changed externally', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" snap-height="height" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect(element[0].offsetHeight).toBe(50);
      $scope.$apply(function () {
        $scope.height = 70;
      });
      expect(element[0].offsetHeight).toBe(70);
    });
    
    it('stays snapped to the current index if snapHeight is changed', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="1" snap-height="height" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect(element[0].scrollTop).toBe(50);
      $scope.$apply(function () {
        $scope.height = 70;
      });
      expect(element[0].scrollTop).toBe(70);
    });
  });
  
  it('can be declared as an element', function () {
    compileELement('<snapscroll snap-index="snapIndex"></snapscroll>');
    expect($scope.snapIndex).toBeDefined();
  });
  
  describe('as an element, it', function () {
    it('defaults snapIndex to zero', function () {
      compileELement('<snapscroll snap-index="snapIndex"></snapscroll>');
      expect($scope.snapIndex).toBe(0);
    });
  });
});
