(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('sample-edition-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.SampleeditionPlugin = plugin();
  else
    global.SampleEditionPlugin = plugin();
}(window, function() {
  'use strict';

  function SampleEditionPlugin(plugin, field, editor) {
      var self = this;

      self.name = 'SampleEditionPlugin';
      self.plugin = plugin;
      self.field = field;
      self.editor = editor;
      self.button = document.createElement('button');

      self.button.innerText = 'edition-plugin';
      self.button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    SampleEditionPlugin.prototype = {
      register: function() {
        return this.button;
      },

      beforeShow: function() {
        return;
      },

      destroy: function() {
        return;
      }
    }

  return SampleEditionPlugin;
}));
    
