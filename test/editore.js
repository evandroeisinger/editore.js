describe('editore.js', function() {
  var form, 
      editore;

  beforeEach(function() {
    form = $j([
      '<form>',
        '<h1 data-field="title" data-placeholder="Title" data-required="true" data-length="10"></h1>',
        '<p data-field="description" data-placeholder="Description" data-type="rich">Description</p>',
        '<p data-field="withoutPlaceholder"></p>',
        '<p></p>',
      '</form>'].join())[0];
    editore = new Editore(form);
  });

  it('return a Editor instance', function() {
    expect(editore.fields).toBeDefined();
    expect(editore.fields().title).toBeDefined();
    expect(editore.fields().description).toBeDefined();
    expect(editore.fields().withoutPlaceholder).toBeUndefined();
    expect(editore.values).toBeDefined();
    expect(editore.values().title).toBeDefined();
    expect(editore.values().description).toBeDefined();
    expect(editore.values().withoutPlaceholder).toBeUndefined();
    expect(editore.destroy).toBeDefined();
    expect(editore.registerInsertComponent).toBeDefined();
    expect(editore.registerEditionComponent).toBeDefined();
    expect(editore.subscribeInput).toBeDefined();
    expect(editore.clearFields).toBeDefined();
  });

  it('return a Error when no form was passed', function() {
    expect(new Editore('not a html element') instanceof Error).toBe(true);
    expect(new Editore() instanceof Error).toBe(true);
  });

  it('set element editable', function() {
    expect(editore.fields().title.element.getAttribute('contenteditable')).toBeTruthy();
    expect(editore.fields().description.element.getAttribute('contenteditable')).toBeTruthy();
  });

  it('set element tabIndex', function() {
    expect(editore.fields().title.element.getAttribute('tabIndex')).toBe('1');
    expect(editore.fields().description.element.getAttribute('tabIndex')).toBe('2');
  });

  it('return data attributes', function() {
    var field = editore.fields().title.element;
    expect(Editore.prototype.getDataAttribute('field', field, 'str', false)).toBe('title');
    expect(Editore.prototype.getDataAttribute('required', field, 'bol', false)).toBe(true);
    expect(Editore.prototype.getDataAttribute('length', field, 'int', false)).toBe(10);
    expect(Editore.prototype.getDataAttribute('defaultValue', field, 'str', 'defaultValue')).toBe('defaultValue');
    expect(Editore.prototype.getDataAttribute('defaultValue', field, 'bol', true)).toBe(true);
    expect(Editore.prototype.getDataAttribute('defaultValue', field, 'int', 123)).toBe(123);
  });

  it('return the correct fields from form', function() {
    expect(editore.fields().title).toBeDefined();
    expect(editore.fields().title.name).toBe('title');
    expect(editore.fields().title.maxLength).toBe(10);
    expect(editore.fields().title.type).toBe('simple');
    expect(editore.fields().title.required).toBe(true);
    expect(editore.fields().title.placeholder).toBe('Title');
  });

  it('return fields values', function() {
    var editore = new Editore(form);
    expect(editore.values().title).toBeDefined();
    expect(editore.values().title.name).toBe('title');
    expect(editore.values().title.valid).toBe(false);
    expect(editore.values().title.value).toBe('');
    expect(editore.values().title.length).toBe(0);
  });

  it('validate fields', function() {
    var editore = new Editore(form);
    expect(editore.values().title.valid).toBe(false);
    expect(editore.values().description.valid).toBe(true);
  });

  it('set placeholder', function() {
    var editore = new Editore(form);
    expect(editore.fields().title.element.classList.contains('placeholder')).toBeTruthy();
    expect(editore.fields().description.element.classList.contains('placeholder')).toBeFalsy();
  });
});
