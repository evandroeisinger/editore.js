(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('ActionPlugin', [], plugin);
  else if (typeof exports !== 'undefined')
    exports.ActionPluginSample = plugin();
  else
    global.ActionPluginSample = plugin();
}(window, function() {
  'use strict';

  function ActionPluginSample(field, editor) {
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

    ActionPluginSample.prototype = {
      register: function() {
        return this.button;
      },

      destroy: function() {
        console.log(this);
        return this.button;
      }
    }

  return ActionPluginSample;
}));
    