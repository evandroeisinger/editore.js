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
    field = $j(['<h1 data-field="title" data-length="10" data-placeholder="Title" data-require="true"></h1>',].join())[0];
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
    expect(editor.fields().title).toBeDefined();
    expect(editor.fields().title.name).toBe('title');
    expect(editor.fields().title.maxLength).toBe(10);
    expect(editor.fields().title.placeholder).toBe('Title');
    expect(editor.fields().description).toBeDefined();
    expect(editor.fields().description.element).toBe($j('p', form)[0]);
    expect(editor.fields().description.placeholder).toBe(false);
  });

  it('return data attributes', function() {
    expect(Editor.prototype.getDataAttribute('field', field, 'str', false)).toBe('title');
    expect(Editor.prototype.getDataAttribute('require', field, 'bol', false)).toBe(true);
    expect(Editor.prototype.getDataAttribute('length', field, 'int', false)).toBe(10);
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'str', 'defaultValue')).toBe('defaultValue');
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'bol', true)).toBe(true);
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'int', 123)).toBe(123);
  });

  it('return fields', function() {
    // length/regex - karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
  });

  it('return fields values', function() {
    // length/regex - karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
  });

  it('return field value', function() {
    // length/regex - karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
  });

  it('validate length', function() {
    // length/regex - karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
  });

  it('validate valid', function() {
    // length/regex - karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
  });

  it('validate require', function() {
    // length/regex - karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
  });
});