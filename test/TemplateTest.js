var Template = require('../src/Template.js');
var $ = require('jquery');

var tpl = $('#template1').html();

var html = Template(tpl, {
    books: ['SICP', 'CSAPP'],
    ifShowBook: true,
    region: [[
        {
            text: 'Singapore'
        }, {
            text: 'HongKong'
        }
    ], [
        {
            text: 'NY'
        }, {
            text: 'CA'
        }
    ]]
});

$('#template1').html(html);