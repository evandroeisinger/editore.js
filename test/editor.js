describe('editor.js', function() {
  var form, 
      field;

  beforeEach(function() {
    form = $j([
      '<form>',
        '<h1 data-field="title" data-length="10" data-placeholder="Title"></h1>',
        '<p data-field="description"></p>',
        '<p></p>',
      '</form>'].join())[0];
    field = $j(['<h1 data-field="title" data-length="10" data-placeholder="Title"></h1>',].join())[0];
  });

  it('return a Editor instance', function() {
    expect((new Editor(form)).fields).toBeDefined(true);
  });

  it('return a Error when no form was passed', function() {
    expect(new Editor('not a html element') instanceof Error).toBe(true);
    expect(new Editor() instanceof Error).toBe(true);
  });

  it('return the element editable', function() {
    expect(Editor.prototype.applyEditable(form).getAttribute('contenteditable')).toBeTruthy();
  });

  it('return the correct fields from form', function() {
    var editor = new Editor(form);
    expect(editor.fields.length).toBe(2);
    expect(editor.fields[1].name).toBe('title');
    expect(editor.fields[1].maxLength).toBe(10);
    expect(editor.fields[0].element).toBe($j('p', form)[0]);
    expect(editor.fields[1].placeholder).toBe('Title');
    expect(editor.fields[0].placeholder).toBe(false);
  });

  it('return data attributes', function() {
    expect(Editor.prototype.getDataAttribute('field', field)).toBe('title');
    expect(Editor.prototype.getDataAttribute('length', field)).toBe('10');
    expect(Editor.prototype.getDataAttribute('length', field, true)).toBe(10);
    expect(Editor.prototype.getDataAttribute('data-field', field)).toBe(false);
  });

  it('validate length', function() {
    // karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
  });

  it('validate require', function() {
    // karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
  });
});