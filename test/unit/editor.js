describe('editor.js - unit', function() {
  it('return a Editor instance', function() {
    var form = document.createElement('form');
    expect((new Editor(form)).fields).toBeDefined(true);
  });

  it('return a Error when no form was passed', function() {
    expect(new Editor('not a html element') instanceof Error).toBe(true);
    expect(new Editor() instanceof Error).toBe(true);
  });

  it('return the correct fields from form', function() {
    var form = $j([
      '<form>',
        '<h1 data-field="title" data-length="10" data-placeholder="Title"></h1>',
        '<p data-field="description"></p>',
        '<p></p>',
      '</form>'].join())[0],
      editor = new Editor(form);

    expect(editor.fields.length).toBe(2);
    expect(editor.fields[1].name).toBe('title');
    expect(editor.fields[1].length).toBe(10);
    expect(editor.fields[1].placeholder).toBe('Title');
    expect(editor.fields[0].placeholder).toBe(false);
  });

  it('return data attributes', function() {
    var element = $j('<div data-field="element" data-length="10"></div>')[0];

    expect(Editor.prototype.getDataAttribute('field', element)).toBe('element');
    expect(Editor.prototype.getDataAttribute('length', element)).toBe('10');
    expect(Editor.prototype.getDataAttribute('length', element, true)).toBe(10);
    expect(Editor.prototype.getDataAttribute('data-field', element)).toBe(false);
  });
});