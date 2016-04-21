var tagPair = function (str, mode) {
    str = str.split('\n').map(function (s) {return s.trim();}).join('').replace(/[\t\n\r]/g, '');
    var subSection = [], ts = [], _m, _tag, cursor = 0;
    var re = new RegExp("<([^>]*?) [^>]*lk-"+ mode +"=[\'\"]([^\'\"]*)[\'\"][^>]*>");
    var updateTag = function (s) {
        s = s || '';
        var temp = s.match(re);
        var reStart = temp ? temp[1] : '';
        _tag = new RegExp('<' + reStart + '|<\/'+ reStart + '>', 'g');
    };
    var restStr = str;
    updateTag(restStr);

    _m = _tag.exec(restStr);
    var _index =  _m ? _m.index : 0;
    subSection.push(restStr.slice(0, _index));
    restStr = restStr.slice(_index);

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
    subSection.push(restStr);
    return subSection;
};
var Template = function (tpl, data) {
    tpl = tpl.split('\n').map(function (s) {return s.trim();}).join('').replace(/[\t\n\r]/g, '').replace(/"/g, '\'');
    var ifSta = /<(\S*?) [^>]*lk-if='([^\']*)'[^>]*>(.*)<\/\1>/g;
    var notSta = /<(\S*?) [^>]*lk-not='([^\']*)'[^>]*>(.*)<\/\1>/g;
    var loop = /<(\S*?) [^>]*lk-for='([^\']*)'[^>]*>(.*)<\/\1>/g;
    var html = /\{\{\{([^!][^\}\}\}]+)?\}\}\}/g;
    var value = /\{\{([^!][^\}\}]+)?\}\}(?=[^}])/g;
    var convertControl = function (str) {
        var _map = {
            'if': ifSta,
            'not': notSta
        };
        var _op = '';
        var _t = function (sub) {
            return sub.replace(_map[_op], function (m, tag, _c) {
                _c = 'this.' + _c.replace(/\{|\}/g, '');
                if (_op === 'if') {
                    if ((new Function('return ' + _c)).apply(data) === false) return "";
                }
                if (_op === 'not')
                    if ((new Function('return ' + _c)).apply(data) !== false) return "";
                return m;
            });
        };
        str = tagPair(str, _op = 'if').map(_t).join('');
        str = tagPair(str, _op = 'not').map(_t).join('');
        return str;
    };
    var convertLoop = function (str, layer) {
        var subs = tagPair(str, 'for');
        return subs.map(function (sub) {
            if (!sub) return '';
            return (
            sub.replace(loop, function (m, tag, _c, _sta) {
                var cv = _c.split(' '), e = cv[0], es = cv[2];
                var innerSta = _sta;
                var tempC = 'this.' + es;
                layer++;
                if (loop.test(_sta)) {
                    innerSta = convertLoop(_sta, layer);
                }
                return m.replace(_sta, function () {
                    var tempS = innerSta.replace(new RegExp('{{ *' + '(' + e + ')([^\}]*)' + ' *}}', 'g'), function (m, _e, _suf) {
                        return '{{' + es + '[i'+ layer +']' + _suf +'}}'
                    });
                    tempS = tempS.replace(new RegExp('this.('+ e +')(.*).length', 'g'), function (m, _e, _suf) {
                        return 'this.' + es + '[i'+ layer +']'+ _suf +'.length';
                    });
                    return '");\nfor(var i' + layer +' = 0; i'+ layer +' < '+ tempC + '.length; i'+ layer +'++) {\n\ts.push("' + tempS + '");\n}\ns.push("';
                });
            }));
        }).join('');
    };
    var convertValue = function (str) {
        return str.replace(value, function (m, g) {
            if (!g) return m;
            return '" + handleValue(get(this, "' + g.trim() + '"), "'+ m +'") + "';
        });
    };
    var convertHTML = function (str) {
        return str.replace(html, function (m, g) {
            if (!g) return m;
            return '" + handleHTML(get(this, "' + g.trim() + '"), "'+ m +'") + "';
        })
    };
    var pre = 'var get = function(obj, key) {return key.split(".").reduce(function(o, x) {var re = new RegExp("([^\[]+)([^ ]*)"); var ox = x.match(re); var x = ox[1]; var suf = ox[2]; return (typeof o == "undefined" || o === null) ? o : eval("o[x]" + suf);}, obj);}; var handleValue = function(value, m) {if (value) {return value.replace(/>/g, "&gt;").replace(/</g, "&lt;");} return m;}; var handleHTML = function(value, m) {if (value) {return value;} return m;}; var s = [];';
    var suf = 'return s.join("").replace(/\{\{([^!][^\}\}]+)?\}\}(?=[^}])|\{\{\{([^!][^\}\}\}]+)?\}\}\}/g, "").replace(/\{\{!/g, "\{\{")';
    body = convertControl(tpl);
    body = 's.push("' + convertLoop(body, -1)  + '");';
    body = convertValue(body);
    body = convertHTML(body);
    body = pre + body + suf;
    return (new Function(body.replace(/[\t\n\r]/g, ''))).apply(data).replace(/'/g, '"');
};
Template.tagPair = tagPair;
module.exports = Template;