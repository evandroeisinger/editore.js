(function(global, plugin) {
  'use strict';

  if (typeof define === 'function' && define.amd)
    define('editore-italic-plugin', plugin);
  else if (typeof exports !== 'undefined')
    exports.EditoreItalicPlugin = plugin();
  else
    global.EditoreItalicPlugin = plugin();
}(window, function() {
  'use strict';

  function EditoreItalicPlugin() {
    var self = this;
    // set plugin elements/props
    self.button = document.createElement('button');
    self.button.innerText = 'italic';
    self.name = 'italicEditionPlugin';
    self.tag = 'i';
  }

  EditoreItalicPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      document.execCommand('italic', false, null);
    },

    destroy: function() {}
  };


  return EditoreItalicPlugin;
}));