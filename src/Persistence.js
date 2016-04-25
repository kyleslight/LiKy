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
module.exports = Persistence;