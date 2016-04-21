var ViewModel = require('../src/ViewModel.js');
var marked = require('marked');

// App 1

ViewModel.createComponent().bindElement('#app1', {
    message: 'Hello, LiKy!'
});

// App 2

ViewModel.createComponent({
    onInitialRendered: function () {
        this.convertToMD();
    },
    convertToMD: function () {
        this.setState({
            preview: marked(this.state.text)
        });
    }
}).bindElement('#app2', {
    text: '# Hello LiKy\n---\ncontent'
});

// App 3

ViewModel.createComponent().bindElement('#app3', {
    items: [
      { text: 'Learn JavaScript' },
      { text: 'Learn LiKy' },
      { text: 'Build Something Awesome' }
    ]
});

// App 4

ViewModel.createComponent({
    reverseMessage: function () {
        this.setState({
            message: this.state.message.split('').reverse().join('')
        });
    }
}).bindElement('#app4', {
    message: 'Hello LiKy!'
});

// App 5

ViewModel.createComponent({
    addTodo: function (e) {
        if (e.keyCode !== 13) return;
        if (!this.state.newTodo) return;
        this.state.todos.push({text: this.state.newTodo});
        this.setState({newTodo: ''});
    },
    removeTodo: function (index) {
        this.state.todos.splice(index, 1);
        this.setState();
    }
}).bindElement('#app5', {
    newTodo: '',
    todos: [{text: 'Add some todos!'}]
});

// Structure changes

ViewModel.createComponent({
    removeTodo: function (index) {
        this.state.todos.splice(index, 1);
        this.setState();
    },
    removeItem: function (index) {
        this.state.todos.forEach(function (todo) {
            todo.items.forEach( function (item, i) {
                if (index-- === 0)
                    todo.items.splice(i, 1);
            });
        });
        this.setState();
    }
}).bindElement('#app6', {
    todos : [{
        title: 'todo 1',
        items: ['item 1', 'item 2']
    }, {
        title: 'todo 2',
        items: ['item 1', 'item 2']
    }]
});

// Bind different elements

var List = ViewModel.createComponent({
    $state: {
        title: 'Same Conponent'
    },
    removeItem: function (index) {
        this.state.items.splice(index, 1);
        this.setState();
    }
});

List.bindElement('#app7-list1', {
    items: ['Learn JavaScript', 'Learn LiKy', 'Build Something Awesome']
});

List.bindElement('#app7-list2', {
    items: ['item 1', 'item 2', 'item 3']
});

// Handle Form

ViewModel.createComponent({
    submit: function () {
        var map = {
            maleShow: 'sex.male',
            femaleShow: 'sex.female',
            checkboxShow: 'checkbox'
        };
        for (var i in map) this.state[i] = (this.state[map[i]] ? 'true' : 'false');
        this.setState();
        return false;
    }
}).bindElement('#app8');

var Code = ViewModel.createComponent({
    onInitialRendered: function () {
        this.setState({
            htmlPreview: marked(this.state.html),
            jsPreview: marked(this.state.js)
        });
    }
});
var code1 = Code.bindElement('#code1', {
    html: '```html\n<div id="app1">\n    {{!message}}\n</div>```',
    js: '```javascript\nViewModel.createComponent().bindElement(\'#app1\', {\n    message: \'Hello, LiKy!\'\n});```'
});

var code2 = Code.bindElement('#code2', {
    html: '```html\n<div id="app2">\n    <textarea lk-state="text" lk-on="input:convertToMD"></textarea>\n    <div>{{{!preview}}}</div>\n</div>```',
    js: '```javascript\nViewModel.createComponent({\n    onInitialRendered: function () {\n        this.convertToMD();\n    },\n    convertToMD: function () {\n        this.setState({\n            preview: marked(this.state.text)\n        });\n    }\n}).bindElement(\'#app2\', {\n    text: \'# Hello LiKy\\n---\\ncontent\'\n});```'
});

