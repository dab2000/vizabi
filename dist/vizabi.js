/* VIZABI - http://www.gapminder.org - 2015-05-25 */

/*!
 * VIZABI MAIN
 */

(function() {

    "use strict";

    var root = this;
    var previous = root.Vizabi;

    var Vizabi = function(tool, placeholder, options) {
        return startTool(tool, placeholder, options);
    };

    //stores reference to each tool on the page
    Vizabi._instances = {};

    function startTool(name, placeholder, options) {
        var tool = Vizabi.Tool.get(name);
        if (tool) {
            var t = new tool(placeholder, options);
            Vizabi._instances[t._id] = t;
            return t;
        } else {
            Vizabi.utils.error('Tool "' + name + '" was not found.');
        }
    }

    //TODO: clear all objects and intervals as well
    //garbage collection
    Vizabi.clearInstances = function(id) {
        if (id) {
            delete Vizabi._instances[id];
        } else {
            Vizabi._instances = {};
        }
    }

    /*
     * throws a warning if the required variable is not defined
     * returns false if the required variable is not defined
     * returns true if the required variable is defined
     * @param variable
     * @returns {Boolean}
     */
    Vizabi._require = function(variable) {
        if (typeof root[variable] === 'undefined') {
            Vizabi.utils.warn(variable + " is required and could not be found.");
            return false;
        }
        return true;
    }

    //if AMD define
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Vizabi;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = Vizabi;
    }

    root.Vizabi = Vizabi;

}).call(this);
/*!
 * VIZABI UTILS
 * Util functions
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;

    Vizabi.utils = {

        /*
         * returns unique id with optional prefix
         * @param {String} prefix
         * @returns {String} id
         */
        uniqueId: (function() {
            var id = 0;
            return function(p) {
                return (p) ? p + id++ : id++;
            };
        })(),

        /*
         * checks whether obj is a DOM element
         * @param {Object} obj
         * @returns {Boolean}
         * from underscore: https://github.com/jashkenas/underscore/blob/master/underscore.js
         */
        isElement: function(obj) {
            return !!(obj && obj.nodeType === 1);
        },

        /*
         * checks whether obj is an Array
         * @param {Object} obj
         * @returns {Boolean}
         * from underscore: https://github.com/jashkenas/underscore/blob/master/underscore.js
         */
        isArray: Array.isArray || function(obj) {
            return toString.call(obj) === '[object Array]';
        },

        /*
         * checks whether obj is an object
         * @param {Object} obj
         * @returns {Boolean}
         * from underscore: https://github.com/jashkenas/underscore/blob/master/underscore.js
         */
        isObject: function(obj) {
            var type = typeof obj;
            return type === 'object' && !!obj;
        },

        /*
         * checks whether obj is a date
         * @param {Object} obj
         * @returns {Boolean}
         */
        isDate: function(obj) {
            return (obj instanceof Date);
        },

        /*
         * checks whether obj is a plain object {}
         * @param {Object} obj
         * @returns {Boolean}
         */
        isPlainObject: function(obj) {
            return obj != null &&
                Object.prototype.toString.call(obj) === "[object Object]";
        },

        /*
         * loops through an object or array
         * @param {Object|Array} obj object or array
         * @param {Function} callback callback function
         * @param {Object} ctx context object
         */
        forEach: function(obj, callback, ctx) {
            if (!obj) return;
            if (this.isArray(obj)) {
                var i;
                for (i = 0; i < obj.length; i++) {
                    if (callback.apply(ctx, [obj[i], i]) === false) {
                        break;
                    }
                }
            } else {
                for (var item in obj) {
                    if (callback.apply(ctx, [obj[item], item]) === false) {
                        break;
                    }
                }
            }
        },

        /*
         * extends an object
         * @param {Object} destination object
         * @returns {Object} extented object
         */
        extend: function(dest) {
            //objects to overwrite dest are next arguments 
            var objs = Array.prototype.slice.call(arguments, 1);
            var _this = this;
            //loop through each obj and each argument, left to right
            this.forEach(objs, function(obj, i) {
                _this.forEach(obj, function(value, k) {
                    if (obj.hasOwnProperty(k)) {
                        dest[k] = value;
                    }
                });
            });
            return dest;
        },

        /*
         * merges objects instead of replacing
         * @param {Object} destination object
         * @returns {Object} merged object
         */
        merge: function(dest) {
            //objects to overwrite dest are next arguments 
            var objs = Array.prototype.slice.call(arguments, 1);
            var _this = this;
            //loop through each obj and each argument, left to right
            this.forEach(objs, function(obj, i) {
                _this.forEach(obj, function(value, k) {
                    if (obj.hasOwnProperty(k)) {
                        if (dest.hasOwnProperty(k)) {
                            if (!_this.isArray(dest[k])) {
                                dest[k] = [dest[k]];
                            }
                            dest[k].push(value);
                        } else {
                            dest[k] = value;
                        }
                    }
                });
            });
            return dest;
        },

        /*
         * clones an object (shallow copy)
         * @param {Object} src original object
         * @param {Array} arr filter keys
         * @returns {Object} cloned object
         */
        clone: function(src, arr) {
            if(this.isArray(src)) {
                return src.slice(0);
            }
            var clone = {};
            this.forEach(src, function(value, k) {
                if (arr && arr.indexOf(k) === -1) {
                    return;
                }
                if (src.hasOwnProperty(k)) {
                    clone[k] = value;
                }
            });
            return clone;
        },

        /*
         * deep clones an object (deep copy)
         * @param {Object} src original object
         * @returns {Object} cloned object
         */
        deepClone: function(src) {
            var clone = {};
            var _this = this;
            this.forEach(src, function(value, k) {
                if (src.hasOwnProperty(k)) {
                    if (_this.isObject(value) || _this.isArray(value)) {
                        clone[k] = _this.deepClone(value);
                    } else {
                        clone[k] = value;
                    }
                }
            });
            return clone;
        },

        /*
         * Prints message to timestamp
         * @param {Arr} arr
         * @param {Object} el
         */
        without: function(arr, el) {
            var idx = arr.indexOf(el);
            if (idx !== -1) arr.splice(idx, 1);
            return arr;
        },

        /*
         * unique items in an array
         * @param {Array} arr original array
         * @param {Function} func optional evaluation function
         * @returns {Array} unique items
         * Based on:
         * http://stackoverflow.com/questions/1960473/unique-values-in-an-array
         */
        unique: function(arr, func) {
            var u = {};
            var a = [];
            if (!func) {
                func = function(d) {
                    return d
                };
            }
            for (var i = 0, l = arr.length; i < l; ++i) {
                var key = func(arr[i]);
                if (u.hasOwnProperty(key)) {
                    continue;
                }
                a.push(arr[i]);
                u[key] = 1;
            }
            return a;
        },

        /*
         * returns first value that passes the test
         * @param {Array} arr original collection
         * @returns {Function} func test function
         */
        find: function(arr, func) {
            var found;
            this.forEach(arr, function(i) {
                if (func(i)) {
                    found = i
                    return false; //break
                }
            });
            return found;
        },

        /*
         * filters an array based on object properties
         * @param {Array} arr original array
         * @returns {Object} filter properties to use as filter
         */
        filter: function(arr, filter) {
            return arr.filter(function(i) {
                for (var f in filter) {
                    if (i[f] !== filter[f]) return false;
                }
                return true;
            });
        },

        /*
         * Prints message to timestamp
         * @param {String} message
         */
        timeStamp: function(message) {
            if (root.console && typeof root.console.timeStamp === "function") {
                root.console.timeStamp(message);
            }
        },

        /*
         * Prints warning
         * @param {String} message
         */
        warn: function(message) {
            if (root.console && typeof root.console.warn === "function") {
                root.console.warn(message);
            }
        },

        /*
         * Prints message for group
         * @param {String} message
         */
        groupCollapsed: function(message) {
            if (root.console && typeof root.console.groupCollapsed === "function") {
                root.console.groupCollapsed(message);
            }
        },

        /*
         * Prints end of group
         * @param {String} message
         */
        groupEnd: function() {
            if (root.console && typeof root.console.groupEnd === "function") {
                root.console.groupEnd();
            }
        },

        /*
         * Prints error
         * @param {String} message
         */
        error: function(message) {
            if (root.console && typeof root.console.error === "function") {
                root.console.error(message);
            }
        },

        /*
         * Count the number of decimal numbers
         * @param {Number} number
         */
        countDecimals: function(number) {
            if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
            return number.toString().split(".")[1].length || 0;
        },

        /*
         * Adds class to DOM element
         * @param {Element} el
         * @param {String} className 
         */
        addClass: function(el, className) {
            if (el.classList) {
                el.classList.add(className);
            } else { //IE<10
                el.className += ' ' + className;
            }
        },

        /*
         * Remove class from DOM element
         * @param {Element} el
         * @param {String} className 
         */
        removeClass: function(el, className) {
            if (el.classList) {
                el.classList.remove(className);
            } else { //IE<10
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        },

        /*
         * Throttles a function
         * @param {Function} func
         * @param {Number} ms duration 
         */
        throttle: (function() {
            var isThrottled = {};
            return function(func, ms) {
                if (isThrottled[func]) {
                    return
                };
                isThrottled[func] = true;
                setTimeout(function() {
                    isThrottled[func] = false;
                }, ms);
                func();
            }
        })(),

        /*
         * Checks whether a DOM element has a class or not
         * @param {Element} el
         * @param {String} className 
         * @return {Boolean}
         */
        hasClass: function(el, className) {
            if (el.classList) {
                return el.classList.contains(className);
            } else { //IE<10
                return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
            }
        },

        /*
         * returns the values of an object in an array format
         * @param {Object} obj
         * @return {Array}
         */
        values: function(obj) {
            var arr;
            for (var i in obj) {
                (arr = arr || []).push(obj[i])
            };
            return arr;
        },

        /*
         * Defers a function
         * @param {Function} func
         */
        defer: function(func) {
            setTimeout(func, 1);
        },

        /*
         * Performs an ajax request
         * @param {Object} options
         * @param {String} className 
         * @return {Boolean}
         */
        ajax: function(options) {
            var request = new XMLHttpRequest();
            request.open(options.method, options.url, true);
            if (options.method === "POST") {
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            }
            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    var data = (options.json) ? JSON.parse(request.responseText) : request.responseText;
                    if (options.success) options.success(data);
                } else {
                    if (options.error) options.error();
                }
            };
            request.onerror = function() {
                if (options.error) options.error();
            };
            request.send(options.data);
        },

        /*
         * Performs a GET http request
         */
        get: function(url, pars, success, error, json) {
            var pars = [];
            this.forEach(pars, function(value, key) {
                pars.push(key + "=" + value);
            });
            url = (pars.length) ? url + "?" + pars.join("&") : url;
            this.ajax({
                method: "GET",
                url: url,
                success: success,
                error: error,
                json: json
            });
        },

        /*
         * Performs a POST http request
         */
        post: function(url, pars, success, error, json) {
            this.ajax({
                method: "POST",
                url: url,
                success: success,
                error: error,
                json: json,
                data: pars
            });
        }


    };

}).call(this);
/*!
 * VIZABI PROMISES
 * Util functions
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;

    /*
     * Modified version of promises from
     * @Author: dm.yang
     * https://github.com/chemdemo/promiseA
     */

    ;
    (function(root, factory) {
        if (typeof module !== 'undefined' && module.exports) { // CommonJS
            module.exports = factory();
        } else if (typeof define === 'function' && define.amd) { // AMD / RequireJS
            define(factory);
        } else {
            root.Promise = factory.call(root);
        }
    }(Vizabi, function() {
        'use strict';

        function Promise(resolver) {
            if (!(this instanceof Promise)) return new Promise(resolver);

            this.status = 'pending';
            this.value;
            this.reason;

            // then may be called multiple times on the same promise
            this._resolves = [];
            this._rejects = [];

            if (isFn(resolver)) resolver(this.resolve.bind(this), this.reject.bind(this));

            return this;
        };

        Promise.prototype.then = function(resolve, reject) {
            var next = this._next || (this._next = Promise());
            var status = this.status;
            var x;

            if ('pending' === status) {
                isFn(resolve) && this._resolves.push(resolve);
                isFn(reject) && this._rejects.push(reject);
                return next;
            }

            if ('resolved' === status) {
                if (!isFn(resolve)) {
                    next.resolve(resolve);
                } else {
                    try {
                        x = resolve(this.value);
                        resolveX(next, x);
                    } catch (e) {
                        this.reject(e);
                    }
                }
                return next;
            }

            if ('rejected' === status) {
                if (!isFn(reject)) {
                    next.reject(reject);
                } else {
                    try {
                        x = reject(this.reason);
                        resolveX(next, x);
                    } catch (e) {
                        this.reject(e);
                    }
                }
                return next;
            }
        };

        Promise.prototype.resolve = function(value) {
            if ('rejected' === this.status) throw Error('Illegal call.');

            this.status = 'resolved';
            this.value = value;

            this._resolves.length && fireQ(this);

            return this;
        };

        Promise.prototype.reject = function(reason) {
            if ('resolved' === this.status) throw Error('Illegal call.');

            this.status = 'rejected';
            this.reason = reason;

            this._rejects.length && fireQ(this);

            return this;
        };

        // shortcut of promise.then(undefined, reject)
        Promise.prototype.catch = function(reject) {
            return this.then(void 0, reject);
        };

        // return a promise with another promise passing in
        Promise.cast = function(arg) {
            var p = Promise();

            if (arg instanceof Promise) return resolvePromise(p, arg);
            else return Promise.resolve(arg);
        };

        // return a promise which resolved with arg
        // the arg maybe a thanable object or thanable function or other
        Promise.resolve = function(arg) {
            var p = Promise();

            if (isThenable(arg)) return resolveThen(p, arg);
            else return p.resolve(arg);
        };

        // accept a promises array,
        // return a promise which will resolsed with all promises's value,
        // if any promise passed rejectd, the returned promise will rejected with the same reason
        Promise.all = function(promises) {
            var len = promises.length;
            var promise = Promise();
            var r = [];
            var pending = 0;
            var locked;

            var test = promises;

            //modified
            utils.forEach(promises, function(p, i) {
                p.then(function(v) {
                    r[i] = v;
                    if (++pending === len && !locked) promise.resolve(r);
                }, function(e) {
                    locked = true;
                    promise.reject(e);
                });
            });

            return promise;
        };

        // accept a promises array,
        // return a promise which will resolsed with the first resolved promise passed,
        // if any promise passed rejectd, the returned promise will rejected with the same reason
        Promise.any = function(promises) {
            var promise = Promise();
            var called;

            //modified
            utils.forEach(promises, function(p, i) {
                p.then(function(v) {
                    if (!called) {
                        promise.resolve(v);
                        called = true;
                    }
                }, function(e) {
                    called = true;
                    promise.reject(e);
                });
            });

            return promise;
        };

        // return a promise which reject with reason
        // reason must be an instance of Error object
        Promise.reject = function(reason) {
            if (!(reason instanceof Error)) throw Error('reason must be an instance of Error');

            var p = Promise();

            p.reject(reason);

            return p;
        };

        function resolveX(promise, x) {
            if (x === promise) promise.reject(new Error('TypeError'));

            if (x instanceof Promise) return resolvePromise(promise, x);
            else if (isThenable(x)) return resolveThen(promise, x);
            else return promise.resolve(x);
        };

        function resolvePromise(promise1, promise2) {
            var status = promise2.status;

            if ('pending' === status) {
                promise2.then(promise1.resolve.bind(promise1), promise1.reject.bind(promise1));
            }
            if ('resolved' === status) promise1.resolve(promise2.value);
            if ('rejected' === status) promise1.reject(promise2.reason);

            return promise;
        };

        function resolveThen(promise, thanable) {
            var called;
            var resolve = once(function(x) {
                if (called) return;
                resolveX(promise, x);
                called = true;
            });
            var reject = once(function(r) {
                if (called) return;
                promise.reject(r);
                called = true;
            });

            try {
                thanable.then.call(thanable, resolve, reject);
            } catch (e) {
                if (!called) throw e;
                else promise.reject(e);
            }

            return promise;
        };

        function fireQ(promise) {
            var status = promise.status;
            var queue = promise['resolved' === status ? '_resolves' : '_rejects'];
            var arg = promise['resolved' === status ? 'value' : 'reason'];
            var fn;
            var x;

            while (fn = queue.shift()) {
                x = fn.call(promise, arg);
                x && resolveX(promise._next, x);
            }

            return promise;
        };

        function noop() {};

        function isFn(fn) {
            return 'function' === type(fn);
        };

        function isObj(o) {
            return 'object' === type(o);
        };

        function type(obj) {
            var o = {};
            return o.toString.call(obj).replace(/\[object (\w+)\]/, '$1').toLowerCase();
        };

        function isThenable(obj) {
            return obj && obj.then && isFn(obj.then);
        };

        function once(fn) {
            var called;
            var r;

            return function() {
                if (called) return r;
                called = true;
                return r = fn.apply(this, arguments);
            };
        };

        return Promise;
    }));

}).call(this);
/*!
 * VIZABI CLASS
 * Base class
 * Based on Simple JavaScript Inheritance by John Resig
 * Source http://ejohn.org/blog/simple-javascript-inheritance/
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var initializing = false;

    var fnTest = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    function extend(name, extensions) {
        //in case there are two args
        extensions = (arguments.length === 1) ? name : extensions;
        var _super = this.prototype;

        initializing = true;
        var prototype = new this();
        initializing = false;

        Vizabi.utils.forEach(extensions, function(method, name) {
            if (typeof extensions[name] == "function" && typeof _super[name] == "function" && fnTest.test(extensions[name])) {
                prototype[name] = (function(name, fn) {
                    return function() {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, extensions[name]);
            } else {
                prototype[name] = method;
            }
        });

        function Class() {
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = extend;
        Class._collection = {};
        Class.register = function(name, code) {
            if (typeof this._collection[name] !== 'undefined') {
                Vizabi.utils.warn('"'+ name +'" is already registered. Overwriting...');
            }
            this._collection[name] = code;
        };
        Class.unregister = function(name) {
            delete this._collection[name];
        };
        Class.getCollection = function() {
            return this._collection;
        };
        Class.get = function(name, silent) {
            if (this._collection.hasOwnProperty(name)) {
                return this._collection[name];
            }
            if(!silent) {
                Vizabi.utils.warn('"'+ name +'" was not found.');
            }
            return false;
        };

        //register extension by name
        if (arguments.length > 1 && this.register) {
            this.register(name, Class);
        }

        return Class;
    }

    Vizabi.Class = function() {};
    Vizabi.Class.extend = extend;

}).call(this);
/*!
 * VIZABI DATA
 * Manages data
 */

