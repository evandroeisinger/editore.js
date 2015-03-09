(function(global, plugin) {
  'use strict';

  if (typeof define === 'function' && define.amd)
    define('editore-link-plugin', plugin);
  else if (typeof exports !== 'undefined')
    exports.EditoreLinkPlugin = plugin();
  else
    global.EditoreLinkPlugin = plugin();
}(window, function() {
  'use strict';

  function EditoreLinkPlugin() {
    var self = this;
    // set plugin elements/props
    self.button = document.createElement('button');
    self.button.innerText = 'Link';
    self.name = 'linkEditionPlugin';
    self.tag = 'a';

    // set handlers
    self.createHandler = function(e) {
      e.preventDefault();
      var url = self.input.value,
          isValid = /^https?:\/\/(\.?\w\/?)+(\/(.(?!\s))+\/?)*$/g.test(url);        

      if (isValid) {
        self.input.classList.remove('invalid');

        if (e.which === 13) {
          self.restoreSelection();
          document.execCommand('createLink', false, url);
          self.hideElements();
          self.triggerInput();
        }
      } else {
        self.input.classList.add('invalid');
      }
    };

    self.removeHandler = function(e) {
      e.preventDefault();
      self.restoreSelection();
      // apply link
      document.execCommand('unLink', false, null);
      self.hideElements();
      self.triggerInput();
    };

    // create link form
    self.input = document.createElement('input');
    self.removeButton = document.createElement('button');
    self.removeButton.className = 'linkEditionPlugin__removeButton';
    self.removeButton.innerText = 'Remove';
    self.input.className = 'linkEditionPlugin__input';

    // set listeners
    self.removeButton.addEventListener('click', self.removeHandler);
    self.input.addEventListener('keyup', self.createHandler);
  }

  EditoreLinkPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      var self = this;
      // save selection
      self.selection = self.component.selection.getRangeAt(0);
      // get url if its a link
      self.showElements(self.getUrl());
    },

    restoreSelection: function() {
      var self = this,
          _selection = window.getSelection();
      // set new selection
      _selection.removeAllRanges();
      _selection.addRange(self.selection);
    },

    getUrl: function() {
      var self = this,
          url = false,
          link;

      if (self.selection.startContainer.nodeType === 3)
        link = self.selection.startContainer.parentNode;
      else
        link = self.selection.startContainer;

      while (link.parentNode.tagName !== undefined) {
        if (link.tagName.toLowerCase() == self.tag.toLowerCase()) {
          url = link.getAttribute('href');
          break;
        }
        link = link.parentNode;
      }

      return url;
    },

    showElements: function(url) {
      var self = this;
      // hide plugins
      for (var plugin in self.component.plugins) {
        self.component.element.removeChild(self.component.plugins[plugin].button);
      }
      // show form
      self.component.element.appendChild(self.input);
      self.component.element.appendChild(self.removeButton);
      self.input.focus();
      self.input.classList.remove('invalid');
      self.input.value = "";
      // if already a link set its url
      if (url)
        self.input.value = url;
    },

    hideElements: function() {
      var self = this;
      // restore plugins
      self.component.element.removeChild(self.input);
      self.component.element.removeChild(self.removeButton);
      // show plugins
      for (var plugin in self.component.plugins) {
        self.component.element.appendChild(self.component.plugins[plugin].button);
      }
      // check plugins state
      self.component.checkPluginsState();
    },

    destroy: function() {
      var self = this;
      // remove listeners
      self.removeButton.removeEventListener('click', self.removeHandler);
      self.input.removeEventListener('keyup', self.createHandler);
    }
  };

  return EditoreLinkPlugin;
}));
    