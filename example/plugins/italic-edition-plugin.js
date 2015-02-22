(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('italic-edition-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.ItalicEditionPlugin = plugin();
  else
    global.ItalicEditionPlugin = plugin();
}(window, function() {
  'use strict';

  function ItalicEditionPlugin() {
    var self = this;
    // set plugin elements/props
    self.button = document.createElement('button');
    self.button.innerText = 'italic';
    self.name = 'ItalicEditionPlugin';
    self.tag = 'i';
  }

  ItalicEditionPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      document.execCommand('italic', false, null);
    },

    destroy: function() {}
  };

  return ItalicEditionPlugin;
}));
    
