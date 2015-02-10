(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('bold-edition-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.BoldEditionPlugin = plugin();
  else
    global.BoldEditionPlugin = plugin();
}(window, function() {
  'use strict';

  function BoldEditionPlugin() {
    this.button = document.createElement('button');
    this.button.innerText = 'bold';
    this.name = 'BoldEditionPlugin';
    this.tag = 'b';
  }

  BoldEditionPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      document.execCommand('bold', false, null);
    }
  };

  return BoldEditionPlugin;
}));
    
