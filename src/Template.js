var Template = function (tpl, data) {
    tpl = tpl.split('\n').map(function (s) {return s.trim();}).join('').replace(/[\t\n\r]/g, '').replace(/"/g, '\'');
    var value = /\{\{([^\}\}]+)?\}\}/g;
    var loop = /<(\S*?) [^>]*lk-for='([^=]*)'[^>]*>(((?!<\/\1>).)*(<\/\1>)*)<\/\1>/g;
    var body = 'var s = []; ';
    var convertLoop = function (str, layer) {
        return (
            str.replace(loop, function (m, tag, _c, _sta) {
                var innerSta = _sta;
                layer++;
                if (loop.test(_sta)) {
                    innerSta = convertLoop(_sta, layer);
                }
                var cv = _c.split(' '), e = cv[0], es = cv[2];
                return m.replace(_sta, function () {
                    var tempS = innerSta.replace(new RegExp('{{ *' + '(' + e + ')([^ ]*)' + ' *}}', 'g'), function (m, _e, _suf) {
                        return '{{' + es + '[i'+ layer +']' + _suf +'}}'
                    });
                    tempS = tempS.replace(new RegExp('this.('+ e +').length', 'g'), function (m, _e) {
                        return 'this.' + es + '[i'+ layer +'].length';
                    });
                    return '");\nfor(var i' + layer +' = 0; i'+ layer +' < this.' + es + '.length; i'+ layer +'++) {\n\ts.push("' + tempS + '");\n}\ns.push("';
                });
            }));
    };
    body += 's.push("' + convertLoop(tpl, -1) + '");';
    body = body.replace(value, function (m, g) {
        return '" + this.' + g.trim() + ' + "';
    });
    body += 'return s.join("");';
    return (new Function(body.replace(/[\t\n\r]/g, ''))).apply(data).replace(/'/g, '"');
};

module.exports = Template;