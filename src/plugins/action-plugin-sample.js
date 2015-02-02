(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('sample-action-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.SampleActionPlugin = plugin();
  else
    global.SampleActionPlugin = plugin();
}(window, function() {
  'use strict';

  function SampleActionPlugin(field, editor) {
      var self = this;

      self.name = 'ActionPlugin';
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

    SampleActionPlugin.prototype = {
      register: function() {
        return this.button;
      },

      destroy: function() {
        console.log(this);
        return this.button;
      }
    }

  return SampleActionPlugin;
}));
    
