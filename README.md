# editore.js [![Build Status](https://travis-ci.org/evandroeisinger/editore.js.svg?branch=master)](https://travis-ci.org/evandroeisinger/editore.js) [![npm version](https://badge.fury.io/js/editore.svg)](http://badge.fury.io/js/editore) [![Bower version](https://badge.fury.io/bo/editore.svg)](http://badge.fury.io/bo/editore)

> A magnific javascript editor! It's easy to create and valitade fields and get data from them, even better is that you don't need to handle contenteditable yourself :8ball: 

#### install
Available on npm and bower:
`npm install editore`, `bower install editore` or [directly download](https://github.com/evandroeisinger/editore.js/raw/master/src/editore.js)

#### basic usage
It's easy to use! Load editor.js into your application, create the editor wrapper element, set some fields and instantiate a new Editore to use it.

```html
<!-- Create editor wrapper element and some fields: -->
<form id="editor">
  <h1 data-field="title" data-placeholder="Title" data-require="true" data-length="60">Example title</h1>
  <article data-field="articleBody" data-placeholder="Write here..." data-type="rich" data-require="true">
    <p>Article body example.</p>
  </article>
</form>
```

```javascript
// Instantiate a new Editore passing its wrapper element:
var editore = new Editore(document.getElementById('editor'));

//Get values from fields:
var values = editore.values();

// show values
console.log(values);
// {
//   title: {
//     name: 'title',
//     length: 13,
//     value: 'Example title',
//     valid: false
//   },
//   articleBody: {
//     name: 'articleBody',
//     length: 21,
//     value: '<p>Article body example.</p>',
//     valid: true
//   }
// }
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
  <h1 data-field="title" data-placeholder="Title" data-require="true" data-length="60"></h1>
```
###### data attributes
  - **data-field**=*"String"*
  - **data-placeholder**=*"String"*
  - **data-required**=*"Boolean" (optional)*: toggle class: required
  - **data-length**=*"Number" (optional)*: toggle class: invalid
  - **data-type**=*"String" (optional)*
    - **simple** *(default)*: It's a single-line field, without any text manipulation
    - **rich**: It's a multi-line field, with text manipulation support

### methods
###### editore.values()
  - return a object with all fields values.
```javascript
editore.clearFields();
/*
{
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
  - clear all fields data.
```javascript
editore.clearFields();
```

###### editore.setFieldsValues( *fields* )
  - parameters
    - **fields**=*"Object"*
```javascript
editore.setFieldsValues({
  fieldName: 'Value',
  fieldName: 'Value'
});
```

###### editore.destroy()
  - unset editable and remove all fields listeners.
```javascript
editore.destroy();
```

###### editore.subscribeInput( *callback* )
  - parameters
    - **callback**=*"Function[currentField]"*
```javascript
editore.subscribeInput(function(currentField) {
  console.log('Current: ', currentField);
});
```

###### editore.registerEditionComponent( *pluginConstructor* )
  - parameters  
    - **pluginConstructor**=*"Plugin Constructor"*

###### editore.registerInsertComponent( *pluginConstructor* )
  - parameters  
    - **pluginConstructor**=*"Plugin Constructor"*

---
## support
- chrome:
- firefox:
- safari:
- internet explore:

---
## contribute
Everyone can contribute! Finding bugs, creating issues, improving editor it self or creating components.
Every contribution will be welcomed! :santa: 

**Fork it** -> **Branch it** -> **Test it** -> **Push it** -> **Pull Request it** :gem:  
