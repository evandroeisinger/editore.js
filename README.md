# editore.js [![Build Status](https://travis-ci.org/evandroeisinger/editore.js.svg?branch=master)](https://travis-ci.org/evandroeisinger/editore.js) [![npm version](https://badge.fury.io/js/editore.svg)](https://www.npmjs.com/package/editore) [![Bower version](https://badge.fury.io/bo/editore.svg)](http://bower.io/search/?q=editore)

A magnific javascript editor! Create, validate and get data from fields easily without ever have to handle contenteditable yourself. :8ball:

#### install
Available on npm and bower:
`npm install editore`, `bower install editore` or [directly download](https://github.com/evandroeisinger/editore.js/raw/master/src/editore.js)

#### basic usage
Load editore.js into your application, create the editor wrapper element, set some fields and instantiate a new Editore.

```html
<!-- Create editor wrapper element and some fields: -->
<div id="editor">
  <h1 data-field="title" data-placeholder="Title" data-require="true" data-length="60">Example title</h1>
  <h3>Article</h3>
  <article data-field="articleBody" data-placeholder="Write here..." data-type="rich" data-require="true">
    <p>Lorem lorem lorem!</p>
  </article>
</div>
```

```javascript
// Instantiate a new Editore passing fields wrapper element:
var editore = new Editore(document.getElementById('editor'));

//Get values from fields:
var values = editore.values();

/* 
values = {
  title: {
    name: 'title',
    length: 13,
    value: 'Example title',
    valid: false
  },
  articleBody: {
    name: 'articleBody',
    length: 18,
    value: '<p>Lorem lorem lorem!</p>',
    valid: true
  }
}
*/
```
---
### constructor
```javascript
new Editor(element);
```
###### parameters
  - **element**: is the element from where the editor should get its child elements to transform in fields according with their data-attributes. *Child elements that don't have the required data-attributes will not be converted into editor fields.*

### field element
```html
  <h1 data-field="title" data-placeholder="Title" data-require="true" data-length="60">
    Lorem title!
  </h1>
```
###### data attributes
  - **data-field**: *String* **(required)**
  - **data-placeholder**: *String* **(required)**
  - **data-required**: *Boolean*
    - toggle class: required
  - **data-length**: *Number*
    - toggle class: invalid
  - **data-type**: *String*
    - **simple** *(default)*: It's a single-line field, without any text manipulation
    - **rich**: It's a multi-line field, with text manipulation support

### methods
- [editore.values()](https://github.com/evandroeisinger/editore.js/blob/master/README.md#editorevalues)
- [editore.fields()](https://github.com/evandroeisinger/editore.js/blob/master/README.md#editorefields)
- [editore.clearFields()](https://github.com/evandroeisinger/editore.js/blob/master/README.md#editoreclearfields)
- [editore.setFieldsValues( *fields* )](https://github.com/evandroeisinger/editore.js/blob/master/README.md#editoresetfieldsvalues-fields-)
- [editore.destroy()](https://github.com/evandroeisinger/editore.js/blob/master/README.md#editoredestroy)
- [editore.subscribeInput( *callback* )](https://github.com/evandroeisinger/editore.js/blob/master/README.md#editoresubscribeinput-callback-)
- [editore.registerEditionPlugin( *Plugin* )](https://github.com/evandroeisinger/editore.js/blob/master/README.md#editoreregistereditionplugin-plugin-)
- [editore.registerInsertionPlugin( *Plugin* )](https://github.com/evandroeisinger/editore.js/blob/master/README.md#editoreregisterinsertionplugin-plugin-)

###### editore.values()
  - return a object with all fields values.
```javascript
editore.values();
/*
return {
  fieldName: {
    name: String,
    length: Number,
    value: String,
    valid: Boolean
  }
}
*/
```

###### editore.fields()
  - return a object with all fields internal attributes.
```javascript
editore.clearFields();
/*
return {
  fieldName: {
    element: DOMElement,
    maxLength: Number,
    name: String,
    placeholder: String,
    required: Boolean,
    type: String
  }
}
*/
```

###### editore.clearFields()
  - clear all fields values.
```javascript
editore.clearFields();
```

###### editore.setFieldsValues( *fields* )
  - parameters
    - **fields**: *Object*
```javascript
editore.setFieldsValues({
  fieldName: 'Value',
  richFieldName: '<p>Value</p>'
});
```

###### editore.destroy()
  - unset editable and remove all fields listeners.
```javascript
editore.destroy();
```

###### editore.subscribeInput( *callback* )
  - parameters
    - **callback**: *Function(currentField)*
```javascript
editore.subscribeInput(function(currentField) {
  console.log('Current: ', currentField);
});
```

###### editore.registerEditionPlugin( *Plugin* )
  - register a new plugin on selection edition component.
  - parameters  
    - **Plugin**: *Plugin Constructor*
```javascript
editore.registerEditionPlugin(EditionPlugin);
```

###### editore.registerInsertionPlugin( *Plugin* )
  - register a new plugin on insertion component, which is located between the current block and the next block.
  - parameters  
    - **Plugin**: *Plugin Constructor*
```javascript
editore.registerInsertionPlugin(InsertionPlugin);
```

### Plugins avaliable
Pretty soon we'll have more :pray:

- [Bold Edition Plugin](https://github.com/evandroeisinger/editore-bold-plugin.js)
- [Italic Edition Plugin](https://github.com/evandroeisinger/editore-italic-plugin.js)
- [Link Edition Plugin](https://github.com/evandroeisinger/editore-link-plugin.js)

### Plugin constructor
  - insertion type: A component called on rich fields selection to edit the selection data.
  - edition type: A component called on rich fields between the current edit block and the next block, in order to insert new content into the field.

##### method
  - context instance objects
    - **this.name**: *String* **(required)**
      - editore uses this name to register and manage the plugin, also uses to define the class of the plugin button
    - **this.button**: *DOMElement* **(required)**
      - Editore get this button and insert into selection component
    - **this.tag**: *String* **(required if is a edition plugin)**
      - Editore uses this tag to check if the edition plugin is active with current selection element
  - injected objects
    - **this.component**: Editore adds in the plugin instance context it's component object, enabling access to it's element, plugins and checkPluginsState method.
        - element: *DOMElement*
        - plugins: *Array*
        - checkPluginsState: *Function*

```javascript
function EditionPlugin() {
  this.name = 'editionPlugin';
  this.button = document.createElement('button');
  this.button.innerText = 'Edition';
  // if is a edition component
  this.tag = 'i'
  // show component objects
  console.log(this.component)
}
```

##### prototype
  - **action**: *Function(currentSelectionField, clickEvent)* **(required)**
    - method called when plugin button is clicked
  - **destroy**: *Function()* **(required)**
    - method called before destroy Editore

```javascript
EditionPlugin.prototype = {
  action: function(currentSelectionField, clickEvent) {
    e.preventDefault();
    // do what you have to do
  },

  destroy: function() {
    // destroy the plugin
  }
};
```

---
## support
- chrome: ?
- firefox: ?
- safari: ?
- internet explore: ?

---
## contribute
Everyone can contribute! Finding bugs, creating issues, improving documentation, improving editor it self or creating components.
Every contribution will be welcomed! :santa: 

**Fork it** -> **Branch it** -> **Test it** -> **Push it** -> **Pull Request it** :gem:  

*Currently development is being maintained by [Núcleo Digital Grupo RBS](http://nucleodigital.gruporbs.com.br/).*

