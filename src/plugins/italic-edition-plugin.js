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
    this.button = document.createElement('button');
    this.button.innerText = 'italic';
    this.name = 'ItalicEditionPlugin';
    this.tag = 'i';
  }

  ItalicEditionPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      document.execCommand('italic', false, null);
    }
  };

  return ItalicEditionPlugin;
}));
    