var code3 = Code.bindElement('#code3', {
    html: '```html\n<div id="app3">\n\t<ul lk-for="item in items">\n\t\t<li>{{!item.text}}</li>\n\t</ul>\n</div>```',
    js: '```javascript\nViewModel.createComponent().bindElement(\'#app3\', {\n\titems: [\n\t  { text: \'Learn JavaScript\' },\n\t  { text: \'Learn LiKy\' },\n\t  { text: \'Build Something Awesome\' }\n\t]\n});```'
});

var code4 = Code.bindElement('#code4', {
    html: '```html\n<div id="app4">\n    <p>{{!message}}</p>\n    <button lk-on="click:reverseMessage">Reverse</button>\n</div>```',
    js: '```javascript\nViewModel.createComponent({\n    reverseMessage: function () {\n        this.setState({\n            message: this.state.message.split(\'\').reverse().join(\'\')\n        });\n    }\n}).bindElement(\'#app4\', {\n    message: \'Hello LiKy!\'\n});```'
});

var code5 = Code.bindElement('#code5', {
    html: '```html\n<div id="app5">\n    <input type="text" lk-state="newTodo" lk-on="keyup:addTodo">\n    <ul lk-for="todo in todos">\n        <li>\n            {{!todo.text}} <button lk-on="click:removeTodo($index)"> x </button>\n        </li>\n    </ul>\n</div>```',
    js: '```javascript\nViewModel.createComponent({\n    addTodo: function (e) {\n        if (e.keyCode !== 13) return;\n        if (!this.state.newTodo) return;\n        this.state.todos.push({text: this.state.newTodo});\n        this.setState({newTodo: \'\'});\n    },\n    removeTodo: function (index) {\n        this.state.todos.splice(index, 1);\n        this.setState();\n    }\n}).bindElement(\'#app5\', {\n    newTodo: \'\',\n    todos: [{text: \'Add some todos!\'}]\n});```'
});

var code6 = Code.bindElement('#code6', {
    html: '```html\n<div class="col width-fill" id="app6">\n    <ul lk-for="todo in todos">\n        <li>\n            {{!todo.title}} <button lk-on="click:removeTodo($index)"> x </button><br>\n            <ul lk-for="item in todo.items">\n                <li>{{!item}} <button lk-on="click:removeItem($index)"> x </button></li>\n            </ul>\n        </li>\n    </ul>\n</div>```',
    js: '```javascript\nViewModel.createComponent({\n    removeTodo: function (index) {\n        this.state.todos.splice(index, 1);\n        this.setState();\n    },\n    removeItem: function (index) {\n        this.state.todos.forEach(function (todo) {\n            todo.items.forEach( function (item, i) {\n                if (index-- === 0)\n                    todo.items.splice(i, 1);\n            });\n        });\n        this.setState();\n    }\n}).bindElement(\'#app6\', {\n    todos : [{\n        title: \'todo 1\',\n        items: [\'item 1\', \'item 2\']\n    }, {\n        title: \'todo 2\',\n        items: [\'item 1\', \'item 2\']\n    }]\n});```'
});

var code7 = Code.bindElement('#code7', {
    html: '```html\n<div class="col width-fill" id="app7">\n    <div id="app7-list1">\n        <h3>List - {{!title}}</h3>\n        <ul lk-for="item in items">\n            <li>{{!item}}</li>\n        </ul>\n    </div>\n    <div id="app7-list2">\n        <h3>Another List - {{!title}}</h3>\n        <ul lk-for="item in items">\n            <li>{{!item}}</li>\n        </ul>\n    </div>\n</div>```',
    js: "```javascript\nvar List = ViewModel.createComponent({\n    $state: {\n        title: 'Same Conponent'\n    },\n    removeItem: function (index) {\n        this.state.items.splice(index, 1);\n        this.setState();\n    }\n});\n\nList.bindElement('#app7-list1', {\n    items: ['Learn JavaScript', 'Learn LiKy', 'Build Something Awesome']\n});\n\nList.bindElement('#app7-list2', {\n    items: ['item 1', 'item 2', 'item 3']\n});```"
});

