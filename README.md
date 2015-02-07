# editor.js [![Build Status](https://travis-ci.org/evandroeisinger/editor.js.svg?branch=master)](https://travis-ci.org/evandroeisinger/editor.js)

> It's a magnific javascript editor! It's easy to create and valitade fields and get data from them, even better is that you don't need to handle contenteditable yourself :8ball: 

#### basic usage

It's easy to use! Load editor.js into your application, create the editor wrapper element, set some fields and instantiate a new editor to use it.

Let's load editor.js:
```html
<script src="editor.js"></script>
```

Enable pseudo fields placeholder:
```css
.placeholder::after { 
  content: attr(data-placeholder);
  position: absolute;
  top: 0;
}
```

Create editor wrapper element and some fields:
```html
<form id="editor">
  <h1 data-field="title" data-placeholder="Title" data-require="true" data-length="60"></h1>
  <article data-field="article" data-placeholder="Article" data-type="rich" data-require="true"></article>
</form>
```

Instantiate a new editor passing its wrapper element:
```javascript
var editor = new Editor(document.getElementById('editor'));
```

Subscribe for editor input events:
```javascript
editor.subscribe('input', function(field) {
  console.log('Current editing field:', field);
});
```

To register insert plugin into its components collection:
```javascript
editor.register('insert', SampleActionPlugin);
```

To tegister edition plugin into its components collection:
```javascript
editor.register('edition', SampleEditionPlugin);
```

If you need to remove editor elements and listeners:
```javascript
editor.destroy();
```
---
#### api
##### constructor
```javascript
new Editor(element);
```
###### parameters
- *element*: is the element from where the editor should get its child elements to transform in fields according with their data-attributes.

##### field
```html
  <h1 data-field="title" data-placeholder="Title" data-require="true" data-length="60"></h1>
```
###### data-attributes
- *data-field*:
- *data-placeholder*:
- *data-required* (optional):
- *data-type* (optional):
- *data-length* (optional):

---
#### support



---
#### contribute
Everyone can contribute! Finding bugs, creating issues, improving editor it self or creating components.
Every contribution will be welcomed! :santa: 

**Fork it** -> **Branch it** -> **Test it** -> **Push it** -> **Pull Request it** :gem:  
