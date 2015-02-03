(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('sample-edition-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.SampleeditionPlugin = plugin();
  else
    global.SampleEditionPlugin = plugin();
}(window, function() {
  'use strict';

  function SampleEditionPlugin(field, editor) {
      var self = this;

      self.name = 'SampleEditionPlugin';
      self.field = field;
      self.editor = editor;
      self.button = document.createElement('button');

      self.button.innerText = 'button';
      self.button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(self.field);
      });
    }

    SampleEditionPlugin.prototype = {
      register: function() {
        return this.button;
      },

      destroy: function() {
        console.log(this);
        return this.button;
      }
    }

  return SampleEditionPlugin;
}));
    
