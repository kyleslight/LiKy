var Template = require('../src/Template.js');
var $ = require('jquery');

var tpl = $('#template1').html();

var html = Template(tpl, {
    todos : [{
        title: 'todo 1',
        items: ['item 1', 'item 2']
    }, {
        title: 'todo 2',
        items: ['item 1', 'item 2']
    }]
});

$('#template1').html(html);