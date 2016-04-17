var Template = function (tpl, data) {
    tpl = tpl.split('\n').map(function (s) {return s.trim();}).join('').replace(/[\t\n\r]/g, '').replace(/"/g, '\'');
    var control = /<(\S*?) [^>]*lk-if='([^\']*)'[^>]*>((?!<\/\1>).)*(<\/\1>)*<\/\1>/g;
    var loop = /<(\S*?) [^>]*lk-for='([^=]*)'[^>]*>(((?!<\/\1>).)*(<\/\1>)*)<\/\1>/g;
    var value = /\{\{([^\}\}]+)?\}\}/g;
    var tagPair = function (str, mode) {
        var subSection = [], ts = [], _m, _tag, cursor = 0;
        var re = new RegExp("<([^>]*?) [^>]*lk-"+ mode +"='([^\']*)'[^>]*>");
        var updateTag = function (s) {
            var temp = s.match(re);
            var reStart = temp ? temp[1] : '';
            _tag = new RegExp('<' + reStart + '|<\/'+ reStart + '>', 'g');
        };
        var restStr = str;
        updateTag(restStr);
        while (_m = _tag.exec(restStr)) {
            var tagName = _m[0];
            if (/<\/.*/.test(tagName)) ts.pop();
            else ts.push(tagName);
            if (!ts.length) {
                subSection.push(restStr.slice(cursor, cursor = _m.index + tagName.length));
                restStr = restStr.slice(cursor);
                cursor = 0;
                updateTag(restStr);
            }
        }
        return subSection;
    };
    var convertControl = function (str) {
        return str.replace(control, function (m, tag, _c) {
            _c = 'this.' + _c.replace(/\{|\}/g, '');
            if ((new Function('return ' + _c)).apply(data) === false) return "";
            return m;
        });
    };
    var convertLoop = function (str, layer) {
        var subs = tagPair(str, 'for');
        return subs.map(function (sub) {
            return (
            sub.replace(loop, function (m, tag, _c, _sta) {
                var innerSta = _sta;
                layer++;
                if (loop.test(_sta)) innerSta = convertLoop(_sta, layer);
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
        }).join('');
    };
    var convertValue = function (str) {
        return str.replace(value, function (m, g) {
            return '" + this.' + g.trim() + ' + "';
        });
    };

    var body = convertControl(tpl);
    body = 'var s = []; s.push("' + convertLoop(body, -1) + '");';
    body = convertValue(body);
    body += 'return s.join("");';
    return (new Function(body.replace(/[\t\n\r]/g, ''))).apply(data).replace(/'/g, '"');
};

module.exports = Template;