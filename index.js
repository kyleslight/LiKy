(function () {
    // App 1

    LiKy.createComponent().bindElement('#app1', {
        message: 'Hello, LiKy!'
    });

    // App 2

    LiKy.createComponent({
        onInitialRendered: function () {
            this.convertMD();
        },
        convertMD: function () {
            this.setState({
                preview: marked(this.state.text)
            });
        }
    }).bindElement('#app2', {
        text: '# Hello LiKy\n---\ncontent'
    });

    // App 3

    LiKy.createComponent().bindElement('#app3', {
        items: [
          { text: 'Learn JavaScript' },
          { text: 'Learn LiKy' },
          { text: 'Build Something Awesome' }
        ]
    });

    // App 4

    LiKy.createComponent({
        reverseMessage: function () {
            this.setState({
                message: this.state.message.split('').reverse().join('')
            });
        }
    }).bindElement('#app4', {
        message: 'Hello LiKy!'
    });

    // App 5

    LiKy.createComponent({
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

    LiKy.createComponent({
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

    var List = LiKy.createComponent({
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

    LiKy.createComponent({
        submit: function (e) {
            e.preventDefault();
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


    // Remote Persistence

    LiKy.createComponent({
        $remoteUrl: '/posts',
        onInitialRendered: function () {
            this.remoteRead(function (data) {
                this.setState({
                    posts: data.posts
                });
            })
        },
        addPost: function () {
            this.remoteCreate({
                post: this.getPostInput()
            }, function (data) {
                this.setState({
                    title: '',
                    content: '',
                    posts: data.posts
                });
            });
        },
        editPost: function (index) {
            var tempPost = this.state.posts[index];
            this.setState({
                title: tempPost.title,
                content: tempPost.content,
                ifAdd: false,
                id: index
            });
        },
        updatePost: function () {
            var self = this;
            this.remoteUpdate({
                index: this.state.id,
                post: self.getPostInput()
            }, function (data) {
                this.setState({
                    title: '',
                    content: '',
                    posts: data.posts,
                    ifAdd: true,
                    index: -1
                });
            });
        },
        deletePost: function (index) {
            this.remoteDelete({
                index: index
            }, function (data) {
                this.setState({
                    posts: data.posts
                });
            });
        },
        getPostInput: function () {
            return {
                title: this.state.title,
                content: this.state.content
            };
        }
    }).bindElement('#app9', {
        posts: [],
        ifAdd: true,
        id: -1
    });

    // Local Persistence

    LiKy.createComponent({
        onInitialRendered: function () {
            localStorage['posts'] = JSON.stringify([{
                title: 'title 1',
                content: 'content 1'
            }, {
                title: 'title 2',
                content: 'content 2'
            }]);
            this.localRead({
                posts: true
            }, function (data) {
                this.setState({
                    posts: data.posts
                })
            });
        },
        addPost: function () {
            this.localCreate({
                posts: this.getPostInput()
            }, function (data) {
                this.setState({
                    title: '',
                    content: '',
                    posts: data.posts
                });
            });
        },
        editPost: function (index) {
            var tempPost = this.state.posts[index];
            this.setState({
                title: tempPost.title,
                content: tempPost.content,
                ifAdd: false,
                id: index
            });
        },
        updatePost: function () {
            var self = this;
            this.localUpdate({
                posts: {
                    _id: this.state.id,
                    _content: self.getPostInput()
                }
            }, function (data) {
                this.setState({
                    title: '',
                    content: '',
                    posts: data.posts,
                    ifAdd: true,
                    id: -1
                });
            });
        },
        deletePost: function (index) {
            this.localDelete({
                posts: index
            }, function (data) {
                this.setState({
                    posts: data.posts
                });
            });
        },
        getPostInput: function () {
            return {
                title: this.state.title,
                content: this.state.content
            };
        }
    }).bindElement('#app10', {
        posts: [],
        ifAdd: true,
        id: -1
    });

    // Attributes

    LiKy.createComponent({
        toRed: function () {
            this.setState({
                color: 'red'
            });
        },
        toBlue: function () {
            console.log('here');
            this.setState({
                color: 'blue'
            });
        },
        clear: function () {
            this.setState({
                color: ''
            });
        }
    }).bindElement('#app11', {
        color: ''
    });


    // Code

    var Code = LiKy.createComponent({
        onInitialRendered: function () {
            this.setState({
                htmlPreview: marked(this.state.html),
                jsPreview: marked(this.state.js)
            });
        }
    });

    Code.bindElement('#code1', {
        html: '```html\n<div id="app1">\n    {{!message}}\n</div>```',
        js: '```javascript\nLiKy.createComponent().bindElement(\'#app1\', {\n    message: \'Hello, LiKy!\'\n});```'
    });
    Code.bindElement('#code2', {
        html: '```html\n<div id="app2">\n    <textarea lk-state="text" lk-on="input:convertMD"></textarea>\n    <div>{{{!preview}}}</div>\n</div>```',
        js: '```javascript\nLiKy.createComponent({\n    onInitialRendered: function () {\n        this.convertMD();\n    },\n    convertMD: function () {\n        this.setState({\n            preview: marked(this.state.text)\n        });\n    }\n}).bindElement(\'#app2\', {\n    text: \'# Hello LiKy\\n---\\ncontent\'\n});```'
    });
    Code.bindElement('#code3', {
        html: '```html\n<div id="app3">\n\t<ul lk-for="item in items">\n\t\t<li>{{!item.text}}</li>\n\t</ul>\n</div>```',
        js: '```javascript\nLiKy.createComponent().bindElement(\'#app3\', {\n\titems: [\n\t  { text: \'Learn JavaScript\' },\n\t  { text: \'Learn LiKy\' },\n\t  { text: \'Build Something Awesome\' }\n\t]\n});```'
    });
    Code.bindElement('#code4', {
        html: '```html\n<div id="app4">\n    <p>{{!message}}</p>\n    <button lk-on="click:reverseMessage">Reverse</button>\n</div>```',
        js: '```javascript\nLiKy.createComponent({\n    reverseMessage: function () {\n        this.setState({\n            message: this.state.message.split(\'\').reverse().join(\'\')\n        });\n    }\n}).bindElement(\'#app4\', {\n    message: \'Hello LiKy!\'\n});```'
    });
    Code.bindElement('#code5', {
        html: '```html\n<div id="app5">\n    <input type="text" lk-state="newTodo" lk-on="keyup:addTodo">\n    <ul lk-for="todo in todos">\n        <li>\n            {{!todo.text}} <button lk-on="click:removeTodo($index)"> x </button>\n        </li>\n    </ul>\n</div>```',
        js: '```javascript\nLiKy.createComponent({\n    addTodo: function (e) {\n        if (e.keyCode !== 13) return;\n        if (!this.state.newTodo) return;\n        this.state.todos.push({text: this.state.newTodo});\n        this.setState({newTodo: \'\'});\n    },\n    removeTodo: function (index) {\n        this.state.todos.splice(index, 1);\n        this.setState();\n    }\n}).bindElement(\'#app5\', {\n    newTodo: \'\',\n    todos: [{text: \'Add some todos!\'}]\n});```'
    });
    Code.bindElement('#code6', {
        html: '```html\n<div class="col width-fill" id="app6">\n    <ul lk-for="todo in todos">\n        <li>\n            {{!todo.title}} <button lk-on="click:removeTodo($index)"> x </button><br>\n            <ul lk-for="item in todo.items">\n                <li>{{!item}} <button lk-on="click:removeItem($index)"> x </button></li>\n            </ul>\n        </li>\n    </ul>\n</div>```',
        js: '```javascript\nLiKy.createComponent({\n    removeTodo: function (index) {\n        this.state.todos.splice(index, 1);\n        this.setState();\n    },\n    removeItem: function (index) {\n        this.state.todos.forEach(function (todo) {\n            todo.items.forEach( function (item, i) {\n                if (index-- === 0)\n                    todo.items.splice(i, 1);\n            });\n        });\n        this.setState();\n    }\n}).bindElement(\'#app6\', {\n    todos : [{\n        title: \'todo 1\',\n        items: [\'item 1\', \'item 2\']\n    }, {\n        title: \'todo 2\',\n        items: [\'item 1\', \'item 2\']\n    }]\n});```'
    });
    Code.bindElement('#code7', {
        html: '```html\n<div class="col width-fill" id="app7">\n    <div id="app7-list1">\n        <h3>List - {{!title}}</h3>\n        <ul lk-for="item in items">\n            <li>{{!item}}</li>\n        </ul>\n    </div>\n    <div id="app7-list2">\n        <h3>Another List - {{!title}}</h3>\n        <ul lk-for="item in items">\n            <li>{{!item}}</li>\n        </ul>\n    </div>\n</div>```',
        js: "```javascript\nvar List = LiKy.createComponent({\n    $state: {\n        title: 'Same Conponent'\n    },\n    removeItem: function (index) {\n        this.state.items.splice(index, 1);\n        this.setState();\n    }\n});\n\nList.bindElement('#app7-list1', {\n    items: ['Learn JavaScript', 'Learn LiKy', 'Build Something Awesome']\n});\n\nList.bindElement('#app7-list2', {\n    items: ['item 1', 'item 2', 'item 3']\n});```"
    });
    Code.bindElement('#code8', {
        html: '```html\n\n<div id="app8">\n    <form lk-on="submit:submit">\n        <div>Input <input name="input" lk-state="input" type="text"></div>\n        <div>Textarea <textarea lk-state="textarea" cols="30" rows="10"></textarea>\n        </div>\n       <div> Radio \n           <input type="radio" name="sex" value="male" lk-state="sex.male" /> Male<br>\n           <input type="radio" name="sex" value="female" lk-state="sex.female" /> Female \n       </div>\n       <div>Checkbox <input type="checkbox" value="1" name="bike" lk-state="checkbox"/> I have a bike\n       </div>\n       <div>Select\n           <select name="select" lk-state="select">\n               <option disabled selected value> -- select an option -- </option>\n               <option value="Volvo">Volvo</option>\n               <option value="Saab">Saab</option>\n           </select>\n       </div>\n       <div>Select Option Group\n           <select name="optionGroup" lk-state="optionGroup">\n               <option disabled selected value> -- select an option -- </option>\n               <optgroup label="Swedish Cars">\n                   <option value="volvo">Volvo</option>\n               </optgroup>\n               <optgroup label="German Cars">\n                   <option value="mercedes">Mercedes</option>\n               </optgroup>\n           </select>\n       </div>\n       <div><button type="submit">Submit</button></div>\n   </form>\n   <div>\n       <h2>Form Data</h2>\n       <p>Input {{!input}}</p>\n       <p>Textarea {{!textarea}}</p>\n       <p>Radio </p>\n       <ul>\n           <li>Male {{!maleShow}}</li>\n           <li>Female {{!femaleShow}}</li>\n       </ul>\n       <p>Checkbox {{!checkboxShow}}</p>\n       <p>Select {{!select}}</p>\n       <p>Select Option Group {{!optionGroup}}</p>\n    </div>\n</div>```',
        js: "```javascript\nLiKy.createComponent({\n    submit: function () {\n        var map = {\n            maleShow: 'sex.male',\n            femaleShow: 'sex.female',\n            checkboxShow: 'checkbox'\n        };\n        for (var i in map) this.state[i] = (this.state[map[i]] ? 'true' : 'false');\n        this.setState();\n        return false;\n    }\n}).bindElement('#app8');```"
    });

    LiKy.createComponent({
        onInitialRendered: function () {
            this.setState({
                introPreview: marked(this.state.intro)
            });
        }
    }).bindElement('#intro', {
        intro: "[LiKy](https://github.com/kyleslight/LiKy) is a Javascript MVVM Library to help web developers building user interface. It is a project created by [Kyles Light](https://github.com/kyleslight) for learning and personal use. In fact the page you view is driven by little LiKy ( by the way, thanks for the help of framework [Cascade](http://jslegers.github.io/cascadeframeworklight/) ).\n\nLiKy is inspired by a series of awesome librarys such as [React](https://facebook.github.io/react/) , [Vue](https://vuejs.org/) and [Spine](http://spinejs.com/),  it contains a few ideas to make web development more simple and efficient :\n\n- **Component**. The component holds the common methods and data shared by all LiKy instances created by it, it also supports inheritance. So you can divide your application into segments and give the each segment more reusability with the help of component.\n- **Element and State**. You create a LiKy instance by binding it with a element name ( using CSS selector syntax ) and initial state object ( optional ). So the element will be rendered with the state. You can also trigger event and generate structure ( and other staffs ) by adding attributes to the element.\n\nAnd that's it! \n\nHere are some demos created with LiKy so you can have a more clear concept about how to develop with it.\n\n"
    });
}());