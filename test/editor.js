describe('editor.js', function() {
  var form;

  beforeEach(function() {
    form = $j([
      '<form>',
        '<h1 data-field="title" data-require="true" data-length="10" data-placeholder="Title"></h1>',
        '<p data-field="description">Description</p>',
        '<p></p>',
      '</form>'].join())[0];
  });

  it('return a Editor instance', function() {
    var editor = new Editor(form);
    expect(editor.fields).toBeDefined(true);
    expect(editor.values).toBeDefined(true);
    expect(editor.destroy).toBeDefined(true);
  });

  it('return a Error when no form was passed', function() {
    expect(new Editor('not a html element') instanceof Error).toBe(true);
    expect(new Editor() instanceof Error).toBe(true);
  });

  it('return the element editable', function() {
    Editor.prototype.setEditable(form);
    expect(form.getAttribute('contenteditable')).toBeTruthy();
  });

  it('return data attributes', function() {
    var field = $j(['<h1 data-field="title" data-length="10" data-placeholder="Title" data-require="true"></h1>',].join())[0];
    expect(Editor.prototype.getDataAttribute('field', field, 'str', false)).toBe('title');
    expect(Editor.prototype.getDataAttribute('require', field, 'bol', false)).toBe(true);
    expect(Editor.prototype.getDataAttribute('length', field, 'int', false)).toBe(10);
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'str', 'defaultValue')).toBe('defaultValue');
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'bol', true)).toBe(true);
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'int', 123)).toBe(123);
  });

  it('return the correct fields from form', function() {
    var editor = new Editor(form);
    expect(editor.fields().title).toBeDefined();
    expect(editor.fields().title.name).toBe('title');
    expect(editor.fields().title.maxLength).toBe(10);
    expect(editor.fields().title.type).toBe('simple');
    expect(editor.fields().title.require).toBe(true);
    expect(editor.fields().title.placeholder).toBe('Title');
  });

  it('return fields values', function() {
    var editor = new Editor(form);
    expect(editor.values().title).toBeDefined();
    expect(editor.values().title.name).toBe('title');
    expect(editor.values().title.valid).toBe(false);
    expect(editor.values().title.value).toBe('');
    expect(editor.values().title.length).toBe(0);
    expect(editor.values().description).toBeDefined();
    expect(editor.values().description.name).toBe('description');
    expect(editor.values().description.valid).toBe(true);
    expect(editor.values().description.value).toBe('Description');
    expect(editor.values().description.length).toBe(11);
  });

  it('validate valid', function() {
    var editor = new Editor(form);
    expect(editor.values().title.valid).toBe(false);
    expect(editor.values().description.valid).toBe(true);
  });
});