(function() {

    "use strict";
    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;
    var Promise = Vizabi.Promise;

    var readersList = {};

    var Data = Vizabi.Class.extend({

        /**
         * Initializes the data manager.
         */
        init: function() {
            this._data = {};
        },

        /**
         * Loads resource from reader or cache
         * @param {Array} query Array with queries to be loaded
         * @param {String} language Language
         * @param {Object} reader Which reader to use - data reader info
         * @param {String} path Where data is located
         */
        load: function(query, language, reader, evts) {

            var _this = this;
            var promise = new Promise();
            var wait = Promise.all([]);
            var cached = this.isCached(query, language, reader);
            var loaded = false;

            //if result is cached, dont load anything
            if (!cached) {
                utils.timeStamp("Vizabi Data: Loading Data");

                if (evts && typeof evts.load_start === 'function') {
                    evts.load_start();
                }
                wait = new Promise();
                this.loadFromReader(query, language, reader).then(function(queryId) {
                    loaded = true;
                    cached = queryId;
                    wait.resolve();
                });
            }

            wait.then(
                function() {
                    //pass the data forward
                    var data = _this.get(cached);
                    promise.resolve(data);
                    //not loading anymore
                    if (loaded && evts && typeof evts.load_end === 'function') {
                        evts.load_end();
                    }
                },
                function() {
                    promise.reject('Error loading file...');
                    //not loading anymore
                    if (loaded && evts && typeof evts.load_end === 'function') {
                        evts.load_end();
                    }
                });
            return promise;
        },

        /**
         * Loads resource from reader
         * @param {Array} query Array with queries to be loaded
         * @param {String} lang Language
         * @param {Object} reader Which reader to use. E.g.: "local-json"
         * @param {String} path Where data is located
         */

        loadFromReader: function(query, lang, reader) {
            var _this = this;
            var promise = new Promise();
            var reader_name = reader.reader;
            var queryId = idQuery(query, lang, reader);

            if (!readersList.hasOwnProperty(reader_name)) {
                utils.error('Vizabi Reader ' + reader_name + ' not found');
                return;
            }

            var r = new readersList[reader_name](reader);
            r.read(query, lang).then(function() {
                    //success reading
                    var values = r.getData();
                    var q = query;

                    var query_region = (q.select.indexOf("geo.region") !== -1);

                    //make sure all queried is returned
                    values = values.map(function(d) {
                        for (var i = 0; i < q.select.length; i++) {
                            var col = q.select[i];
                            if (typeof d[col] === 'undefined') {
                                d[col] = null;
                            }
                        }
                        return d;
                    });

                    values = values.map(function(d) {
                        if (d.geo === null) d.geo = d["geo.name"];
                        if (query_region && d["geo.region"] === null) {
                            d["geo.region"] = d.geo;
                        }
                        return d;
                    });
                    // convert time to Date()
                    values = values.map(function(d) {
                        d.time = new Date(d.time);
                        d.time.setHours(0);
                        return d;
                    });
                    // sort records by time
                    values.sort(function(a, b) {
                        return a.time - b.time;
                    });

                    _this._data[queryId] = values;
                    promise.resolve(queryId);
                },
                //error reading
                function(err) {
                    promise.reject(err);
                });

            return promise;
        },

        /**
         * Gets all items
         * @param queryId query identifier
         * @returns {Array} items
         */
        get: function(queryId) {
            if (queryId) {
                return this._data[queryId];
            }
            return this._data;
        },

        /**
         * Checks whether it's already cached
         * @returns {Boolean}
         */
        isCached: function(query, language, reader) {
            //encode in one string
            var q = idQuery(query, language, reader);
            //simply check if we have this in internal data
            if (Object.keys(this._data).indexOf(q) !== -1) {
                return q;
            }
            return false;
        },

        /**
         * Clears all data and querying
         */
        clear: function() {
            this._data = {};
        }
    });

    /**
     * Initializes the reader.
     * @param {Object} reader_info Information about the reader
     */
    var Reader = Vizabi.Class.extend({
        init: function(reader_info) {
            this._name = this._name || reader_info.reader;
            this._data = reader_info.data || [];
            this._basepath = this._basepath || reader_info.path || null;
        },

        /**
         * Reads from source
         * @param {Array} queries Queries to be performed
         * @param {String} language language
         * @returns a promise that will be resolved when data is read
         */
        read: function(queries, language) {
            return new Promise.resolve(this._data);
        },

        /**
         * Gets the data
         * @returns all data
         */
        getData: function() {
            return this._data;
        }

    });

    /**
     * Encodes query into a string
     */
    function idQuery(query, language, reader) {
        return JSON.stringify(query) + language + JSON.stringify(reader);
    }

    readersList = Reader._collection;
    Vizabi.Reader = Reader;
    Vizabi.Data = Data;

}).call(this);
/*!
 * VIZABI EVENTS
 * Manages Vizabi events
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;

    var _freezeAllEvents = false;
    var _frozenEventInstances = [];
    var _freezeAllExceptions = {};

    var Events = Vizabi.Class.extend({
        /**
         * Initializes the event class
         */
        init: function(config, parent) {

            this._id = this._id || utils.uniqueId('e');
            this._events = {};

            //freezing events
            this._freeze = false;
            this._freezer = [];
            this._freezeExceptions = {};
        },

        /**
         * Binds a callback function to an event
         * @param {String|Array} name name of event or array with names
         * @param {Function} func function to be linked with event
         */
        on: function(name, func) {
            var i;
            //bind multiple functions at the same time
            if (utils.isArray(func)) {
                for (i = 0; i < func.length; i++) {
                    this.on(name, func[i]);
                }
                return;
            }
            //bind multiple at a time
            if (utils.isArray(name)) {
                for (i = 0; i < name.length; i++) {
                    this.on(name[i], func);
                }
                return;
            }
            //multiple at a time with  object format
            if (utils.isObject(name)) {
                for (i in name) {
                    this.on(i, name[i]);
                }
                return;
            }

            this._events[name] = this._events[name] || [];
            
            if (typeof func === 'function') {
                this._events[name].push(func);
            } else {
                utils.warn("Can't bind event '" + name + "'. It must be a function.");
            }
        },

        /**
         * Unbinds all events associated with a name or a specific one
         * @param {String|Array} name name of event or array with names
         */
        unbind: function(name) {
            //unbind multiple at a time
            if (utils.isArray(name)) {
                for (var i = 0; i < name.length; i++) {
                    this.unbind(name[i]);
                }
                return;
            }
            if (this._events.hasOwnProperty(name)) {
                this._events[name] = [];
            }
        },

        /**
         * Unbinds all events
         */
        unbindAll: function() {
            this._events = {};
        },

        /**
         * Triggers an event, adding it to the buffer
         * @param {String|Array} name name of event or array with names
         * @param args Optional arguments (values to be passed)
         */
        trigger: function(name, args, original) {
            var i;
            if (utils.isArray(name)) {
                for (i = 0, size = name.length; i < size; i++) {
                    this.trigger(name[i], args);
                }
            } else {
                if (!this._events.hasOwnProperty(name)) return;
                for (i = 0; i < this._events[name].length; i++) {
                    var f = this._events[name][i];
                    //if not in buffer, add and execute
                    var _this = this;
                    var execute = function() {
                        var msg = "Vizabi Event: "+ name +" - "+ original;
                        utils.timeStamp(msg);
                        f.apply(_this, [(original || name), args]);
                    };

                    //TODO: improve readability of freezer code
                    //only execute if not frozen and exception doesnt exist
                    if (this._freeze || _freezeAllEvents) {
                        //if exception exists for freezing, execute
                        if ((_freezeAllEvents && _freezeAllExceptions.hasOwnProperty(name))
                            || (!_freezeAllEvents && this._freeze && this._freezeExceptions.hasOwnProperty(name))) {
                            execute();
                        }
                        //otherwise, freeze it
                        else {
                            this._freezer.push(execute);
                            if (_freezeAllEvents && !_frozenEventInstances[this._id]) {
                                this.freeze();
                                _frozenEventInstances[this._id] = this;
                            }
                        }
                    } else {
                        execute();
                    }
                }
            }
        },

        /**
         * Triggers an event and all parent events
         * @param {String|Array} name name of event or array with names
         * @param args Optional arguments (values to be passed)
         */
        triggerAll: function(name, args) {
            if (utils.isArray(name)) {
                for (var i = 0, size = name.length; i < size; i++) {
                    this.triggerAll(name[i], args);
                }
            } else {
                var original = name;
                var parts = name.split(":");
                while (parts.length) {
                    this.trigger(name, args, original);
                    parts.pop();
                    name = parts.join(":");
                }
            }
        },
        /**
         * Prevents all events from being triggered, buffering them
         */
        freeze: function(exceptions) {
            this._freeze = true;
            if (!exceptions) return;
            if (!utils.isArray(exceptions)) exceptions = [exceptions];
            for (var i = 0; i < exceptions.length; i++) {
                this._freezeExceptions[exceptions[i]] = true;
            }
        },

        /**
         * triggers all frozen events
         */
        unfreeze: function() {
            this._freeze = false;
            this._freezeExceptions = {};
            //execute old frozen events
            while (this._freezer.length) {
                var execute = this._freezer.shift();
                execute();
            }
        }

    });
    //generic event functions

    /**
     * freezes all events
     */
    Events.freezeAll = function(exceptions) {
        _freezeAllEvents = true;
        if (!exceptions) return;
        if (!utils.isArray(exceptions)) exceptions = [exceptions];
        utils.forEach(exceptions, function(e) {
            _freezeAllExceptions[e] = true;
        });
    };

    /**
     * triggers all frozen events form all instances
     */
    Events.unfreezeAll = function() {
        _freezeAllEvents = false;
        _freezeAllExceptions = {};

        //unfreeze all instances
        for (var i in _frozenEventInstances) {
            var instance = _frozenEventInstances[i];
            instance.unfreeze();
            delete _frozenEventInstances[i];
        }
    };

    Vizabi.Events = Events;

}).call(this);
/*!
 * VIZABI INTERVALS
 * Manages Vizabi layout profiles and classes
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;

    var Intervals = Vizabi.Class.extend({
        /**
         * Initializes intervals
         */
        init: function() {
            this.intervals = {};
        },
        /**
         * Sets an interval
         * @param {String} name name of interval
         * @param {Function} func function to be executed
         * @param {Number} duration duration in milliseconds
         */
        setInterval: function(name, func, duration) {
            this.clearInterval(name);
            this.intervals[name] = setInterval(func, duration);
        },
        /**
         * Clears an interval
         * @param {String} name name of interval to be removed
         */
        clearInterval: function(name) {
            return (name) ? clearInterval(this.intervals[name]) : this.clearAllIntervals();
        },
        /**
         * Clears all intervals
         */
        clearAllIntervals: function() {
            for (var i in this.intervals) {
                this.clearInterval(i);
            }
        }
    });

    Vizabi.Intervals = Intervals;

}).call(this);

/*!
 * VIZABI LAYOUT
 * Manages Vizabi layout profiles and classes
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;

    //classes are vzb-portrait, vzb-landscape...
    var class_prefix = "vzb-";
    var class_portrait = "vzb-portrait";
    var class_lansdcape = "vzb-landscape";

    var screen_sizes = {
        small: {
            min_width: 0,
            max_width: 749
        },
        medium: {
            min_width: 750,
            max_width: 969
        },
        large: {
            min_width: 970,
            max_width: Infinity
        }
    };

    var Layout = Vizabi.Events.extend({

        /**
         * Initializes the layout manager
         */
        init: function() {

            this._container = null; //dom element
            this._curr_profile = null;
            this._prev_size = {};

            //resize when window resizes
            var _this = this;

            root.addEventListener('resize', function() {
                if (_this.container) {
                    _this.setSize();
                }
            });

            this._super();
        },

        /**
         * Calculates the size of the newly resized container
         */
        setSize: function() {
            var _this = this;
            var width = this._container.clientWidth;
            var height = this._container.clientHeight;

            if (this._prev_size && this._prev_size.width === width && this._prev_size.height === height) return;

            utils.forEach(screen_sizes, function(range, size) {
                //remove class
                utils.removeClass(_this._container, class_prefix + size);
                //find best fit
                if (width >= range.min_width && width <= range.max_width) {
                    _this._curr_profile = size;
                }
            });

            //update size class
            utils.addClass(this._container, class_prefix+this._curr_profile);

            //toggle, untoggle classes based on orientation
             if(width < height) {
                utils.addClass(this._container, class_portrait);
                utils.removeClass(this._container, class_lansdcape);
            }
            else {
                utils.addClass(this._container, class_lansdcape);
                utils.removeClass(this._container, class_portrait);
            }

            this._prev_size.width = width;
            this._prev_size.height = height;

            this.trigger('resize');
        },

        /**
         * Sets the container for this layout
         * @param container DOM element
         */
        setContainer: function(container) {
            this._container = container;
            this.setSize();
        },

        /**
         * Gets the current selected profile
         * @returns {String} name of current profile
         */
        currentProfile: function() {
            return this._curr_profile;
        }

    });

    Vizabi.Layout = Layout;

}).call(this);
/*!
 * VIZABI MODEL
 * Base Model
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var Promise = Vizabi.Promise;
    var utils = Vizabi.utils;

    //names of reserved hook properties
    var HOOK_PROPERTY = 'use';
    var HOOK_VALUE = 'value';

    //warn client if d3 is not defined
    Vizabi._require('d3');

    var Model = Vizabi.Events.extend({

        /**
         * Initializes the model.
         * @param {Object} values The initial values of this model
         * @param {Object} parent reference to parent
         * @param {Object} bind Initial events to bind
         */

        init: function(values, parent, bind) {
            this._type = this._type || "model";
            this._id = this._id || utils.uniqueId("m");
            this._data = {}; //holds attributes of this model
            this._parent = parent;
            this._set = false;
            this._ready = false;
            this._readyOnce = false; //has this model ever been ready?
            this._loadedOnce = false;
            this._loading = []; //array of processes that are loading
            this._intervals = getIntervals(this);
            //holds the list of dependencies for virtual models
            this._deps = { parent: [], children: []};

            //will the model be hooked to data?
            this._hooks = {};
            this._items = []; //holds hook items for this hook
            this._unique = {}; //stores unique values per column
            this._filtered = {}; //stores filtered values
            this._limits = {}; //stores limit values

            this._super();

            //bind initial events
            if (bind) {
                this.on(bind);
            }

            //initial values
            if (values) {
                this.set(values);
            }

        },

        /* ==========================
         * Getters and Setters
         * ==========================
         */

        /**
         * Gets an attribute from this model or all fields.
         * @param attr Optional attribute
         * @returns attr value or all values if attr is undefined
         */
        get: function(attr) {
            if (!attr) {
                return this._data;
            }
            return this._data[attr];
        },

        /**
         * Sets an attribute or multiple for this model (inspired by Backbone)
         * @param attr property name
         * @param val property value (object or value)
         * @returns defer defer that will be resolved when set is done
         */
        set: function(attr, val, force) {

            var events = [],
                changes = [],
                setting = this._setting,
                _this = this,
                attrs;

            //expect object as default
            if (!utils.isPlainObject(attr)) {
                (attrs = {})[attr] = val;
            } else {
                attrs = attr;
                force = val;
            }

            //if it's the first time we are setting this, check previous
            if (!setting) {
                this._prevData = utils.clone(this._data);
                this._changedData = {};
            }

            this._setting = true; //we are currently setting the model
            this.setReady(false);

            //compute each change
            for (var a in attrs) {
                var val = attrs[a];
                var curr = this._data[a];
                var prev = this._prevData[a];

                //if its a regular value
                if (!utils.isPlainObject(val) || utils.isArray(val)) {
                    //change if it's not the same value
                    if (curr !== val || force || JSON.stringify(curr) !== JSON.stringify(val)) {
                        var p = (typeof curr === 'undefined') ? 'init' : 'change';
                        events.push(p + ":" + a);
                    }
                    if (prev !== val || force || JSON.stringify(prev) !== JSON.stringify(val)) {
                        this._changedData[a] = val;
                    } else {
                        delete this._changedData[a];
                    }
                    this._data[a] = val;
                }
                //if it's an object, it's a submodel
                else {
                    if (curr && isModel(curr)) {
                        events.push('change:' + a);
                        this._data[a].set(val, force);
                    }
                    //submodel doesnt exist, create it
                    else {
                        events.push('init:' + a);
                        this._data[a] = initSubmodel(a, val, this);
                    }
                }
            }

            bindSettersGetters(this);

            //for tool model when setting for the first time
            if (this.validate && !setting) {
                this.validate();
            }

            if (!setting || force) {
                //trigger set if not set
                if (!this._set) {
                    this._set = true;
                    events.push("set");
                } else if (events.length) {
                    events.push("change");
                }

                _this.triggerAll(events, _this.getObject());
                _this._setting = false;

                if (!this.isHook()) {
                    this.setReady();
                }
            }
        },

        /**
         * Gets the type of this model
         * @returns {String} type of the model
         */
        getType: function() {
            return this._type;
        },

        /**
         * Gets all submodels of the current model
         */
        getSubmodels: function() {
            var submodels = [];
            utils.forEach(this._data, function(s) {
                if (s && typeof s._id !== 'undefined') {
                    submodels.push(s);
                }
            });
            return submodels;
        },

        /**
         * Gets the current model and submodel values as a JS object
         * @returns {Object} All model as JS object
         */
        getObject: function() {
            var obj = {};
            for (var i in this._data) {
                //if it's a submodel
                if (this._data[i] && typeof this._data[i].getObject === 'function') {
                    obj[i] = this._data[i].getObject();
                } else {
                    obj[i] = this._data[i];
                }
            }
            return obj;
        },

        /**
         * Clears this model, submodels, data and events
         */
        clear: function() {
            var submodels = this.getSubmodels();
            for (var i in submodels) {
                submodels[i].clear();
            }
            this.setReady(false);
            this.unbindAll();
            this._intervals.clearAllIntervals();
            this._data = {};
        },

        /**
         * Validates data.
         * Interface for the validation function implemented by a model
         * @returns Promise or nothing
         */
        validate: function() {
            //placeholder for validate function
        },

        /* ==========================
         * Model loading
         * ==========================
         */

        /**
         * checks whether this model is loading anything
         * @param {String} optional process id (to check only one)
         * @returns {Boolean} is it loading?
         */
        isLoading: function(p_id) {

            if (this.isHook() && !this._loadedOnce) {
                return true;
            }
            if (p_id) {
                return (this._loading.indexOf(p_id) !== -1);
            }
            //if loading something
            else if (this._loading.length > 0) {
                return true;
            }
            //if not loading anything, check submodels
            else {
                var submodels = this.getSubmodels();
                var i;
                for (i = 0; i < submodels.length; i++) {
                    if (submodels[i].isLoading()) {
                        return true;
                        break;
                    }
                }
                for (i = 0; i < this._deps.children.length; i++) {
                    var d = this._deps.children[i];
                    if (d.isLoading() || !d._ready) {
                        return true;
                        break;
                    }
                }
                return false;
            }
        },

        /**
         * specifies that the model is loading data
         * @param {String} id of the loading process
         */
        setLoading: function(p_id) {
            //if this is the first time we're loading anything
            if (!this.isLoading()) {
                this.trigger("load_start");
            }
            //add id to the list of processes that are loading
            this._loading.push(p_id);
        },

        /**
         * specifies that the model is done with loading data
         * @param {String} id of the loading process
         */
        setLoadingDone: function(p_id) {
            this._loading = utils.without(this._loading, p_id);
            this.setReady();
        },

        /**
         * Sets the model as ready or not depending on its loading status
         */
        setReady: function(value) {

            if (value === false) {
                this._ready = false;
                if (this._parent && this._parent.setReady) {
                    this._parent.setReady(false);
                }
                return;
            }
            //only ready if nothing is loading at all
            this._ready = (!this.isLoading() && !this._setting && !this._loadCall);

            if (this._ready) {
                if (!this._readyOnce) {
                    this._readyOnce = true;
                    this.trigger("readyOnce");
                }
                this.trigger("ready");
                //check if parent dependency is ready (virtual models)
                for (var i = 0; i < this._deps.parent.length; i++) {
                    this._deps.parent[i].setReady();
                }
            }
        },

        /**
         * loads data (if hook)
         * Hooks loads data, models ask children to load data
         * Basically, this method:
         * loads is theres something to be loaded:
         * does not load if there's nothing to be loaded
         * @returns defer
         */
        load: function() {
            var _this = this;
            var submodels = this.getSubmodels();
            var data_hook = this._dataModel;
            var language_hook = this._languageModel;
            var query = this.getQuery();
            var promiseLoad = new Promise;
            var promises = [];

            //useful to check if in the middle of a load call
            this._loadCall = true;

            //load hook
            //if its not a hook, the promise will not be created
            if (this.isHook() && data_hook && query) {

                //get reader omfp
                var reader = data_hook.getObject();
                var lang = (language_hook) ? language_hook.id : "en";
                var promise = new Promise;

                var evts = {
                    'load_start': function() {
                        _this.setLoading("_hook_data");
                        Vizabi.Events.freezeAll(['load_start', 'resize', 'dom_ready']);
                    },
                    'load_end': function() {
                        Vizabi.Events.unfreezeAll();
                        _this.setLoadingDone("_hook_data");
                    }
                };

                utils.timeStamp("Vizabi Model: Loading Data: " + _this._id);

                this._dataManager.load(query, lang, reader, evts)
                    .then(function(data) {
                            _this._items = data;

                            utils.timeStamp("Vizabi Model: Data loaded: " + _this._id);

                            _this._unique = {};
                            _this._filtered = {};
                            _this._limits = {};
                            _this.afterLoad();

                            promise.resolve();
                        },
                        function(err) {
                            _this.trigger("load_error", query);
                            promise.reject(err);
                        });

                promises.push(promise);

            }

            //load submodels as well
            for (var i in submodels) {
                promises.push(submodels[i].load());
            }

            //when all promises/loading have been done successfully
            //we will consider this done
            var wait = (promises.length) ? Promise.all(promises) : new Promise.resolve();

            wait.then(function() {

                if (_this.validate) {
                    _this.validate();
                }

                utils.timeStamp("Vizabi Model: Model loaded: " + _this._id);

                //end this load call
                _this._loadedOnce = true;
                _this._loadCall = false;
                _this.setReady();

                promiseLoad.resolve();
            });

            return promiseLoad;
        },

        /**
         * executes after data has actually been loaded
         */
        afterLoad: function() {
            //placeholder method
        },

        /**
         * removes all external dependency references
         */
        resetDeps: function() {
            this._deps.children = [];
        },

        /**
         * add external dependency ref to this model
         */
        addDep: function(child) {
            this._deps.children.push(child);
            child._deps.parent.push(this);
        },

        /* ===============================
         * Hooking model to external data
         * ===============================
         */

        /**
         * is this model hooked to data?
         */
        isHook: function() {
            return (this[HOOK_PROPERTY]) ? true : false;
        },

        /**
         * Hooks all hookable submodels to data
         */
        setHooks: function() {
            if (this.isHook()) {
                //what should this hook to?
                this.dimensions = getHookTo(this);
                this.hookModel();
            }
            //hook submodels
            var submodels = this.getSubmodels();
            utils.forEach(submodels, function(s) {
                s.setHooks();
            });
        },

        /**
         * Hooks this model to data, entities and time
         * @param {Object} h Object containing the hooks
         */
        hookModel: function() {

            var _this = this;
            this._dataManager = new Vizabi.Data();
            // assuming all models will need data and language support
            this._dataModel = getClosestModel(this, "data");
            this._languageModel = getClosestModel(this, "language");

            //check what we want to hook this model to
            utils.forEach(this.dimensions, function(name) {
                //hook with the closest prefix to this model
                _this._hooks[name] = getClosestModel(_this, name);
                //if hooks change, this should load again
                //TODO: remove hardcoded 'show"
                if (_this._hooks[name].show) {
                    _this._hooks[name].on("change:show", function(evt) {
                        _this.load();
                    });
                }
            });

            //this is a hook, therefore it needs to reload when data changes
            this.on("change", function() {
                _this.load();
            });

        },

        /**
         * gets a certain hook reference
         * @returns {Object} defined hook or undefined
         */
        getHook: function(hook) {
            return this._hooks[hook];
        },

        /**
         * gets all sub values for a certain hook
         * only hooks have the "hook" attribute.
         * @param {String} type specific type to lookup
         * @returns {Array} all unique values with specific hook use
         */
        getHookValues: function(type) {
            var values = [];
            if (this[HOOK_PROPERTY] && this[HOOK_PROPERTY] === type) {
                values.push(this[HOOK_VALUE]);
            }
            //repeat for each submodel
            utils.forEach(this.getSubmodels(), function(s) {
                values = utils.unique(values.concat(s.getHookValues(type)));
            });
            //now we have an array with all values in a type of hook for hooks.
            return values;
        },

        /**
         * gets all sub values for indicators in this model
         * @returns {Array} all unique values of indicator hooks
         */
        getIndicators: function() {
            return this.getHookValues("indicator");
        },

        /**
         * gets all sub values for indicators in this model
         * @returns {Array} all unique values of property hooks
         */
        getProperties: function() {
            return this.getHookValues("property");
        },

        /**
         * gets all hook dimensions
         * @returns {Array} all unique dimensions
         */
        getAllDimensions: function() {
            var dims = [],
                dim;
            utils.forEach(this._hooks, function(h) {
                if (dim = h.getDimension()) dims.push(dim);
            });
            return dims;
        },

        /**
         * gets all hook filters
         * @returns {Object} filters
         */
        getAllFilters: function() {
            var filters = {};
            utils.forEach(this._hooks, function(h) {
                filters = utils.extend(filters, h.getFilter());
            });
            return filters;
        },

        /**
         * gets the value specified by this hook
         * @param {Object} filter Reference to the row. e.g: {geo: "swe", time: "1999", ... }
         * @returns hooked value
         */

        getValue: function(filter) {
            //extract id from original filter
            var id = utils.clone(filter, this.getAllDimensions());
            return this.mapValue(this._getHookedValue(id));
        },

        /**
         * gets multiple values from the hook
         * @param {Object} filter Reference to the row. e.g: {geo: "swe", time: "1999", ... }
         * @returns an array of values
         */

        getValues: function(filter) {
            //extract id from original filter
            var id = utils.clone(filter, this.getAllDimensions());
            return this._getHookedValues(id);
        },

        /**
         * maps the value to this hook's specifications
         * @param value Original value
         * @returns hooked value
         */
        mapValue: function(value) {
            return value;
        },

        /**
         * gets the items associated with this hook with values
         * @param value Original value
         * @returns hooked value
         */
        getItems: function(filter) {
            if (this.isHook() && this._dataModel) {

                //all dimensions except time (continuous)
                var dimensions = utils.without(this.getAllDimensions(), "time");

                return this.getUnique(dimensions).map(function(item) {
                    // Forcefully write the time to item
                    // TODO: Clean this hack
                    if (filter && filter['time']) {
                        item['time'] = filter['time'];
                    }
                    return item;
                })

                return values;
            } else {
                return [];
            }
        },

        /**
         * Gets the dimension of this model if it has one
         * @returns {String|Boolean} dimension
         */
        getDimension: function() {
            return false; //defaults to no dimension
        },

        /**
         * Gets the filter for this model if it has one
         * @returns {Object} filters
         */
        getFilter: function() {
            return {}; //defaults to no filter
        },


        /**
         * gets query that this model/hook needs to get data
         * @returns {Array} query
         */
        getQuery: function() {
            //only perform query in these two uses
            var needs_query = ["property", "indicator"];
            //if it's not a hook, property or indicator, no query is necessary
            if (!this.isHook() || needs_query.indexOf(this[HOOK_PROPERTY]) === -1) {
                return [];
            }
            //error if there's nothing to hook to
            else if (Object.keys(this._hooks).length < 1) {
                utils.error("Error:", this._id, "can't find any dimension");
                return [];
            }
            //else, its a hook (indicator or property) and it needs to query
            else {
                var dimensions = this.getAllDimensions(),
                    select = utils.unique(dimensions.concat([this[HOOK_VALUE]])),
                    filters = this.getAllFilters();
                //return query
                return {
                    "from": "data",
                    "select": select,
                    "where": filters
                };
            }
        },

        /**
         * Gets the d3 scale for this hook. if no scale then builds it
         * @returns {Array} domain
         */
        getScale: function() {
            if (this.scale == null) this.buildScale();
            return this.scale;
        },


        /**
         * Gets the domain for this hook
         * @returns {Array} domain
         */
        buildScale: function() {

            if (!this.isHook()) {
                return;
            }

            var domain,
                scaleType = this.scaleType || "linear";
            switch (this.use) {
                case "indicator":
                    var limits = this.getLimits(this[HOOK_VALUE]);
                    domain = [limits.min, limits.max];
                    break;
                case "property":
                    domain = this.getUnique(this[HOOK_VALUE]);
                    break;
                case "value":
                default:
                    domain = [this[HOOK_VALUE]];
                    break;
            }

            //TODO: d3 is global?
            this.scale = d3.scale[scaleType]().domain(domain);
        },

        /**
         * Gets limits
         * @param {String} attr parameter
         * @returns {Object} limits (min and max)
         */
        getLimits: function(attr) {

            if (!this.isHook()) {
                return;
            }

            if (!attr) {
                attr = 'time'; //fallback in case no attr is provided
            }

            //store limits so that we stop rechecking.
            if (this._limits[attr]) {
                return this._limits[attr];
            }

            var limits = {
                    min: 0,
                    max: 0
                },
                filtered = this._items.map(function(d) {
                    //TODO: Move this up to readers ?
                    return (attr !== "time") ? parseFloat(d[attr]) : new Date(d[attr].toString());
                });
            if (filtered.length > 0) {
                limits.min = Math.min.apply(null, filtered);
                limits.max = Math.max.apply(null, filtered);
            }
            this._limits[attr] = limits;
            return limits;
        },

        /**
         * Gets unique values in a column
         * @param {String} attr parameter
         * @returns {Array} unique values
         */
        getUnique: function(attr) {

            //if it's an array, it will return a list of unique combinations.
            if (!utils.isArray(attr)) {
                return this.getUnique([attr]);
            }

            if (!this.isHook()) return;

            if (!attr) attr = 'time'; //fallback in case no attr is provided

            //cache optimization
            var uniq_id = JSON.stringify(attr),
                uniq;
            if (this._unique[uniq_id]) {
                return this._unique[uniq_id];
            }

        
            var v = this._items.map(function(d) {
                return utils.clone(d, attr);
            });
            //TODO: Move this up to readers ?
            if (attr.indexOf("time") !== -1) {
                for (var i = 0; i < v.length; i++) {
                    v[i]['time'] = new Date(v[i]['time']);
                };
            }
            uniq = utils.unique(v, function(n) {
                return JSON.stringify(n);
            });

            this._unique[uniq_id] = uniq;
            return uniq;
        },

        /**
         * gets the value of the hook point
         * @param {Object} filter Id the row. e.g: {geo: "swe", time: "1999"}
         * @returns hooked value
         */
        _getHookedValue: function(filter) {

            if (!this.isHook()) {
                utils.warn("_getHookedValue method needs the model to be hooked to data.");
                return;
            }
            var value;
            if (this[HOOK_PROPERTY] === "value") {
                value = this[HOOK_VALUE];
            } else if (this._hooks.hasOwnProperty(this[HOOK_PROPERTY])) {
                value = this.getHook(this[HOOK_PROPERTY])[this[HOOK_VALUE]];
            } else {
                value = interpolateValue(this, filter, this[HOOK_PROPERTY], this[HOOK_VALUE]);
            }
            return value;
        },

        /**
         * gets the values of the hook point
         * @param {Object} filter Id the row. e.g: {geo: "swe", time: "1999"}
         * @returns an array of hooked values
         */
        _getHookedValues: function(filter) {
            var _this = this;

            if (!this.isHook()) {
                utils.warn("_getHookedValue method needs the model to be hooked to data.");
                return;
            }

            var values;

            if (this[HOOK_PROPERTY] === "value") {
                values = [this[HOOK_VALUE]];
            } else if (this._hooks.hasOwnProperty(this[HOOK_PROPERTY])) {
                values = [this.getHook(this[HOOK_PROPERTY])[this[HOOK_VALUE]]];
            } else {
                // if a specific time is requested -- return values up to this time
                if (filter && filter.hasOwnProperty('time')) {
                    // save time into variable
                    var time = new Date(filter.time);
                    // filter.time will be removed during interpolation
                    var lastValue = _interpolateValue(this, filter, this[HOOK_PROPERTY], this[HOOK_VALUE]);
                    // return values up to the requested time point, append an interpolated value as the last one
                    values = utils.filter(this._items, filter)
                        .filter(function(d) {
                            return d.time <= time
                        })
                        .map(function(d) {
                            return d[_this[HOOK_VALUE]]
                        })
                        .concat(lastValue);
                } else {
                    // if time not requested -- return just all values
                    values = this._items.filter(filter)
                        .map(function(d) {
                            return d[_this[HOOK_VALUE]]
                        });
                }
            }
            return values;
        },


        //TODO: Is this supposed to be here?
        /**
         * gets maximum, minimum and mean values from the dataset of this certain hook
         */
        getMaxMinMean: function(timeFormatter) {
            var _this = this;
            var result = {};

            //TODO: d3 is global?
            //Can we do this without d3?
            d3.nest()
                .key(function(d) {
                    return timeFormatter(d.time);
                })
                .entries(_this._items)
                .forEach(function(d) {
                    var values = d.values
                        .filter(function(f) {
                            return f[_this[HOOK_VALUE]] != null
                        })
                        .map(function(m) {
                            return +m[_this[HOOK_VALUE]]
                        });
                    result[d.key] = {
                        max: d3.max(values),
                        min: d3.min(values),
                        mean: d3.mean(values)
                    };
                })

            return result;
        },


        /**
         * gets filtered dataset with fewer keys
         */
        _getFilteredItems: function(filter) {
            var filterId = JSON.stringify(filter);
            //cache optimization
            var filter_id = JSON.stringify(filter);
            if (this._filtered[filter_id]) {
                return this._filtered[filter_id];
            }
            return this._filtered[filter_id] = utils.filter(this._items, filter);
        }

    });

    Vizabi.Model = Model;


    /* ===============================
     * Private Helper Functions
     * ===============================
     */

    /**
     * Checks whether an object is a model or not
     */
    function isModel(model) {
        return model.hasOwnProperty("_data");
    }

    /**
     * Binds all attributes in _data to magic setters and getters
     */
    function bindSettersGetters(model) {
        for (var prop in model._data) {
            Object.defineProperty(model, prop, {
                configurable: true, //allow reconfiguration
                get: (function(p) {
                    return function() {
                        return model.get(p);
                    }
                })(prop),
                set: (function(p) {
                    return function(value) {
                        return model.set(p, value);
                    }
                })(prop)
            });
        }
    }

    /**
     * Loads a submodel, when necessaary
     * @param {String} attr Name of submodel
     * @param {Object} val Initial values
     * @param {Object} ctx context
     * @returns {Object} model new submodel
     */
    function initSubmodel(attr, val, ctx) {
        //naming convention: underscore -> time, time_2, time_overlay
        var name = attr.split("_")[0];
        var binds = {
            //the submodel has been set (only once)
            'set': function(evt, vals) {
                //its set
            },
            //the submodel has initialized (only once)
            'init': function(evt, vals) {
                // evt = evt.replace('init', 'init:' + name);
                // ctx.triggerAll(evt, ctx.getObject());
            },
            //the submodel has changed (multiple times)
            'change': function(evt, vals) {
                evt = evt.replace('change', 'change:' + name);
                ctx.triggerAll(evt, ctx.getObject());
            },
            //loading has started in this submodel (multiple times)
            'load_start': function(evt, vals) {
                evt = evt.replace('load_start', 'load_start:' + name);
                ctx.triggerAll(evt, ctx.getObject());
            },
            //loading has failed in this submodel (multiple times)
            'load_error': function(evt, vals) {
                evt = evt.replace('load_error', 'load_error:' + name);
                ctx.triggerAll(evt, vals);
            },
            //loading has ended in this submodel (multiple times)
            'ready': function(evt, vals) {
                //trigger only for submodel
                evt = evt.replace('ready', 'ready:' + name);
                ctx.trigger(evt, vals);
                ctx.setReady();
            }
        };

        if (isModel(val)) {
            val.on(binds);
            return val;
        } else {
            //special model
            var model =  Vizabi.Model.get(name, true) || Model;
            return new model(val, ctx, binds);
        }

    }

    /**
     * gets closest interval from this model or parent
     * @returns {Object} Intervals object
     */
    function getIntervals(ctx) {
        if (ctx._intervals) {
            return ctx._intervals;
        } else if (ctx._parent) {
            return getIntervals(ctx._parent);
        } else {
            return new Vizabi.Intervals();
        }
    }

    /**
     * gets closest prefix model moving up the model tree
     * @param {String} prefix
     * @returns {Object} submodel
     */
    function getClosestModel(ctx, name) {
        var model = findSubmodel(ctx, name);
        if (model) {
            return model;
        } else if (ctx._parent) {
            return getClosestModel(ctx._parent, name);
        }
    }

    /**
     * find submodel with name that starts with prefix
     * @param {String} prefix
     * @returns {Object} submodel or false if nothing is found
     */
    function findSubmodel(ctx, name) {
        for (var i in ctx._data) {
            //found submodel
            if (i === name && isModel(ctx._data[i])) {
                return ctx._data[i];
            }
        }
    }

    /**
     * Learn what this model should hook to
     * @returns {Array} dimensions array
     */
    function getHookTo(model) {
        if (utils.isArray(model.dimensions)) {
            return model.dimensions;
        } else if (model._parent) {
            return getHookTo(model._parent);
        } else {
            utils.error('ERROR: dimensions not found.\n You must specify the objects this hook will use under the dimensions attribute in the state.\n Example:\n dimensions: ["entities", "time"]');
        }
    }

    /**
     * interpolates the specific value if missing
     * @param {Object} filter Id the row. e.g: {geo: "swe", time: "1999"}
     * filter SHOULD contain time property
     * @returns interpolated value
     */
    function interpolateValue(ctx, filter, hook, value) {
        if (ctx._items == null || ctx._items.length == 0) {
            utils.warn("interpolateValue returning NULL because items array is empty");
            return null;
        }

        // fetch time from filter object and remove it from there
        var time = new Date(filter.time);
        delete filter.time;

        // filter items so that we only have a dataset for certain keys, like "geo"
        var items = ctx._getFilteredItems(filter);

        // return constant for the hook of "values"
        if (hook == "value") return items[0][ctx[HOOK_VALUE]];

        // search where the desired value should fall between the known points
        // TODO: d3 is global?
        var indexNext = d3.bisectLeft(items.map(function(d) {
            return d.time
        }), time);

        // zero-order interpolation for the hook of properties
        if (hook == "property" && indexNext == 0) return items[0][value];
        if (hook == "property") return items[indexNext - 1][value];

        // the rest is for the continuous measurements

        // check if the desired value is out of range. 0-order extrapolation
        if (indexNext == 0) return items[0][value];
        if (indexNext == items.length) return items[items.length - 1][value];

        //return null if data is missing
        if (items[indexNext][value] == null || items[indexNext - 1][value] == null) return null;

        // perform a simple linear interpolation
        var fraction =
            (time - items[indexNext - 1].time) / (items[indexNext].time - items[indexNext - 1].time);
        var value = +items[indexNext - 1][value] + (items[indexNext][value] - items[indexNext - 1][value]) * fraction;

        // cast to time object if we are interpolating time
        if (Object.prototype.toString.call(items[0][value]) === "[object Date]") {
            value = new Date(value);
        }

        return value;
    }



}).call(this);
/*!
 * VIZABI COMPONENT
 * Base Component
 */

