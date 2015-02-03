(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('sample-action-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.SampleActionPlugin = plugin();
  else
    global.SampleActionPlugin = plugin();
}(window, function() {
  'use strict';

  function SampleActionPlugin(plugin, field, editor) {
      var self = this;

      self.name = 'SampleActionPlugin';
      self.plugin = plugin;
      self.field = field;
      self.editor = editor;
      self.button = document.createElement('button');

      self.button.innerText = 'action-plugin';
      self.button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    SampleActionPlugin.prototype = {
      register: function() {
        return this.button;
      },

      beforeShow: function() {
        return;
      },

      destroy: function() {
        return;
      },
    }

  return SampleActionPlugin;
}));
    
