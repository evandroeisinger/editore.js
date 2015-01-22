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
    self.regex        = {};
    self.regex.markup = /(<\/*[\w\s01-9='":;,\-]*\/*>)+/g;
    self.regex.enbsp  = /&nbsp;*/g;
    self.regex.space  = /\s/g;
    self.regex.spaceAndEnbsp  = /\s|&nbsp;/g;

    // handler methods
    function handler(methods, data, context) {
      return function() {
        for (var method in methods) (function (method) {
          method.call(context, data);
        }(methods[method]));
      }
    }

    // editor init
    if (self.fields.length)
      for (var field in self.fields) (function (field) {
        var clickHandlers = [],
            focusHandlers = [],
            keyupHanlders = [];

        if (field.maxLength) {
          clickHandlers.push(self.validateLength);
          focusHandlers.push(self.validateLength);
          keyupHanlders.push(self.validateLength);
        }

        if (field.require) {
          clickHandlers.push(self.validateRequire);
          focusHandlers.push(self.validateRequire);
          keyupHanlders.push(self.validateRequire);
        }

        field.element.addEventListener('click', handler(clickHandlers, field, self));
        field.element.addEventListener('focus', handler(focusHandlers, field, self));
        field.element.addEventListener('keyup', handler(keyupHanlders, field, self));
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
            type        : self.getDataAttribute('type', element) || 'simple',
            maxLength   : self.getDataAttribute('length', element, true),
            placeholder : self.getDataAttribute('placeholder', element),
            require     : self.getDataAttribute('require', element),
            element     : self.applyEditable(self.applyTabIndex(element, tabIndex))
          });
      }(form.children[i]));

      return fields;
    },

    getDataAttribute: function(name, element, isInt) {
      var value = element.getAttribute('data-' + name) || false;

      if (!value)
        return false;
      if (isInt)
        return window.parseInt(value);
      
      return value;
    },

    getInnerText: function(element) {
      var self = this;
      return element.innerHTML
        .replace(self.regex.markup, '')
        .replace(self.regex.enbsp, '');
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
      var self = this;

      field.length = field.element.innerHTML
        .replace(self.regex.markup, '')
        .replace(self.regex.spaceAndEnbsp, '_')
        .length;

      if (field.length > field.maxLength)
        return self.applyClassName(field.element, 'invalid');
      self.removeClassName(field.element, 'invalid')
    },

    validateRequire: function(field) {
      var self = this;

      if (!field.length)
        return self.applyClassName(field.element, 'require');
      self.removeClassName(field.element, 'require')
    }
  }

  return Editor;
}));
