var ViewModel = require('../src/ViewModel.js');
var marked = require('marked');

// App 1

ViewModel.createComponent().bindElement('#app1', {
    message: 'Hello, LiKy!'
});

// App 2

ViewModel.createComponent({
    convertToMD: function () {
        this.setState({
            preview: marked(this.state.text)
        })
    }
}).bindElement('#app2');

// App 3

ViewModel.createComponent().bindElement('#app3', {
    todos: [
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
        title: 'lala'
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
    onStateCreated: function () {
        this.show();
    },
    show: function () {
        var map = {
            maleShow: 'sex.male',
            femaleShow: 'sex.female',
            unknowShow: 'sex.unknow',
            checkboxShow: 'checkbox'
        };
        for (var i in map) this.state[i] = (this.state[map[i]] ? 'true' : 'false');
        this.setState();
    }
}).bindElement('#app8');