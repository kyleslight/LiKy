
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

module.exports = Selector;