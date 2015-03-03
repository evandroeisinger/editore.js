(function(global, plugin) {
  'use strict';

  if (typeof define === 'function' && define.amd)
    define('editore-image-plugin', plugin);
  else if (typeof exports !== 'undefined')
    exports.EditoreImagePlugin = plugin();
  else
    global.EditoreImagePlugin = plugin();
}(window, function() {
  'use strict';

  function EditoreImagePlugin() {
    var self = this;
    // set plugin elements/props
    self.button = document.createElement('button');
    self.button.innerText = 'Insert Image';
    self.name = 'imageInsertPlugin';

    // create input element for files selection
    self.fileInput = document.createElement('input');
    self.fileInput.type = 'file';

    self.uploadImage = function(e) {
      var file = self.fileInput.files[0] || false,
          validate = /.(jpg|jpeg|png|gif)/;

      // if no file was selected
      if (!file || !validate.test(file.name))
        return new Error('invalid file');

      self.getImagePreview(file, self.insertPreview);
    }

    // add to virtual file upload element a change listener
    self.fileInput.addEventListener('change', self.uploadImage);
  }

  EditoreImagePlugin.prototype = {
    uploadComplete: function(figure, autocomplete) {
      var image = figure.getElementsByTagName('img')[0];
      if (autocomplete)
        return figure.classList.remove('preview');
      // return complete method
      return function(url) {
        figure.classList.remove('preview');
        image.src = url;
      }
    },

    createFigure: function(file) {
      var figure = document.createElement('figure'), 
          image = new Image();
      
      image.setAttribute('contenteditable', false);
      image.draggable = false;
      image.src = file;
      figure.setAttribute('contenteditable', false);
      figure.classList.add('preview');
      figure.appendChild(image);

      return figure;
    },

    createEmptyBlock: function() {
      var block = document.createElement('p');
      block.innerHTML = '<br/>';

      return block;
    },

    getImagePreview: function(file, callback) {
      var self = this,
          reader = new FileReader();

      reader.onload = function() {
        callback.call(self, reader.result);
      }

      reader.readAsDataURL(file); 
    },

    insertPreview: function(file) {
      var self = this,
          figure = self.createFigure(file);

      // insert figure after the component element
      self.component.element.parentElement.insertBefore(figure, self.component.element.nextSibling);

      // if figure don't have siblings create a empty block after it
      if (!figure.nextSibling)
        self.component.element.parentElement.insertBefore(self.createEmptyBlock(), figure.nextSibling);

      // if a upload service was passed
      if (self.options.uploadService)
        self.options.uploadService(file, self.uploadComplete(figure));
      else
        self.uploadComplete(figure, true);
    },

    action: function(field, e) {
      e.stopPropagation();
      e.preventDefault();

      this.fileInput.click();
    },

    destroy: function() {}
  };

  return EditoreImagePlugin;
}));
    