(function() {

    "use strict";

    var class_loading = "vzb-loading";
    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;
    var templates = {};

    var Component = Vizabi.Events.extend({

        /**
         * Initializes the component
         * @param {Object} config Initial config, with name and placeholder
         * @param {Object} parent Reference to tool
         */
        init: function(config, parent) {

            this._id = this._id || utils.uniqueId("c");
            this._ready = false;
            this._readyOnce = false;

            this.name = this.name || config.name;
            this.template = this.template || "<div></div>";
            this.placeholder = this.placeholder || config.placeholder;
            this.template_data = this.template_data || {
                name: this.name
            };

            //make sure placeholder is DOM element
            if (this.placeholder && !utils.isElement(this.placeholder)) {
                try {
                    this.placeholder = parent.placeholder.querySelector(this.placeholder);
                } catch (e) {
                    utils.error("Error finding placeholder '" + this.placeholder + "' for component '" + this.name + "'");
                }
            }

            this.parent = parent || this;
            this.components = this.components || [];
            this._components_config = this.components.map(function(x) {
                return utils.clone(x);
            });
            this._frameRate = 10;

            //define expected models for this component
            this.model_expects = this.model_expects || [];
            this.model_binds = this.model_binds || {};

            this.ui = this.ui || config.ui;

            this._super();

            //domReady alias
            var _this = this;
            this.on({
                'dom_ready': function() {
                    if (typeof _this.domReady === 'function') {
                        _this.domReady();
                    }
                },
                'ready': function() {
                    if (typeof _this.ready === 'function') {
                        _this.ready();
                    }
                },
                'resize': function() {
                    if (typeof _this.resize === 'function') {
                        _this.resize();
                    }
                }
            });

        },

        /**
         * Renders the component (after data is ready)
         */
        render: function() {
            var _this = this;
            this.loadTemplate();
            this.loadComponents();

            //render each subcomponent
            utils.forEach(this.components, function(subcomp) {
                subcomp.render();
                _this.on('resize', function() {
                    subcomp.trigger('resize');
                });
            });

            //if it's a root component with model
            if (this.isRoot() && this.model) {
                this.model.on("ready", function() {
                    done();
                });
                this.model.setHooks();
                this.model.load();
            } else {
                done();
            }

            function done() {
                _this.trigger('dom_ready');
                utils.removeClass(_this.placeholder, class_loading);
                _this._ready = true;
                if (!_this._readyOnce) {
                    _this._readyOnce = true;
                }
                _this.trigger('ready');
            };
        },

        /**
         * Loads the template
         * @returns defer a promise to be resolved when template is loaded
         */
        loadTemplate: function() {
            var tmpl = this.template;
            var data = this.template_data;
            var _this = this;
            var rendered = "";

            if (!this.placeholder) {
                return;
            }

            if (this.template) {
                try {
                    rendered = templateFunc(tmpl, data);
                } catch (e) {
                    utils.error("Templating error for component: '" + this.name + "' - Check if path to template is correct. E.g.: 'src/components/...'");
                }
            }
            //add loading class and html
            utils.addClass(this.placeholder, class_loading);
            this.placeholder.innerHTML = rendered;
            this.element = this.placeholder.children[0];

            //only tools have layout (manage sizes)
            if (this.layout) {
                this.layout.setContainer(this.placeholder);
                this.layout.on('resize', function() {
                    if (_this._ready) {
                        utils.throttle(function() {
                            _this.trigger('resize');
                        }, _this._frameRate);
                    }
                });
            }
        },

        /*
         * Loads all subcomponents
         */
        loadComponents: function() {
            var _this = this;
            var config;
            var comp;
            //use the same name for collection
            this.components = [];
            //external dependencies let this model know what it
            //has to wait for
            if (this.model) {
                this.model.resetDeps();
            }

            // Loops through components, loading them.
            utils.forEach(this._components_config, function(c) {

                if (!c.component) {
                    utils.error("Error loading component: name not provided");
                    return;
                }
                if (!(comp = Vizabi.Component.get(c.component))) {
                    return;
                }

                config = utils.extend(c, {
                    name: c.component,
                    ui: _this._uiMapping(c.placeholder, c.ui)
                });

                //instantiate new subcomponent
                var subcomp = new comp(config, _this);
                var c_model = c.model || [];
                subcomp.model = _this._modelMapping(subcomp.name, c_model, subcomp.model_expects, subcomp.model_binds);

                //external dependencies let this model know what it
                //has to wait for
                if (_this.model) {
                    _this.model.addDep(subcomp.model);
                }
                _this.components.push(subcomp);
            });
        },

        isRoot: function() {
            return this.parent === this;
        },

        /**
         * Get layout profile of the current resolution
         * @returns {String} profile
         */
        getLayoutProfile: function() {
            //get profile from parent if layout is not available
            if (this.layout) {
                return this.layout.currentProfile();
            } else {
                return this.parent.getLayoutProfile();
            }
        },

        //TODO: make ui mapping more powerful
        /**
         * Maps the current ui to the subcomponents
         * @param {String} id subcomponent id (placeholder)
         * @param {Object} ui Optional ui parameters to overwrite existing
         * @returns {Object} the UI object
         */
        _uiMapping: function(id, ui) {

            //if overwritting UI
            if (ui) {
                return new Vizabi.Model(ui);
            }

            if (id && this.ui) {
                id = id.replace(".", ""); //remove trailing period
                var sub_ui = this.ui[id];
                if (sub_ui) {
                    return sub_ui;
                }
            }
            return this.ui;
        },

        /**
         * Maps the current model to the subcomponents
         * @param {String} subcomponent name of the subcomponent
         * @param {String|Array} model_config Configuration of model
         * @param {String|Array} model_expects Expected models
         * @param {Object} model_binds Initial model bindings
         * @returns {Object} the model
         */
        _modelMapping: function(subcomponent, model_config, model_expects, model_binds) {

            var _this = this;
            var values = {};

            //If model_config is an array, we map it
            if (utils.isArray(model_config) && utils.isArray(model_expects)) {
                //if there's a different number of models received and expected

                if (model_expects.length !== model_config.length) {
                    utils.groupCollapsed("DIFFERENCE IN NUMBER OF MODELS EXPECTED AND RECEIVED");
                    utils.warn("Please, configure the 'model_expects' attribute accordingly in '" + subcomponent + "' or check the models passed in '" + _this.name + "'. [ADD LINK TO DOCUMENTATION]\n\nComponent: '" + _this.name + "'\nSubcomponent: '" + subcomponent + "'\nNumber of Models Expected: " + model_expects.length + "\nNumber of Models Received: " + model_config.length);
                    utils.groupEnd();
                }

                utils.forEach(model_config, function(m, i) {
                    var model_info = _mapOne(m);
                    var new_name;

                    if (model_expects[i]) {
                        new_name = model_expects[i].name;

                        if (model_expects[i].type && model_info.type !== model_expects[i].type) {

                            //TODO: add link to the documentation about model_expects
                            utils.groupCollapsed("UNEXPECTED MODEL TYPE: '" + model_info.type + "' instead of '" + model_expects[i].type + "'");
                            utils.warn("Please, configure the 'model_expects' attribute accordingly in '" + subcomponent + "' or check the models passed in '" + _this.name + "'. [ADD LINK TO DOCUMENTATION]\n\nComponent: '" + _this.name + "'\nSubcomponent: '" + subcomponent + "'\nExpected Model: '" + model_expects[i].type + "'\nReceived Model'" + model_info.type + "'\nModel order: " + i);
                            utils.groupEnd();
                        }
                    } else {
                        //TODO: add link to the documentation about model_expects
                        utils.groupCollapsed("UNEXPECTED MODEL: '" + model_config[i] + "'");
                        utils.warn("Please, configure the 'model_expects' attribute accordingly in '" + subcomponent + "' or check the models passed in '" + _this.name + "'. [ADD LINK TO DOCUMENTATION]\n\nComponent: '" + _this.name + "'\nSubcomponent: '" + subcomponent + "'\nNumber of Models Expected: " + model_expects.length + "\nNumber of Models Received: " + model_config.length);
                        utils.groupEnd();

                        new_name = model_info.name;
                    }
                    values[new_name] = model_info.model;

                });

                //check for remaining expected models
                var existing = model_config.length,
                    expected = model_expects.length;
                if (expected > existing) {
                    //skip existing
                    model_expects.splice(0, existing);
                    //adds new expected models if needed
                    utils.forEach(expected, function(m) {
                        values[m.name] = {};
                    });
                }
            } else {
                return;
            }

            //return a new model with the defined submodels
            var model = new Vizabi.Model(values, null, model_binds);
            afterSet();

            return model;

            function afterSet() {
                var submodels = model.getSubmodels();

                for (var submodel in model.get()) {

                    if (typeof model[submodel]._id === 'undefined') continue;

                    //closure to set up the submodel
                    (function(model, submodel) {

                        model[submodel].on({
                            //the submodel has been set (only once)
                            'set': function(evt, vals) {
                                //trigger only for submodel
                                evt = evt.replace('set', 'set:' + submodel);
                                model.trigger(evt, vals);

                                //check if all are ready
                                var rdy = true;
                                utils.forEach(submodels, function(sm) {
                                    if (sm._set !== true) rdy = false;
                                });
                                if (rdy) {
                                    model.trigger('set', vals)
                                }
                            },
                            //the submodel has initialized (only once)
                            'init': function(evt, vals) {
                                evt = evt.replace('init', 'init:' + submodel);
                                model.triggerAll(evt, model.getObject());
                            },
                            //the submodel has changed (multiple times)
                            'change': function(evt, vals) {
                                evt = evt.replace('change', 'change:' + submodel);
                                model.triggerAll(evt, model.getObject());
                            },
                            //loading has started in this submodel (multiple times)
                            'load_start': function(evt, vals) {
                                evt = evt.replace('load_start', 'load_start:' + submodel);
                                model.triggerAll(evt, vals);
                            },
                            //loading has failed in this submodel (multiple times)
                            'load_error': function(evt, vals) {
                                evt = evt.replace('load_error', 'load_error:' + submodel);
                                model.triggerAll(evt, vals);
                            },
                            //the submodel is ready/loading has ended
                            'ready': function(evt, vals) {
                                //trigger only for submodel
                                evt = evt.replace('ready', 'ready:' + submodel);
                                model.trigger(evt, vals);

                                //try to set virtual model ready, then orig one
                                model.setReady();
                            }
                        });

                    })(model, submodel); //self executing function

                }
            }

            /**
             * Maps one model name to current submodel and returns info
             * @param {String} name Full model path. E.g.: "state.marker.color"
             * @returns {Object} the model info, with name and the actual model
             */
            function _mapOne(name) {
                var parts = name.split("."),
                    current = _this.model,
                    current_name = "";
                while (parts.length) {
                    current_name = parts.shift();
                    current = current[current_name];
                }
                return {
                    name: name,
                    model: current,
                    type: current.getType()
                };
            }

        },

        /**
         * Get translation function for templates
         * @param {Boolean} wrap wrap in spam tags
         * @returns {Function}
         */
        getTranslationFunction: function(wrap) {
            var t_func;
            try {
                t_func = this.model.get("language").getTFunction();
            } catch (err) {
                if (this.parent && this.parent != this) {
                    t_func = this.parent.getTranslationFunction();
                }
            }

            if (!t_func) {
                t_func = function(s) {
                    return s;
                };
            }
            if (wrap) return this._translatedStringFunction(t_func);
            else return t_func;
        },

        /**
         * Get function for translated string
         * @param {Function} translation_function The translation function
         * @returns {Function}
         */
        _translatedStringFunction: function(translation_function) {
            return function(string) {
                var translated = translation_function(string);
                return '<span data-vzb-translate="' + string + '">' + translated + '</span>';
            };
        },

        /**
         * Translate all strings in the template
         */
        translateStrings: function() {
            var t = this.getTranslationFunction();
            var strings = this.placeholder.querySelectorAll('[data-vzb-translate]');
            utils.forEach(strings, function(str) {
                str.innerHTML = t(str.getAttribute("data-vzb-translate"));
            });
        },

        /**
         * Checks whether this component is a tool or not
         * @returns {Boolean}
         */
        isTool: function() {
            return this._id[0] === 't';
        },

        /**
         * Executes after the template is loaded and rendered.
         * Ideally, it contains HTML instantiations related to template
         * At this point, this.element and this.placeholder are available
         * as DOM elements
         */
        domReady: function() {},

        /**
         * Executes after the template and model (if any) are ready
         */
        ready: function() {},

        /**
         * Executes when the resize event is triggered.
         * Ideally, it only contains operations related to size
         */
        resize: function() {},


    });

    // Based on Simple JavaScript Templating by John Resig
    //generic templating function
    function templateFunc(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/<[a-z][\s\S]*>/i.test(str) ?
            templates[str] = templates[str] ||
            templateFunc(root.document.getElementById(str).innerHTML) :
            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +
                // Convert the template into pure JavaScript
                str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'") + "');}return p.join('');");
        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    }

    Component.isComponent = function(c) {
        return (c._id && (c._id[0] === 't' || c._id[0] === 'c'));
    }

    Vizabi.Component = Component;

}).call(this);
/*!
 * VIZABI COMPONENT
 * Base Component
 */

