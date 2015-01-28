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

    // editor setup
    self.default = {};
    self.default.blockElement = 'p';

    // field types
    self.types        = {};
    self.types.RICH   = 'rich';
    self.types.SIMPLE = 'simple';

    // elements
    self.form   = form;
    self.fields = self.getFields(self.form);
    
    // regex patterns
    self.regex            = {};
    self.regex.markup     = /(<\/*[\w\s01-9='":;,\-]*\/*>)+/g;
    self.regex.enbsp      = /&nbsp;*/g;
    self.regex.space      = /\s/g;
    self.regex.trim       = /\s+$/g;
    self.regex.lineBreak  = /(\r\n|\n|\r)[.]?/g; 
    self.regex.spaceAndEnbsp  = /\s|&nbsp;/g;

    // set handler event method
    function handler(methods, data, context) {
      return function(e) {
        for (var method in methods) (function (method) {
          method.call(context, data, e);
        }(methods[method]));
      }
    }

    // return editor fields
    function fields() {
      var fields = {};

      for (var field in self.fields) (function(field) {
        fields[field.name] = {
          name        : field.name,
          element     : field.element,
          maxLength   : field.maxLength,
          type        : field.type,
          require     : field.require,
          placeholder : field.placeholder
        }
      }(self.fields[field]))

      return fields;
    }

    // return field values
    function values() {
      var values = {};

      for (var field in self.fields) (function(field) {
        values[field.name] = {
          name   : field.name,
          value  : self.getValue(field),
          length : self.getLength(field),
          valid  : self.isValid(field)
        }
      }(self.fields[field]))

      return values;
    }

    // destroy this editor
    function destroy() {
      console.log('Remove all eventListeners!');
    }

    // editor constructor
    for (var field in self.fields) (function (field) {
      var click   = [self.binds.focus],
          focus   = [],
          blur    = [],
          keyup   = [self.binds.focus],
          keydown = [],
          keypress = [];

      if (field.maxLength) {
        keyup.push(self.isOutOfBounds);
      }

      if (field.placeholder) {
        keyup.push(self.applyPlaceholder);
        keydown.push(self.removePlaceHolder);
      }

      if (field.require) {
        keyup.push(self.isEmpty);
      }

      if (field.type == self.types.SIMPLE) {
        keypress.push(self.binds.disableBlocks);
      }

      if (field.type == self.types.RICH) {
        keyup.push(self.binds.blocksCreation);
      }

      field.element.addEventListener('blur', handler(blur, field, self));
      field.element.addEventListener('click', handler(click, field, self));
      field.element.addEventListener('focus', handler(focus, field, self));
      field.element.addEventListener('keyup', handler(keyup, field, self));
      field.element.addEventListener('keydown', handler(keydown, field, self));
      field.element.addEventListener('keypress', handler(keypress, field, self));

      self.applyPlaceholder(field);
    } (self.fields[field]));

    return {
      fields: fields,
      values: values,
      destroy: destroy
    }
  }

  Editor.prototype = {
    helpers: {
      currentNode: function() {
        var node = document.getSelection().anchorNode;
        // if is child (3) return parent node else return node
        return (node && node.nodeType === 3 ? node.parentNode : node);
      },
    },

    binds: {
      focus: function (field, e) {
        var self = this,
            currentBlock;
        // only this keys bind focus
        if ([13,40,38,39,37,8,46,9,1].indexOf(e.which) < 0)
          return;

        for (var _field in self.fields) (function (_field) {
          if (field.name == _field.name) {
            field.element.classList.add('focus');
            field.focus = true;
            return;
          } else {
            _field.focus = false;
            _field.element.classList.remove('focus');
          }
        } (self.fields[_field]));

        if (field.type == self.types.RICH) {
          field.currentBlock = self.getCurrentBlock(self.helpers.currentNode());
          field.currentBlock.classList.add('focus');
          for (var i = 0; i < field.element.children.length; i++) (function(block) {
            if (block !== field.currentBlock)
              block.classList.remove('focus');
          }(field.element.children[i]));
        }
      },

      disableBlocks: function (field, e) {
        var self = this;
        if (e.which === 13 && field.type == self.types.SIMPLE)
          return e.preventDefault();
      },

      blocksCreation: function (field) {
        var self = this,
            node = self.helpers.currentNode();
        if (node && node.children.length === 0) {
          document.execCommand('formatBlock', false, self.default.blockElement);
        }
      },
    },

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
          type        : self.getDataAttribute('type', element, 'str', self.types.SIMPLE),
          maxLength   : self.getDataAttribute('length', element, 'int', false),
          placeholder : self.getDataAttribute('placeholder', element, 'str', false),
          require     : self.getDataAttribute('require', element, 'bol', false),
          element     : self.applyEditable(self.applyTabIndex(element, tabIndex)),
          value       : '',
          valid       : false,
          length      : 0,
          focus       : false
          }
        }
      }(form.children[i]));

      return fields;
    },

    getCurrentBlock: function(currentNode) {
      var self = this,
          // error when field its empty
          currentTagName = currentNode.tagName.toLowerCase();

      if (currentTagName == self.default.blockElement)
          return currentNode;
      
      return self.getCurrentBlock(currentNode.parentNode);
    },

    getValue: function(field) {
      var self = this;

      if (field.type = self.types.SIMPLE)
        return field.element.innerText.replace(self.regex.lineBreak, ' ').replace(self.regex.trim, '');
      if (field.type = self.types.RICH)
        return field.element.innerHTML;
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

    getLength: function(field) {
      var self = this;

      return field.element.innerHTML
        .replace(self.regex.markup, '')
        .replace(self.regex.spaceAndEnbsp, '_')
        .length;
    },

    applyEditable: function(element) {
      element.setAttribute('contenteditable', true);
      return element; 
    },

    applyTabIndex: function(element, index) {
      element.setAttribute('tabindex', index + 1);
      return element; 
    },

    applyPlaceholder: function(field) {
      var self = this;
      if (!self.getLength(field)) {
        field.element.innerHTML = "";
        field.element.classList.add('placeholder');
      }
      return self;
    },

    removePlaceHolder: function(field, event) {
      var self = this;
      
      if (event.keyCode !== 9)
        field.element.classList.remove('placeholder');
    },

    isOutOfBounds: function(field) {
      var self = this;

      if (self.getLength(field) > field.maxLength) {
        field.element.classList.add('invalid');
        return true;
      }
      
      field.element.classList.remove('invalid')
      return false;
    },

    isEmpty: function(field) {
      var self = this;

      if (!self.getLength(field)) {
        field.element.classList.add('require');
        return true;
      }

      field.element.classList.remove('require');
      return false;
    },

    isValid: function(field) {
      var self = this;

      if (field.require && self.isEmpty(field))
        return false;
      if (field.maxLength && self.isOutOfBounds(field))
        return false;
      return true;
    }
  }

  return Editor;
}));
