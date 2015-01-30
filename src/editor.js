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

    if (!form || !form.nodeName || !form.children.length)
      return new Error('No form was passed!');

    // editor setup
    self.default = {};
    self.default.blockElement = 'p';

    // field types
    self.types        = {};
    self.types.RICH   = 'rich';
    self.types.SIMPLE = 'simple';

    // regex patterns
    self.regex              = {};
    self.regex.markup       = /(<\/*[\w\s01-9='":;,\-]*\/*>)+/g;
    self.regex.enbsp        = /&nbsp;*/g;
    self.regex.space        = /\s/g;
    self.regex.spaces       = /\s+/g;
    self.regex.trim         = /\s+$/g;
    self.regex.lineBreak      = /[\r\n]/g; 
    self.regex.lineBreaks     = /(\r\n|\n|\r)[.]?/g; 
    self.regex.spaceAndEnbsp  = /\s|&nbsp;/g;

    // set editor form, fields and plugins
    self.form             = form;
    self.fields           = {};

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

    // register plugins
    function register(type, plugin) {
      switch(type) {
        case 'action':
          for (var field in self.fields) (function(field) {
            if (field.type == self.types.RICH) {
              field.actionBar.plugins[plugin.name] = plugin;
              // call register plugin method
              field.actionBar.element.appendChild(field.actionBar.plugins[plugin.name].register(field, self));
            }
          }(self.fields[field]));
          break;
        case 'edition':
          break;
      }
    }

    // destroy this editor
    function destroy() {
      console.log('Remove all eventListeners!');
      console.log('Remove all plugins/eventListeners!');
    }

    // editor constructor
    for (var i = form.children.length - 1; i >= 0; i--) (function(element) {
      var field          = self.getDataAttribute('field', element, 'str', false),
          placeholder    = self.getDataAttribute('placeholder', element, 'str', false),
          pasteEvents    = [],
          clickEvents    = [],
          keyupEvents    = [],
          keydownEvents  = [],
          keypressEvents = [];

      if (!(field) || !(placeholder))
        return;

      // set field
      self.fields[field]             = {};
      self.fields[field].type        = self.getDataAttribute('type', element, 'str', self.types.SIMPLE);
      self.fields[field].maxLength   = self.getDataAttribute('length', element, 'int', false);
      self.fields[field].require     = self.getDataAttribute('require', element, 'bol', false);
      self.fields[field].name        = field;
      self.fields[field].placeholder = placeholder;
      self.fields[field].element     = element;
      self.fields[field].value       = '';
      self.fields[field].valid       = false;
      self.fields[field].length      = 0;
      self.fields[field].focus       = false;
      self.fields[field].actionBar = {};
      self.fields[field].actionBar.plugins = {};
      self.fields[field].actionBar.element = document.createElement('div');
      // set actionBar element      
      self.fields[field].actionBar.element.setAttribute('contenteditable', 'false');
      self.fields[field].actionBar.element.setAttribute('id', 'actionBar');

      // set handlers
      self.fields[field].element.addEventListener('paste', handler(pasteEvents, self.fields[field], self));
      self.fields[field].element.addEventListener('click', handler(clickEvents, self.fields[field], self));
      self.fields[field].element.addEventListener('keydown', handler(keydownEvents, self.fields[field], self));
      self.fields[field].element.addEventListener('keypress', handler(keypressEvents, self.fields[field], self));
      self.fields[field].element.addEventListener('keyup', handler(keyupEvents, self.fields[field], self));

      // set elements
      self.setEditable(self.fields[field].element);
      self.setTabIndex(self.fields[field].element, (i - length) + 1);
      self.setLength(self.fields[field]);
      self.setPlaceholder(self.fields[field]);

      // set listeners
      switch(self.fields[field].type) {
        case self.types.SIMPLE:
          pasteEvents.push(self.binds.paste);
          clickEvents.push(self.binds.focus);
          keydownEvents.push(self.removePlaceHolder);
          keypressEvents.push(self.binds.disableBlocks);
          keyupEvents.push(self.setLength, self.setPlaceholder, self.binds.focus);
          break;
        case self.types.RICH:
          pasteEvents.push(self.binds.paste);
          clickEvents.push(self.binds.blocksCreation, self.binds.focus);
          keydownEvents.push(self.removePlaceHolder);
          keypressEvents.push();
          keyupEvents.push(self.setLength, self.binds.blocksCreation, self.binds.focus, self.setPlaceholder);
          break;
      }

      // set optional listeners
      if (self.fields[field].maxLength)
        keyupEvents.push(self.validateMaxLength);
      if (self.fields[field].require)
        keyupEvents.push(self.validateRequire);
    } (form.children[i]));

    return {
      fields: fields,
      values: values,
      register: register,
      destroy: destroy
    }
  }

  Editor.prototype = {
    binds: {
      focus: function (field, e) {
        var self = this;
        // only this keys bind focus
        if ([13,40,38,39,37,8,46,9,1].indexOf(e.which) < 0 || (!field.length && e.type !== 'click') || e.target == field.actionBar.element)
          return;

        for (var _field in self.fields) (function (_field) {
          if (field.name == _field.name) {
            field.focus = true;
            field.element.classList.add('focus');
            return;
          } else {
            _field.focus = false;
            _field.element.classList.remove('focus');
          }
        } (self.fields[_field]));

        if (field.type == self.types.RICH) {
          // set current block focus
          field.currentBlock = self.getCurrentBlock(self.getCurrentNode());
          field.currentBlock.classList.add('focus');
          // set actionbar after the currentblock
          self.setActionBar(field, field.currentBlock);
          // remove focus
          for (var i = 0; i < field.element.children.length; i++) (function(block) {
            if (block !== field.currentBlock)
              block.classList.remove('focus');
          }(field.element.children[i]));
        }
      },

      paste: function (field, e) {
        e.preventDefault();

        var self = this,
            html = [],
            blocks = e.clipboardData.getData('text/plain'),
            block, blockOpen, blockClose;

        switch(field.type) {
          case self.types.SIMPLE:
            html = [e.clipboardData.getData('text/plain').replace(self.regex.spaces, ' ')];
            break;

          case self.types.RICH:
            blocks = e.clipboardData.getData('text/plain').split(self.regex.lineBreak);
            blockOpen = ('<' + self.default.blockElement + '>');
            blockClose = ('</' + self.default.blockElement + '>');

            for (var block in blocks) (function(block) {
                html.push(blockOpen, block, blockClose);
            } (blocks[block])); 
            break;

          default:
            html = [e.clipboardData.getData('text/plain').replace(self.regex.spaces, ' ')];
            break;
        }

        document.execCommand('insertHTML', false, html.join(''));
      },

      disableBlocks: function(field, e) {
        if (e.which === 13)
          return e.preventDefault();
      },

      blocksCreation: function(field, e) {
        var self = this,
            node = self.getCurrentNode();

        if ((node && node.children.length === 0 && e.which !== 8) || (!field.length && e.which === 1))
          document.execCommand('formatBlock', false, self.default.blockElement);
      }
    },

    getCurrentNode: function() {
      var node = document.getSelection().anchorNode;

      // if child is nodeText (type 3) return parent node else return node
      if (node && node.nodeType === 3)
        return node.parentNode
      else
        return node;
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
        return field.element.innerText.replace(self.regex.lineBreaks, ' ').replace(self.regex.trim, '');
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

    setActionBar: function(field, block) {
      var self = this;

      field.element.insertBefore(field.actionBar.element, block.nextSibling);
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