(function() {

    "use strict";

    var class_loading = "vzb-loading";
    var class_loading_data = "vzb-loading";
    var class_loading_error = "vzb-loading-error";
    var class_placeholder = "vzb-placeholder";
    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;
    var templates = {};
    var toolsList = {};

    //tool model is quite simple and doesn't need to be registered
    var ToolModel = Vizabi.Model.extend({
        /**
         * Initializes the tool model.
         * @param {Object} values The initial values of this model
         * @param {Object} binds contains initial bindings for the model
         * @param {Function|Array} validade validate rules
         */
        init: function(values, defaults, binds, validate) {
            this._id = utils.uniqueId("tm");
            this._type = "tool";

            //generate validation function
            this.validate = generateValidate(this, validate);

            //default submodels
            values = defaultOptions(values, defaults);

            //constructor is similar to model
            this._super(values, null, binds);

            // change language
            if (values.language) {
                var _this = this;
                this.on("change:language", function() {
                    _this.trigger("translate");
                });
            }
        }
    });

    //tool
    var Tool = Vizabi.Component.extend({

        /**
         * Initializes the tool
         * @param {Object} placeholder object
         * @param {Object} options Options such as state, data, etc
         */
        init: function(placeholder, options) {

            this._id = utils.uniqueId("t");
            this.layout = new Vizabi.Layout();
            this.template = this.template || '<div class="vzb-tool vzb-tool-'+this.name+'"><div class="vzb-tool-content"><div class="vzb-tool-stage"><div class="vzb-tool-viz"></div><div class="vzb-tool-timeslider"></div></div><div class="vzb-tool-buttonlist"></div></div></div>';

            this.model_binds = this.model_binds || {};
            this.default_options = this.default_options || {};

            //bind the validation function with the tool
            var validate = this.validate.bind(this);

            var _this = this;
            var callbacks = utils.merge({
                'change': function(evt, val) {
                    if (_this._ready) {
                        _this.model.validate();
                        _this.triggerAll(evt, val);
                    }
                },
                'translate': function(evt, val) {
                    if (_this._ready) {
                        _this.model.load().then(function() {
                            _this.model.validate();
                            _this.translateStrings();
                        });
                    }
                },
                'load_start': function() {
                    _this.beforeLoading();
                },
                'load_error': function() {
                    _this.errorLoading();
                },
                'ready': function(evt) {
                    if (_this._ready) {
                        _this.afterLoading();
                    }
                }
            }, this.model_binds);

            this.model = new ToolModel(options, this.default_options, callbacks, validate);

            this.ui = this.model.ui;

            this._super({
                name: this.name || this._id,
                placeholder: placeholder
            }, this);

            //add placeholder class
            utils.addClass(this.placeholder, class_placeholder);

            this._bindEvents();
            this.render();
        },

        /**
         * Binds events in model to outside world
         */
        _bindEvents: function() {
            if (!this.model.bind) return;
            this.on(this.model.bind.get());
        },

        /**
         * Sets options from external page
         * @param {Object} options new options
         * @param {Boolean} overwrite overwrite everything instead of extending
         * @param {Boolean} silent prevent events
         */
        setOptions: function(options, overwrite, silent) {
            if (overwrite) {
                this.model.reset(options);
            } else {
                this.model.set(options);
            }
        },

        /**
         * gets all options
         * @param {Object} options new options
         * @param {Boolean} overwrite overwrite everything instead of extending
         * @param {Boolean} silent prevent events
         */
        getOptions: function() {
            return this.model.getObject() || {};
        },

        /**
         * Displays loading class
         */
        beforeLoading: function() {
            if (!utils.hasClass(this.placeholder, class_loading_data)) {
                utils.addClass(this.placeholder, class_loading_data);
            }
        },

        /**
         * Removes loading class
         */
        afterLoading: function() {
            utils.removeClass(this.placeholder, class_loading_data);
        },

        /**
         * Adds loading error class
         */
        errorLoading: function() {
            utils.addClass(this.placeholder, class_loading_error);
        },

        /* ==========================
         * Validation and query
         * ==========================
         */

        /**
         * Placeholder for model validation
         */
        validate: function() {
            //placeholder for tool validation methods
        }


    });

    /* ==========================
     * Validation methods
     * ==========================
     */

    /**
     * Generates a validation function based on specific model validation
     * @param {Object} m model
     * @param {Function} validate validation function
     * @returns {Function} validation
     */
    function generateValidate(m, validate) {
        var max = 10;

        function validate_func() {
            var model = JSON.stringify(m.getObject());
            var c = arguments[0] || 0;
            //TODO: remove validation hotfix
            //while setting this.model is not available
            if(!this._readyOnce) {
                validate(this);
            }
            else {
                validate();
            }
            var model2 = JSON.stringify(m.getObject());
            if (c >= max) {
                utils.error("Max validation loop.");
            } else if (model !== model2) {
                validate_func.call(this, [++c]);
            }
        }
        return validate_func;
    }

    /* ==========================
     * Default options methods
     * ==========================
     */

    /**
     * Generates a valid state based on default options
     */
    function defaultOptions(values, defaults) {

        for (var field in defaults) {

            var blueprint = defaults[field];
            var original = values[field];
            //specified type, default value and possible values
            var type = utils.isObject(blueprint) ? blueprint._type_ : null;
            var defs = utils.isObject(blueprint) ? blueprint._defs_ : null;
            var opts = utils.isObject(blueprint) ? blueprint._opts_ : null;

            //in case there's no type, just deep extend as much as possible
            if (!type) {
                if (typeof original === "undefined") {
                    values[field] = blueprint;
                } else if (utils.isObject(blueprint) && utils.isObject(original)) {

                    values[field] = defaultOptions(original, blueprint);
                }
                continue;
            }

            //otherwise, each case has special verification
            if (type === "number" && isNaN(original)) {
                values[field] = isNaN(defs) ? 0 : defs;
            } else if (type === "string" && typeof original !== 'string') {
                values[field] = (typeof defs === 'string') ? defs : "";
            } else if (type === "array" && !utils.isArray(original)) {
                values[field] = utils.isArray(defs) ? defs : [];
            } else if (type === "object" && !utils.isObject(original)) {
                values[field] = utils.isObject(defs) ? defs : {};
            } else if (type === "model" || type === "hook") {
                if (!utils.isObject(original)) {
                    values[field] = {};
                }
                values[field] = defaultOptions(values[field], defs);
            }

            //if possible values are determined, we should respect it
            if (utils.isArray(opts) && defs && opts.indexOf(values[field]) === -1) {
                utils.warn("Vizabi options contain invalid value for '" + field + "'. Permitted values: " + JSON.stringify(opts) + ". Changing to default");
                values[field] = defs;
            }
        }
        return values;
    }

    Tool.isTool = function(c) {
        return (c._id && c._id[0] === 't');
    }


    Vizabi.Tool = Tool;


}).call(this);
(function() {var root = this;var s = root.document.createElement('script');s.type = 'text/template';s.setAttribute('id', 'src/components/_gapminder/timeslider/timeslider.html');s.innerHTML = '<div class="vzb-timeslider"> <div class="vzb-ts-slider-wrapper"> <svg class="vzb-ts-slider"> <g> <g class="vzb-ts-slider-axis"></g> <g class="vzb-ts-slider-slide"> <circle class="vzb-ts-slider-handle"></circle> <text class="vzb-ts-slider-value"></text> </g> </g> </svg> </div>  <div class="vzb-ts-btns"> <button class="vzb-ts-btn-play vzb-ts-btn"> <svg class="vzb-icon vzb-icon-play" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1576 927l-1328 738q-23 13-39.5 3t-16.5-36v-1472q0-26 16.5-36t39.5 3l1328 738q23 13 23 31t-23 31z"/></svg> </button> <button class="vzb-ts-btn-pause vzb-ts-btn"> <svg class="vzb-icon vzb-icon-pause" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1664 192v1408q0 26-19 45t-45 19h-512q-26 0-45-19t-19-45v-1408q0-26 19-45t45-19h512q26 0 45 19t19 45zm-896 0v1408q0 26-19 45t-45 19h-512q-26 0-45-19t-19-45v-1408q0-26 19-45t45-19h512q26 0 45 19t19 45z"/></svg> </button> </div> </div>';root.document.body.appendChild(s);}).call(this);
(function() {var root = this;var s = root.document.createElement('script');s.type = 'text/template';s.setAttribute('id', 'src/tools/_examples/bar-chart/bar-chart-comp.html');s.innerHTML = ' <svg class="vzb-bar-chart"> <g class="vzb-bc-graph"> <g class="vzb-bc-bars"></g> <g class="vzb-bc-bar-labels"></g> <text class="vzb-bc-axis-y-title"></text> <g class="vzb-bc-axis-x"></g> <g class="vzb-bc-axis-y"></g> <g class="vzb-bc-axis-labels">  </g> </g> </svg>';root.document.body.appendChild(s);}).call(this);
/*!
 * VIZABI TIMESLIDER
 * Reusable timeslider component
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var Promise = Vizabi.Promise;
    var utils = Vizabi.utils;

    //warn client if d3 is not defined
    if (!Vizabi._require('d3')) {
        return;
    }

    //constants
    var class_playing = "vzb-playing";
    var class_hide_play = "vzb-ts-hide-play-button";
    var class_dragging = "vzb-ts-dragging";
    var class_axis_aligned = "vzb-ts-axis-aligned";
    var class_show_value = "vzb-ts-show-value";
    var class_show_value_when_drag_play = "vzb-ts-show-value-when-drag-play";

    var time_formats = {
        "year": d3.time.format("%Y"),
        "month": d3.time.format("%b"),
        "week": d3.time.format("week %U"),
        "day": d3.time.format("%d/%m/%Y"),
        "hour": d3.time.format("%d/%m/%Y %H"),
        "minute": d3.time.format("%d/%m/%Y %H:%M"),
        "second": d3.time.format("%d/%m/%Y %H:%M:%S")
    };

    //margins for slider
    var profiles = {
        small: {
            margin: {
                top: 9,
                right: 15,
                bottom: 10,
                left: 15
            },
            radius: 8,
            label_spacing: 10
        },
        medium: {
            margin: {
                top: 9,
                right: 15,
                bottom: 10,
                left: 15
            },
            radius: 10,
            label_spacing: 12
        },
        large: {
            margin: {
                top: 9,
                right: 15,
                bottom: 10,
                left: 15
            },
            radius: 11,
            label_spacing: 14
        }
    };

    Vizabi.Component.extend("gapminder-timeslider", {
        /**
         * Initializes the timeslider.
         * Executed once before any template is rendered.
         * @param config The options passed to the component
         * @param context The component's parent
         */
        init: function(config, context) {
            this.template = this.template || "src/components/_gapminder/timeslider/timeslider.html";

            //define expected models/hooks for this component
            this.model_expects = [{
                name: "time",
                type: "time"
            }];

            var _this = this;

            //binds methods to this model
            this.model_binds = {
                'change': function(evt, original) {
                    _this.changeTime();
                    _this._setHandle(_this.model.time.playing);
                }
            };

            this.ui = utils.extend({
                show_limits: false,
                show_value: false,
                show_value_when_drag_play: true,
                show_button: true,
                class_axis_aligned: false
            }, config.ui, this.ui);

            // Same constructor as the superclass
            this._super(config, context);


            //defaults
            this.width = 0;
            this.height = 0;
        },

        //template is ready
        domReady: function() {
            var _this = this;

            //DOM to d3
            this.element = d3.select(this.element);

            //html elements
            this.slider_outer = this.element.select(".vzb-ts-slider");
            this.slider = this.slider_outer.select("g");
            this.axis = this.element.select(".vzb-ts-slider-axis");
            this.slide = this.element.select(".vzb-ts-slider-slide");
            this.handle = this.slide.select(".vzb-ts-slider-handle");
            this.valueText = this.slide.select('.vzb-ts-slider-value');

            //Scale
            this.xScale = d3.time.scale()
                .clamp(true);
            //Axis
            this.xAxis = d3.svg.axis()
                .orient("bottom")
                .tickSize(0);

            //Value
            this.valueText.attr("text-anchor", "middle").attr("dy", "-1em");

            var brushed = _this._getBrushed(),
                brushedEnd = _this._getBrushedEnd();

            //Brush for dragging
            this.brush = d3.svg.brush()
                .x(this.xScale)
                .extent([0, 0])
                .on("brush", brushed)
                .on("brushend", brushedEnd);

            //Slide
            this.slide.call(this.brush);
            this.slide.selectAll(".extent,.resize")
                .remove();


            var _this = this;

        },

        //template and model are ready
        ready: function() {
           
            var play = this.element.select(".vzb-ts-btn-play");
            var pause = this.element.select(".vzb-ts-btn-pause");
            var _this = this;

            play.on('click', function() {
                _this.model.time.play();
            });

            pause.on('click', function() {
                _this.model.time.pause();
            });
           
            this.changeTime();
            this._setHandle(this.model.time.playing);
        },

        changeTime: function() {
            this.ui.format = this.model.time.unit;

            //time slider should always receive a time model
            var time = this.model.time.value;
            var minValue = this.model.time.start;
            var maxValue = this.model.time.end;
            var _this = this;

            //format
            this.format = time_formats[this.ui.format];

            //scale
            this.xScale.domain([minValue, maxValue]);
            //axis
            this.xAxis.tickValues([minValue, maxValue])
                .tickFormat(this.format);

            //special classes
            this._optionClasses();
            //resize
            this.resize();
        },

        /**
         * Executes everytime the container or vizabi is resized
         * Ideally,it contains only operations related to size
         */
        resize: function() {

            this.profile = profiles[this.getLayoutProfile()];

            var slider_w = parseInt(this.slider_outer.style("width"), 10);
            var slider_h = parseInt(this.slider_outer.style("height"), 10);
            this.width = slider_w - this.profile.margin.left - this.profile.margin.right;
            this.height = slider_h - this.profile.margin.bottom - this.profile.margin.top;
            var _this = this;

            //translate according to margins
            this.slider.attr("transform", "translate(" + this.profile.margin.left + "," + this.profile.margin.top + ")");

            //adjust scale width if it was not set manually before
            if (this.xScale.range()[1] = 1) this.xScale.range([0, this.width]);

            //adjust axis with scale
            this.xAxis = this.xAxis.scale(this.xScale)
                .tickPadding(this.profile.label_spacing);

            this.axis.attr("transform", "translate(0," + this.height / 2 + ")")
                .call(this.xAxis);

            this.slide.select(".background")
                .attr("height", this.height);

            //size of handle
            this.handle.attr("transform", "translate(0," + this.height / 2 + ")")
                .attr("r", this.profile.radius);

        },


        /**
         * Getter and setter for styling profile
         * @returns {Structure} current profile if not set
         * @returns {class} this if set
         */
        getSetProfile: function(arg) {
            if (!arguments.length) return profiles;
            profiles = arg;
            return this;
        },


        /**
         * Getter and setter for scale range
         * @returns {Structure} current profile if not set
         * @returns {class} this if set
         */
        getSetScaleRangeMax: function(arg) {
            if (!arguments.length) return this.xScale.range()[1];
            this.xScale.range([0, arg]);
            return this;
        },


        /**
         * Gets brushed function to be executed when dragging
         * @returns {Function} brushed function
         */
        _getBrushed: function() {

            var _this = this;
            return function() {
                if (!_this._blockUpdate) {
                    _this.model.time.pause();
                    _this._optionClasses();
                    _this._blockUpdate = true;
                    _this.element.classed(class_dragging, true);
                }

                var value = _this.brush.extent()[0];

                //set brushed properties
                if (d3.event.sourceEvent) {
                    value = _this.xScale.invert(d3.mouse(this)[0]);
                }

                //set time according to dragged position
                if (value - _this.model.time.value !== 0) {
                    _this._setTime(value);
                }
                //position handle
                _this._setHandle();
            }
        },

        /**
         * Gets brushedEnd function to be executed when dragging ends
         * @returns {Function} brushedEnd function
         */
        _getBrushedEnd: function() {

            var _this = this;
            return function() {
                _this._blockUpdate = false;
                _this.model.time.pause();
                _this.element.classed(class_dragging, false);
                _this.model.time.snap();
            }
        },

        /**
         * Sets the handle to the correct position
         * @param {Boolean} transition whether to use transition or not
         */
        _setHandle: function(transition) {
            var value = this.model.time.value;
            this.slide.call(this.brush.extent([value, value]));

            this.valueText.text(this.format(value));

            if (this.model.time.start - this.model.time.value === 0) {
                transition = false;
            }

            if (transition) {
                var speed = this.model.time.speed,
                    old_pos = this.handle.attr("cx"),
                    new_pos = this.xScale(value);

                this.handle.attr("cx", old_pos)
                    .transition()
                    .duration(speed)
                    .ease("linear")
                    .attr("cx", new_pos);

                this.valueText.attr("transform", "translate(" + old_pos + "," + (this.height / 2) + ")")
                    .transition()
                    .duration(speed)
                    .ease("linear")
                    .attr("transform", "translate(" + new_pos + "," + (this.height / 2) + ")");

            } else {
                var pos = this.xScale(value);
                this.handle.attr("cx", pos);
                this.valueText.attr("transform", "translate(" + pos + "," + (this.height / 2) + ")");
            }
        },

        /**
         * Sets the current time model to time
         * @param {number} time The time
         */
        _setTime: function(time) {
            //update state
            var _this = this,
                frameRate = 50;

            //avoid updating more than once in "frameRate"
            var now = new Date();
            if (this._updTime != null && now - this._updTime < frameRate) return;
            this._updTime = now;

            _this.model.time.value = time;
        },

        /**
         * Applies some classes to the element according to options
         */
        _optionClasses: function() {
            //show/hide classes

            var show_limits = this.ui.show_limits;
            var show_value = this.ui.show_value;
            var show_value_when_drag_play = this.ui.show_value_when_drag_play;
            var axis_aligned = this.ui.axis_aligned;
            var show_play = (this.ui.show_button) && (this.model.time.playable);

            if (!show_limits) {
                this.xAxis.tickValues([]).ticks(0);
            }

            this.element.classed(class_hide_play, !show_play);
            this.element.classed(class_playing, this.model.time.playing);
            this.element.classed(class_show_value, show_value);
            this.element.classed(class_show_value_when_drag_play, show_value_when_drag_play);
            this.element.classed(class_axis_aligned, axis_aligned);
        }
    });

}).call(this);
/*!
 * VIZABI Entities Model
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;

    Vizabi.Model.extend('entities', {
        /**
         * Initializes the entities model.
         * @param {Object} values The initial values of this model
         * @param parent A reference to the parent model
         * @param {Object} bind Initial events to bind
         */
        init: function(values, parent, bind) {

            this._type = "entities";
            values = utils.extend({
                show: {},
                select: [],
                brush: [],
                opacityNonSelected: 0.3
            }, values);

            this._visible = [];

            this._super(values, parent, bind);
        },

        /**
         * Validates the model
         * @param {boolean} silent Block triggering of events
         */
        validate: function(silent) {
            var _this = this;
            var dimension = this.getDimension();
            var visible_array = this._visible.map(function(d) {
                return d[dimension]
            });

            this.select = this.select.filter(function(f) {
                return visible_array.indexOf(f[dimension]) !== -1;
            });
            this.brush = this.brush.filter(function(f) {
                return visible_array.indexOf(f[dimension]) !== -1;
            });
        },

        /**
         * Gets the dimensions in this entities
         * @returns {String} String with dimension
         */
        getDimension: function() {
            return this.show.dim;
        },

        /**
         * Gets the filter in this entities
         * @returns {Array} Array of unique values
         */
        getFilter: function() {
            return this.show.filter.getObject();
        },

        /**
         * Gets the selected items
         * @returns {Array} Array of unique selected values
         */
        getSelected: function() {
            var dim = this.getDimension();
            return this.select.map(function(d) {
                return d[dim];
            });
        },

        /**
         * Selects or unselects an entity from the set
         */
        selectEntity: function(d, timeFormatter) {
            var dimension = this.getDimension();
            var value = d[dimension];
            if (this.isSelected(d)) {
                this.select = this.select.filter(function(d) {
                    return d[dimension] !== value;
                });
            } else {
                var added = {};
                added[dimension] = value;
                added["labelOffset"] = [0, 0];
                if (timeFormatter) {
                    added["trailStartTime"] = timeFormatter(d.time);
                }
                this.select = this.select.concat(added);
            }
        },

        setLabelOffset: function(d, xy) {
            var dimension = this.getDimension();
            var value = d[dimension];

            utils.find(this.select, function(d) {
                return d[dimension] === value;
            }).labelOffset = xy;

            //force the model to trigger events even if value is the same
            this.set("select", this.select, true);
        },

        /**
         * Selects an entity from the set
         * @returns {Boolean} whether the item is selected or not
         */
        isSelected: function(d) {
            var dimension = this.getDimension();
            var value = d[this.getDimension()];

            var select_array = this.select.map(function(d) {
                return d[dimension];
            });

            return select_array.indexOf(value) !== -1;
        },

        /**
         * Clears selection of items
         */
        clearSelected: function() {
            this.select = [];
        },

        //TODO: join the following 3 methods with the previous 3

        /**
         * Highlights an entity from the set
         */
        highlightEntity: function(d, timeFormatter) {
            var dimension = this.getDimension();
            var value = d[dimension];
            if (!this.isHighlighted(d)) {
                var added = {};
                added[dimension] = value;
                if (timeFormatter) {
                    added["trailStartTime"] = timeFormatter(d.time);
                }
                this.brush = this.brush.concat(added);
            }
        },

        /**
         * Unhighlights an entity from the set
         */
        unhighlightEntity: function(d, timeFormatter) {
            var dimension = this.getDimension();
            var value = d[dimension];
            if (this.isHighlighted(d)) {
                this.brush = this.brush.filter(function(d) {
                    return d[dimension] !== value;
                });
            }
        },

        /**
         * Checks whether an entity is highlighted from the set
         * @returns {Boolean} whether the item is highlighted or not
         */
        isHighlighted: function(d) {
            var dimension = this.getDimension();
            var value = d[this.getDimension()];

            var brush_array = this.brush.map(function(d) {
                return d[dimension];
            });

            return brush_array.indexOf(value) !== -1;
        },

        /**
         * Clears selection of items
         */
        clearHighlighted: function() {
            this.brush = [];
        }
    });

}).call(this);
/*!
 * VIZABI Entities Model
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;

    //do not create model if d3 is not defined
    if(!Vizabi._require('d3')) return;

    //constant time formats
    var time_formats = {
        "year": d3.time.format("%Y"),
        "month": d3.time.format("%Y-%m"),
        "week": d3.time.format("%Y-W%W"),
        "day": d3.time.format("%Y-%m-%d"),
        "hour": d3.time.format("%Y-%m-%d %H"),
        "minute": d3.time.format("%Y-%m-%d %H:%M"),
        "second": d3.time.format("%Y-%m-%d %H:%M:%S")
    };

    var time_units = Object.keys(time_formats);
    var formatters = utils.values(time_formats);

    Vizabi.Model.extend('time', {

        /**
         * Initializes the language model.
         * @param {Object} values The initial values of this model
         * @param parent A reference to the parent model
         * @param {Object} bind Initial events to bind
         */
        init: function(values, parent, bind) {

            this._type = "time";
            //default values for time model
            values = utils.extend({
                value: "1800",
                start: "1800",
                end: "2014",
                playable: true,
                playing: false,
                loop: false,
                round: true,
                speed: 500,
                unit: "year",
                format: "%Y", //defaults to year format
                step: 1, //step must be integer
                adaptMinMaxZoom: false
            }, values);

            //same constructor
            this._super(values, parent, bind);

            var _this = this;
            this._playing_now = false;

            //bing play method to model change
            this.on({
                "change:playing": function() {
                    if (_this.playing === true) {
                        _this._startPlaying();
                    } else {
                        _this._stopPlaying();
                    }
                },
                "set": function() {
                    //auto play if playing is true by reseting variable
                    if (_this.playing === true) {
                        _this.set('playing', true, true); //3rd argumennt forces update
                    }

                    this.snap("start");
                    this.snap("end");
                    this.snap("value");
                }
            });
        },

        /**
         * Formats value, start and end dates to actual Date objects
         */
        _formatToDates: function() {

            var date_attr = ["value", "start", "end"];
            for (var i = 0; i < date_attr.length; i++) {
                var attr = date_attr[i];
                if (!utils.isDate(this[attr])) {
                    for (var j = 0; j < formatters.length; j++) {
                        var formatter = formatters[j];
                        var date = formatter.parse(this[attr].toString());
                        if (utils.isDate(date)) {
                            this.set(attr, date);
                            break;
                        }
                    };
                }
            };
        },

        /**
         * Validates the model
         */
        validate: function() {

            //unit has to be one of the available_time_units
            if (time_units.indexOf(this.unit) === -1) {
                this.unit = "year";
            }

            if (this.step < 1) {
                this.step = "year";
            }

            //make sure dates are transformed into dates at all times
            if (!utils.isDate(this.start) || !utils.isDate(this.end) || !utils.isDate(this.value)) {
                this._formatToDates();
            }

            //end has to be >= than start
            if (this.end < this.start) {
                this.end = this.start;
            }
            //value has to be between start and end
            if (this.value < this.start) {
                this.value = this.start;
            } else if (this.value > this.end) {
                this.value = this.end;
            }

            if (this.playable === false && this.playing === true) {
                this.playing = false;
            }
        },

        /**
         * Plays time
         */
        play: function() {
            this.playing = true;
        },

        /**
         * Pauses time
         */
        pause: function() {
            this.playing = false;
        },

        /**
         * gets time range
         * @returns range between start and end
         */
        getRange: function() {
            return d3.time[this.unit].range(this.start, this.end, this.step);
        },

        /**
         * Gets the dimensions in time
         * @returns {String} time dimension
         */
        getDimension: function() {
            return "time";
        },

        /**
         * Gets filter for time
         * @returns {Object} time filter
         */
        getFilter: function() {
            var start = d3.time.format(this.format || "%Y")(this.start),
                end = d3.time.format(this.format || "%Y")(this.end),
                filter = {
                    "time": [
                        [start, end]
                    ]
                };
            return filter;
        },

        /**
         * gets formatted value
         * @param {String} f Optional format. Defaults to YYYY
         * @param {String} attr Optional attribute. Defaults to "value"
         * @returns {String} formatted value
         */
        getFormatted: function(f, attr) {
            if (!f) f = "%Y";
            if (!attr) attr = "value";

            var format = d3.time.format(f);
            return format(this[attr]);
        },
        
        /**
         * Snaps the time to integer
         * possible inputs are "start", "end", "value". "value" is default
         */
        snap: function(what){
            if (!this.round) return
            if(what == null) what = "value";
            var op = 'round';
            if (this.round === 'ceil') op = 'ceil';
            if (this.round === 'floor') op = 'floor';
            var time = d3.time[this.unit][op](this[what]);

            this.set(what, time, true); //3rd argumennt forces update
        },

        /**
         * Starts playing the time, initializing the interval
         */
        _startPlaying: function() {
            //don't play if it's not playable or if it's already playing
            if (!this.playable || this._playing_now) return;

            this._playing_now = true;

            var _this = this,
                time = this.value,
                interval = this.speed; // * this.step;
            
            this.snap();

            //go to start if we start from end point
            if (_this.end - time <= 0) {
                time = this.start;
                _this.value = time;
            }

            //we don't create intervals directly
            this._intervals.setInterval('playInterval_' + this._id, function() {
                if (time >= _this.end) {
                    if (_this.loop) {
                        time = _this.start;
                        _this.value = time
                    } else {
                        _this.playing = false;
                    }
                    return;
                } else {
                    time = d3.time[_this.unit].offset(time, _this.step);
                    _this.value = time;
                }
            }, interval);

            this.trigger("play");
        },

        /**
         * Stops playing the time, clearing the interval
         */
        _stopPlaying: function() {
            this._playing_now = false;
            this._intervals.clearInterval('playInterval_' + this._id);
            this.snap();
            this.trigger("pause");
        }

    });


}).call(this);
/*!
 * VIZABI Entities Model
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;

    Vizabi.Model.extend('language', {

        /**
         * Initializes the language model.
         * @param {Object} values The initial values of this model
         * @param parent A reference to the parent model
         * @param {Object} bind Initial events to bind
         */
        init: function(values, parent, bind) {

            this._type = "language";
            //default values for state model
            values = utils.extend({
                id: "en",
                strings: {}
            }, values);

            //same constructor, with same arguments
            this._super(values, parent, bind);
        },

        /**
         * Gets a certain UI string
         * @param {String} id string identifier
         * @param {String} lang language
         * @param {Object} ui_strings ui_strings object or model
         * @returns {string} translated string
         */
        getUIString: function(id, lang, strings) {
            lang = lang || this.id;
            strings = strings || this.strings;

            if (strings && strings.hasOwnProperty(lang) && strings[lang].hasOwnProperty(id)) {
                return strings[lang][id];
            } else {
                return id;
            }
        },

        /**
         * Gets the translation function
         * @returns {string} translation function
         */
        getTFunction: function() {
            var lang = this.id,
                strings = this.strings,
                _this = this;

            return function(string) {
                return _this.getUIString(string, lang, strings);
            }
        }

    });

}).call(this);

