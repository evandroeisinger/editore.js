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

    if (!form || !form.nodeName)
      return new Error('No form was passed!');

    self.form   = form;
    self.fields = self.getFields(self.form);

    if (self.fields.length)
      for (var field in self.fields)
        self.applyFieldEvents(self.fields[field]);

    return {
      fields: self.fields
    }
  }

  Editor.prototype = {
    getFields: function(form) {
      var self    = this,
          fields  = [];

      if (!form.children.length)
        return fields;

      for (var i = form.children.length - 1; i >= 0; i--) (function(element) {
        var field = self.getDataAttribute('field', element),
            tabIndex = (i - length);

        if (field)
          fields.push({
            name        : field,
            typeof      : self.getDataAttribute('type', element),
            length      : self.getDataAttribute('length', element, true),
            placeholder : self.getDataAttribute('placeholder', element),
            element     : self.applyEditable(self.applyTabIndex(element, tabIndex))
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
    },

    applyEditable: function(element) {
      element.setAttribute('contenteditable', true);
      return element; 
    },

    applyTabIndex: function(element, index) {
      element.setAttribute('tabindex', index + 1);
      return element; 
    },

    applyFieldEvents: function(field) {
      // placeholder
      // length
    },

    applyType: function(field, type) {}
  }

  return Editor;
}));
