'use strict';

describe('Directive: snapscroll', function () {

  var $compile,
      $scope;

  beforeEach(module('snapscroll'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
  }));
  
  afterEach(function () {
    angular.element(document).find('body').empty();
  });
  
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
  
  function testBeforeSnap(html) {
    var test = 0;
    $scope.beforeSnap = function () {
      test = 1;
    };
    compileELement(html);
    $scope.snapIndex = 1;
    $scope.$apply();
    expect(test).toBe(1);
  }
  
  function testExecutesBeforeSnapOnInitialSnap(html) {
    var test = 0;
    $scope.beforeSnap = function () {
      test = 1;
    };
    compileELement(html);
    expect(test).toBe(1);
  }
  
  function testCorrectSnapIndexPassedToBeforeSnap(html) {
    var first = true,
        second = false;
    $scope.snapIndex = 0;
    $scope.beforeSnap = function (snapIndex) {
      // this would work, but isn't very transparent
      // expect(snapIndex).toEqual($scope.snapIndex);
      if (first) {
        expect(snapIndex).toBe(0);
      } else if (second) {
        expect(snapIndex).toBe(1);
      }
    };
    compileELement(html);
    first = false;
    second = true;
    $scope.snapIndex = 1;
    $scope.$apply();
  }
  
  function testAllowsPreventingSnapping(html) {
    var prevent = false,
        test = 0;
    $scope.beforeSnap = function () {
      if (prevent) {
        return false;
      }
      test += 1;
    };
    compileELement(html);
    // expect(test).toBe(1);
    $scope.snapIndex = 1;
    $scope.$apply();
    expect(test).toBe(2);
    prevent = true;
    $scope.snapIndex = 2;
    $scope.$apply();
    expect(test).toBe(2);
  }
  
  function testResetsSnapIndexIfSnappingPrevented(html) {
    var prevent = false;
    $scope.beforeSnap = function () {
      if (prevent) {
        return false;
      }
    };
    compileELement(html);
    $scope.snapIndex = 1;
    $scope.$apply();
    expect($scope.snapIndex).toBe(1);
    prevent = true;
    $scope.snapIndex = 2;
    $scope.$apply();
    expect($scope.snapIndex).toBe(1);
  }
  
  function testAfterSnap(html) {
    var test = 0;
    $scope.afterSnap = function () {
      test = 1;
    };
    compileELement(html);
    $scope.snapIndex = 1;
    $scope.$apply();
    expect(test).toBe(1);
  }
  
  function testExecutesAfterSnapOnInitialSnap(html) {
    var test = 0;
    $scope.afterSnap = function () {
      test = 1;
    };
    compileELement(html);
    expect(test).toBe(1);
  }
  
  function testCorrectSnapIndexPassedToAfterSnap(html) {
    $scope.snapIndex = 0;
    $scope.afterSnap = function (snapIndex) {
      // see note on: testCorrectSnapIndexPassedToBeforeSnap()
      expect(snapIndex).toEqual($scope.snapIndex); 
    };
    compileELement(html);
    $scope.snapIndex = 1;
    $scope.$apply();
  }
  
  it('can be declared as an attribute', function () {
    // TODO: better way to test this?
    compileELement('<div snapscroll="" snap-index="snapIndex"></div>');
    expect($scope.snapIndex).toBeDefined();
  });
  
  describe('as an attribute', function () {
    it('sets overflow-y on the element to auto so that it\'s always scrollable', function () {
      var element = compileELement('<div snapscroll=""></div>');
      expect(element.css('overflowY')).toBe('auto');
    });
    
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
    
    it('doesn\'t snap to a snapIndex less than zero', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.index = 1;
      element = compileELement(html, true);
      $scope.$apply(function () {
        $scope.index = -1;
      });
      expect($scope.index).toBe(1);
      expect(element[0].scrollTop).toBe(50);
    });
    
    it('doesn\'t snap to a snapIndex greater than the number of available snaps (i.e. total - 1 since snapIndex is zero-based)', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.index = 1;
      element = compileELement(html, true);
      $scope.$apply(function () {
        $scope.index = 3;
      });
      expect($scope.index).toBe(1);
      expect(element[0].scrollTop).toBe(50);
    });
    
    it('converts a scrollTop to a snapIndex after a timeout (i.e. listens to scroll on the element)', inject(function ($timeout) {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect($scope.index).toBe(0);
      element[0].scrollTop = 50;
      element.triggerHandler('scroll');
      $timeout.flush();
      expect($scope.index).toBe(1);
    }));
    
    it('defaults the scrollDelay timeout to 250', inject(function ($timeout) {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect($scope.index).toBe(0);
      element[0].scrollTop = 50;
      element.triggerHandler('scroll');
      $timeout.flush(249);
      expect($scope.index).toBe(0);
      $timeout.flush(1);
      expect($scope.index).toBe(1);
    }));
    
    it('allows setting the scrollDelay timeout', inject(function ($timeout) {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" scroll-delay="400" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect($scope.index).toBe(0);
      element[0].scrollTop = 50;
      element.triggerHandler('scroll');
      $timeout.flush(399);
      expect($scope.index).toBe(0);
      $timeout.flush(1);
      expect($scope.index).toBe(1);
    }));
    
    it('does not allow setting the scrollDelay timeout using expressions', inject(function ($timeout) {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" scroll-delay="200 + 200" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect($scope.index).toBe(0);
      element[0].scrollTop = 50;
      element.triggerHandler('scroll');
      $timeout.flush(250);
      expect($scope.index).toBe(1);
      $timeout.flush(150);
      expect($scope.index).toBe(1);
    }));
    
    it('allows turning off the scrollDelay timeout if passed \'false\'', inject(function ($timeout) {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" scroll-delay="false" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect($scope.index).toBe(0);
      element[0].scrollTop = 50;
      element.triggerHandler('scroll');
      expect(function () {
        $timeout.flush();
      }).toThrow();
      expect($scope.index).toBe(1);
    }));
    
    it('defaults the the scrollDelay timeout to 250 if a non-number scrollDelay is provided', inject(function ($timeout) {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" scroll-delay="\'bad\'" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect($scope.index).toBe(0);
      element[0].scrollTop = 50;
      element.triggerHandler('scroll');
      $timeout.flush(249);
      expect($scope.index).toBe(0);
      $timeout.flush(1);
      expect($scope.index).toBe(1);
    }));
    
    it('stops listening on scroll event when scrop is destroyed', inject(function ($timeout) {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" scroll-delay="\'bad\'" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      $scope.$destroy();
      element[0].scrollTop = 50;
      element.triggerHandler('scroll');
      expect(function () {
        $timeout.flush();
      }).toThrow();
    }));
    
    it('resets (rounds up/down) the scrollTop after a scroll event so that a snap is always fully visible', inject(function ($timeout) {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect($scope.index).toBe(0);
      element[0].scrollTop = 25;
      element.triggerHandler('scroll');
      $timeout.flush();
      expect($scope.index).toBe(1);
      expect(element[0].scrollTop).toBe(50);
      element[0].scrollTop = 24;
      element.triggerHandler('scroll');
      $timeout.flush();
      expect($scope.index).toBe(0);
      expect(element[0].scrollTop).toBe(0);
    }));
    
    it('doesn\'t fire before and afterSnap callbacks while resetting the scrollTop', inject(function ($timeout) {
      var element,
          test = 0,
          html = [
            '<div snapscroll="" snap-index="index" after-snap="afterSnap()" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.afterSnap = function () {
        test += 1;
      };
      element = compileELement(html, true);
      expect($scope.index).toBe(0);
      expect(test).toBe(1);
      element[0].scrollTop = 24;
      element.triggerHandler('scroll');
      $timeout.flush();
      expect($scope.index).toBe(0);
      expect(test).toBe(1);
    }));
    
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
    
    it('updates the heights of the element\'s children when snapHeight is changed externally', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" snap-height="height" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      element = compileELement(html, true);
      expect(element.children()[0].offsetHeight).toBe(50);
      $scope.$apply(function () {
        $scope.height = 70;
      });
      expect(element.children()[0].offsetHeight).toBe(70);
    });
    
    it('can (therefore) function without heights set on the element or it\'s children, as long as snapHeight is provided', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="1" snap-height="height" style="overflow: auto">',
              '<div></div>',
              '<div></div>',
            '</div>'
          ].join('');
      $scope.height = 50;
      element = compileELement(html, true);
      expect(element[0].scrollTop).toBe(50);
      expect(element[0].offsetHeight).toBe(50);
      expect(element.children()[0].offsetHeight).toBe(50);
    });
    
    it('updates the scrollTop when snapHeight is changed so that the current snap is fully visible', function () {
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
    
    it('stays snapped to the current snapIndex when snapHeight is changed', function () {
      var element,
          html = [
            '<div snapscroll="" snap-index="index" snap-height="height" style="height: 50px; overflow: auto">',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
              '<div style="height: 50px"></div>',
            '</div>'
          ].join('');
      $scope.index = 1;
      element = compileELement(html, true);
      expect($scope.index).toBe(1);
      $scope.$apply(function () {
        $scope.height = 100;
      });
      expect($scope.index).toBe(1);
    });
    
    it('can execute a beforeSnap callback', function () {
      testBeforeSnap('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div></div>');
    });
    
    it('executes the beforeSnap callback on the initial snap', function () {
      testExecutesBeforeSnapOnInitialSnap('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div></div>');
    });
    
    it('passes the incoming snapIndex to the beforeSnap callback', function () {
      testCorrectSnapIndexPassedToBeforeSnap('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap(snapIndex)"></div>');
    });
    
    it('allows preventing snapping by returning \'false\' from the beforeSnap callback', function () {
      testAllowsPreventingSnapping('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div><div></div></div>');
    });
    
    it('resets the snapIndex if snapping is prevented', function () {
      testResetsSnapIndexIfSnappingPrevented('<div snapscroll="" snap-index="snapIndex" before-snap="beforeSnap()"><div></div><div></div></div>');
    });
    
    it('can execute an afterSnap callback', function () {
      testAfterSnap('<div snapscroll="" snap-index="snapIndex" after-snap="afterSnap()"><div></div></div>');
    });
    
    it('executes the afterSnap callback on the initial snap', function () {
      testExecutesAfterSnapOnInitialSnap('<div snapscroll="" snap-index="snapIndex" after-snap="afterSnap()"><div></div></div>');
    });
    
    it('passes the new snapIndex to the afterSnap callback', function () {
      testCorrectSnapIndexPassedToAfterSnap('<div snapscroll="" snap-index="snapIndex" after-snap="afterSnap(snapIndex)"></div>');
    });
    
    // test suite for animations
    describe('', function () {
//      beforeEach(function () {
//        
//      });
      
      it('animates the snapping by default', function () {
        var html = [
              '<div snapscroll="" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
              '</div>'
            ].join('');
        spyOn(angular.element, 'scrollTop');
        compileELement(html, true);
        expect(angular.element.scrollTop).toHaveBeenCalled();
      });

      it('allows disabling snapAnimation on initialisation', function () {
        var element,
            html = [
              '<div snapscroll="" snap-index="1" snap-animation="animation" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
              '</div>'
            ].join('');
        $scope.animation = false;
        element = compileELement(html, true);
        expect(element[0].scrollTop).toBe(50);
      });

      it('allows disabling snapAnimation on initialisation by passing \'false\'', function () {
        var element,
            html = [
              '<div snapscroll="" snap-index="1" snap-animation="false" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
              '</div>'
            ].join('');
        element = compileELement(html, true);
        expect(element[0].scrollTop).toBe(50);
      });

      it('allows enabling/disabling snapAnimation after initialisation i.e. creates one-way bind to snapAnimation', function () {
        var element,
            html = [
              '<div snapscroll="" snap-index="index" snap-animation="animation" style="height: 50px; overflow: auto">',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
                '<div style="height: 50px"></div>',
              '</div>'
            ].join('');
        element = compileELement(html, true);
        expect(element[0].scrollTop).not.toBe(50);
        element[0].scrollTop = 50;
        $scope.animation = false;
        $scope.index = 2;
        $scope.$apply();
        expect(element[0].scrollTop).toBe(100);
      });

      // TODO: how to test these?
      it('allows setting the snapAnimation duration (snapDuration)', function () {
      });

      it('only accepts integer values for snapDuration', function () {
      });

      it('defaults snapDuration to the value of duScrollDuration', function () {
      });

      it('allows setting the snapAnimation easing (snapEasing) for a single instance', function () {
      });

      it('defaults setting the snapEasing (snapEasing) to the value of duScrollEasing', function () {
      });
    });
  });
});
