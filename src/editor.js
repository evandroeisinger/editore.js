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

    // elements
    self.form   = form;
    self.fields = self.getFields(self.form);
    
    // field types
    self.types        = {};
    self.types.RICH   = 'rich';
    self.types.SIMPLE = 'simple';

    // regex patterns
    self.regex       = {};
    self.regex.arkup = /(<\/*[\w\s01-9='":;,\-]*\/*>)+/g;
    self.regex.space = /(&nbsp;)*/g;

    // handler methods
    function handler(method, data, context) {
      return method.bind(context, data);
    }

    if (self.fields.length)
      for (var field in self.fields) (function (field) {
        if (field.length) {
          field.element.addEventListener('click', handler(self.validateLength, field, self));
          field.element.addEventListener('focus', handler(self.validateLength, field, self));
          field.element.addEventListener('keyup', handler(self.validateLength, field, self));
        }
      }(self.fields[field]))

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
            type        : self.getDataAttribute('type', element) || '',
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

    getInnerText: function(element) {
      var self = this;
      return element.innerHTML
        .replace(self.regex.markup, '')
        .replace(self.regex.space, '');
    },

    applyEditable: function(element) {
      element.setAttribute('contenteditable', true);
      return element; 
    },

    applyTabIndex: function(element, index) {
      element.setAttribute('tabindex', index + 1);
      return element; 
    },

    applyClassName: function(element, className) {
      if (element.classList)
        return element.classList.add(className);
    },

    removeClassName: function(element, className) {
      if (element.classList)
        return element.classList.remove(className);
    },

    validateLength: function(field) {
      var self      = this, 
      currentLength = self.getInnerText(field.element).length;

      if (currentLength > field.length) {
        self.applyClassName(field.element, 'invalid');
        return false;
      }
      
      self.removeClassName(field.element, 'invalid')
      return true;
    }
  }

  return Editor;
}));