/*!
 * Inline Reader
 * the simplest reader possible
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;

    Vizabi.Reader.extend('inline', {
        init: function(reader_info) {
            this.name = "inline";
            this._super(reader_info);
        },
        read: function() {
            return (new Vizabi.Promise).resolve();
        }
    });

}).call(this);
/*!
 * Local JSON reader
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;
    var Promise = Vizabi.Promise;

    Vizabi.Reader.extend('local-json', {

        /**
         * Initializes the reader.
         * @param {Object} reader_info Information about the reader
         */
        init: function(reader_info) {
            this._name = 'local-json';
            this._data = [];
            this._basepath = reader_info.path;
            if (!this._basepath) {
                utils.error("Missing base path for local-json reader");
            };
        },

        /**
         * Reads from source
         * @param {Object} query to be performed
         * @param {String} language language
         * @returns a promise that will be resolved when data is read
         */
        read: function(query, language) {
            var _this = this;
            var p = new Promise();

            //this specific reader has support for the tag {{LANGUAGE}}
            var path = this._basepath.replace("{{LANGUAGE}}", language);
            _this._data = [];

            d3.json(path, function(error, res) {
                if (error) {
                    utils.error("Error Happened While Loading File: " + path, error);
                    return;
                }

                //TODO: Improve local json filtering
                var data = res[0];
                //rename geo.category to geo.cat
                var where = query.where;
                if (where['geo.category']) {
                    where['geo.cat'] = utils.clone(where['geo.category']);
                    delete where['geo.category'];
                }

                for (var filter in where) {
                    var wanted = where[filter];

                    if (wanted[0] === "*") {
                        continue;
                    }

                    //if not time, normal filtering
                    if (filter !== "time") {
                        data = data.filter(function(row) {
                            var val = row[filter];
                            var found = -1;

                            //normalize
                            if (!utils.isArray(val)) val = [val];

                            //find first occurence
                            utils.forEach(val, function(j, i) {
                                if (wanted.indexOf(j) !== -1) {
                                    found = i;
                                    return false;
                                }
                            });
                            //if found, include
                            return found !== -1;
                        });
                    }
                    //in case it's time, special filtering
                    else {
                        var timeRange = wanted[0];
                        var min = timeRange[0];
                        var max = timeRange[1] || min;

                        data = data.filter(function(row) {
                            var val = row[filter]
                            return val >= min && val <= max;
                        });
                    }

                }

                //only selected items get returned
                data = data.map(function(row) {
                    return utils.clone(row, query.select);
                })

                _this._data = data;

                p.resolve();
            });

            return p;
        },

        /**
         * Gets the data
         * @returns all data
         */
        getData: function() {
            return this._data;
        }
    });

}).call(this);
/*!
 * Waffle server Reader
 * the simplest reader possible
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var utils = Vizabi.utils;
    var Promise = Vizabi.Promise;

    Vizabi.Reader.extend('waffle-server', {

        /**
         * Initializes the reader.
         * @param {Object} reader_info Information about the reader
         */
        init: function(reader_info) {
            this._name = 'waffle-reader';
            this._data = [];
            this._basepath = reader_info.path || "https://waffle.gapminder.org/api/v1/query";
        },

        /**
         * Reads from source
         * @param {Array} query to be performed
         * @param {String} language language
         * @returns a promise that will be resolved when data is read
         */
        read: function(query, language) {
            var _this = this;
            var p = new Promise();
            var formatted;

            this._data = [];

            var where = query.where;
            //format time query if existing
            if (where['time']) {
                //[['1990', '2012']] -> '1990-2012'
                where['time'] = where['time'][0].join('-');
            }
            //rename geo.category to geo.cat
            if (where['geo.category']) {
                where['geo.cat'] = utils.clone(where['geo.category']);
                delete where['geo.category'];
            }


            formatted = {
                "SELECT": query.select,
                "WHERE": where,
                "FROM": "humnum"
            };

            var pars = {
                query: [formatted],
                lang: language
            };

            utils.post(this._basepath, pars, function(res) {
                _this._data = res;
                p.resolve();
            }, function() {
                console.log("Error loading from Waffle Server:", _this._basepath);
                p.reject('Could not read from waffle server');
            }, true);

            return p;
        },

        /**
         * Gets the data
         * @returns all data
         */
        getData: function() {
            return this._data;
        }
    });

}).call(this);
/*!
 * VIZABI BARCHART
 */

