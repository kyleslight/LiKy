var Selector = require('../src/Selector.js');

Selector('.list').each(function () {
    console.log(this);
});

console.log(Selector('.list').html());

Selector('.inputwrap').delegate('[lk-state]', 'input', function () {
    console.log('trigger this element', this.value);
});

