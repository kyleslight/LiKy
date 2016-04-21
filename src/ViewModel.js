var Model = require('./Model.js');
var GUID = require('./GUID.js');
var $ = require('jquery');
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
            $(this).addClass('le-' + tempGUID);
            self._eventMap[tempGUID] = {
                ems: ems,
                elClass: '.le-' + tempGUID
            }
        });
        // handle {{}}
        this._elInner = this._el.html().replace(/^ +/gm, '').replace(/\n/gm, '').trim();
        this._elInner = Template.tagPair(self._elInner, 'for').map(function (sub) {
            if (!/lk-for/.test(sub)) return sub;
            var tempGUID = GUID();
            var tempStr = '<span class="cs-' + tempGUID + '">' + sub + '</span>';
            self._controlMap[tempGUID] = tempStr;
            return tempStr;
        }).join('');
        this._elInner = this._elInner.replace(/\{\{([^\}\}]+)?\}\}(?=[^}])|\{\{\{([^\}\}\}]+)?\}\}\}/g, function (str) {
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
                $(this).val(self.state[key]);
            if (diff && diff[key] !== undefined) {
                $(this).val(diff[key]);
            }
        });
        this._selectInScope('[lk-hide]').each(function () {
            var key = this.getAttribute('lk-hide');
            if (key === 'false') return;
            $(this).hide();
        });
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
            this._selectInScope('.lm-' + i).html(afterRender);
        }
        for (var i in this._controlMap) {
            var afterRender = Template(this._controlMap[i], this.$state);
            afterRender = $(afterRender).html();
            this._selectInScope('.cs-' + i).html(afterRender);
        }
    },
    _onStateChanged: function () {
        this._render(arguments[2]);
    },
    _selectInScope: function (selector) {
        return $(selector, this._el);
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
        o._el = $(el);
        o._elInner = o._el.html();
        o._eventMap = {};
        o._stateElMap = {};
        o._controlMap = {};
        o._elStateMap = {};

        o._preElInner();
        o._render();
        o._delegateEvents();
        return o;
    }
});

module.exports = ViewModel;