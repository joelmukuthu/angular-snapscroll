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
  
  it('can be declared as an element', function () {
    compileELement('<snapscroll snap-index="snapIndex"></snapscroll>');
    expect($scope.snapIndex).toBeDefined();
  });
  
  describe('as an attribute, it', function () {
    it('defaults snapIndex to zero', function () {
      compileELement('<div snapscroll="" snap-index="snapIndex"></div>');
      expect($scope.snapIndex).toBe(0);
    });
  });
  
  describe('as an element, it', function () {
    it('defaults snapIndex to zero', function () {
      compileELement('<snapscroll snap-index="snapIndex"></snapscroll>');
      expect($scope.snapIndex).toBe(0);
    });
  });
});
