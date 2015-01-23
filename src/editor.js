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

    // set handler event method
    function setHandler(methods, data, context) {
      return function(e) {
        for (var method in methods) (function (method) {
          method.call(context, data, e);
        }(methods[method]));
      }
    }

    // return editor fields 
    function getFields() {
      var fields = {};

      for (var field in self.fields) (function(field) {
        fields[field.name] = {
          name        : field.name,
          element     : field.element,
          value       : field.value(field),
          maxLength   : field.maxLength,
          type        : field.type,
          require     : field.require,
          placeholder : field.placeholder
        }
      }(self.fields[field]))

      return fields;
    }

    // return field values
    function getValues() {
      var values = {};

      for (var field in self.fields) (function(field) {
        values[field.name] = {
          name   : field.name,
          value  : field.value(field),
          length : field.length,
          valid  : field.valid
        }
      }(self.fields[field]))

      return values;
    }

    // editor constructor
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

      field.element.addEventListener('click', setHandler(click, field, self));
      field.element.addEventListener('focus', setHandler(focus, field, self));
      field.element.addEventListener('keyup', setHandler(keyup, field, self));
      field.element.addEventListener('keydown', setHandler(keydown, field, self));

      self
        .calculateLength(field)
        .validateLength(field)
        .validatePlaceholder(field)
        .validateRequire(field);

    }(self.fields[field]))

    return {
      fields : getFields,
      values : getValues
    }
  }

  Editor.prototype = {
    getFields: function(form) {
      var self    = this,
          fields  = {};

      if (!form.children.length)
        return fields;

      for (var i = form.children.length - 1; i >= 0; i--) (function(element) {
        var field    = self.getDataAttribute('field', element, 'str', false),
            tabIndex = (i - length);

        if (field) {
          fields[field] = {
          name        : field,
          type        : self.getDataAttribute('type', element, 'str', 'single'),
          maxLength   : self.getDataAttribute('length', element, 'int', false),
          placeholder : self.getDataAttribute('placeholder', element, 'str', false),
          require     : self.getDataAttribute('require', element, 'bol', false),
          element     : self.applyEditable(self.applyTabIndex(element, tabIndex)),
          value       : self.getValue,
          length      : 0,
          valid       : false
          }
        }
      }(form.children[i]));

      return fields;
    },

    getValue: function(field) {
      var self = this;
      return '';
    },

    getDataAttribute: function(name, element, type, defaultValue) {
      var value = element.getAttribute('data-' + name);

      if (!value)
        return defaultValue || false;

      switch (type) {
        case 'str':
          value = value.toString();
          break;
        case 'int':
          value = window.parseInt(value);
          break;
        case 'bol':
          value = (value == 'true');
          break;
        default:
          value = value.toString();
          break;
      }
      
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
