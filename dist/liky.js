/**
* LiKy - A MVVM Library
* Copyright (c) 2016, Kyles Light. (MIT Licensed)
* https://github.com/kyleslight/LiKy
*/

;(function () {

var Class = function (parent) {
    var _class = function () {
        if (parent && parent.prototype.init) this.superInit = parent.prototype.init;
        this.init.apply(this, arguments);
    };

    if (parent) {
        var subclass = function () {};
        subclass.prototype = parent.prototype;
        _class.prototype = new subclass;
    }

    _class.fn = _class.prototype;
    _class.fn.init = function () {};
    _class.fn.parent = _class;
    _class.fn._super = _class.__proto__;

    _class.proxy = function (func) {
        var self = this;
        return (function() {
            return func.apply(self, arguments);
        })
    }
    _class.fn.proxy = _class.proxy;

    _class.include = function (obj) {
        var included = obj.included;
        for(var key in obj) {
            _class.fn[key] = obj[key];
        }
        if (included) included(_class);
    }

    _class.extend = function (obj) {
        var extended = obj.extended;
        for(var key in obj) {
            _class[key] = obj[key];
        }
        if (extended) extended(_class);
    }
    return _class;
}

var GUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

if(typeof Object.create !== 'function') {
    Object.create = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    }
}

var Persistence = {
    localCreate: function (_option, _f) {
        if (!this._checkObject(_option)) return;
        this._localRequest('CREATE', _option, _f);
    },
    localRead: function (_option, _f) {
        if (!this._checkObject(_option)) return;
        this._localRequest('READ', _option, _f);
    },
    localUpdate: function (_option, _f) {
        if (!this._checkObject(_option)) return;
        this._localRequest('UPDATE', _option, _f);
    },
    localDelete: function (_option, _f) {
        if (!this._checkObject(_option)) return;
        this._localRequest('DELETE', _option, _f);
    },
    remoteCreate: function (_option, _f) {
        var self = this;
        if (!this._checkUrl()) return;
        if (typeof _option !== 'object') {
            console.error('The first argument must be object');
            return;
        }
        _option = this._serialize(_option);
        if (arguments.length === 2 && typeof _f !== 'function') {   
            console.error('The second argument must be function');
            return;
        }
        this._request('POST', _option, _f);
    },
    remoteRead: function (_1, _2) {
        var self = this;
        if (!this._checkUrl()) return;
        if (arguments.length === 2) {
            _1 = (typeof _1 === 'object' ? '?' + this._serialize(_1) : '');
            if (_2 && typeof _2 !== 'function') {
                console.error('The second argument must be a function');
                return;
            }
            var _option = _1;
            var _f = _2;
        } else if (arguments.length === 1){
            if (typeof _1 === 'function') var _f = _1;
            else if (typeof _1 === 'object') var _option = _1;
        }
        this._request('GET', _option, _f);
    },
    remoteUpdate: function (_option, _f) {
        var self = this;
        if (!this._checkUrl()) return;
        if (typeof _option !== 'object') {
            console.error('The first argument must be object');
            return;
        }
        _option = this._serialize(_option);
        if (arguments.length === 2 && typeof _f !== 'function') {   
            console.error('The second argument must be function');
            return;
        }
        this._request('PUT', _option, _f);
    },
    remoteDelete: function (_1, _2) {
        var self = this;
        if (!this._checkUrl()) return;
        if (arguments.length === 2) {
            _1 = (typeof _1 === 'object' ? '?' + this._serialize(_1) : '');
            if (_2 && typeof _2 !== 'function') {
                console.error('The second argument must be a function');
                return;
            }
            var _option = _1;
            var _f = _2;
        } else if (arguments.length === 1){
            if (typeof _1 === 'function') var _f = _1;
            else if (typeof _1 === 'object') var _option = _1;
        }
        this._request('DELETE', _option, _f);
    },
    _checkUrl: function () {
        if (!this.$remoteUrl) {
            console.error('No $remoteUrl, please set it in component');
            return false;
        }
        return true;
    },
    _checkObject: function (_option) {
        if (typeof _option !== 'object') {
            console.error('The argument should be an object');
            return false;
        }
        return true;
    },
    _request: function (_type, _option, _f) {
        var self = this;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status === 200 && _f) _f.call(self, JSON.parse(req.responseText));
                else console.warn('Request failed, status: %d', req.status);
            }
        }
        var typeUrlMap = {
            'POST': this.$remoteUrl,
            'GET': this.$remoteUrl + (_option ? _option : ''),
            'PUT': this.$remoteUrl,
            'DELETE': this.$remoteUrl + (_option ? _option : '')
        };
        req.open(_type, typeUrlMap[_type], true);
        req.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
        if (_type === 'POST' || _type === 'PUT')
            req.send(_option);
        else
            req.send();
    },
    _localRequest: function (_type, _option, _f) {
        var _o = {}, temp;
        var typeMeMap = {
            'CREATE': function (i) {
                temp.push(_option[i]);
                localStorage[i] = JSON.stringify(temp);
                _o[i] = temp;
            },
            'READ': function (i) {
                _o[i] = JSON.parse(localStorage[i]);
            },
            'UPDATE': function (i) {
                var _id = _option[i]._id;
                temp[_id] = _content = _option[i]._content;
                localStorage[i] = JSON.stringify(temp);
                _o[i] = temp;
            },
            'DELETE': function (i) {
                temp.splice(_option[i], 1);
                localStorage[i] = JSON.stringify(temp);
                _o[i] = temp;
            }

        };
        for (var i in _option) {
            temp = JSON.parse(localStorage[i]);
            typeMeMap[_type].call(this, i);
        }
        if (_f && typeof _f === 'function') _f.call(this, Object.create(_o));
    },
    _serialize: function(obj, prefix) {
        var str = [];
        for(var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ? this._serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    },
    _updateState: function (obj) {
        for (var i in obj) this.state[i] = obj[i];
    }
};