(function() {

    "use strict";

    var root = this;
    var Vizabi = root.Vizabi;
    var Promise = Vizabi.Promise;
    var utils = Vizabi.utils;

    //warn client if d3 is not defined
    if (!Vizabi._require('d3')) {
        return;
    }

    var comp_template = 'src/tools/_examples/bar-chart/bar-chart-comp.html';

    //BAR CHART COMPONENT
    Vizabi.Component.extend('gapminder-barchart', {

        /**
         * Initializes the component (Bar Chart).
         * Executed once before any template is rendered.
         * @param {Object} config The options passed to the component
         * @param {Object} context The component's parent
         */
        init: function(config, context) {
            this.name = 'bar-chart';
            this.template = comp_template;

            //define expected models for this component
            this.model_expects = [{
                name: "time",
                type: "time"
            }, {
                name: "entities",
                type: "entities"
            }, {
                name: "marker",
                type: "model"
            }, {
                name: "language",
                type: "language"
            }];

            var _this = this;
            this.model_binds = {
                "change:time:value": function(evt) {
                    _this.updateEntities();
                }
            };

            //contructor is the same as any component
            this._super(config, context);

            this.xScale = null;
            this.yScale = null;
            this.cScale = d3.scale.category10();

            this.xAxis = d3.svg.axisSmart();
            this.yAxis = d3.svg.axisSmart();
        },

        /**
         * DOM is ready
         */
        domReady: function() {

            this.element = d3.select(this.element);

            this.graph = this.element.select('.vzb-bc-graph');
            this.yAxisEl = this.graph.select('.vzb-bc-axis-y');
            this.xAxisEl = this.graph.select('.vzb-bc-axis-x');
            this.yTitleEl = this.graph.select('.vzb-bc-axis-y-title');
            this.bars = this.graph.select('.vzb-bc-bars');

            var _this = this;
            this.on("resize", function() {
                _this.updateEntities();
            });
        },

        /*
         * Both model and DOM are ready
         */
        ready: function() {
            this.updateIndicators();
            this.resize();
            this.updateEntities();
        },

        /**
         * Changes labels for indicators
         */
        updateIndicators: function() {
            var _this = this;
            this.translator = this.model.language.getTFunction();
            this.duration = this.model.time.speed;
            this.timeFormatter = d3.time.format(this.model.time.formatInput);

            var titleStringY = this.translator("indicator/" + this.model.marker.axis_y.value);

            var yTitle = this.yTitleEl.selectAll("text").data([0]);
            yTitle.enter().append("text");
            yTitle
                .attr("y", "-6px")
                .attr("x", "-9px")
                .attr("dx", "-0.72em")
                .text(titleStringY);

            this.yScale = this.model.marker.axis_y.getScale();
            this.xScale = this.model.marker.axis_x.getScale();
            this.cScale = this.model.marker.color.getScale();

            this.yAxis.tickFormat(_this.model.marker.axis_y.tickFormatter);
            this.xAxis.tickFormat(_this.model.marker.axis_x.tickFormatter);
        },

        /**
         * Updates entities
         */
        updateEntities: function() {

            var _this = this;
            var time = this.model.time;
            var currTime = time.value;
            var duration = (time.playing) ? time.speed : 0;

            var items = this.model.marker.label.getItems({
                time: currTime
            });

            this.entityBars = this.bars.selectAll('.vzb-bc-bar')
                .data(items);

            //exit selection
            this.entityBars.exit().remove();

            //enter selection -- init circles
            this.entityBars.enter().append("rect")
                .attr("class", "vzb-bc-bar")
                .on("mousemove", function(d, i) {
                })
                .on("mouseout", function(d, i) {
                })
                .on("click", function(d, i) {
                });

            //positioning and sizes of the bars

            var bars = this.bars.selectAll('.vzb-bc-bar');

            barWidth = this.xScale.rangeBand();

            this.bars.selectAll('.vzb-bc-bar')
                .attr("width", barWidth)
                .attr("fill", function(d) {
                    return _this.cScale(_this.model.marker.color.getValue(d));
                })
                .attr("x", function(d) {
                    return _this.xScale(_this.model.marker.axis_x.getValue(d));
                })
                .transition().duration(duration).ease("linear")
                .attr("y", function(d) {
                    return _this.yScale(_this.model.marker.axis_y.getValue(d));
                })
                .attr("height", function(d) {
                    return _this.height - _this.yScale(_this.model.marker.axis_y.getValue(d));
                });
        },

        /**
         * Executes everytime the container or vizabi is resized
         * Ideally,it contains only operations related to size
         */
        resize: function() {

            var _this = this;

            this.profiles = {
                "small": {
                    margin: {
                        top: 30,
                        right: 20,
                        left: 40,
                        bottom: 40
                    },
                    padding: 2,
                    minRadius: 2,
                    maxRadius: 40
                },
                "medium": {
                    margin: {
                        top: 30,
                        right: 60,
                        left: 60,
                        bottom: 40
                    },
                    padding: 2,
                    minRadius: 3,
                    maxRadius: 60
                },
                "large": {
                    margin: {
                        top: 30,
                        right: 60,
                        left: 60,
                        bottom: 40
                    },
                    padding: 2,
                    minRadius: 4,
                    maxRadius: 80
                }
            };

            this.activeProfile = this.profiles[this.getLayoutProfile()];
            var margin = this.activeProfile.margin;


            //stage
            this.height = parseInt(this.element.style("height"), 10) - margin.top - margin.bottom;
            this.width = parseInt(this.element.style("width"), 10) - margin.left - margin.right;

            this.graph
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //update scales to the new range
            if (this.model.marker.axis_y.scaleType !== "ordinal") {
                this.yScale.range([this.height, 0]);
            } else {
                this.yScale.rangePoints([this.height, 0], _this.activeProfile.padding).range();
            }
            if (this.model.marker.axis_x.scaleType !== "ordinal") {
                this.xScale.range([0, this.width]);
            } else {
                this.xScale.rangePoints([0, this.width], _this.activeProfile.padding).range();
            }

            //apply scales to axes and redraw
            this.yAxis.scale(this.yScale)
                .orient("left")
                .tickSize(6, 0)
                .tickSizeMinor(3, 0)
                .labelerOptions({
                    scaleType: this.model.marker.axis_y.scaleType,
                    toolMargin: margin,
                    limitMaxTickNumber: 6
                });

            this.xAxis.scale(this.xScale)
                .orient("bottom")
                .tickSize(6, 0)
                .tickSizeMinor(3, 0)
                .labelerOptions({
                    scaleType: this.model.marker.axis_x.scaleType,
                    toolMargin: margin
                });

            this.xAxisEl.attr("transform", "translate(0," + this.height + ")")
                .call(this.xAxis);

            this.xScale.rangeRoundBands([0, this.width], 0.1, 0.2);

            this.yAxisEl.call(this.yAxis);
            this.xAxisEl.call(this.xAxis);

        },


        drawBars: function() {

        }
    });

    //BAR CHART TOOL
    Vizabi.Tool.extend('BarChart', {

        /**
         * Initializes the tool (Bar Chart Tool).
         * Executed once before any template is rendered.
         * @param {Object} config Initial config, with name and placeholder
         * @param {Object} options Options such as state, data, etc
         */
        init: function(config, options) {

            this.name = "bar-chart";

            //specifying components
            this.components = [{
                    component: 'gapminder-barchart',
                    placeholder: '.vzb-tool-viz',
                    model: ["state.time", "state.entities", "state.marker", "language"] //pass models to component
                },
                // {
                //     component: '_gapminder/buttonlist',
                //     placeholder: '.vzb-tool-buttonlist',
                //     model: ['state', 'ui', 'language'],
                //     buttons: ['fullscreen']
                // },
                {
                    component: 'gapminder-timeslider',
                    placeholder: '.vzb-tool-timeslider',
                    model: ["state.time"]
                }
            ];

            //default options
            this.default_options = {
                state: {
                    _type_: "model",
                    _defs_: {
                        //timespan of the visualization
                        time: {
                            _type_: "model",
                            _defs_: {
                                start: 1952,
                                end: 2012,
                                value: 2000,
                                step: 1,
                                speed: 300,
                                formatInput: "%Y"
                            }
                        },
                        //entities we want to show
                        entities: {
                            _type_: "model",
                            _defs_: {
                                show: {
                                    _type_: "model",
                                    _defs_: {
                                        dim: {
                                            _type_: "string",
                                            _defs_: "geo"
                                        },
                                        filter: {
                                            _type_: "object",
                                            _defs_: {
                                                "geo": ["*"],
                                                "geo.category": ["region"]
                                            }
                                        }
                                    }
                                }
                            }
                        },

                        //how we show it
                        marker: {
                            _type_: "model",
                            _defs_: {
                                dimensions: {
                                    _type_: "array",
                                    _defs_: ["entities", "time"]
                                },
                                label: {
                                    _type_: "hook",
                                    _defs_: {
                                        use: {
                                            _type_: "string",
                                            _defs_: "property",
                                            _opts_: ["property", "indicator", "value"]
                                        },
                                        value: {
                                            _type_: "string",
                                            _defs_: "geo.name"
                                        }
                                    }
                                },
                                axis_y: {
                                    _type_: "hook",
                                    _defs_: {
                                        use: {
                                            _type_: "string",
                                            _defs_: "indicator"
                                        },
                                        value: {
                                            _type_: "string",
                                            _defs_: "lex"
                                        },
                                        scaleType: {
                                            _type_: "string",
                                            _defs_: "linear"
                                        }
                                    }
                                },
                                axis_x: {
                                    _type_: "hook",
                                    _defs_: {
                                        use: {
                                            _type_: "string",
                                            _defs_: "property",
                                            _opts_: ["property"]
                                        },
                                        value: {
                                            _type_: "string",
                                            _defs_: "geo.name"
                                        }
                                    }
                                },
                                color: {
                                    _type_: "hook",
                                    _defs_: {
                                        use: {
                                            _type_: "string",
                                            _defs_: "property"
                                        },
                                        value: {
                                            _type_: "string",
                                            _defs_: "geo.region"
                                        },
                                        palette: {
                                            _type_: "object",
                                            _defs_: {
                                                "_default": "#ffb600",
                                                "world": "#ffb600",
                                                "eur": "#FFE700",
                                                "afr": "#00D5E9",
                                                "asi": "#FF5872",
                                                "ame": "#7FEB00"
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                },

                data: {
                    _type_: "model",
                    _defs_: {
                        reader: {
                            _type_: "string",
                            _defs_: "local-json"
                        },
                        path: {
                            _type_: "string",
                            _defs_: "local_data/waffles/{{LANGUAGE}}/basic-indicators.json"
                        }
                    }
                },

                ui: {
                    _type_: "model",
                    _defs_: {
                        'vzb-tool-bar-chart': {
                            _type_: "object",
                            _defs_: {}
                        }
                    }
                },

                //language properties
                language: {
                    _type_: "model",
                    _defs_: {
                        id: {
                            _type_: "string",
                            _defs_: "en"
                        },
                        strings: {
                            _type_: "object",
                            _defs_: {
                                en: {
                                    "title": "",
                                    "buttons/expand": "Full screen",
                                    "buttons/unexpand": "Leave full screen",
                                    "buttons/lock": "Lock",
                                    "buttons/find": "Find",
                                    "buttons/colors": "Colors",
                                    "buttons/size": "Size",
                                    "buttons/more_options": "Options",
                                    "indicator/lex": "Life expectancy",
                                    "indicator/gdp_per_cap": "GDP per capita",
                                    "indicator/pop": "Population",
                                    "indicator/geo.region": "Region",
                                    "indicator/geo": "Geo code",
                                    "indicator/time": "",
                                    "indicator/geo.category": "Geo category"
                                }
                            }
                        }
                    }
                }
            };

            //constructor is the same as any tool
            this._super(config, options);
        },

        /**
         * Validating the tool model
         * @param model the current tool model to be validated
         */
        validate: function(model) {

            model = this.model || model;

            var time = model.state.time;
            var marker = model.state.marker.label;

            //don't validate anything if data hasn't been loaded
            if (!marker.getItems() || marker.getItems().length < 1) {
                return;
            }

            var dateMin = marker.getLimits('time').min,
                dateMax = marker.getLimits('time').max;

            if (time.start < dateMin) {
                time.start = dateMin;
            }
            if (time.end > dateMax) {
                time.end = dateMax;
            }
        }
    });


}).call(this);
(function() {

    "use strict";

    var root = this;

    //warn client if d3 is not defined
    if (!Vizabi._require('d3')) {
        return;
    }

    d3.svg.axisSmart = function(){
        
    return function d3_axis_smart(_super) {
        
        var VERTICAL = 'vertical axis';
        var HORIZONTAL = 'horizontal axis';
        var X = 'labels stack side by side';
        var Y = 'labels stack top to bottom';
        
        var OPTIMISTIC = 'optimistic approximation: labels have different lengths';
        var PESSIMISTIC = 'pessimistic approximation: all labels have the largest length';
        var DEFAULT_LOGBASE = 10;
        
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        function axis(g) {
            if(highlightValue!=null){axis.highlightValueRun(g); return;}
            
            // measure the width and height of one digit
            var widthSampleG = g.append("g").attr("class","tick widthSampling");
            var widthSampleT = widthSampleG.append('text').text('0');
            
            options.cssMarginTop = widthSampleT.style("margin-top");
            options.cssMarginBottom = widthSampleT.style("margin-bottom");
            options.cssMarginLeft = widthSampleT.style("margin-left");
            options.cssMarginRight = widthSampleT.style("margin-right");
            options.widthOfOneDigit = widthSampleT[0][0].getBBox().width;
            options.heightOfOneDigit = widthSampleT[0][0].getBBox().height;
            widthSampleG.remove();
            
            
            // run label factory - it will store labels in tickValues property of axis
            axis.labelFactory(options);
            
            //if(axis.orient()=="bottom") console.log("ordered", axis.tickValues())
            // construct the view (d3 constructor is used)
            if(options.transitionDuration>0){
                _super(g.transition().duration(options.transitionDuration));
            }else{
                _super(g);
            }
            //if(axis.orient()=="bottom") console.log("received", g.selectAll("text").each(function(d){console.log(d)}))
            
            var orient = axis.orient()=="top"||axis.orient()=="bottom"?HORIZONTAL:VERTICAL;
            var dimension = (orient==HORIZONTAL && axis.pivot() || orient==VERTICAL && !axis.pivot())?Y:X;

            g.selectAll('.vzb-axis-value')
                .data([null])
                .enter().append('g')
                .attr("class",'vzb-axis-value')
                .append("text")
                .style("opacity",0);
            
            // patch the label positioning after the view is generated
            g.selectAll("text")
                .each(function(d,i){
                    var view = d3.select(this);
                
                    if(axis.pivot() == null) return;
                    view.attr("transform","rotate("+(axis.pivot()?-90:0)+")");
                    view.style("text-anchor", dimension==X?"middle":"end");
                    view.attr("x",  dimension==X?0:(-axis.tickPadding() - axis.tickSize()));
                    view.attr("y", dimension==X? (orient==VERTICAL?-1:1)*(axis.tickPadding() + axis.tickSize()):0);
                    view.attr("dy", dimension==X?(orient==VERTICAL?0:".72em"):".32em");
                    
                    if(axis.repositionLabels() == null) return;
                    var shift = axis.repositionLabels()[i] || {x:0, y:0}; 
                    view.attr("x",+view.attr("x") + shift.x);
                    view.attr("y",+view.attr("y") + shift.y);
                })
            
            if (axis.tickValuesMinor()==null) axis.tickValuesMinor([]);
                // add minor ticks
                var minorTicks = g.selectAll(".tickMinor").data(tickValuesMinor);
                minorTicks.exit().remove();
                minorTicks.enter().append("line")
                    .attr("class", "tickMinor");

                var tickLengthOut = axis.tickSizeMinor().outbound;
                var tickLengthIn = axis.tickSizeMinor().inbound;
                var scale = axis.scale();
                minorTicks
                    .attr("y1", orient==HORIZONTAL? (axis.orient()=="top"?1:-1)*tickLengthIn : scale)
                    .attr("y2", orient==HORIZONTAL? (axis.orient()=="top"?-1:1)*tickLengthOut : scale)
                    .attr("x1", orient==VERTICAL? (axis.orient()=="right"?-1:1)*tickLengthIn : scale)
                    .attr("x2", orient==VERTICAL? (axis.orient()=="right"?1:-1)*tickLengthOut : scale)
            
        };
        
        
        axis.highlightValueRun = function(g){
            var orient = axis.orient()=="top"||axis.orient()=="bottom"?HORIZONTAL:VERTICAL;
            
            g.selectAll(".tick")
                .each(function(d,t){
                    d3.select(this).select("text")
                        .transition()
                        .duration(highlightTransDuration)
                        .ease("linear")
                        .style("opacity", highlightValue=="none"? 1 : Math.min(1, Math.pow(
                                    Math.abs(axis.scale()(d)-axis.scale()(highlightValue))/
                                    (axis.scale().range()[1] - axis.scale().range()[0])*5, 2) 
                              ))
                })
            
            
            g.select('.vzb-axis-value')    
                .transition()
                .duration(highlightTransDuration)
                .ease("linear")
                .attr("transform", highlightValue=="none"? "translate(0,0)" : "translate("
                    + (orient==HORIZONTAL?axis.scale()(highlightValue):0) +","
                    + (orient==VERTICAL?axis.scale()(highlightValue):0) + ")"
                )
                
            g.select('.vzb-axis-value').select("text")
                .text(axis.tickFormat()(highlightValue=="none"?0:highlightValue))
                .style("opacity",(highlightValue=="none"?0:1));

            highlightValue = null;
        }
        
        
        var highlightValue = null;
        axis.highlightValue = function(arg){
            if (!arguments.length) return highlightValue;
            highlightValue = arg;
            return axis;
        }
        
        var highlightTransDuration = 0;
        axis.highlightTransDuration = function(arg){
            if (!arguments.length) return highlightTransDuration;
            highlightTransDuration = arg;
            return axis;
        }        
        
        var repositionLabels = null;
        axis.repositionLabels = function(arg){
            if (!arguments.length) return repositionLabels;
            repositionLabels = arg;
            return axis;
        };
        
        var pivot = false;
        axis.pivot = function(arg) {
            if (!arguments.length) return pivot;
            pivot = !!arg;
            return axis;
        };
                
        var tickValuesMinor = [];
        axis.tickValuesMinor = function(arg) {
            if (!arguments.length) return tickValuesMinor;
            tickValuesMinor = arg;
            return axis;
        };     
        
        var tickSizeMinor = {outbound:0, inbound:0};
        axis.tickSizeMinor = function(arg1, arg2) {
            if (!arguments.length) return tickSizeMinor;
            tickSizeMinor = {outbound:arg1, inbound:arg2||0};
            meow("setting", tickSizeMinor)
            return axis;
        };
        
        var options = {};
        axis.labelerOptions = function(arg) {
            if (!arguments.length) return options;
            options = arg;
            return axis;
        };
        
        axis.labelFactory = function(options){
            this.METHOD_REPEATING = 'repeating specified powers';
            this.METHOD_DOUBLING = 'doubling the value';

            if(options==null) options = {}
            if(options.scaleType!="linear"&&
               options.scaleType!="time"&&
               options.scaleType!="genericLog"&&
               options.scaleType!="log" && 
               options.scaleType!="ordinal") {
                return axis.ticks(ticksNumber)
                            .tickFormat(null)
                            .tickValues(null)
                            .tickValuesMinor(null)
                            .pivot(null)
                            .repositionLabels(null);
            };
            if(options.scaleType=='ordinal') return axis.tickValues(null);

            if(options.logBase==null) options.logBase = DEFAULT_LOGBASE;
            if(options.baseValues==null) options.stops = [1,2,5,3,7,4,6,8,9];
            
            
            
            if(options.removeAllLabels==null) options.removeAllLabels = false;

            if(options.formatterRemovePrefix==null) options.formatterRemovePrefix = false;

            if(options.formatter==null) options.formatter = function(d){
                               
                if(options.scaleType == "time") {
                    if(!(d instanceof Date)) d = new Date(d);
                    return d3.time.format("%Y")(d);
                }
                
                var format = "f";
                var prec = 0;
                if(Math.abs(d)<1) {prec = 1; format = "r"};

                var prefix = "";
                if(options.formatterRemovePrefix) return d3.format("."+prec+format)(d);

                switch (Math.floor(Math.log10(Math.abs(d)))){
                    case -13: d = d*1000000000000; prefix = "p"; break; //0.1p
                    case -10: d = d*1000000000; prefix = "n"; break; //0.1n
                    case  -7: d = d*1000000; prefix = "µ"; break; //0.1µ
                    case  -6: d = d*1000000; prefix = "µ"; break; //1µ
                    case  -5: d = d*1000000; prefix = "µ"; break; //10µ
                    case  -4: break; //0.0001
                    case  -3: break; //0.001
                    case  -2: break; //0.01
                    case  -1: break; //0.1
                    case   0: break; //1
                    case   1: break; //10
                    case   2: break; //100
                    case   3: break; //1000
                    case   4: break; //10000
                    case   5: d = d/1000; prefix = "k"; break; //0.1M
                    case   6: d = d/1000000; prefix = "M"; prec = 1; break; //1M
                    case   7: d = d/1000000; prefix = "M"; break; //10M
                    case   8: d = d/1000000; prefix = "M"; break; //100M
                    case   9: d = d/1000000000; prefix = "B"; prec = 1; break; //1B
                    case  10: d = d/1000000000; prefix = "B"; break; //10B
                    case  11: d = d/1000000000; prefix = "B"; break; //100B
                    case  12: d = d/1000000000000; prefix = "T"; prec = 1; break; //1T
                    //use the D3 SI formatting for the extreme cases
                    default: return (d3.format("."+prec+"s")(d)).replace("G","B");
                }


                // use manual formatting for the cases above
                return (d3.format("."+prec+format)(d)+prefix).replace("G","B");
            }
            options.cssLabelMarginLimit = 5; //px
            if(options.cssMarginLeft==null||parseInt(options.cssMarginLeft)<options.cssLabelMarginLimit) options.cssMarginLeft = options.cssLabelMarginLimit + "px";
            if(options.cssMarginRight==null||parseInt(options.cssMarginRight)<options.cssLabelMarginLimit) options.cssMarginRight = options.cssLabelMarginLimit + "px";
            if(options.cssMarginTop==null||parseInt(options.cssMarginTop)<options.cssLabelMarginLimit) options.cssMarginTop = options.cssLabelMarginLimit + "px";
            if(options.cssMarginBottom==null||parseInt(options.cssMarginBottom)<options.cssLabelMarginLimit) options.cssMarginBottom = options.cssLabelMarginLimit + "px";
            if(options.toolMargin==null) options.toolMargin = {left: 30, bottom: 30, right: 30, top: 30};

            if(options.pivotingLimit==null) options.pivotingLimit = options.toolMargin[this.orient()];
            
            if(options.showOuter==null)options.showOuter = false;
            if(options.limitMaxTickNumber==null)options.limitMaxTickNumber = 0; //0 is unlimited

            var orient = this.orient()=="top"||this.orient()=="bottom"?HORIZONTAL:VERTICAL;

            if(options.isPivotAuto==null) options.isPivotAuto = orient==VERTICAL;
            
            if(options.cssFontSize==null) options.cssFontSize = "13px";
            if(options.widthToFontsizeRatio==null) options.widthToFontsizeRatio = 0.75;
            if(options.heightToFontsizeRatio==null) options.heightToFontsizeRatio = 1.20;
            if(options.widthOfOneDigit==null) options.widthOfOneDigit =
                parseInt(options.cssFontSize)*options.widthToFontsizeRatio;
            if(options.heightOfOneDigit==null) options.heightOfOneDigit =
                parseInt(options.cssFontSize)*options.heightToFontsizeRatio;
            
            

meow("********** "+orient+" **********");
            
            var domain = axis.scale().domain();
            var range = axis.scale().range();
            var lengthDomain = Math.abs(domain[domain.length-1] - domain[0]);
            var lengthRange = Math.abs(range[range.length-1] - range[0]);
            
            var min = d3.min([domain[0],domain[domain.length-1]]);
            var max = d3.max([domain[0],domain[domain.length-1]]);
            var bothSidesUsed = (min<0 && max >0) && options.scaleType != "time";
            
            if(bothSidesUsed && options.scaleType == "log")console.error("It looks like your " + orient + " log scale domain is crossing ZERO. Classic log scale can only be one-sided. If need crossing zero try using genericLog scale instead")
                
            var tickValues = options.showOuter?[min, max]:[];
            var tickValuesMinor = []; //[min, max];
            var ticksNumber = 5;
            
            function getBaseLog(x, base) {
                if(base == null) base = options.logBase;
                return Math.log(x) / Math.log(base);
            };
            
            // estimate the longest formatted label in pixels
            var estLongestLabelLength =
                //take 17 sample values and measure the longest formatted label
                d3.max( d3.range(min, max, (max-min)/17).concat(max).map(function(d){return options.formatter(d).length}) ) 
                * options.widthOfOneDigit
                + parseInt(options.cssMarginLeft);

            var pivot = options.isPivotAuto 
                && (
                    (estLongestLabelLength + axis.tickPadding() + axis.tickSize() > options.pivotingLimit)
                    && (orient == VERTICAL)
                    ||
                    !(estLongestLabelLength + axis.tickPadding() + axis.tickSize() > options.pivotingLimit)
                    && !(orient == VERTICAL)
                );
            
            var labelsStackOnTop = (orient==HORIZONTAL && pivot || orient==VERTICAL && !pivot);
            
            
            
            
            // conditions to remove labels altogether
            var labelsJustDontFit = (!labelsStackOnTop && options.heightOfOneDigit > options.pivotingLimit);
            if(options.removeAllLabels) return axis.tickValues([]);
            
            // return a single tick if have only one point in the domain
            if (min==max) return axis.tickValues([min]).ticks(1).tickFormat(options.formatter);






            // LABELS FIT INTO SCALE
            // measure if all labels in array tickValues can fit into the allotted lengthRange
            // approximationStyle can be OPTIMISTIC or PESSIMISTIC
            // in optimistic style the length of every label is added up and then we check if the total pack of symbols fit
            // in pessimistic style we assume all labels have the length of the longest label from tickValues
            // returns TRUE if labels fit and FALSE otherwise
            var labelsFitIntoScale = function(tickValues, lengthRange, approximationStyle, rescalingLabels){
                if(tickValues == null || tickValues.length <= 1) return true;
                if (approximationStyle==null) approximationStyle = PESSIMISTIC;
                if (rescalingLabels==null) scaleType = "none";
                
                
                
                if(labelsStackOnTop){
                    //labels stack on top of each other. digit height matters
                    return lengthRange >
                        tickValues.length * (
                            options.heightOfOneDigit +
                            parseInt(options.cssMarginTop) +
                            parseInt(options.cssMarginBottom)
                        );
                }else{
                    //labels stack side by side. label width matters
                    var marginsLR = parseInt(options.cssMarginLeft) + parseInt(options.cssMarginRight);
                    var maxLength = d3.max(tickValues.map(function(d){return options.formatter(d).length}));
                    
                    // log scales need to rescale labels, so that 9 takes more space than 2
                    if(rescalingLabels=="log"){
                        // sometimes only a fragment of axis is used. in this case we want to limit the scope to that fragment
                        // yes, this is hacky and experimental 
                        lengthRange = Math.abs(axis.scale()(d3.max(tickValues)) - axis.scale()(d3.min(tickValues)));
                    
                        return lengthRange > 
                            d3.sum(tickValues.map(function(d){
                                    return (
                                        options.widthOfOneDigit 
                                            * (approximationStyle == PESSIMISTIC ? maxLength : options.formatter(d).length) 
                                        + marginsLR
                                    ) 
                                    // this is a logarithmic rescaling of labels
                                    * (1 + Math.log10((d+"").substr(0,1)))
                            }))

                    }else{
                        return lengthRange >
                            tickValues.length * marginsLR
                            + (approximationStyle == PESSIMISTIC ?
                                options.widthOfOneDigit 
                                    * tickValues.length * maxLength
                                : 0)
                            + (approximationStyle == OPTIMISTIC ?
                                options.widthOfOneDigit * (
                                    tickValues.map(function(d){return options.formatter(d)}).join("").length
                                )
                                : 0);
                    }
                }
            }
            
            
            
            
            
            // COLLISION BETWEEN
            // Check is there is a collision between labels ONE and TWO
            // ONE is a value, TWO can be a value or an array
            // returns TRUE if collision takes place and FALSE otherwise
            var collisionBetween = function(one, two){
                if(two==null || two.length == 0) return false;
                if(!(two instanceof Array))two = [two];
            
                for(var i = 0; i<two.length; i++){
                    if( 
                        one != two[i] && one != 0
                        &&
                        Math.abs(axis.scale()(one) - axis.scale()(two[i]))
                        <
                        (labelsStackOnTop? 
                            (options.heightOfOneDigit)
                            :
                            (options.formatter(one).length+options.formatter(two[i]).length)*options.widthOfOneDigit/2
                        )
                    ) return true; 
                
                }
                return false;
            }

            

            


            if(options.scaleType=="genericLog" || options.scaleType=="log"){
                var eps = axis.scale().eps ? axis.scale().eps() : 0;
                
                var spawnZero = bothSidesUsed? [0]:[];

                // check if spawn positive is needed. if yes then spawn!
                var spawnPos = max<eps? [] : (
                    d3.range(
                        Math.floor(getBaseLog(Math.max(eps,min))),
                        Math.ceil(getBaseLog(max)),
                        1)
                    .concat(Math.ceil(getBaseLog(max)))
                    .map(function(d){return Math.pow(options.logBase, d)})
                    );

                // check if spawn negative is needed. if yes then spawn!
                var spawnNeg = min>-eps? [] : (
                    d3.range(
                        Math.floor(getBaseLog(Math.max(eps,-max))),
                        Math.ceil(getBaseLog(-min)),
                    1)
                    .concat(Math.ceil(getBaseLog(-min)))
                    .map(function(d){return -Math.pow(options.logBase, d)})
                    );
                
                
                // automatic chosing of method if it's not explicitly defined
                if(options.method==null) {
                    var coverage = bothSidesUsed ? 
                        Math.max(Math.abs(max), Math.abs(min))/eps 
                        :
                        Math.max(Math.abs(max), Math.abs(min))/Math.min(Math.abs(max), Math.abs(min));
                    options.method = 10 <= coverage&&coverage <= 1024 ? this.METHOD_DOUBLING : this.METHOD_REPEATING;
                };

                
                //meow('spawn pos/neg: ', spawnPos, spawnNeg);
            
                    
                if(options.method == this.METHOD_DOUBLING) {
                    var doublingLabels = [];
                    if(bothSidesUsed)tickValues.push(0);
                    var avoidCollidingWith = [].concat(tickValues);

                    // start with the smallest abs number on the scale, rounded to nearest nice power
                    //var startPos = max<eps? null : Math.pow(options.logBase, Math.floor(getBaseLog(Math.max(eps,min))));
                    //var startNeg = min>-eps? null : -Math.pow(options.logBase, Math.floor(getBaseLog(Math.max(eps,-max))));
                    
                    var startPos = max<eps? null  : 4*spawnPos[Math.floor(spawnPos.length/2)-1];
                    var startNeg = min>-eps? null : 4*spawnNeg[Math.floor(spawnNeg.length/2)-1];
                    
                    //meow('starter pos/neg: ', startPos, startNeg);

                    if(startPos){ for(var l=startPos; l<=max; l*=2) doublingLabels.push(l);}
                    if(startPos){ for(var l=startPos/2; l>=Math.max(min,eps); l/=2) doublingLabels.push(l);}
                    if(startNeg){ for(var l=startNeg; l>=min; l*=2) doublingLabels.push(l);}
                    if(startNeg){ for(var l=startNeg/2; l<=Math.min(max,-eps); l/=2) doublingLabels.push(l);}
                                        
                    doublingLabels = doublingLabels
                        .sort(d3.ascending)
                        .filter(function(d){return min<=d&&d<=max});
                    
                    tickValuesMinor = tickValuesMinor.concat(doublingLabels);
                    
                    doublingLabels = groupByPriorities(doublingLabels,false); // don't skip taken values
                    
                    var tickValues_1 = tickValues;
                    for(var j = 0; j<doublingLabels.length; j++){

                        // compose an attempt to add more axis labels    
                        var trytofit = tickValues_1.concat(doublingLabels[j])
                            .filter(function(d){ return !collisionBetween(d,avoidCollidingWith); })
                            .filter(onlyUnique)
                        
                        // stop populating if labels don't fit 
                        if(!labelsFitIntoScale(trytofit, lengthRange, PESSIMISTIC, "none")) break;
                        
                        // apply changes if no blocking instructions
                        tickValues = trytofit
                    }
                }
                
                
                if(options.method == this.METHOD_REPEATING){
                    
                    var spawn = spawnZero.concat(spawnPos).concat(spawnNeg).sort(d3.ascending);
                    
                    options.stops.forEach(function(stop, i){
                        tickValuesMinor = tickValuesMinor.concat(spawn.map(function(d){return d*stop}));
                    });
                    
                    spawn = groupByPriorities(spawn);
                    var avoidCollidingWith = spawnZero.concat(tickValues);
                    
                    var stopTrying = false;

                    options.stops.forEach(function(stop, i){
                        if(i==0){
                            for(var j = 0; j<spawn.length; j++){
                                
                                // compose an attempt to add more axis labels    
                                var trytofit = tickValues
                                    .concat(spawn[j].map(function(d){return d*stop}))
                                    // throw away labels that collide with "special" labels 0, min, max
                                    .filter(function(d){return !collisionBetween(d,avoidCollidingWith);})
                                    .filter(function(d){return min<=d&&d<=max})
                                    .filter(onlyUnique);
                                
                                // stop populating if labels don't fit 
                                if(!labelsFitIntoScale(trytofit, lengthRange, OPTIMISTIC, "none")) break;
                                
                                // apply changes if no blocking instructions
                                tickValues = trytofit;
                            }
                            
                            //flatten the spawn array
                            spawn = [].concat.apply([], spawn);
                        }else{
                            if(stopTrying)return; 
                            
                            // compose an attempt to add more axis labels
                            var trytofit = tickValues
                                .concat(spawn.map(function(d){return d*stop}))
                                .filter(function(d){return min<=d&&d<=max})
                                .filter(onlyUnique);
                            
                            // stop populating if the new composition doesn't fit
                            if(!labelsFitIntoScale(trytofit, lengthRange, PESSIMISTIC, "log")) {stopTrying = true; return;}
                            // stop populating if the number of labels is limited in options
                            if(tickValues.length > options.limitMaxTickNumber && options.limitMaxTickNumber!=0) {stopTrying = true; return;}
                            
                            // apply changes if no blocking instructions
                            tickValues = trytofit;
                        }
                    })


                }//method

                
            } //logarithmic

            
            
            
            if(options.scaleType=="linear" || options.scaleType=="time"){
                if(bothSidesUsed)tickValues.push(0);
                var avoidCollidingWith = [].concat(tickValues);
                
                ticksNumber = Math.max(Math.floor(lengthRange / estLongestLabelLength), 2);
                
                // limit maximum ticks number
                if(options.limitMaxTickNumber!=0 && ticksNumber>options.limitMaxTickNumber)ticksNumber = options.limitMaxTickNumber;
                
                var addLabels = axis.scale().ticks.apply(axis.scale(), [ticksNumber])
                    .sort(d3.ascending)
                    .filter(function(d){return min<=d&&d<=max}); 
                
                tickValuesMinor = tickValuesMinor.concat(addLabels);
                
                addLabels = groupByPriorities(addLabels,false);
                
                var tickValues_1 = tickValues;
                for(var j = 0; j<addLabels.length; j++){

                    // compose an attempt to add more axis labels    
                    var trytofit = tickValues_1.concat(addLabels[j])
                        .filter(function(d){ return !collisionBetween(d,avoidCollidingWith); })
                        .filter(onlyUnique);

                    // stop populating if labels don't fit 
                    if(!labelsFitIntoScale(trytofit, lengthRange, PESSIMISTIC, "none")) break;

                    // apply changes if no blocking instructions
                    tickValues = trytofit
                }
                
                tickValues = tickValues//.concat(addLabels)
                    .filter(function(d){ return !collisionBetween(d,avoidCollidingWith); })
                    .filter(onlyUnique);

                
            }



            
            if(tickValues!=null && tickValues.length<=2 && !bothSidesUsed)tickValues = [min, max];
            
            if(tickValues!=null && tickValues.length<=3 && bothSidesUsed){
                if (!collisionBetween(0,[min,max])){ 
                    tickValues = [min, 0, max];
                }else{
                    tickValues = [min, max];
                }
            }
            
            if(tickValues!=null) tickValues.sort(function(a,b){
                return (orient==HORIZONTAL?-1:1)*(axis.scale()(b) - axis.scale()(a))
            });
            
            if(labelsJustDontFit) tickValues = [];
            tickValuesMinor = tickValuesMinor.filter(function(d){
                return tickValues.indexOf(d)==-1 && min<=d&&d<=max
            });
            

meow("final result",tickValues);
            
            return axis
                .ticks(ticksNumber)
                .tickFormat(options.formatter)
                .tickValues(tickValues)
                .tickValuesMinor(tickValuesMinor)
                .pivot(pivot)
                .repositionLabels(
                    repositionLabelsThatStickOut(tickValues, options, orient, axis.scale(), labelsStackOnTop?"y":"x")
                );
        };

        
        
        
        
        
        
        
        
        
        
        // GROUP ELEMENTS OF AN ARRAY, SO THAT...
        // less-prio elements are between the high-prio elements
        // Purpose: enable adding axis labels incrementally, like this for 9 labels:
        // PRIO 1: +--------, concat result: +-------- first we show only 1 label
        // PRIO 2: ----+---+, concat result: +---+---+ then we add 2 more, that are maximally spaced
        // PRIO 3: --+---+--, concat result: +-+-+-+-+ then we fill spaces with 2 more labels
        // PRIO 4: -+-+-+-+-, concat result: +++++++++ then we fill the remaing spaces and show all labels
        // exception: zero jumps to the front, if it's on the list
        // example1: [1 2 3 4 5 6 7] --> [[1][4 7][2 3 5 6]]
        // example2: [1 2 3 4 5 6 7 8 9] --> [[1][5 9][3 7][2 4 6 8]]
        // example3: [-4 -3 -2 -1 0 1 2 3 4 5 6 7] --> [[0][-4][2][-1 5][-3 -2 1 3 4 6 7]]
        // inputs:
        // array - the source array to be processed. Only makes sense if sorted
        // removeDuplicates - return incremental groups (true, default), or return concatinated result (false)
        // returns:
        // the nested array
        function groupByPriorities(array, removeDuplicates){
            if(removeDuplicates==null) removeDuplicates = true;

            var result = [];
            var taken = [];

            //zero is an exception, if it's present we manually take it to the front
            if(array.indexOf(0)!=-1){
                result.push([0]);
                taken.push(array.indexOf(0));
            }

            for(var k = array.length; k>=1; k = k<4? k-1 : k/2){
                // push the next group of elements to the result
                result.push(array.filter(function(d,i){
                    if(i % Math.floor(k) == 0 && (taken.indexOf(i)==-1 || !removeDuplicates)){
                        taken.push(i);
                        return true;
                    }
                    return false;
                }));
            }

            return result;
        }        
        
        
        
        
        
        
        
        
        // REPOSITION LABELS THAT STICK OUT
        // Purpose: the outer labels can easily be so large, they stick out of the allotted area
        // Example:
        // Label is fine:    Label sticks out:    Label sticks out more:    Solution - label is shifted:
        //      12345 |           1234|                123|5                   12345|          
        // _______.   |      _______. |           _______.|                 _______.|          
        // 
        // this is what the function does on the first step (only outer labels)
        // on the second step it shifts the inner labels that start to overlap with the shifted outer labels
        // 
        // requires tickValues array to be sorted from tail-first
        // tail means left or bottom, head means top or right
        //
        // dimension - which dimension requires shifting
        // X if labels stack side by side, Y if labels stack on top of one another
        //
        // returns the array of recommended {x,y} shifts
        
        function repositionLabelsThatStickOut(tickValues, options, orient, scale, dimension){
            if(tickValues==null)return null;
                
            // make an abstraction layer for margin sizes
            // tail means left or bottom, head means top or right
            var margin = 
                orient==VERTICAL?
                {head: options.toolMargin.top, tail: options.toolMargin.bottom}
                :
                {head: options.toolMargin.right, tail: options.toolMargin.left};
            
            
            var result = {};
                        
               
            // STEP 1:
            // for outer labels: avoid sticking out from the tool margin
            tickValues.forEach(function(d,i){
                if(i!=0 && i!=tickValues.length-1) return;
                
                // compute the influence of the axis head
                var repositionHead = margin.head
                    + (orient==HORIZONTAL?1:0) * d3.max(scale.range()) 
                    - (orient==HORIZONTAL?0:1) * d3.min(scale.range()) 
                    + (orient==HORIZONTAL?-1:1) * scale(d)
                    - (dimension=="x") * options.formatter(d).length * options.widthOfOneDigit / 2
                    - (dimension=="y") * options.heightOfOneDigit / 2
                    // we may consider or not the label margins to give them a bit of spacing from the edges
                    //- (dimension=="x") * parseInt(options.cssMarginRight);
                    //- (dimension=="y") * parseInt(options.cssMarginTop);
                
                // compute the influence of the axis tail
                var repositionTail = Math.min(margin.tail, options.widthOfOneDigit)
                    + (orient==VERTICAL?1:0) * d3.max(scale.range()) 
                    - (orient==VERTICAL?0:1) * d3.min(scale.range()) 
                    + (orient==VERTICAL?-1:1) * scale(d)
                    - (dimension=="x") * options.formatter(d).length * options.widthOfOneDigit / 2
                    - (dimension=="y") * options.heightOfOneDigit / 2
                    // we may consider or not the label margins to give them a bit of spacing from the edges
                    //- (dimension=="x") * parseInt(options.cssMarginLeft);
                    //- (dimension=="y") * parseInt(options.cssMarginBottom);
                
                // apply limits in order to cancel repositioning of labels that are good
                if(repositionHead>0)repositionHead=0;
                if(repositionTail>0)repositionTail=0;
                
                // add them up with appropriate signs, save to the axis
                result[i] = {x:0, y:0};
                result[i][dimension] = (dimension=="y" && orient==VERTICAL?-1:1) * (repositionHead - repositionTail);
            });
            

            // STEP 2:
            // for inner labels: avoid collision with outer labels
            tickValues.forEach(function(d,i){
                if(i==0 || i==tickValues.length-1) return;
                
                // compute the influence of the head-side outer label
                var repositionHead = 
                    // take the distance between head and the tick at hand
                    Math.abs(scale(d) - scale(tickValues[tickValues.length-1]) )
                    // substract the shift of the tail
                    - (dimension=="y" && orient==HORIZONTAL?-1:1) * result[tickValues.length-1][dimension]
                    
                    - (dimension=="x") * options.widthOfOneDigit / 2 
                        * options.formatter(d).length
                    - (dimension=="x") * options.widthOfOneDigit / 2 
                        * options.formatter(tickValues[tickValues.length-1]).length
                    - (dimension=="y") * options.heightOfOneDigit 
                        * 0.7; //TODO remove magic constant - relation of actual font height to BBox-measured height

                // compute the influence of the tail-side outer label
                var repositionTail = 
                    // take the distance between tail and the tick at hand
                    Math.abs(scale(d) - scale(tickValues[0]) )
                    // substract the shift of the tail
                    - (dimension=="y" && orient==VERTICAL?-1:1) * result[0][dimension]
                
                    - (dimension=="x") * options.widthOfOneDigit / 2 
                        * options.formatter(d).length
                    - (dimension=="x") * options.widthOfOneDigit / 2 
                        * options.formatter(tickValues[0]).length
                    - (dimension=="y") * options.heightOfOneDigit 
                        * 0.7; //TODO remove magic constant - relation of actual font height to BBox-measured height
                
                // apply limits in order to cancel repositioning of labels that are good
                if(repositionHead>0)repositionHead=0;
                if(repositionTail>0)repositionTail=0;
                
                // add them up with appropriate signs, save to the axis
                result[i] = {x:0, y:0};
                result[i][dimension] = (dimension=="y" && orient==VERTICAL?-1:1) * (repositionHead - repositionTail);
            });
            
            
            return result;
        } // function repositionLabelsThatStickOut()
        
        
        
        
        axis.copy = function () {
            return d3_axis_smart(d3.svg.axis());
        };
        
        return d3.rebind(axis, _super, 
            "scale", "orient", "ticks", "tickValues", "tickFormat", 
            "tickSize", "innerTickSize", "outerTickSize", "tickPadding", 
            "tickSubdivide"
            );
        
        
        function meow(l1,l2,l3,l4,l5){
            if(!axis.labelerOptions().isDevMode)return;
            if(l5!=null){console.log(l1,l2,l3,l4,l5); return;}
            if(l4!=null){console.log(l1,l2,l3,l4); return;}
            if(l3!=null){console.log(l1,l2,l3); return;}
            if(l2!=null){console.log(l1,l2); return;}
            if(l1!=null){console.log(l1); return;}
        }
        
        }(d3.svg.axis());
        
    }; //d3.svg.axisSmart = function(){

}).call(this);


(function() {

    "use strict";

    var root = this;

    //warn client if d3 is not defined
    if (!Vizabi._require('d3')) {
        return;
    }
    
    d3.svg.collisionResolver = function(){
        
    return function collision_resolver() {

        var DURATION = 300;
        var labelHeight = {};
        var labelPosition = {};

        
        // MAINN FUNCTION. RUN COLLISION RESOLVER ON A GROUP g
        function resolver(g) {
            
            if(data == null){console.warn(
                "D3 collision resolver stopped: missing data to work with. Example: data = {asi: {valueY: 45, valueX: 87}, ame: {valueY: 987, valueX: 767}}"); return;}
            if(selector == null){console.warn(
                "D3 collision resolver stopped: missing a CSS slector"); return;}
            if(height == null){console.warn(
                "D3 collision resolver stopped: missing height of the canvas"); return;}
            if(value == null){console.warn(
                "D3 collision resolver stopped: missing pointer within data objects. Example: value = 'valueY' "); return;}
  
            g.each(function(d, index) {
                labelHeight[d.geo] = d3.select(this).select(selector)[0][0].getBBox().height;
            });

            labelPosition = resolver.calculatePositions(data, value, height, scale);
 
            //actually reposition the labels
            g.each(function (d, i) {
                
                if(data[d.geo][fixed]) return;
                
                var resolvedY = labelPosition[d.geo] || scale(data[d.geo][value]) || 0;
                var resolvedX = null;
                
                if(handleResult!=null) {handleResult(d, i, this, resolvedX, resolvedY); return;}
                
                d3.select(this).selectAll(selector)
                    .transition()
                    .duration(DURATION)
                    .attr("transform", "translate(0," + resolvedY + ")")
            });

   
        };
        
        
        
                
        // CALCULATE OPTIMIZED POSITIONS BASED ON LABELS' HEIGHT AND THEIR PROXIMITY (DELTA)
            
        resolver.calculatePositions = function(data, value, height, scale){
            
            var result = {};
                        
            var keys = Object.keys(data).sort(function(a,b){return data[a][value] - data[b][value]});
                            
            keys.forEach(function(d, index){

                //initial positioning
                result[d] = scale(data[d][value]);

                // check the overlapping chain reaction all the way down 
                for(var j = index; j>0; j--){
                    // if overlap found shift the overlapped label downwards
                    var delta = result[keys[j-1]] - result[keys[j]] - labelHeight[keys[j]];
                    if(delta<0) result[keys[j-1]] -= delta;

                    // if the chain reaction stopped because found some gap in the middle, then quit
                    if(delta>0) break;
                }

            })
                
                
            // check if the lowest label is breaking the boundary...
            var delta = height - result[keys[0]] - labelHeight[keys[0]];

            // if it does, then                
            if(delta<0){
                // shift the lowest up
                result[keys[0]] += delta;

                // check the overlapping chain reaction all the way up 
                for(var j = 0; j<keys.length-1; j++){
                    // if overlap found shift the overlapped label upwards
                    var delta = result[keys[j]] - result[keys[j+1]] - labelHeight[keys[j+1]];
                    if(delta<0) result[keys[j+1]] += delta;

                    // if the chain reaction stopped because found some gap in the middle, then quit
                    if(delta>0) break;
                }
            }
            
            

            return result;
        };
        
        
        
        
        // GETTERS AND SETTERS
        
        var data = null;
        resolver.data = function(arg) {
            if (!arguments.length) return data;
            data = arg;
            return resolver;
        };
        var selector = null;
        resolver.selector = function(arg) {
            if (!arguments.length) return selector;
            selector = arg;
            return resolver;
        };
        var height = null;
        resolver.height = function(arg) {
            if (!arguments.length) return height;
            height = arg;
            return resolver;
        };
        var scale = d3.scale.linear().domain([0,1]).range([0,1]);
        resolver.scale = function(arg) {
            if (!arguments.length) return scale;
            scale = arg;
            return resolver;
        };
        var value = null;
        resolver.value = function(arg) {
            if (!arguments.length) return value;
            value = arg;
            return resolver;
        };
        var fixed = null;
        resolver.fixed = function(arg) {
            if (!arguments.length) return fixed;
            fixed = arg;
            return resolver;
        };
        var handleResult = null;
        resolver.handleResult = function(arg) {
            if (!arguments.length) return handleResult;
            handleResult = arg;
            return resolver;
        };
        

        return resolver;
        
    }();
        
    }; //d3.svg.collisionResolver = function(){

}).call(this);


(function() {

    "use strict";

    var root = this;

    //warn client if d3 is not defined
    if (!Vizabi._require('d3')) {
        return;
    }

    d3.svg.colorPicker = function(){
        
        return function d3_color_picker() {
        
            

            // tuning defaults
            var nCellsH = 15; // number of cells by hues (angular)
            var minH = 0; // which hue do we start from: 0 to 1 instead of 0 to 365
            var nCellsL = 4; // number of cells by lightness (radial)
            var minL = 0.50; // which lightness to start from: 0 to 1. Recommended 0.3...0.5
            var satConstant = 0.7; // constant saturation for color wheel: 0 to 1. Recommended 0.7...0.8
            
            var outerL_display = 0.40; // ecxeptional saturation of the outer circle. the one displayed 0 to 1
            var outerL_meaning = 0.30; // ecxeptional saturation of the outer circle. the one actually ment 0 to 1
            var firstAngleSat = 0.0; // exceptional saturation at first angular segment. Set 0 to have shades of grey
            
            var minRadius = 15; //radius of the central hole in color wheel: px
            
            var margin = {top: 0.1, bottom: 0.1, left: 0.1, right: 0.1}; //margins in % of container's width and height
            
            var colorOld = "#000";
            var colorDef = "#000";
            
            // names of CSS classes
            var css = {
                INVISIBLE: "vzb-invisible",
                COLOR_POINTER: "vzb-colorPicker-colorPointer",
                COLOR_BUTTON: "vzb-colorPicker-colorCell",
                COLOR_DEFAULT: "vzb-colorPicker-defaultColor",
                COLOR_SAMPLE: "vzb-colorPicker-colorSample",
                COLOR_PICKER: "vzb-colorPicker-colorPicker",
                COLOR_CIRCLE: "vzb-colorPicker-colorCircle",
                COLOR_SEGMENT: "vzb-colorPicker-colorSegment",
                COLOR_BACKGR: "vzb-colorPicker-background"
            }
            
            var colorData = []; //here we store color data. formatted as follows:
            /*
            [
                [ // outer circle
                    {display: "#123456", meaning: "#123456"}, // first angle
                    ... 
                    {display: "#123456", meaning: "#123456"} // last angle, clockwise
                ],
                [ // next circle
                    {display: "#123456", meaning: "#123456"}, // first angle
                    ...
                    {display: "#123456", meaning: "#123456"} // last angle, clockwise
                ],
                
                ...
                
                [ // inner circle
                    {display: "#123456", meaning: "#123456"}, // first angle
                    ...
                    {display: "#123456", meaning: "#123456"} // last angle, clockwise
                ]
            ]
            */
            var arc = d3.svg.arc();

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return 1 });
            
            var svg = null;
            var colorPointer = null;
            var showColorPicker = false;
            var sampleRect = null;
            var sampleText = null;
            var background = null;
            
            var callback = function(value){console.info("Color picker callback example. Setting color to " + value)}; 

            function _generateColorData() {
                var result = [];
                
                // loop across circles
                for(var l = 0; l<nCellsL; l++) {
                    var lightness = (minL+(1-minL)/nCellsL * l);

                    // new circle of cells
                    result.push([]);
                    
                    // loop across angles
                    for(var h = 0; h<=nCellsH; h++) {
                        var hue = minH+(1-minH)/nCellsH * h;
                        
                        // new cell
                        result[l].push({
                            display: _hslToRgb(hue, h==0?firstAngleSat:satConstant, l==0?outerL_display:lightness),
                            meaning: _hslToRgb(hue, h==0?firstAngleSat:satConstant, l==0?outerL_meaning:lightness)
                        });
                    }
                }
                return result;
            }
            
            
            function _hslToRgb(h, s, l){
                var r, g, b;

                if(s == 0){
                    r = g = b = l; // achromatic
                }else{
                    var _hue2rgb = function _hue2rgb(p, q, t){
                        if(t < 0) t += 1;
                        if(t > 1) t -= 1;
                        if(t < 1/6) return p + (q - p) * 6 * t;
                        if(t < 1/2) return q;
                        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    }

                    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    var p = 2 * l - q;
                    r = _hue2rgb(p, q, h + 1/3);
                    g = _hue2rgb(p, q, h);
                    b = _hue2rgb(p, q, h - 1/3);
                }

                return "#" + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
            }

            
            // this is init function. call it once after you are satisfied with parameters tuning
            // container should be a D3 selection that has a div where we want to render color picker
            // that div should have !=0 width and height in its style 
            function colorPicker(container) {
                colorData = _generateColorData();
                
                svg = container.append("svg")
                    .style("position", "absolute")
                    .style("top", "0")
                    .style("left", "0")
                    .style("width", "100%")
                    .style("height", "100%")
                    .attr("class", css.COLOR_PICKER)
                    .classed(css.INVISIBLE, !showColorPicker);

                var width = parseInt(svg.style("width"));
                var height = parseInt(svg.style("height"));
                var maxRadius = width / 2 * (1 - margin.left - margin.right);
                
                background = svg.append("rect")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", css.COLOR_BUTTON + " " + css.COLOR_BACKGR)
                    .on("mouseover", function(d){_cellHover(colorOld)});
                
                var circles = svg.append("g")
                    .attr("transform", "translate(" + (maxRadius + width * margin.left) + "," 
                                                    + (maxRadius + height * margin.top) + ")");
                
                
                svg.append("rect")
                    .attr("class", css.COLOR_SAMPLE)
                    .attr("width", width/2)
                    .attr("height", height * margin.top/2);
                
                sampleRect = svg.append("rect")
                    .attr("class", css.COLOR_SAMPLE)
                    .attr("width", width/2)
                    .attr("x", width/2)
                    .attr("height", height * margin.top/2);

                svg.append("text")
                    .attr("x", width * margin.left)
                    .attr("y", height * margin.top/2)
                    .attr("dy", "0.5em")
                    .style("text-anchor", "start")
                    .attr("class", css.COLOR_SAMPLE);

                sampleText = svg.append("text")
                    .attr("x", width * (1-margin.right))
                    .attr("y", height * margin.top/2)
                    .attr("dy", "0.5em")
                    .style("text-anchor", "end")
                    .attr("class", css.COLOR_SAMPLE);

                svg.append("text")
                    .attr("x", width*0.1)
                    .attr("y", height*(1-margin.bottom))
                    .attr("dy", "0.3em")
                    .style("text-anchor", "start")
                    .text("default");


                svg.append("circle")
                    .attr("class", css.COLOR_DEFAULT + " " + css.COLOR_BUTTON)
                    .attr("r", width * margin.left/2)
                    .attr("cx", width * margin.left * 1.5)
                    .attr("cy", height * (1 - margin.bottom * 1.5))
                    .on("mouseover", function(){
                        d3.select(this).style("stroke", "#444");
                        _cellHover(colorDef);
                    })
                    .on("mouseout", function(){
                        d3.select(this).style("stroke", "none");
                    });

                circles.append("circle")
                    .attr("r", minRadius-1)
                    .attr("fill", "#FFF")
                    .attr("class", css.COLOR_BUTTON)
                    .on("mouseover", function(){
                        d3.select(this).style("stroke", "#444");
                        _cellHover("#FFF");
                    })
                    .on("mouseout", function(){
                        d3.select(this).style("stroke", "none");
                    });


                circles.selectAll("." + css.COLOR_CIRCLE)
                    .data(colorData)
                    .enter().append("g")
                    .attr("class", css.COLOR_CIRCLE)
                    .each(function(circleData, index){

                        arc.outerRadius(minRadius+(maxRadius-minRadius)/nCellsL*(nCellsL-index))
                            .innerRadius(minRadius+(maxRadius-minRadius)/nCellsL*(nCellsL-index-1));


                        var segment = d3.select(this).selectAll("." + css.COLOR_SEGMENT)
                            .data(pie(circleData))
                            .enter().append("g")
                            .attr("class", css.COLOR_SEGMENT);

                        segment.append("path")
                            .attr("class", css.COLOR_BUTTON)
                            .attr("d", arc)
                            .style("fill", function(d) {return d.data.display })
                            .style("stroke", function(d) {return d.data.display })
                            .on("mouseover", function(d){_cellHover(d.data.meaning, this)})
                            .on("mouseout", function(d){_cellUnHover()});
                    })

                colorPointer = circles.append("path")
                    .attr("class", css.COLOR_POINTER + " " + css.INVISIBLE);


                svg.selectAll("." + css.COLOR_BUTTON)
                    .on("click", function(){_this.show(TOGGLE)});


                _doTheStyling(svg);
            };
            
            
            var _doTheStyling = function(svg){
                
                //styling                
                svg.select("."+css.COLOR_BACKGR)
                    .style("fill", "white");
    
                svg.select("."+css.COLOR_POINTER)
                    .style("stroke-width", 2)
                    .style("stroke", "white")
                    .style("pointer-events", "none")
                    .style("fill", "none")

                svg.selectAll("."+css.COLOR_BUTTON)
                    .style("cursor","pointer")
                
                svg.selectAll("text")
                    .style("dominant-baseline","hanging")
                    .style("fill","#D9D9D9")
                    .style("font-size","0.7em")
                    .style("text-transform","uppercase");

                svg.selectAll("circle." + css.COLOR_BUTTON)
                    .style("stroke-width", 2);
            }
            
            
            var _this = colorPicker;
        
            var _cellHover = function(value, view){
                // show color pointer if the view is set (a cell of colorwheel)
                if(view!=null) colorPointer.classed(css.INVISIBLE, false).attr("d", d3.select(view).attr("d"));
                
                sampleRect.style("fill", value);
                sampleText.text(value);
                callback(value);
            }
            var _cellUnHover = function(){
                colorPointer.classed(css.INVISIBLE, true);
            }
                

            //Use this function to hide or show the color picker
            //true = show, false = hide, "toggle" or TOGGLE = toggle
            var TOGGLE = 'toggle';
            colorPicker.show = function(arg){
                if (!arguments.length) return showColorPicker;
                if(svg == null)console.warn("Color picker is missing SVG element. Was init sequence performed?");
                showColorPicker = (arg==TOGGLE? !showColorPicker : arg);
                svg.classed(css.INVISIBLE, !showColorPicker);
            }
                
        
            // getters and setters
            colorPicker.nCellsH = function(arg) {if (!arguments.length) return nCellsH; nCellsH = arg; return colorPicker;};
            colorPicker.minH = function(arg) {if (!arguments.length) return minH; minH = arg; return colorPicker;};
            colorPicker.nCellsL = function(arg) {if (!arguments.length) return nCellsL; nCellsL = arg; return colorPicker;};
            colorPicker.minL = function(arg) {if (!arguments.length) return minL; minL = arg; return colorPicker;};
            colorPicker.outerL_display = function(arg) {if (!arguments.length) return outerL_display; outerL_display = arg; return colorPicker;};
            colorPicker.outerL_meaning = function(arg) {if (!arguments.length) return outerL_meaning; outerL_meaning = arg; return colorPicker;};
            colorPicker.satConstant = function(arg) {if (!arguments.length) return satConstant; satConstant = arg; return colorPicker;};
            colorPicker.firstAngleSat = function(arg) {if (!arguments.length) return firstAngleSat; firstAngleSat = arg; return colorPicker;};
            colorPicker.minRadius = function(arg) {if (!arguments.length) return minRadius; minRadius = arg; return colorPicker;};
            colorPicker.margin = function(arg) {if (!arguments.length) return margin; margin = arg; return colorPicker;};
            
            colorPicker.callback = function(arg) {if (!arguments.length) return callback; callback = arg; return colorPicker;};
            
            colorPicker.colorDef = function (arg) {
                if (!arguments.length) return colorDef;
                colorDef = arg;
                if(svg == null)console.warn("Color picker is missing SVG element. Was init sequence performed?");
                svg.select("."+css.COLOR_DEFAULT).style("fill",colorDef);
                return colorPicker;
            };
            colorPicker.colorOld = function (arg) {
                if (!arguments.length) return colorOld;
                colorOld = arg;
                if(svg == null)console.warn("Color picker is missing SVG element. Was init sequence performed?");
                svg.select("rect."+css.COLOR_SAMPLE).style("fill",colorOld);
                svg.select("text."+css.COLOR_SAMPLE).text(colorOld);
                return colorPicker;
            };
            
            
            return colorPicker;
        }();
        
        

        
    }; //d3.svg.axisSmart = function(){

}).call(this);
















            
(function() {

    "use strict";

    var root = this;

    //warn client if d3 is not defined
    if (!Vizabi._require('d3')) {
        return;
    }

    d3.scale.genericLog = function () {


        return function d3_scale_genericLog(logScale) {

            var _this = this;
            var eps = 0.001;
            var ePos = 0.001;
            var eNeg = -0.001;
            var delta = 5;
            var domain = logScale.domain();
            var range = logScale.range();
            var useLinear = false;

            var linScale = d3.scale.linear().domain([0, eps]).range([0, delta]);


            var abs = function(arg){
                if(arg instanceof Array) return arg.map(function(d){return Math.abs(d)});
                return Math.abs(arg);
            }
            var oneside = function(arg){
                var sign = Math.sign(arg[0]);
                for(var i=0; i<arg.length; i++){ if(Math.sign(arg[i])!=sign)return false; }
                return true;
            }


            function scale(x) {
                var ratio = 1;
                var shiftNeg = 0;
                var shiftPos = 0;
                var shiftAll = 0;
                
                //console.log("DOMAIN log lin", logScale.domain(), linScale.domain());
                //console.log("RANGE log lin", logScale.range(), linScale.range());
                
                var domainPointingForward = domain[0]<domain[domain.length-1];
                var rangePointingForward = range[0]<range[range.length-1];
                
                if(d3.min(domain)<0 && d3.max(domain)>0){
                    var minAbsDomain = d3.min(abs([ domain[0], domain[domain.length-1] ]));
                    //var maxAbsDomain = d3.max(abs([ domain[0], domain[domain.length-1] ]));
                    
                    
                    //ratio shows how the + and - scale should fit as compared to a simple + or - scale
                    ratio = domainPointingForward != rangePointingForward ?
                        ( d3.max(range) + d3.max(range) - logScale( Math.max(eps,minAbsDomain) ) ) / d3.max(range) 
                        :
                        ( d3.max(range) + logScale( Math.max(eps,minAbsDomain)) ) / d3.max(range);
                    
                    
                    
                    if(domainPointingForward && !rangePointingForward){
                        shiftNeg = (d3.max(range) + linScale(0))/ratio;
                        // if the bottom is heavier we need to shift the entire chart
                        if(abs(domain[0])>abs(domain[domain.length-1])) shiftAll -= logScale( Math.max(eps,minAbsDomain) )/ratio;
                        
                    }else if(!domainPointingForward && !rangePointingForward){                        
                        shiftAll = logScale( Math.max(eps,minAbsDomain) ) / ratio;
                        //if the top is heavier we need to shift the entire chart
                        if(abs(domain[0])<abs(domain[domain.length-1])) shiftAll += ( d3.max(range)-logScale( Math.max(eps,minAbsDomain) ) )/ratio;
                        
                    } else if(domainPointingForward && rangePointingForward){
                        shiftAll = d3.max(range)/ratio;
                        // if the top is heavier we need to shift the entire chart
                        if(abs(domain[0])<abs(domain[domain.length-1])) shiftAll -= ( d3.max(range)-logScale( Math.max(eps,minAbsDomain) ) )/ratio;
                        
                    }else if(!domainPointingForward && rangePointingForward){
                        shiftNeg = (d3.max(range) + linScale(0))/ratio;
                        //if the top is heavier we need to shift the entire chart
                        if(abs(domain[0])<abs(domain[domain.length-1])) shiftAll -= logScale( Math.max(eps,minAbsDomain) )/ratio;
                    }
                    
                    
                }else if(d3.min(domain)<0 && d3.max(domain)<0){
                    shiftNeg = d3.max(range);
                }

                
                if (x > eps) return logScale(x)/ratio + shiftAll + shiftPos;
                if (x < -eps) return -logScale(-x)/ratio + shiftAll + shiftNeg ;
                if (0 <= x && x <= eps) return linScale(x)/ratio + shiftAll + shiftPos;
                if (-eps <= x && x < 0) return -linScale(-x)/ratio + shiftAll + shiftNeg ;
            }
            scale.eps = function (arg) {
                if (!arguments.length) return eps;
                eps = arg;
                scale.domain(domain);
                return scale;
            }
            scale.delta = function (arg) {
                if (!arguments.length) return delta;
                delta = arg;
                scale.range(range);
                return scale;
            }

            scale.domain = function (_arg) {
                if (!arguments.length) return domain;
                
                // this is an internal array, it will be modified. the input _arg should stay intact
                var arg = [];

                if(_arg.length!=2)console.warn("generic log scale is best for 2 values in domain, but it tries to support other cases too");
                
                switch (_arg.length){
                    // if no values are given, reset input to the default domain (do nothing)
                    case 0: arg = domain; break;
                    // use the given value as a center, get the domain /2 and *2 around it
                    case 1: arg = [_arg[0]/2, _arg[0]*2]; break;
                    // two is the standard case. just use these
                    case 2: arg = [_arg[0], _arg[1]]; break;
                    // use the edge values as domain, center as ±epsilon
                    case 3: arg = [_arg[0], _arg[2]]; eps = abs(_arg[1]); break;
                    // use the edge values as domain, center two values as ±epsilon
//                    case 4: arg = [_arg[0], _arg[3]]; 
//                        // if the domain is pointing forward
//                        if(_arg[0]<=_arg[3]){eNeg = -abs(_arg[1]); ePos = abs(_arg[2]);}
//                        // if the domain is pointing backward
//                        if(_arg[0]>=_arg[3]){eNeg = -abs(_arg[2]); ePos = abs(_arg[1]);}
//                         break;
                    // use the edge values as domain, the minimum of the rest be the epsilon
                    default: arg = [_arg[0], _arg[_arg.length-1]];
                        eps = d3.min(abs(_arg.filter(function(d, i){return i!=0 && i!=_arg.length-1})));
                        break;
                }

                //if the domain is just a single value
                if (arg[0]==arg[1]){arg[0] = arg[0]/2; arg[1] = arg[1]*2};


                //if the desired domain is one-seded
                if(oneside(arg) && d3.min(abs(arg)) >= eps) {

                    //if the desired domain is above +epsilon
                    if(arg[0]>0 && arg[1]>0){
                        //then fallback to a regular log scale. nothing special
                        logScale.domain(arg);
                    }else{
                        //otherwise it's all negative, we take absolute and swap the arguments
                        logScale.domain([-arg[1], -arg[0]]);
                    }

                    useLinear = false;

                //if the desired domain is one-sided and takes part of or falls within 0±epsilon
                } else if (oneside(arg) && d3.min(abs(arg)) < eps) {


                    //if the desired domain is all positive
                    if(arg[0]>0 && arg[1]>0){
                        //the domain is all positive

                        //check the direction of the domain
                        if(arg[0]<=arg[1]){
                            //if the domain is pointing forward
                            logScale.domain([eps,arg[1]]);
                            linScale.domain([0,eps]);
                        }else{
                            //if the domain is pointing backward
                            logScale.domain([arg[0],eps]);
                            linScale.domain([eps,0]);
                        }
                    }else{
                        //otherwise it's all negative, we take absolute and swap the arguments

                        //check the direction of the domain
                        if(arg[0]<=arg[1]){
                            //if the domain is pointing forward
                            logScale.domain([eps,-arg[0]]);
                            linScale.domain([0,eps]);
                        }else{
                            //if the domain is pointing backward
                            logScale.domain([-arg[1],eps]);
                            linScale.domain([eps,0]);
                        }
                    }

                    useLinear = true;

                // if the desired domain is two-sided and fully or partially covers 0±epsilon
                } else if (!oneside(arg)){

                    //check the direction of the domain
                    if(arg[0]<=arg[1]){
                        //if the domain is pointing forward
                        logScale.domain([eps,d3.max(abs(arg))]);
                        linScale.domain([0,eps]);
                    }else{
                        //if the domain is pointing backward
                        logScale.domain([d3.max(abs(arg)),eps]);
                        linScale.domain([eps,0]);
                    }

                    useLinear = true;
                }

//
//console.log("LOG scale domain:", logScale.domain());
//if(useLinear)console.log("LIN scale domain:", linScale.domain());
                domain = _arg;
                return scale;
            };





            scale.range = function (arg) {
                if (!arguments.length) return range;

                if(arg.length!=2)console.warn("generic log scale is best for 2 values in range, but it tries to support other cases too");
                switch (arg.length){
                    // reset input to the default range
                    case 0: arg = range; break;
                    // use the only value as a center, get the range ±100 around it
                    case 1: arg = [arg[0]-100, arg[0]+100]; break;
                    // two is the standard case. do nothing
                    case 2: arg = arg; break;
                    // use the edge values as range, center as delta
                    case 3: delta = arg[1]; arg = [arg[0], arg[2]]; break;
                    // use the edge values as range, the minimum of the rest be the delta
                    default: delta = d3.min(arg.filter(function(d, i){return i!=0 && i!=arg.length-1}));
                            arg = [arg[0], arg[arg.length-1]];
                            break;
                }

                if(!useLinear){
                    logScale.range(arg);
                }else{
                    if(arg[0] < arg[1]){
                        //range is pointing forward
                        
                        //check where domain is pointing
                        if(domain[0] < domain[domain.length-1]){
                            //domain is pointing forward
                            logScale.range([delta, arg[1]]);
                            linScale.range([0, delta]);
                        }else{
                            //domain is pointing backward
                            logScale.range([0, arg[1]-delta]);
                            linScale.range([arg[1]-delta, arg[1]]);
                        }
                    }else{
                        //range is pointing backward

                        //check where domain is pointing
                        if(domain[0] < domain[domain.length-1]){
                            //domain is pointing forward
                            logScale.range([arg[0]-delta, 0]);
                            linScale.range([arg[0], arg[0]-delta]);
                        }else{
                            //domain is pointing backward
                            logScale.range([arg[0], delta]);
                            linScale.range([delta, 0]);
                        }
                    }
                }

//
//console.log("LOG and LIN range:", logScale.range(), linScale.range());
                range = arg;
                return scale;
            };





            scale.copy = function () {
                return d3_scale_genericLog(d3.scale.log().domain([1, 10])).domain(domain).range(range).eps(eps).delta(delta);
            };

            return d3.rebind(scale, logScale, "invert", "base", "rangeRound", "interpolate", "clamp", "nice", "tickFormat", "ticks");
        }(d3.scale.log().domain([1, 10]));

    }

}).call(this);

//# sourceMappingURL=vizabi.js.map