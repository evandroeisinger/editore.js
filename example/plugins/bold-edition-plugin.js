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
    var self = this;
    // set plugin elements/props
    self.button = document.createElement('button');
    self.button.innerText = 'bold';
    self.name = 'BoldEditionPlugin';
    self.tag = 'b';
  }

  BoldEditionPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      document.execCommand('bold', false, null);
    },

    destroy: function() {}
  };

  return BoldEditionPlugin;
}));
    
