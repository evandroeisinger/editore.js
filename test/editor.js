describe('editor.js', function() {
  var form, 
      editor;

  beforeEach(function() {
    form = $j([
      '<form>',
        '<h1 data-field="title" data-require="true" data-length="10" data-placeholder="Title"></h1>',
        '<p data-field="description" data-placeholder="Description" data-type="rich">Description</p>',
        '<p data-field="withoutPlaceholder"></p>',
        '<p></p>',
      '</form>'].join())[0];
    editor = new Editor(form);
  });

  it('return a Editor instance', function() {
    expect(editor.fields).toBeDefined();
    expect(editor.fields().title).toBeDefined();
    expect(editor.fields().description).toBeDefined();
    expect(editor.fields().withoutPlaceholder).toBeUndefined();
    expect(editor.values).toBeDefined();
    expect(editor.values().title).toBeDefined();
    expect(editor.values().description).toBeDefined();
    expect(editor.values().withoutPlaceholder).toBeUndefined();
    expect(editor.destroy).toBeDefined();
    expect(editor.register).toBeDefined();
  });

  it('register a new actionBar plugin', function() {
    editor.register('action', SampleActionPlugin);
    expect(editor.fields().description.actionBar.plugins.SampleActionPlugin instanceof SampleActionPlugin).toBe(true);
  });

  it('return a Error when no form was passed', function() {
    expect(new Editor('not a html element') instanceof Error).toBe(true);
    expect(new Editor() instanceof Error).toBe(true);
  });

  it('set element editable', function() {
    Editor.prototype.setEditable(form);
    expect(form.getAttribute('contenteditable')).toBeTruthy();
  });

  it('set element tabIndex', function() {
    Editor.prototype.setTabIndex(form, 0);
    var tabIndex = form.getAttribute('tabindex');
    expect(tabIndex).toBeTruthy();
    expect(tabIndex).toBe('0');
  });

  it('return data attributes', function() {
    var field = editor.fields().title.element;
    expect(Editor.prototype.getDataAttribute('field', field, 'str', false)).toBe('title');
    expect(Editor.prototype.getDataAttribute('require', field, 'bol', false)).toBe(true);
    expect(Editor.prototype.getDataAttribute('length', field, 'int', false)).toBe(10);
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'str', 'defaultValue')).toBe('defaultValue');
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'bol', true)).toBe(true);
    expect(Editor.prototype.getDataAttribute('defaultValue', field, 'int', 123)).toBe(123);
  });

  it('return the correct fields from form', function() {
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
  });

  it('validate fields', function() {
    var editor = new Editor(form);
    expect(editor.values().title.valid).toBe(false);
    expect(editor.values().description.valid).toBe(true);
  });

  it('set placeholder', function() {
    var editor = new Editor(form);
    expect(editor.fields().title.element.classList.contains('placeholder')).toBeTruthy();
    expect(editor.fields().description.element.classList.contains('placeholder')).toBeFalsy();
  });
});
