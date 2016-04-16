var Template = require('../src/Template.js');
var $ = require('jquery');

var tpl = $('#template1').html();

var html = Template(tpl, {
    personBook: [[
        'SICP', 'Pro JS Tech'
    ], [
        'TSOJN', 'PRML'
    ]],
    region: [[
        'Shangri-La', 'HongKong'
    ], [
        'CA', 'NY'
    ]]
});

$('#template1').html(html);

console.log('Rendered Text\n', html);