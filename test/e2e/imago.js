describe("editor.js - e2e", function() {
    var f = jasmine.getFixtures(),
        form;

    f.fixturesPath = 'base';

    beforeEach(function(){
      f.load('test/e2e/form.html');
      form = $j('#form');
    });
 
    afterEach(function() {
        f.cleanUp();
        f.clearCache();
    });
 
    it("dummy", function() {
      expect(true).toBe(true);
    });
});