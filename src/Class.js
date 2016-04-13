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

module.exports = Class;