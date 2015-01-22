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
      return function(e) {
        for (var method in methods) (function (method) {
          method.call(context, data, e);
        }(methods[method]));
      }
    }

    // editor init
    if (self.fields.length)
      for (var field in self.fields) (function (field) {
        var click   = [],
            focus   = [],
            keyup   = [self.calculateLength],
            keydown = [];

        if (field.maxLength) {
          keyup.push(self.validateLength);
        }

        if (field.placeholder) {
          keyup.push(self.validatePlaceholder);
          keydown.push(self.removePlaceHolder);
        }

        if (field.require) {
          keyup.push(self.validateRequire);
        }

        field.element.addEventListener('click', handler(click, field, self));
        field.element.addEventListener('focus', handler(focus, field, self));
        field.element.addEventListener('keyup', handler(keyup, field, self));
        field.element.addEventListener('keydown', handler(keydown, field, self));

        self
          .calculateLength(field)
          .validateLength(field)
          .validatePlaceholder(field)
          .validateRequire(field);

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

    getClassName: function(element, className) {
      if (element.classList)
        return element.classList.contains(className);
    },

    calculateLength: function(field) {
      var self = this;

      field.length = field.element.innerHTML
        .replace(self.regex.markup, '')
        .replace(self.regex.spaceAndEnbsp, '_')
        .length;

      return self;
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

    removePlaceHolder: function(field, event) {
      var self = this;
      
      if (event.keyCode !== 9)
        self.removeClassName(field.element, 'placeholder');
    },

    validateLength: function(field) {
      var self = this;

      if (field.length > field.maxLength)
        self.applyClassName(field.element, 'invalid');
      else
        self.removeClassName(field.element, 'invalid')
      return self;
    },

    validateRequire: function(field) {
      var self = this;

      if (!field.length)
        self.applyClassName(field.element, 'require');
      else
        self.removeClassName(field.element, 'require')
      return self;
    },

    validatePlaceholder: function(field) {
      var self = this;

      if (!field.length)
        self.applyClassName(field.element, 'placeholder');
      return self;
    }
  }

  return Editor;
}));
