var Class = require('./Class.js');
var GUID = require('./GUID.js');
var Persistence = require('./Persistence.js');

if(typeof Object.create !== 'function') {
    Object.create = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    }
}

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

Model.include(Persistence);

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
    // P
    remoteRead: function (_f, _option) {
        var self = this;
        if (!this.$remoteUrl) {
            console.error('No $remoteUrl, please set it in component');
            return;
        }
        if (typeof _f !== 'function') {
            console.error('The first argument must be a function');
            return;
        }
        _option = (typeof _option === 'object' ? this._serialize(_option) : '');
        var res = new XMLHttpRequest();
        res.onreadystatechange = function () {
            if (res.readyState === 4) {
                if (res.status === 200) {
                    _f.call(self, JSON.parse(res.responseText));
                }
                else
                    console.warn('Request failed, status: %d', res.status);
            }

        };
        res.open('GET', this.$remoteUrl + '?' + _option, true);
        res.send();
    },
    _serialize: function(obj, prefix) {
        var str = [];
        for(var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    },
    _updateState: function (obj) {
        for (var i in obj) this.state[i] = obj[i];
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

module.exports = Model;