define(function(require) {
  if (window.__html__) {
    document.body.innerHTML = window.__html__['index.html'];
  }
  var chai = require('node/chai/chai');
  //require('js/platformstyle');
  require('activity/utils');
  /*require('js/logo');
  require('lib/easeljs');
  require('lib/tweenjs');
  require('lib/preloadjs');
  require('lib/howler');
  //require('lib/p5.sound');
  //require('lib/p5.dom');
  require('lib/mespeak');
  require('lib/Chart');
  require('js/utils');
  require('js/artwork');
  require('js/munsell');
  //require('js/trash');
  require('js/turtle');
  //require('js/palette');
  require('js/protoblocks');
  require('js/blocks');
  require('js/block');
  require('js/logo');
  require('js/clearbox');
  require('js/utilitybox');
  require('js/samplesviewer');
  require('js/basicblocks');
  require('js/blockfactory');
  require('js/analytics');
  require('lib/prefixfree.min');*/
  //require('js/activity.js');

  var expect = chai.expect;


  describe("Turtle Block", function() {
    it("contains spec with an expectation", function() {
      //var logo;
      //logo = new Logo();
      //logo.setTurtleDelay(2);
      //console.log(logo.turtleDelay);
      var myList = [];
      myList.push('1');
      myList.push('2');
      myList.push('3');
      myList.push('5');
      var a = last(myList);
      console.log(a);
      expect(a).to.equal('5');
    });
  });
});
