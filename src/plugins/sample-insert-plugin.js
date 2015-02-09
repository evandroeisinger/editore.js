(function(global, plugin) {
  if (typeof define === 'function' && define.amd)
    define('sample-insert-plugin', ['editor-js'], plugin);
  else if (typeof exports !== 'undefined')
    exports.SampleInsertPlugin = plugin();
  else
    global.SampleInsertPlugin = plugin();
}(window, function() {
  'use strict';

  function SampleInsertPlugin(editor) {
    this.name = 'SampleInsertPlugin';
    this.editor = editor;
    this.button = document.createElement('button');
    this.button.innerText = 'insert-plugin';
  }

  SampleInsertPlugin.prototype = {
    action: function(field, e) {
      e.preventDefault();
      console.log('insert',field);
    },

    beforeShow: function(component, field) {
      return;
    },

    beforeDestroy: function(component) {
      return;
    }
  };

  return SampleInsertPlugin;
}));
    
