(function(global, editor) {
  if (typeof define === 'function' && define.amd)
    define('editor-js', [], editor);
  else if (typeof exports !== 'undefined')
    exports.Editor = editor();
  else
    global.Editor = editor();
}(window, function() {
  'use strict';

  function Editor(form) {
    var self = this;
    
    self.form   = form;
    self.fields = [];

    if (!form || !form.nodeName)
      return new Error('No form was passed!');

    self.fields = self.getFields(self.form);

    return {
      fields: self.fields
    }
  }

  Editor.prototype = {
    getFields: function(form) {
      var self    = this,
          fields  = [];

      for (var i = form.children.length - 1; i >= 0; i--)(function(element) {
        var field = self.getDataAttribute('field', element);

        if (field)
          fields.push({
            name: field,
            length: self.getDataAttribute('length', element, true),
            placeholder: self.getDataAttribute('placeholder', element)
          });
      }(form.children[i]));

      return fields;
    },

    getDataAttribute: function(name, element, isInt) {
      var value = element.getAttribute('data-' + name) || false;

      if (isInt)
        return window.parseInt(value);
      else
        return value;
    }
  }

  return Editor;
}));
