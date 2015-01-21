(function(global, editor) {
  if (typeof define === 'function' && define.amd)
    define('editor-js', [], editor);
  else if (typeof exports !== 'undefined')
    exports.Editor = editor();
  else
    global.Editor = editor();
}(window, function() {
  'use strict';

  function Editor(form) {
    var self   = this,
        fields = [];

    if (!form || !form.nodeName)
      return new Error('No form was passed!');

    return {
      fields: fields
    }
  }

  Editor.prototype = {}

  return Editor;
}));