var code8 = Code.bindElement('#code8', {
    html: '```html\n\n<div id="app8">\n    <form lk-on="submit:submit">\n        <div>Input <input name="input" lk-state="input" type="text"></div>\n        <div>Textarea <textarea lk-state="textarea" cols="30" rows="10"></textarea>\n        </div>\n       <div> Radio \n           <input type="radio" name="sex" value="male" lk-state="sex.male" /> Male<br>\n           <input type="radio" name="sex" value="female" lk-state="sex.female" /> Female \n       </div>\n       <div>Checkbox <input type="checkbox" value="1" name="bike" lk-state="checkbox"/> I have a bike\n       </div>\n       <div>Select\n           <select name="select" lk-state="select">\n               <option disabled selected value> -- select an option -- </option>\n               <option value="select1">Volvo</option>\n               <option value="select2">Saab</option>\n           </select>\n       </div>\n       <div>Select Option Group\n           <select name="optionGroup" lk-state="optionGroup">\n               <option disabled selected value> -- select an option -- </option>\n               <optgroup label="Swedish Cars">\n                   <option value="volvo">Volvo</option>\n               </optgroup>\n               <optgroup label="German Cars">\n                   <option value="mercedes">Mercedes</option>\n               </optgroup>\n           </select>\n       </div>\n       <div><button type="submit">Submit</button></div>\n   </form>\n   <div>\n       <h2>Form Data</h2>\n       <p>Input {{input}}</p>\n       <p>Textarea {{textarea}}</p>\n       <p>Radio </p>\n       <ul>\n           <li>Male {{maleShow}}</li>\n           <li>Female {{femaleShow}}</li>\n       </ul>\n       <p>Checkbox {{checkboxShow}}</p>\n       <p>Select {{select}}</p>\n       <p>Select Option Group {{optionGroup}}</p>\n    </div>\n</div>```',
    js: "```javascript\nViewModel.createComponent({\n    submit: function () {\n        var map = {\n            maleShow: 'sex.male',\n            femaleShow: 'sex.female',\n            checkboxShow: 'checkbox'\n        };\n        for (var i in map) this.state[i] = (this.state[map[i]] ? 'true' : 'false');\n        this.setState();\n        return false;\n    }\n}).bindElement('#app8');```"
});

var Intro = ViewModel.createComponent({
    onInitialRendered: function () {
        this.setState({
            introPreview: marked(this.state.intro)
        });
    }
}).bindElement('#intro', {
    intro: "[LiKy](https://github.com/kyleslight/LiKy) is a Javascript MVVM Library to help web developers building user interface. It is a project created by [Kyles Light](https://github.com/kyleslight) for learning and personal use. In fact the page you view is driven by little LiKy ( by the way, thanks for the help of framework [Cascade](http://jslegers.github.io/cascadeframeworklight/) ).\n\nLiKy is inspired by a series of awesome librarys such as [React](https://facebook.github.io/react/) , [Vue](https://vuejs.org/) and [Spine](http://spinejs.com/),  it contains a few ideas to make web development more simple and efficient :\n\n- **Component**. The component holds the common methods and data shared by all LiKy instances created by it, it also supports inheritance. So you can divide your application into segments and give the each segment more reusability with the help of component.\n- **Element and State**. You create a LiKy instance by binding it with a element name ( using CSS selector syntax ) and initial state object ( optional ). So the element will be rendered with the state. You can also trigger event and generate structure ( and other staffs ) by adding attributes to the element.\n\nAnd that's it! \n\nHere are some demos created with LiKy so you can have a more clear concept about how to develop with it.\n\n"
})
