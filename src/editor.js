(function(global, editor) {
  if (typeof define === 'function' && define.amd)
    define('editor-js', [], editor);
  else if (typeof exports !== 'undefined')
    exports.Editor = editor();
  else
    global.Editor = editor();
}(window, function() {
  'use strict';

  function Editor(fieldsWrapper) {
    var self = this;

    if (!fieldsWrapper || !fieldsWrapper.nodeName || !fieldsWrapper.children.length)
      return new Error('No fields wrapper was passed!');

    // editor setup
    self.default = {};
    self.default.blockElement = 'p';

    // editor events
    self.eventTypes = {};
    self.eventTypes.INPUT = [];

    // editor components
    self.components = {
      insert: {
        element: document.createElement('div'),
        plugins: [],
        status: false
      },
      edition: {
        element: document.createElement('div'),
        plugins: [],
        status: false
      }
    };

    // set action element      
    self.components.insert.element.setAttribute('contenteditable', 'false');
    self.components.insert.element.setAttribute('id', 'insertComponent');
    // set edition element      
    self.components.edition.element.setAttribute('contenteditable', 'false');
    self.components.edition.element.setAttribute('id', 'editionComponent');
    self.components.edition.element.style.position = 'absolute';
    self.components.edition.element.style.zIndex = 9999;

    // field types
    self.fieldTypes         = {};
    self.fieldTypes.RICH    = 'rich';
    self.fieldTypes.SIMPLE  = 'simple';

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

    // set editor wrapper and fields
    self.fieldsWrapper = fieldsWrapper;
    self.fields        = {};

    // return editor fields
    function fields() {
      var fields = {};

      for (var field in self.fields) (function(field) {
        fields[field.name] = {
          name        : field.name,
          element     : field.element,
          maxLength   : field.maxLength,
          type        : field.type,
          required     : field.required,
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
          name: field.name,
          length: field.length,
          value: self.getValue(field),
          valid: self.validate(field)
        }
      }(self.fields[field]))

      return values;
    }

    // register plugins
    function register(component, Plugin) {
      if (!self.components[component] || !Plugin)
        return new Error('invalid component type or plugin');

      var plugin = new Plugin(self);
      self.components[component].plugins[plugin.name] = plugin;
      self.components[component].element.appendChild(plugin.button);
    }

    // destroy editor listeners
    function destroy() {
      // unset fields
      for (var field in self.fields) (function(field) {
        field.element.removeAttribute('contenteditable');
        field.element.removeEventListener('paste', field.events.paste);
        field.element.removeEventListener('click', field.events.click);
        field.element.removeEventListener('mouseup', field.events.mouseup);
        field.element.removeEventListener('keydown', field.events.keydown);
        field.element.removeEventListener('keypress', field.events.keypress);
        field.element.removeEventListener('keyup', field.events.keyup);
      } (self.fields[field]));
      // unset components
      for (var component in self.components) (function(component) {
        for (var plugin in component.plugins) (function(plugin) {
          plugin.beforeDestroy(component);
          if (plugin._action)
            plugin.button.removeEventListener('click', plugin._action);
        } (component.plugins[plugin]));
        if (component.status)
          component.element.parentNode.removeChild(component.element);
      } (self.components[component]));
    }

    // register callbacks to editor events
    function subscribe(type, callback) {
      if (!self.eventTypes[type.toUpperCase()])
        return new Error('cant subscribe to a invalid event!');
      self.eventTypes[type.toUpperCase()].push(callback);
    }

    // editor constructor
    for (var i = form.children.length - 1; i >= 0; i--) (function(element) {
      var field          = self.getDataAttribute('field', element, 'str', false),
          placeholder    = self.getDataAttribute('placeholder', element, 'str', false),
          pasteEvents    = [],
          clickEvents    = [],
          mouseUpEvents  = [],
          keyupEvents    = [],
          keydownEvents  = [],
          keypressEvents = [],
          DOMNodeInsertedEvents = [];

      if (!(field) || !(placeholder))
        return new Error('data-field or data-placeholder are not defined!');

      // set field
      self.fields[field]             = {};
      self.fields[field].type        = self.getDataAttribute('type', element, 'str', self.fieldTypes.SIMPLE);
      self.fields[field].maxLength   = self.getDataAttribute('length', element, 'int', false);
      self.fields[field].required     = self.getDataAttribute('required', element, 'bol', false);
      self.fields[field].name        = field;
      self.fields[field].placeholder = placeholder;
      self.fields[field].element     = element;
      self.fields[field].value       = '';
      self.fields[field].valid       = false;
      self.fields[field].length      = 0;
      self.fields[field].focus       = false;
      self.fields[field].events      = {};
      // set field listeners
      switch(self.fields[field].type) {
        case self.fieldTypes.SIMPLE:
          pasteEvents.push(self.binds.paste, self.binds.input);
          clickEvents.push(self.binds.focus);
          keydownEvents.push(self.unsetPlaceholder);
          keypressEvents.push(self.binds.disableBlocks);
          keyupEvents.push(self.setLength, self.setPlaceholder, self.binds.focus, self.binds.input);
          break;
        case self.fieldTypes.RICH:
          pasteEvents.push(self.binds.paste, self.binds.input);
          clickEvents.push(self.binds.blocksCreation, self.binds.focus);
          mouseUpEvents.push(self.binds.selection);
          keydownEvents.push(self.unsetPlaceholder);
          keypressEvents.push();
          keyupEvents.push(self.setLength, self.binds.blocksCreation, self.binds.focus, self.setPlaceholder, self.binds.input);
          DOMNodeInsertedEvents.push(self.unsetSpan);
          break;
      }
      // set optional listeners
      if (self.fields[field].maxLength)
        keyupEvents.push(self.validateMaxLength);
      if (self.fields[field].required)
        keyupEvents.push(self.validateRequire);

      // set field element
      self.fields[field].element.style.position = 'relative';
      self.fields[field].element.style.minHeight = '1em'; //fix empty contenteditable input
      self.fields[field].element.setAttribute('contenteditable', true);
      self.fields[field].element.setAttribute('tabindex', (i - length) + 1);
      self.setLength(self.fields[field]);
      self.setPlaceholder(self.fields[field]);

      // set handlers    
      self.fields[field].events.paste = self.handler(pasteEvents, self.fields[field], self);
      self.fields[field].events.click = self.handler(clickEvents, self.fields[field], self);
      self.fields[field].events.mouseup = self.handler(mouseUpEvents, self.fields[field], self);
      self.fields[field].events.keydown = self.handler(keydownEvents, self.fields[field], self);
      self.fields[field].events.keypress = self.handler(keypressEvents, self.fields[field], self);
      self.fields[field].events.keyup = self.handler(keyupEvents, self.fields[field], self);
      self.fields[field].events.DOMNodeInserted = self.handler(DOMNodeInsertedEvents, self.fields[field], self)
      // atach handlers
      self.fields[field].element.addEventListener('paste', self.fields[field].events.paste);
      self.fields[field].element.addEventListener('click', self.fields[field].events.click);
      self.fields[field].element.addEventListener('mouseup', self.fields[field].events.mouseup);
      self.fields[field].element.addEventListener('keydown', self.fields[field].events.keydown);
      self.fields[field].element.addEventListener('keypress', self.fields[field].events.keypress);
      self.fields[field].element.addEventListener('keyup', self.fields[field].events.keyup);
      self.fields[field].element.addEventListener('DOMNodeInserted', self.fields[field].events.DOMNodeInserted);
    } (fieldsWrapper.children[i]));

    return {
      fields: fields,
      values: values,
      register: register,
      destroy: destroy,
      subscribe: subscribe
    }
  }

  Editor.prototype = {
    binds: {
      selection: function(field, e) {
        var self = this,
            selection = window.getSelection(),
            range,
            position,
            top,
            left;

        if (selection.type == 'Range' && !self.components.edition.status) {
          self.setComponent('edition', field);
          range = selection.getRangeAt(0);
          position = range.getBoundingClientRect();
          top = position.top + window.pageYOffset - self.components.edition.element.offsetHeight;
          left = ((position.left + position.right) / 2) - (self.components.edition.element.offsetWidth / 2);
          self.components.edition.element.style.top =  top + 'px';
          self.components.edition.element.style.left = left + 'px';
          self.components.edition.status = true;
          self.components.edition.selection = selection;
          return;
        }

        if(self.components.edition.status) {
          document.body.removeChild(self.components.edition.element);
          self.components.edition.status = false;
          self.components.edition.selection = false;
        }
      },

      focus: function(field, e) {
        var self = this,
            currentBlock;

        if ([91,40,38,37,39,13,1, 8].indexOf(e.which) < 0 || (!field.length & e.type !== 'click') || e.target == self.components.insert.element || e.target == self.components.edition.element)
          return;
        
        field.focus = true;
        field.element.classList.add('focus');

        if (field.type == self.fieldTypes.RICH) {
          currentBlock = self.getCurrentBlock(self.getCurrentNode());
          if (field.currentBlock !== currentBlock) {
            field.currentBlock = currentBlock;
            self.setComponent('insert', field);
          }
        }
        
        for (var _field in self.fields) (function (_field) {
          if (_field.name == field.name)
            return;
          // remove focus
          _field.focus = false;
          _field.element.classList.remove('focus');
        } (self.fields[_field]));
      },

      paste: function (field, e) {
        e.preventDefault();

        var self = this,
            html = [],
            blocks = e.clipboardData.getData('text/plain'),
            block, blockOpen, blockClose;

        switch(field.type) {
          case self.fieldTypes.SIMPLE:
            html = [e.clipboardData.getData('text/plain').replace(self.regex.spaces, ' ')];
            break;

          case self.fieldTypes.RICH:
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

      input: function(field, e) {
        var self = this;
        self.emmit('INPUT', field);
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
      },
    },

    getCurrentNode: function() {
      var node = document.getSelection().anchorNode;

      // if child is nodeText (type 3) return parent node else return node
      if (node && node.nodeType === 3)
        return node.parentNode
      else
        return node;
    },

    getCurrentBlock: function(currentNode) {
      var self = this,
          currentTagName = currentNode.tagName.toLowerCase();
      
      if (currentTagName == self.default.blockElement)
          return currentNode;
      return self.getCurrentBlock(currentNode.parentNode);
    },

    getValue: function(field) {
      var self = this;

      if (field.type = self.fieldTypes.SIMPLE)
        return field.element.innerText.replace(self.regex.lineBreaks, ' ').replace(self.regex.trim, '');
      if (field.type = self.fieldTypes.RICH)
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

    setComponent: function(component, field) {
      var self = this;
          
      for (var plugin in self.components[component].plugins) (function(plugin) {
        if (plugin._action)
          plugin.button.removeEventListener('click', plugin._action);
        plugin._action = self.handler([plugin.action], field, plugin);
        plugin.button.addEventListener('click', plugin._action);
        plugin.beforeShow(self.components[component], field);
      } (self.components[component].plugins[plugin]));

      switch(component) {
        case 'insert':
          // set insert component
          field.element.insertBefore(self.components.insert.element, field.currentBlock.nextSibling);
          self.components.insert.status = true;
          break;
        case 'edition':
          // set edition component
          document.body.appendChild(self.components.edition.element);
          self.components.edition.status = true;
          break;
      }

      return self;
    },

    setEditionBar: function(field) {
    },

    setPlaceholder: function(field) {
      var self = this;
      if (!field.length) {
        field.element.innerHTML = "";
        field.element.classList.add('placeholder');
      }
      return self;
    },

    // https://code.google.com/p/chromium/issues/detail?id=226941
    unsetSpan: function(field, event) {
      var self = this,
          span = event.target;

      if (span.nodeType == 3 || span.tagName.toLowerCase() !== "span" ) 
        return;

      span.parentNode.insertBefore(document.createTextNode(span.innerText), span);
      span.parentNode.removeChild(span);
      return self;
    },

    unsetPlaceholder: function(field, event) {
      var self = this;
      
      if (event.keyCode !== 9)
        field.element.classList.remove('placeholder');
    },

    validate: function(field) {
      var self = this;

      if (field.required && !field.length)
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
        field.element.classList.add('required');
        return true;
      }

      field.element.classList.remove('required');
      return false;
    },

    handler: function(methods, data, context) {
      return function(e) {
        for (var method in methods) (function (method) {
          method.call(context, data, e);
        }(methods[method]));
      }
    },

    emmit: function(event, data) {
      var self = this;

      if (!self.eventTypes[event])
        return new Error('cant emmit a invalid event!');
      for (var callback in self.eventTypes[event]) (function(callback) {
        callback.call(self, data);
      } (self.eventTypes[event][callback]));

      return self;
    },
  }

  return Editor;
}));
