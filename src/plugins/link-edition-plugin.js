(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('link-edition-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.LinkEditionPlugin = plugin();
  else
    global.LinkEditionPlugin = plugin();
}(window, function() {
  'use strict';

  function LinkEditionPlugin() {
    // set handlers
    this.createHandler = createLink.bind(this);
    this.removeHandler = removeLink.bind(this);

    // create link form
    this.removeButton = document.createElement('button');
    this.removeButton.innerText = "Remove";
    this.input = document.createElement('input');

    // set listeners
    this.removeButton.addEventListener('click', this.removeHandler);
    this.input.addEventListener('keyup', this.createHandler);

    // set plugin elements/props
    this.button = document.createElement('button');
    this.button.innerText = 'Link';
    this.name = 'LinkEditionPlugin';
    this.tag = 'a';

    function createLink(e) {
      e.preventDefault();
      var url = this.input.value,
          isValid = /^https?:\/\/(\.?\w\/?)+(\/(.(?!\s))+\/?)*$/g.test(url);        

      if (isValid) {
        this.input.classList.remove('invalid');

        if (e.which === 13) {
          this.restoreSelection();
          document.execCommand('createLink', false, url);
          this.hideElements();
        }
      } else {
        this.input.classList.add('invalid');
      }
    }

    function removeLink(e) {
      e.preventDefault();
      this.restoreSelection();
      // apply link
      document.execCommand('unLink', false, null);
      this.hideElements();
    }
  }

  LinkEditionPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      // save selection
      this.selection = this.component.selection.getRangeAt(0);
      // get url if its a link
      this.showElements(this.getUrl());
    },

    restoreSelection: function() {
      var _selection = window.getSelection();
      _selection.removeAllRanges();
      _selection.addRange(this.selection);
    },

    getUrl: function() {
      var url = false,
          link;

      if (this.selection.startContainer.nodeType === 3)
        link = this.selection.startContainer.parentNode;
      else
        link = this.selection.startContainer;

      while (link.parentNode.tagName !== undefined) {
        if (link.tagName.toLowerCase() == this.tag.toLowerCase()) {
          url = link.getAttribute('href');
          break;
        }
        link = link.parentNode;
      }

      return url;
    },

    showElements: function(url) {
      // hide plugins
      for (var plugin in this.component.plugins) {
        this.component.element.removeChild(this.component.plugins[plugin].button);
      }
      // show form
      this.component.element.appendChild(this.input);
      this.component.element.appendChild(this.removeButton);
      this.input.focus();
      this.input.classList.remove('invalid');
      this.input.value = "";
      // if already a link set its url
      if (url)
        this.input.value = url;
    },

    hideElements: function() {
      // restore plugins
      this.component.element.removeChild(this.input);
      this.component.element.removeChild(this.removeButton);
      // show plugins
      for (var plugin in this.component.plugins) {
        this.component.element.appendChild(this.component.plugins[plugin].button);
      }
      // check plugins state
      this.component.checkPluginsState();
    },

    destroy: function() {
      this.removeButton.removeEventListener('click', this.removeHandler);
      this.input.removeEventListener('keyup', this.createHandler);
      this.component.removeChild(this.input);
      this.component.removeChild(this.removeButton);
    }
  };

  return LinkEditionPlugin;
}));
    
