# LiKy

A Javascript MVVM Library for Building Interface.

## Intro

[LiKy](https://github.com/kyleslight/LiKy) ( name combined with '狸' and 'Kyles' ) is a Javascript MVVM Library to help web developers building user interface. It is a project created by [Kyles Light](https://github.com/kyleslight) for learning and personal use. The core of LiKy is really tiny ( compressed size of version 0.0.2 is 13 KB ) but made easy to use. 

LiKy is inspired by a series of awesome librarys such as [React](https://facebook.github.io/react/) , [Vue](https://vuejs.org/) and [Spine](http://spinejs.com/),  it contains a few ideas to make web development more simple and efficient :

- **Component**. The component holds the common methods and data shared by all LiKy instances created by it, it also supports inheritance. So you can divide your application into segments and give the each segment more reusability with the help of component.
- **Element and State**. You create a LiKy instance by binding it with a element name ( using CSS selector syntax ) and initial state object ( optional ). So the element will be rendered with the state. You can also trigger event and generate structure ( and other staffs ) by adding attributes to the element.

And that's it! 

## Installation

It's easy to install LiKy with [npm](https://www.npmjs.com/package/liky) :

```bash
npm i --save liky
```

Or you can just include it in your `script` tag :

```vbscript-html
<script src="http://kyleslight.net/static/file/liky.min.js"></script>
```

## Getting Start

There is a [demo page](http://kyleslight.net/liky) to show you how to get start with it.

## Features

### Creating Component

To start with LiKy, create a component with common attributes object, the common attributes is optional :

```javascript
var Component = LiKy.createComponent();
```

Common attributes will be shared by all instance created by this component, it will hold the methods and component config data:

```javascript
var Component = LiKy.createComponent({
    $reactive: true,
    foo: function () {
        // do something
    }
});
```

### Binding Element

The component we created is a reusable constructor, it acts much like a Class. We can create a LiKy instance by passing it a element selector string and a initial state object ( optional ) to help it initialise and render with state, if we have an element like :

```html
<div id="app">
    {{message}}
</div>
```

We can bind it with state:

```javascript
Component.bindElement('#app', {
    message: 'Well, this is LiKy desu!'
});
```

After the initial render process, the element will be rendered  :

```html
<div id="app">
    Well, this is LiKy desu!
</div>
```

The component can bind more than one element :

```javascript
var Component = LiKy.createComponent({
    changeMessage: function () {
        // do something for your message
    }
});
Component.bindElement('#app1', {
    message: 'Some Text'
});
Component.bindElement('#app2', {
    message: 'Another Text'
});
```

So the common method and data can be reused by them.

### State

Any LiKy instance has a `state` object,  which is the Model of the term 'MVVM'.  You can access it just like normal Javascript object : 

```javascript
// in your component method
var text = this.state.message;
this.state.message = 'Another Text';
```

`state` can be changed rapidly.  By default, the change will not trigger render process until you call `setState` method, in `loose` mode ( current version only `loose` mode is implemented ), you can pass the changed attributes to `setState`, or you can just write `setState()` to remind LiKy it's time to render :

```javascript
// in your component method

// way 1
this.state.todos.push('Another Todo');
this.setState({
    id: -1
}); // todos and id will all be changed

// way 2
this.state.todos.push('Another Todo');
this.state.id = -1;
this.setState(); // way 1 and way 2 did the same thing
```

### Template Syntax

The template engine of LiKy is implemented individually. But don't worry, the syntax is quite simple and acts like other template engine:

- **Text Replacement**: the place where you set `{{<YourStateAttribute>}}` will be replaced by your state attribute value string ( after HTML escaping ), if the value is `undefined`, it will display nothing.
- **Voidng Escaping**:  set `{{{<YourStateAttribute>}}}` if you do want to replace with `HTML` string ( mind it would cause safety issue ).
- **Looping**:  the element with `lk-for` will traverse state attribute ( it should be an array ), render all items in order. In `lk-for='<item> in <items>'`, `<items>` represents your state attribute, `<item>` is an median value in each looping process. The looping syntax support nested.
- **Control**: if you set `lk-if`, the elemen will/will not be render when the value ( state attribute ) is `true`/`false`. The `lk-not` does the opposite thing.


### Handling Events

If you have declared the methods in element attribute `lk-on` ( note the event name should be listed in https://developer.mozilla.org/en-US/docs/Web/Events ):

```html
<div id="app">
    <button lk-on="click:Clicked">Click</button>
</div>
```

the method will be delegated to the root element ( in this case `#app` ) automatically, remember to define the associated method in your component :

```javascript
LiKy.createComponent({
    clicked: function () {
        console.log('be clicked');
    }
}).bindElement('#app');
```

All things will be done as you imagine. If you have more than one event to be handle, declared it in this way :

```html
<input type="text" lk-on="input:inputed;blur:blured">
```

### Input State

The `state` attributes will be changed in two different ways : dynamically modified in common method or modified by input value. If an element have `value` and  `lk-state` attributes, any change in your Input element will automatically trigger the change of `state` ( not be render ):

```html
<input type="text" lk-state="content">
```

so you can access the real-time value of input in common method.

```javascript
// in your component method
var content = this.state.content; // real-time value
```

### Element Attributes

You can dynamically change your element attribute by setting `lk-attr` :

```html
<div class="block" lk-attr="class:color"></div>
```

So when you change  `color` in your `state`:

```javascript
// in your component method
this.setState({
    color: 'red'
});
```

The element will be :

```html
<div class="block red" lk-attr="class:color"></div>
```

- Note the initial class attribute will not be recovered. But if you change `color` to `blue`, the value `red` will be replaced.
- For other attributes, the value will be replaced by the value in your `state`.
- Use `lk-attr="class:class1,class2..."` to set multi-class.
- Use `lk-attr="attr1:value1;attr2:value2..."` to set multi-attribute.

## Issues

LiKy is still being constructed, it might not be stable. If you have any issue, just to https://github.com/kyleslight/LiKy/issues to remind me about that.

LiKy does not support IE 8 and below, which means you should be careful considering about LiKy if there is still a amount of your users visiting from those browsers.

## License
LiKy is [MIT licensed](https://opensource.org/licenses/MIT), so you are free to use it.