var Model = new Class;

Model.extend({
    createInstance: function () {
        var i = Object.create(this.prototype);
        i.parent = this;
        i.createSelf.apply(i);
        i.initialState.apply(i, arguments);
        return i;
    },
    createClass: function (attrs) {
        var o = Object.create(this);
        o._records = {};
        o.parent = this;
        o.fn = o.prototype = Object.create(this.prototype);
        o.include(attrs || {});
        this.onCreated.apply(this);
        this.onInherited.call(this, o);
        return o;
    },
    addClassStatic: function (staticMethods) {
        for (var method in staticMethods) {
            this[method] = staticMethods[method];
        }
    },
    getRecord: function (id) {
        return this._records[id];
    },
    // callbacks
    onInherited : function () {},
    onCreated: function () {},
    onRecordCreated: function () {},
    onRecordChanged: function () {},
    onRecordDestroyed: function () {}
});

Model.include({
    init: function () {},
    createSelf: function () {
        if(!this._id) this._id = GUID();
        this.parent._records[this._id] = this;
        this.proxy(this.onCreated(this));
        this.parent.onRecordCreated(this);
        this.state = {};
    },
    initialState: function (s) {
        if (typeof s !== 'object') {
            console.warn('Parameter of createInstance should be an object.');
            return;
        }
        this.state = JSON.parse(JSON.stringify(s));
        this.proxy(this.onStateCreated(this));
        this.proxy(this._onStateCreated(this));
    },
    getState: function (attr) {
        if (!this.state[attr]) {
            console.warn('State attribute %s is not available.', attr);
            return null;
        }
        return this.state[attr];
    },
    setState: function (stateDiff) {
        stateDiff = stateDiff || {};
        if (typeof stateDiff !== 'object') {
            console.error('Parameter of setState should be an object.');
            return;
        }

        var old = {};
        old.state = {};

        for (var attr in stateDiff) {
            old.state[attr] = this.state[attr];
            this.state[attr] = stateDiff[attr];
        }

        this.$dirty = true;

        if (stateDiff) this.parent.onRecordChanged(this, old, stateDiff);
        this.proxy(this.onStateChanged(this, old, stateDiff));
        this.proxy(this._onStateChanged(this, old, stateDiff));

        this.$dirty = false;
    },
    destroy: function () {
        this.proxy(this.onStateDestroyed(this));
        this.proxy(this._onStateDestroyed(this));
        this.onDestroyed.apply(this);
        this.parent.onRecordDestroyed(this);

        delete this.parent._records[this._id];
    },
    // callbacks
    onCreated: function () {},
    onStateCreated: function () {},
    _onStateCreated: function () {},
    onStateChanged: function () {},
    _onStateChanged: function () {},
    onStateDestroyed: function () {},
    onDestroyed: function () {}
});

Model.include(Persistence);

