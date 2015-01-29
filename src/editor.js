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

    // regex patterns
    self.regex            = {};
    self.regex.markup     = /(<\/*[\w\s01-9='":;,\-]*\/*>)+/g;
    self.regex.enbsp      = /&nbsp;*/g;
    self.regex.space      = /\s/g;
    self.regex.trim       = /\s+$/g;
    self.regex.lineBreak  = /(\r\n|\n|\r)[.]?/g; 
    self.regex.spaceAndEnbsp  = /\s|&nbsp;/g;

    // elements
    self.form   = form;
    self.fields = self.getFields(self.form);

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
          length : field.length,
          value  : self.getValue(field),
          valid  : self.validate(field)
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
      var click   = [],
          keyup   = [],
          keydown = [],
          keypress = [];

      if (field.type == self.types.SIMPLE) {
        click.push(self.binds.focus);
        keydown.push(self.removePlaceHolder);
        keypress.push(self.binds.disableBlocks);
        keyup.push(self.setLength, self.setPlaceholder, self.binds.focus);
      }

      if (field.type == self.types.RICH) {
        click.push(self.binds.blocksCreation, self.binds.focus);
        keydown.push(self.removePlaceHolder);
        keypress.push();
        keyup.push(self.setLength, self.binds.blocksCreation, self.binds.focus, self.setPlaceholder);
      }

      if (field.maxLength)
        keyup.push(self.validateMaxLength);
      if (field.require)
        keyup.push(self.validateRequire);

      field.element.addEventListener('click', handler(click, field, self));
      field.element.addEventListener('keyup', handler(keyup, field, self));
      field.element.addEventListener('keydown', handler(keydown, field, self));
      field.element.addEventListener('keypress', handler(keypress, field, self));
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

        // if child is nodeText (type 3) return parent node else return node
        if (node && node.nodeType === 3)
          return node.parentNode
        else
          return node;
      },
    },

    binds: {
      focus: function (field, e) {
        var self = this,
            currentBlock;

        // only this keys bind focus
        if ([13,40,38,39,37,8,46,9,1].indexOf(e.which) < 0 || (!field.length && e.type !== 'click'))
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

      disableBlocks: function(field, e) {
        if (e.which === 13)
          return e.preventDefault();
      },

      blocksCreation: function(field, e) {
        var self = this,
            node = self.helpers.currentNode();

        if ((node && node.children.length === 0 && e.which !== 8) || (!field.length && e.which === 1))
          document.execCommand('formatBlock', false, self.default.blockElement);
      }
    },

    getFields: function(form) {
      var self    = this,
          fields  = {};
      if (!form.children.length)
        return fields;
      for (var i = form.children.length - 1; i >= 0; i--) (function(element) {
        var field       = self.getDataAttribute('field', element, 'str', false),
            placeholder = self.getDataAttribute('placeholder', element, 'str', false);

        if (field && placeholder) {
          fields[field]             = {};
          fields[field].name        = field;
          fields[field].type        = self.getDataAttribute('type', element, 'str', self.types.SIMPLE);
          fields[field].maxLength   = self.getDataAttribute('length', element, 'int', false);
          fields[field].placeholder = placeholder;
          fields[field].require     = self.getDataAttribute('require', element, 'bol', false);
          fields[field].element     = element;
          fields[field].value       = '';
          fields[field].valid       = false;
          fields[field].length      = 0;
          fields[field].focus       = false;
          // set elements
          self.setEditable(fields[field].element);
          self.setTabIndex(fields[field].element, (i - length) + 1);
          self.setLength(fields[field]);
          self.setPlaceholder(fields[field]);
        }
      }(form.children[i]));

      return fields;
    },

    getCurrentBlock: function(currentNode, e) {
      var self = this,
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

    setLength: function(field) {
      var self = this;

      field.length = field.element.innerHTML
        .replace(self.regex.markup, '')
        .replace(self.regex.spaceAndEnbsp, '_')
        .length;
      return self;
    },

    setPlaceholder: function(field) {
      var self = this;
      if (!field.length) {
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

    setEditable: function(element) {
      var self = this;

      element.style.minHeight = '1em'; //fix empty contenteditable input
      element.setAttribute('contenteditable', true);
      return self; 
    },

    setTabIndex: function(element, index) {
      var self = this;

      element.setAttribute('tabindex', index);
      return self; 
    },

    validate: function(field) {
      var self = this;

      if (field.require && !field.length)
        return false;
      if (field.maxLength && self.validateMaxLength(field))
        return false;
      return true;
    },

    validateMaxLength: function(field) {
      var self = this;

      if (field.length > field.maxLength) {
        field.element.classList.add('invalid');
        return true;
      }
      
      field.element.classList.remove('invalid')
      return false;
    },

    validateRequire: function(field) {
      var self = this;

      if (!field.length) {
        field.element.classList.add('require');
        return true;
      }

      field.element.classList.remove('require');
      return false;
    },
  }

  return Editor;
}));
