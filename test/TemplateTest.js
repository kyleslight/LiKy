var Template = require('../src/Template.js');
var $ = require('jquery');

var tpl = $('#template1').html();

var html = Template(tpl, {
    books: ['SICP', 'CSAPP'],
    ifShowBook: true,
    region: [[
        {
            text: 'WH'
        }, {
            text: 'HK'
        }
    ], [
        {
            text: 'NY'
        }, {
            text: 'LA'
        }
    ]]
});

$('#template1').html(html);
console.log(html);