var Selector = function (el, iel) {
    var o = {};
    // init
    iel = iel || '';
    var _query = el + ' ' + iel;
    o._el = document.querySelectorAll(_query);
    // each
    o.each = function (_f) {
        if (typeof _f !== 'function') return o;
        for (var i = 0; i < this._el.length; i++) {
            _f.apply(this._el[i]);
        };
        return o;
    }
    // html
    o.html = function (_html) {
        var self = this;
        if (_html) {
            self.each(function () {
                this.innerHTML = _html;
            });
            return o;
        } else {
            return self._el[0].innerHTML;
        }
    }
    // delegate
    o.delegate = function (_ie, _ev, _f) {
        var self = this;
        var _evs = _ev.split(' ');
        var _root = self._el[0];
        _evs.forEach(function (ev) {
            _root.addEventListener(ev, function (e) {
                var _el = e.target;
                var _pels = _root.querySelectorAll(_ie);
                for (var i = 0; i < _pels.length; i++) {
                    var _pel = _pels[i];
                    if (_el === _pel) return _f.call(_pel, event);
                }
            }, false);
        });
        return o;
    }
    // replace
    o.replace = function (_s) {
        if (this._el[0]) this._el[0].outerHTML = _s;
    }
    return o;
};

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
    var ifSta = /<(\S*?) ([^>]*)lk-if='([^\']*)'([^>]*)>(.*)<\/\1>/g;
    var notSta = /<(\S*?) ([^>]*)lk-not='([^\']*)'([^>]*)>(.*)<\/\1>/g;
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
            return sub.replace(_map[_op], function (m, tag, _r, _c, _s) {
                _c = 'this.' + _c.replace(/\{|\}/g, '');
                var _wrap = "<span " + _r + "lk-" + (_op === 'if' ? 'if' : 'not') + "\'"+ _c +"\'" + _s + " ><\/span>";
                if (_op === 'if') {
                    if ((new Function('return ' + _c)).apply(data) === false) return _wrap;
                }
                if (_op === 'not')
                    if ((new Function('return ' + _c)).apply(data) !== false) return _wrap;
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


var ViewModel = Model.createClass({
    _preElInner: function () {
        var self = this;
        // handle lk-on
        this._selectInScope('[lk-on]').each(function () {
            var emRaw = this.getAttribute('lk-on');
            var ems = emRaw.replace(/ /g, '').split(';').map(function (em) {
                return em.split(':');
            });;
            var tempGUID = GUID();
            this.classList.add('le-' + tempGUID);
            self._eventMap[tempGUID] = {
                ems: ems,
                elClass: '.le-' + tempGUID
            }
        });
        // handle lk-if/lk-not
        this._selectInScope('[lk-if], [lk-not]').each(function () {
            var tempGUID = GUID();
            this.classList.add('lm-' + tempGUID);
            self._stateElMap[tempGUID] = this.outerHTML;
        });
        // handle lk-for
        this._selectInScope('[lk-for]').each(function () {
            var tempGUID = GUID();
            this.classList.add('cs-' + tempGUID);
            self._controlMap[tempGUID] = this.outerHTML;
        });
        // handle wrap {{}}
        this._selectInScope('[lk-attr]').each(function () {
            var kvRaw = this.getAttribute('lk-attr');
            var kvs = kvRaw.replace(/ /g, '').split(';').map(function (kv) {
                return kv.split(':');
            });
            var tempGUID = GUID();
            this.classList.add('kv-' + tempGUID);
            self._kvMap[tempGUID] = {
                kvs: kvs,
                elClass: '.kv-' + tempGUID
            };
        });
        // save DOM class
        this._selectInScope('[lk-on], [lk-if], [lk-not], [lk-for], [lk-attr]').each (function () {
            this.setAttribute('_class', this.getAttribute('class'));
        });
        this._elInner = this._el.html().replace(/^ +/gm, '').replace(/\n/gm, '').trim();
        // handle no warp {{}}
        this._elInner = this._elInner.replace(/\{{2}([^\{\}]*)\}{2}(?=[^\}])|{{2}([^}]*)\}{2}$|\{{3}([^\{\}]*)\}{3}(?=[^\}])|{{3}([^}]*)\}{3}$/g, function (str) {
            var tempGUID = GUID();
            var tempStr = '<span class="lm-' + tempGUID + '">' + str + '</span>';
            self._stateElMap[tempGUID] = tempStr;
            return tempStr;
        });
        // handle lk-state
        self._el.delegate('[lk-state]', 'change paste input', function () {
            var key = this.getAttribute('lk-state');
            var value = this.value;
            if (this.type === 'checkbox') value = this.checked;
            if (this.type === 'radio') {
                value = this.checked;
                self._selectInScope('input[name=' + this.name + '][lk-state]:radio').each(function () {
                    var otherkey = this.getAttribute('lk-state');
                    self.state[otherkey] = !value;
                });
            }
            self.state[key] = value;
            if (self.$reactive) {
                self._renderPassivity();
            }
        });
    },
    _render: function (diff) {
        var self = this;
        this.$state = this.$state || {};
        if (diff) {
            self._renderPassivity();
        } else {
            for (var i in this.state) {this.$state[i] = this.state[i]}
            var afterRender = Template(this._elInner, this.$state);
            this._el.html(afterRender);
            this.onInitialRendered();
        }
        this._selectInScope('[lk-state]').each(function () {
            var key = this.getAttribute('lk-state');
            if (typeof self.state[key] === 'undefined') return;
            if (this.type === 'checkbox' || this.type === 'radio') 
                this.checked = self.state[key];
            else if (this.tagName !== 'INPUT')
                this.value = self.state[key];
            if (diff && diff[key] !== undefined) {
                this.value = diff[key];
            }
        });
        for (var i in this._kvMap) {
            var _t = this._kvMap[i];
            this._selectInScope(_t.elClass).each(function () {
                var _dom = this;
                for (var k in _t.kvs) {
                    var attr = _t.kvs[k][0], value = _t.kvs[k][1];
                    if (attr === 'class') {
                        var _saved = _dom.getAttribute('_class');
                        var _l = value.split(',');
                        for (var m in _l) _saved += (' ' + self.state[_l[m]]);
                        _dom.setAttribute('class', _saved);
                    } else {
                        var _saved = '';
                        _dom.setAttribute(attr, value);
                    }
                }
            });
        }
    },
    _delegateEvents: function () {
        var self = this;
        for (var i in this._eventMap) {
            var eleName = this._eventMap[i]['elClass'];
            var ems = this._eventMap[i]['ems'];
            ems.forEach(function (em) {
                var key = em[0], listenWrap = em[1];
                var tester = /(.*\(\$index\).*)/g;
                var listen = listenWrap.replace('($index)', '');
                if (!self[listen]) {
                    console.error('Can not solve %s, create it in createClass of ViewModel', listen);
                    return;
                }
                if (tester.test(listenWrap)) {
                    self._el.delegate(eleName, key, function (e) {
                        var className = e.target.className;
                        var index = [].indexOf.call(document.querySelectorAll("." + className), e.target);
                        self.proxy(self[listen].call(self, index));
                    });
                } else {
                    self._el.delegate(eleName, key, self.proxy(self[listen]));
                }
            });
        }
    },
    _renderPassivity: function () {
        for (var i in this.state) {this.$state[i] = this.state[i]}
        for (var i in this._stateElMap) {
            var afterRender = Template(this._stateElMap[i], this.$state);
            this._selectInScope('.lm-' + i).replace(afterRender);
        }
        for (var i in this._controlMap) {
            var afterRender = Template(this._controlMap[i], this.$state);
            this._selectInScope('.cs-' + i).replace(afterRender);
        }
    },
    _onStateChanged: function () {
        this._render(arguments[2]);
    },
    _selectInScope: function (selector) {
        return Selector(this.$el, selector);
    },
    onInitialRendered: function () {}
});


ViewModel.addClassStatic({
    createComponent: function (attrs) {
        var o = this.createClass();
        for (var i in attrs) o.prototype[i] = attrs[i];
        return o;
    },
    bindElement: function (el, state) {
        var o = this.createInstance(state || {});
        o.$el = el;
        o._el = Selector(el);
        o._elInner = o._el.html();
        o._eventMap = {};
        o._stateElMap = {};
        o._controlMap = {};
        o._elStateMap = {};
        o._kvMap = {};

        o._preElInner();
        o._render();
        o._delegateEvents();
        return o;
    }
});

var LiKy = ViewModel;

if (typeof module !== 'undefined' && typeof exports === 'object') {
    // CommonJS and CommonJS-like
    module.exports = LiKy;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function () { return LiKy;});
} else {
    // Global
    this.LiKy = LiKy;
}

}).call(function () { return this || (typeof window !== 'undefined' ? window : global);}());