describe('editor.js - unit', function() {
  it('return a Editor instance', function() {
    var form = document.createElement('form');
    expect((new Editor(form)).fields).toBeDefined(true);
  });

  it('return a Error no form was passed', function() {
    expect(new Editor('not a html element') instanceof Error).toBe(true);
    expect(new Editor() instanceof Error).toBe(true);
  });
});