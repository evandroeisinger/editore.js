(function (global, editore) {
  'use strict';

  if (typeof define === 'function' && define.amd)
    define('editore-js', [], editore);
  else if (typeof exports !== 'undefined')
    exports.Editore = editore();
  else
    global.Editore = editore();
}(window, function() {
  'use strict';

  function Editore(fieldsWrapper) {
    var self = this;

    if (!fieldsWrapper || !fieldsWrapper.nodeName || !fieldsWrapper.children.length)
      return new Error('No fields wrapper was passed!');

    // editor setup
    self.default = {};
    self.default.blockElement = 'p';

    // editor events
    self.eventTypes = {
      'INPUT': []
    };

    // editor components
    self.components = {
      insertion: {
        element: document.createElement('div'),
        plugins: [],
        status: false
      },
      edition: {
        element: document.createElement('div'),
        plugins: [],
        status: false,
        checkPluginsState: self.setEditionComponentPluginsState.bind(self)
      }
    };

    // set action element
    self.components.insertion.element.setAttribute('contenteditable', 'false');
    self.components.insertion.element.setAttribute('id', 'insertion-component');
    // set edition element
    self.components.edition.element.setAttribute('contenteditable', 'false');
    self.components.edition.element.setAttribute('id', 'edition-component');
    self.components.edition.element.style.position = 'absolute';
    self.components.edition.element.style.zIndex = 9999;
    // field types
    self.fieldTypes         = {};
    self.fieldTypes.RICH    = 'rich';
    self.fieldTypes.SIMPLE  = 'simple';
    // regex patterns
    self.regex              = {};
    self.regex.markup       = /(<\/*[\w\s01-9='":;,\-]*\/*>)+/g;
    self.regex.markupSpaces = /(\s+)?(<\/*[\w\s01-9='":;,\-]*\/*>)+?(\s+)?/g;
    self.regex.enbsp        = /&nbsp;*/g;
    self.regex.space        = /\s/g;
    self.regex.spaces       = /\s+/g;
    self.regex.trim         = /\s+$/g;
    self.regex.lineBreak      = /[\r\n]/g;
    self.regex.lineBreaks     = /(\r\n|\n|\r)[.]?/g;
    self.regex.spaceAndEnbsp  = /\s|&nbsp;/g;
    self.regex.insertionComponenet = /<div contenteditable="false" id="insertion-component">.*<\/div>/;

    // set editor wrapper and fields
    self.fieldsWrapper = fieldsWrapper;
    self.fields        = {};

    // return editor fields
    function _fields() {
      var data = {},
          field;

      for (field in self.fields) {
        field = self.fields[field];
        data[field.name] = {
          name        : field.name,
          element     : field.element,
          maxLength   : field.maxLength,
          type        : field.type,
          required     : field.required,
          placeholder : field.placeholder
        };
      }

      return data;
    }

    // return field values
    function _values() {
      var data = {},
          field;

      for (field in self.fields) {
        field = self.fields[field];
        data[field.name] = {
          name: field.name,
          length: field.length,
          value: self.getValue(field),
          valid: self.validate(field)
        };
      }

      return data;
    }

    // register edition plugins
    function _registerEditionPlugin(Plugin, options) {
      if (!Plugin)
        return new Error('invalid plugin');

      Plugin.prototype.component = self.components.edition;
      Plugin.prototype.options = options || {};
      Plugin.prototype.triggerInput = null;

      // instance a new plugin
      var plugin = new Plugin();
      // set plugin name into button class
      plugin.button.classList.add(plugin.name);
      // add plugin into his component
      self.components.edition.plugins[plugin.name] = plugin;
      self.components.edition.element.appendChild(plugin.button);
    }

    // register edition plugins
    function _registerInsertionPlugin(Plugin, options) {
      if (!Plugin)
        return new Error('invalid plugin');

      Plugin.prototype.component = self.components.insertion;
      Plugin.prototype.options = options || {};
      Plugin.prototype.triggerInput = null;

      // instance a new plugin
      var plugin = new Plugin();
      // set plugin name into button class
      plugin.button.classList.add(plugin.name);
      // add plugin into his component
      self.components.insertion.plugins[plugin.name] = plugin;
      self.components.insertion.element.appendChild(plugin.button);
    }

    // set fields values
    function _setFieldsValues(fields) {
      var field,
          value;

      for (field in fields) {
        if (!self.fields[field])
          return;

        value = fields[field];
        field = self.fields[field];
        field.element.innerHTML = value;
        field.length = value.length;

        if (field.length)
          field.element.classList.remove('placeholder');
        else
          field.element.classList.add('placeholder');
      }
    }

    // clear editor fields values
    function _clearFields() {
      var field;

      for (field in self.fields) {
        field = self.fields[field];
        field.element.innerHTML = "";
        field.length = 0;
        // set placeholder
        field.element.classList.add('placeholder');
      }
    }

    // destroy editor
    function _destroy() {
      var component,
          plugin,
          field;

      // unset fields listeners
      for (field in self.fields) {
        field = self.fields[field];
        field.element.removeAttribute('contenteditable');
        field.element.removeEventListener('paste', field.events.paste);
        field.element.removeEventListener('click', field.events.click);
        field.element.removeEventListener('mouseup', field.events.mouseup);
        field.element.removeEventListener('keydown', field.events.keydown);
        field.element.removeEventListener('keypress', field.events.keypress);
        field.element.removeEventListener('keyup', field.events.keyup);
      }
      // unset components
      for (component in self.components) {
        component = self.components[component];
        for (plugin in component.plugins) {
          plugin = component.plugins[plugin];
          // execute plugin destroy method if exists
          if (plugin.destroy)
            plugin.destroy();
          // unset components listeners
          if (plugin._action)
            plugin.button.removeEventListener('click', plugin._action);
        }

        if (component.status)
          component.element.parentNode.removeChild(component.element);
      }
    }

    // register callbacks to editor input event
    function _subscribeInput(callback) {
      self.eventTypes.INPUT.push(callback);
    }

    // trigger a generic input
    function _triggerInput(data) {
      self.triggerEvent('INPUT', data);
    }


    // remove active components
    function _hideComponents() {
      if (self.components.insertion.status) {
        self.components.insertion.status = false;
        self.components.insertion.element.parentElement.removeChild(self.components.insertion.element);
      }
      if (self.components.edition.status) {
        self.components.edition.status = false;
        self.components.edition.selection = null;
        self.components.edition.element.parentElement.removeChild(self.components.edition.element);
      }
    }

    // editor constructor
    for (var i = fieldsWrapper.children.length - 1; i >= 0; i--) {
      var element         = fieldsWrapper.children[i],
          field           = self.getDataAttribute('field', element, 'str', false),
          placeholder     = self.getDataAttribute('placeholder', element, 'str', false),
          pasteEvents     = [],
          clickEvents     = [],
          mouseDownEvents = [],
          mouseUpEvents   = [],
          keyupEvents     = [],
          keydownEvents   = [],
          keypressEvents  = [],
          DOMNodeInsertedEvents = [];

      if (field &&  placeholder) {
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
            keydownEvents.push(self.binds.removePlaceholder);
            keypressEvents.push(self.binds.disableBlocks);
            keyupEvents.push(self.binds.length, self.binds.placeholder, self.binds.focus, self.binds.input);
            break;
          case self.fieldTypes.RICH:
            pasteEvents.push(self.binds.paste, self.binds.input);
            clickEvents.push(self.binds.blocksCreation, self.binds.focus);
            mouseDownEvents.push(self.binds.clearSelection);
            mouseUpEvents.push(self.binds.selection);
            keydownEvents.push(self.binds.removePlaceholder);
            keyupEvents.push(self.binds.length, self.binds.blocksCreation, self.binds.focus, self.binds.placeholder, self.binds.input);
            DOMNodeInsertedEvents.push(self.binds.removeSpan);
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
        // create event handlers
        self.fields[field].events.paste = self.setListener(pasteEvents, self.fields[field], self);
        self.fields[field].events.click = self.setListener(clickEvents, self.fields[field], self);
        self.fields[field].events.mousedown = self.setListener(mouseDownEvents, self.fields[field], self);
        self.fields[field].events.mouseup = self.setListener(mouseUpEvents, self.fields[field], self);
        self.fields[field].events.keydown = self.setListener(keydownEvents, self.fields[field], self);
        self.fields[field].events.keypress = self.setListener(keypressEvents, self.fields[field], self);
        self.fields[field].events.keyup = self.setListener(keyupEvents, self.fields[field], self);
        self.fields[field].events.DOMNodeInserted = self.setListener(DOMNodeInsertedEvents, self.fields[field], self);
        // atach event handlers
        self.fields[field].element.addEventListener('paste', self.fields[field].events.paste);
        self.fields[field].element.addEventListener('click', self.fields[field].events.click);
        self.fields[field].element.addEventListener('mousedown', self.fields[field].events.mousedown);
        self.fields[field].element.addEventListener('mouseup', self.fields[field].events.mouseup);
        self.fields[field].element.addEventListener('keydown', self.fields[field].events.keydown);
        self.fields[field].element.addEventListener('keypress', self.fields[field].events.keypress);
        self.fields[field].element.addEventListener('keyup', self.fields[field].events.keyup);
        self.fields[field].element.addEventListener('DOMNodeInserted', self.fields[field].events.DOMNodeInserted);
        // apply length and placeholder
        self.binds.length.call(self, self.fields[field]);
        self.binds.placeholder.call(self, self.fields[field]);
      }
    }

    return {
      fields: _fields,
      setFieldsValues: _setFieldsValues,
      clearFields: _clearFields,
      values: _values,
      destroy: _destroy,
      triggerInput: _triggerInput,
      subscribeInput: _subscribeInput,
      hideComponents: _hideComponents,
      registerInsertionPlugin: _registerInsertionPlugin,
      registerEditionPlugin: _registerEditionPlugin
    };
  }

  Editore.prototype = {
    binds: {
      clearSelection: function() {
        if (document.selection)
          return document.selection.empty();
        if (!window.getSelection)
          return;
        // chrome
        if (window.getSelection().empty)
          return window.getSelection().empty();
        // firefox
        if (window.getSelection().removeAllRanges)
          return window.getSelection().removeAllRanges();
      },

      selection: function(field, e) {
        var self = this,
            selection = window.getSelection(),
            selectionSupport = ['p', 'b', 'a', 'i'],
            selectionTag = e.target.tagName.toLowerCase(),
            range,
            position,
            top,
            left;

        if (selectionSupport.indexOf(selectionTag) < 0)
          return;

        if (selection.type == 'Range') {
          self.setComponent('edition', field);
          range = selection.getRangeAt(0);
          position = range.getBoundingClientRect();
          top = position.top + window.pageYOffset - self.components.edition.element.offsetHeight;
          left = ((position.left + position.right) / 2) - (self.components.edition.element.offsetWidth / 2);
          // set component position and props
          self.components.edition.element.style.top =  top + 'px';
          self.components.edition.element.style.left = left + 'px';
          self.components.edition.selection = selection;
          // set edition plugins state
          self.setEditionComponentPluginsState();
          return;
        }

        if (self.components.edition.selection) {
          document.body.removeChild(self.components.edition.element);
          self.components.edition.selection = null;
        }
      },

      focus: function(field, e) {
        var self = this,
            _field,
            currentBlock;

        if ([91,40,38,37,39,13,1, 8].indexOf(e.which) < 0 || (!field.length & e.type !== 'click') || e.target == self.components.insertion.element || e.target == self.components.edition.element)
          return;

        if (field.type == self.fieldTypes.RICH) {
          currentBlock = self.getCurrentBlock(self.getCurrentNode());
          if (field.currentBlock !== currentBlock || !self.components.insertion.status) {
            field.currentBlock = currentBlock;
            self.setComponent('insertion', field);
          }
        }

        for (_field in self.fields) {
          _field = self.fields[_field];

          if (_field == field) {
            _field.focus = true;
            _field.element.classList.add('focus');
          } else {
            _field.focus = false;
            _field.element.classList.remove('focus');
          }
        }
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

            for (block in blocks) {
              block = blocks[block];
              html.push(blockOpen, block, blockClose);
            }
            break;

          default:
            html = [e.clipboardData.getData('text/plain').replace(self.regex.spaces, ' ')];
            break;
        }

        document.execCommand('insertHTML', false, html.join(''));
      },

      input: function(field, e) {
        var self = this;
        self.triggerEvent('INPUT', field);
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

      placeholder: function(field) {
        if (!field.length) {
          field.element.innerHTML = "";
          field.element.classList.add('placeholder');
        }
      },

      length: function(field) {
        var self = this;

        field.length = field.element.innerHTML
          .replace(self.regex.markup, '')
          .replace(self.regex.spaceAndEnbsp, '_')
          .length;
      },

      removePlaceholder: function(field, e) {
        if (e.keyCode !== 9)
          field.element.classList.remove('placeholder');
      },

      removeSpan: function(field, e) {
        var span = e.target;

        if (span.nodeType == 3 || span.tagName.toLowerCase() !== "span" )
          return;
        // https://code.google.com/p/chromium/issues/detail?id=226941
        span.parentNode.insertBefore(document.createTextNode(span.innerText), span);
        span.parentNode.removeChild(span);
      },
    },

    getCurrentNode: function() {
      var node = document.getSelection().anchorNode;

      // if child is nodeText (type 3) return parent node else return node
      if (node && node.nodeType === 3)
        return node.parentNode;
      else
        return node;
    },

    isBlockElement: function(nodeToTest){
      var fields = this.fields;
      return Object.keys(fields).some(function(field){
        return nodeToTest === fields[field].element
      });
    },

    getCurrentBlock: function(currentNode) {
      if (this.isBlockElement(currentNode.parentNode)){
          return currentNode;
      }
      return this.getCurrentBlock(currentNode.parentNode);
    },

    getValue: function(field) {
      var self = this,
          _field;

      if (field.type == self.fieldTypes.SIMPLE)
        return field.element.innerText
          .replace(self.regex.lineBreaks, ' ')
          .replace(self.regex.spaceAndEnbsp, ' ')
          .replace(self.regex.trim, '');
      // return all inner content
      return field.element.innerHTML
        .replace(self.regex.insertionComponenet, '')
        .replace(self.regex.lineBreaks, '')
        .replace(self.regex.spaceAndEnbsp, ' ')
        .replace(self.regex.trim, '')
        .replace(self.regex.markupSpaces, '$2');
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

    setComponent: function(component, field) {
      var self = this,
          triggerInput,
          plugin;

      for (plugin in self.components[component].plugins) {
        plugin = self.components[component].plugins[plugin];
        // unset old action
        if (plugin._action)
          plugin.button.removeEventListener('click', plugin._action);
        // set new action
        if (component == 'edition')
          plugin._action = self.setListener([plugin.action, self.setEditionComponentPluginsState], field, plugin);
        else
          plugin._action = self.setListener([plugin.action], field, plugin);
        // set plugin input method
        plugin.triggerInput = self.triggerInput(field);
        // set action handler
        plugin.button.addEventListener('click', plugin._action);
      }

      switch(component) {
        case 'insertion':
          // set insert component
          field.element.insertBefore(self.components.insertion.element, field.currentBlock.nextSibling);
          self.components.insertion.status = true;
          break;
        case 'edition':
          self.components.edition.element.innerHTML = "";
          for (plugin in self.components.edition.plugins) {
            plugin = self.components.edition.plugins[plugin];
            self.components.edition.element.appendChild(plugin.button);
          }
          // set edition component
          document.body.appendChild(self.components.edition.element);
          self.components.edition.status = true;
          break;
      }

      return self;
    },

    setEditionComponentPluginsState: function() {
      var self = this,
          edition = self.component || self.components.edition,
          currentSelectionNode,
          plugin,
          range;

      // set plugins state
      for (plugin in edition.plugins) {
        plugin = edition.plugins[plugin];
        range = edition.selection.getRangeAt(0);

        if (range.startContainer.nodeType === 3)
          currentSelectionNode = range.startContainer.parentNode;
        else
          currentSelectionNode = range.startContainer;

        plugin.button.classList.remove('active');

        while (currentSelectionNode.parentNode.tagName !== undefined) {
          if (currentSelectionNode.tagName.toLowerCase() == plugin.tag.toLowerCase()) {
            plugin.button.classList.add('active');
            break;
          }
          // keep find
          currentSelectionNode = currentSelectionNode.parentNode;
        }
      }

      return self;
    },

    setListener: function(methods, data, context) {
      var method;

      return function(e) {
        for (method in methods) {
          method = methods[method];
          method.call(context, data, e);
        }
      };
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

      field.element.classList.remove('invalid');
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

    triggerInput: function(field) {
      var self = this;

      return function() {
        self.triggerEvent('INPUT', field);
      };
    },

    triggerEvent: function(type, data) {
      var self = this,
          callback;

      if (!self.eventTypes[type])
        return new Error('cant trigger a invalid event!');

      for (callback in self.eventTypes[type]) {
        callback = self.eventTypes[type][callback];
        callback.call(self, data);
      }
    }
  };

  return Editore;
}));
