# editor.js [![Build Status](https://travis-ci.org/evandroeisinger/editor.js.svg?branch=master)](https://travis-ci.org/evandroeisinger/editor.js)

> It's a magnific javascript editor! It's easy to create, valitade and get data from fields, even better is that you dont need to handle contenteditable :8ball: 

#### basic usage

It's easy to use! Load editor.js into your application, create the editor wrapper element, set some fields and instantiate a new editor to use it.

Let's load editor.js:
```html
<script type="text/javascript" src="editor.js"></script>
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

Instantiate a new editor passing it's wrapper element:
```javascript
var editor = new Editor(document.getElementById('editor'));
```

Subscribe for editor input events:
```javascript
editor.subscribe('input', function(field) {
  console.log('Current editing field:', field);
});
```

Register a action plugin:
```javascript
editor.register('action', SampleActionPlugin);
```

Register a edition plugin:
```javascript
editor.register('edition', SampleEditionPlugin);
```

Destroy editor:
```javascript
editor.destroy();
```
---
#### api



---
#### support



---
#### contribute
Fork it
Create your feature branch (git checkout -b my-new-feature)
Test your changes to the best of your ability.
Update the documentation to reflect your changes if they add or changes current functionality.
Commit your changes (git commit -am 'Added some feature')
Push to the branch (git push origin my-new-feature)
Create new Pull Request
