// phatomjs bind polyfill
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

describe('editor.js - unit', function() {
  it('return a Editor instance', function() {
    var form = document.createElement('form');
    expect((new Editor(form)).fields).toBeDefined(true);
  });

  it('return a Error when no form was passed', function() {
    expect(new Editor('not a html element') instanceof Error).toBe(true);
    expect(new Editor() instanceof Error).toBe(true);
  });

  it('return the element editable', function() {
    var form = $j([
        '<form>',
          '<h1 data-field="title" data-length="10" data-placeholder="Title"></h1>',
          '<p data-field="description"></p>',
        '</form>'].join())[0];

    expect(Editor.prototype.applyEditable(form).getAttribute('contenteditable')).toBeTruthy();
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
    expect(editor.fields[0].element).toBe($j('p', form)[0]);
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

  it('validate length', function() {
    // karma/phatomjs fail - https://github.com/karma-runner/karma/issues/629
    // var innerText = 'InnerText test rocks! ',
    //     form = $j([
    //       '<form>',
    //         '<h1 data-field="title" data-length="10" data-placeholder="Title">InnerText test </h1>',
    //         '<p data-field="description">rocks!</p>',
    //       '</form>'].join())[0];
    // expect(Editor.prototype.getInnerText(form)).toBe(innerText);
  });
});