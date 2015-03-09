(function(global, plugin) {
  'use strict';

  if (typeof define === 'function' && define.amd)
    define('editore-bold-plugin', plugin);
  else if (typeof exports !== 'undefined')
    exports.EditoreBoldPlugin = plugin();
  else
    global.EditoreBoldPlugin = plugin();
}(window, function() {
  'use strict';

  function EditoreBoldPlugin() {
    var self = this;
    // set plugin elements/props
    self.button = document.createElement('button');
    self.button.innerText = 'bold';
    self.name = 'boldEditionPlugin';
    self.tag = 'b';
  }

  EditoreBoldPlugin.prototype = {
    action: function(field, e, done) {
      e.preventDefault();
      document.execCommand('bold', false, null);
      this.triggerInput();
    },

    destroy: function() {}
  };

  return EditoreBoldPlugin;
}));
    
