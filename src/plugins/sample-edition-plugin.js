(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('sample-edition-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.SamplEditionPlugin = plugin();
  else
    global.SampleEditionPlugin = plugin();
}(window, function() {
  'use strict';

  function SampleEditionPlugin(editor) {
    this.name = 'SampleEditionPlugin';
    this.editor = editor;
    this.button = document.createElement('button');
    this.button.innerText = 'edition-plugin';
  }

  SampleEditionPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      console.log('edition',field);
    },

    beforeShow: function(component, field) {
      return;
    },

    beforeDestroy: function(component) {
      return;
    }
  };

  return SampleEditionPlugin;
}));
    
