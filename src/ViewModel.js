var Model = require('./Model.js');
var GUID = require('./GUID.js');
var Selector = require('./Selector.js');
var Template = require('./Template.js');

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

module.exports = ViewModel;