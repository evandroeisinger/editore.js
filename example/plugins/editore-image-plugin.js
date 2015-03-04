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
    self.name = 'imageInsertionPlugin';

    // create input element for files selection
    self.fileInput = document.createElement('input');
    self.fileInput.type = 'file';

    self.uploadImage = function(e) {
      var file = self.fileInput.files[0] || false,
          validate = /.(jpg|jpeg|png|gif)/;

      // if no file was selected
      if (!file || !validate.test(file.name.toLowerCase()))
        return new Error('invalid file');

      self.createPreview(file, self.insertPreview);
    }

    // add to virtual file upload element a change listener
    self.fileInput.addEventListener('change', self.uploadImage);
  }

  EditoreImagePlugin.prototype = {
    done: function(image, figure) {
      var self = this,
          preload = new Image();
      
      return function(url) {
        if (!url)
          return new Error('no upload image url was passed');
        
        // preload image
        preload.src = url;
        // when loaded swap
        preload.onload = self.uploadComplete(image, figure, self.options.uploadComplete)(url);
      }
    },

    uploadComplete: function(image, figure, callback) {
      return function(url) {
        figure.classList.remove('preview');
        
        if (url)
          image.src = url;
        if (callback)
          callback(image, figure);
      }
    },

    createFigure: function(preview) {
      var figure = document.createElement('figure'), 
          image = new Image();
      
      image.setAttribute('contenteditable', false);
      image.draggable = false;
      image.src = preview;
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

    createPreview: function(file, callback) {
      var self = this,
          reader = new FileReader();

      reader.onload = function() {
        callback.call(self, file, reader.result);
      }

      reader.readAsDataURL(file); 
    },

    insertPreview: function(file, preview) {
      var self = this,
          figure = self.createFigure(preview),
          image = figure.getElementsByTagName('img')[0];

      // insert figure after the component element
      self.component.element.parentElement.insertBefore(figure, self.component.element.nextSibling);

      // if figure don't have siblings create a empty block after it
      if (!figure.nextSibling)
        self.component.element.parentElement.insertBefore(self.createEmptyBlock(), figure.nextSibling);

      // upload if a service was passed
      if (self.options.uploadService)
        return self.options.uploadService(file, self.done(image, figure));

      self.uploadComplete(image, figure)();
    },

    action: function(field, e) {
      e.stopPropagation();
      e.preventDefault();

      this.fileInput.click();
    }
  };

  return EditoreImagePlugin;
}));
    
