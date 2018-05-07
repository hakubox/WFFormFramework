; 'use strict';
/**
 * @class HakuJs
 * @author 李典
 * @singleton
 * @license HakuJs框架——基本信息
 * 框架版本：1.0。更新时间：2018-03-13。兼容IE版本：IE9+，部分功能仅支持IE10+
 * 
 * @license HakuJs框架——框架说明
 * 本JS是支持XPT的内核框架，主要功能为操作DOM节点、包括一些直接附加到基础类型的扩展方法，如无必要请勿修改。
 *
 * @license XPT框架——问题修复/更新
 *
 * @p 2017-04-23 新增节流函数Throttle。
 * @p 2017-05-19 修复部分parents查询节点函数。
 * @p 2017-11-06 修复绑定事件函数，可以通过this调用绑定节点本身。
 * @p 2017-11-06 增加off解绑函数。
 * @p 2017-11-06 所有通过on绑定的节点增加事件列表并依附于属性Events。
 * @p 2017-11-06 可通过HakuJs.GetNodeEvents获取所有on绑定的事件。
 * @p 2017-11-20 使用严格模式（XPT.js上因为mydate97日期控件代码不严格所以无法应用严格模式）<a style="color:red;" target="_blank" href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode">参考地址</a>
 * @p 2018-03-11 增加了数组remove函数。
 * @p 2018-03-13 增加IsWeChat属性，判断当前页面是否为微信浏览器。
 */
var HakuJs = new (function (window) {
    me = this;

    if (!window.console) {
        window.console = {};
        if (!window.console.time) {
            window.console.__time = {};
            window.console.time = function (txt) {
                window.console.__time[txt] = new Date().getTime();
            };
            window.console.timeEnd = function (txt) {
                window.console.log(txt + ": " + (new Date().getTime() - window.console.__time[txt]) + "ms");
            };
        }
    };

    /**
     * @property {Object} OSInfo [GET]获取系统版本信息
     * @readonly
     */
    var _oSInfo = (function () {
        var _pf = window.navigator.platform,
            _bit = "",
            appVer = window.navigator.userAgent;
        if (_pf == "Win32" || _pf == "Windows") {
            if (appVer.indexOf("WOW64") > -1) {
                _bit = "64位";
            } else {
                _bit = "32位";
            }
            if (appVer.indexOf("Windows NT 6.0") > -1 || appVer.indexOf("Windows Vista") > -1) {
                return 'Windows_vista ' + _bit;
            }
            else if (appVer.indexOf("Windows NT 6.1") > -1 || appVer.indexOf("Windows 7") > -1) {
                return 'Windows_7 ' + _bit;
            }
            else if (appVer.indexOf("Windows NT 10") > -1 || appVer.indexOf("Windows 10") > -1) {
                return 'Windows_10 ' + _bit;
            }
            else {
                try {
                    var _winName = Array('2000', 'XP', '2003');
                    var _ntNum = appVer.match(/Windows NT 5.\d/i).toString();
                    return 'Windows_' + _winName[_ntNum.replace(/Windows NT 5.(\d)/i, "$1")] + " " + _bit;
                }
                catch (e) {
                    return 'Windows';
                }
            }
        }
        else if (_pf == "Mac68K" || _pf == "MacPPC" || _pf == "Macintosh") {
            return "Mac";
        }
        else if (_pf == "X11") {
            return "Unix";
        }
        else if (String(_pf).indexOf("Linux") > -1) {
            return "Linux";
        }
        else {
            return "[Unknow]" + window.navigator.userAgent;
        }
    })();
    /**
     * @property {Object} AppInfo [GET]获取浏览器版本信息
     * @readonly
     */
    var _appInfo = (function () {
        var browser = {
            msie: false, firefox: false, opera: false, safari: false,
            chrome: false, netscape: false, appname: 'unknown', version: 0
        }, userAgent = window.navigator.userAgent.toLowerCase();
        if (/(rv\:11|msie|firefox|opera|chrome|netscape)\D+(\d[\d.]*)/.test(userAgent)) {
            browser[RegExp.$1] = true;
            browser.appname = RegExp.$1;
            browser.version = RegExp.$2;
        } else if (/version\D+(\d[\d.]*).*safari/.test(userAgent)) {
            browser.safari = true;
            browser.appname = 'safari';
            browser.version = RegExp.$2;
        }
        if (browser["rv:11"]) {
            browser.version = "11";
            browser.msie = true;
            browser.appname = "msie";
            delete browser["rv:11"];
        }
        return browser;
    })();
    /**
     * @property {Boolean} IsIE [GET]浏览器是否为IE
     * @readonly
     */
    var _isIE = (function () {
        return _appInfo.msie == true;
    })();
    /**
     * @property {Boolean} IsIE9 [GET]浏览器是否为IE9(IE9就是坑)
     * @readonly
     */
    var _isIE9 = (function () {
        return _appInfo.msie == true && _appInfo.version == 9;
    })();
    /**
     * @property {Boolean} IsWeChat [GET]浏览器是否为微信浏览器
     * @readonly
     */
    var _isWeChat = (function () {
        return (/micromessenger/i).test(window.navigator.userAgent.toLowerCase());
    })();
    /**
     * @property {Boolean} IsMobile [GET]浏览器是否为移动端打开（安卓/WebOS/IOS/黑莓/微信）
     * @readonly
     */
    var _isMobile = (function () {
        return (/android|webos|iphone|ipad|blackberry|micromessenger/i).test(window.navigator.userAgent.toLowerCase());
    })();

    Object.defineProperties(me, {
        Version: { value: "v1.0" },
        OSInfo: { get: function () { return _oSInfo; } },
        AppInfo: { get: function () { return _appInfo; } },
        IsIE: { get: function () { return _isIE; } },
        IsIE9: { get: function () { return _isIE9; } },
        IsWeChat: { get: function () { return _isWeChat; } },
        IsMobile: { get: function () { return _isMobile; } }
    });

    var _nodeEvents = [];
    var slice = [].slice;
    var sibling = function (cur, dir) {
        do { cur = cur[dir]; } while (cur && cur.nodeType !== 1);
        return cur;
    };

    me.IsElement = function (element) {
        if (!element) return false;
        var _nodeType = element.nodeType;
        if (!_nodeType || _nodeType === 3 || _nodeType === 8 || _nodeType === 2) return false;
        else return true;
        //var _proto = element.constructor.__proto__;
        //return _proto == HTMLElement || _proto == Element || _proto == Node || _proto == HTMLLIElement || element.constructor == HTMLLIElement;
    };

    /**
     * @method GetNodeEvents 获取所有节点事件（必须要用on/one绑定事件才行）
     */
    me.GetNodeEvents = function () {
        return _nodeEvents;
    };

    /**
     * @method addEvent 为元素绑定事件的基础方法 <a style="color:red;" target="_blank" href="https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener">参考用MDN地址</a>
     * @param {HTMLElement} element 调用元素
     * @param {String} event 事件类型
     * @param {Function} fn 事件触发执行的函数
     * @param {Object} [options] 附加参数
     * @param {Boolean} [useCapture=false] 冒泡还是捕获事件
     * @private
     */
    var addEvent = function (element, event, fn, options) {
        if (!fn) console.error(element, '元素绑定事件不存在。');
        var event_fun = (function (e) { fn.call(element, e, element); });
        if (element.addEventListener) {
            if (me.IsIE) element.addEventListener(event, event_fun, options.capture);
            else element.addEventListener(event, event_fun, options);
        } else if (element.attachEvent) {
            if (options && options.once == true) {
                event_fun = function (e) { fn(e, element); element.detachEvent("on" + event, event_fun); };
            }
            element.attachEvent("on" + event, event_fun);
        } else {
            if (options && options.once == true) {
                event_fun = function (e) { fn(e, element); element["on" + event] = null; };
            }
            element["on" + event] = event_fun;
        }
        if (!element.Events) element.Events = [];
        if (!element.Events[event]) element.Events[event] = [];
        element.Events[event].push({ fn: event_fun, trueFn: fn, options: options });
        _nodeEvents.push({ element: element, event: event, fn: event_fun, trueFn: fn, options: options });
    };

    /**
     * @method removeEvent 为元素绑定事件的基础方法
     * @private
     */
    var removeEvent = function (element, event, fn, useCapture) {
        if (element.removeEventListener) {
            element.removeEventListener(event, fn, useCapture);
        } else if (element.detachEvent) {
            element.detachEvent("on" + event, fn, useCapture);
        } else {
            element["on" + event] = null;
        }
        if (element.Events) {
            var i = 0;
            for (i = 0; i < element.Events[event].length; i++) {
                if (element.Events[event][i].fn == fn) {
                    element.Events[event].splice(i, 1);
                    break;
                }
            }
            for (i = 0; i < _nodeEvents.length; i++) {
                if (_nodeEvents[i].fn == fn) {
                    _nodeEvents.splice(i, 1);
                    break;
                }
            }
        }
    };

    /**
     * @method toString 任意类型转字符串函数
     * @member HakuJs
     * @param {Object} obj 任意基本类型的参数
     * @return {string} 解析后的字符串
     */
    me.toString = function (obj) {
        var r = [];
        if (typeof obj == "string") {
            return "\"" + obj.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
        } else if (typeof obj == "object") {
            if (obj instanceof Date) {
                return obj.format("yyyy-MM-dd HH:mm:ss");
            } else {
                if (!obj.sort) {
                    for (var item in obj) {
                        if (obj[item] != null && obj[item].constructor != Function)
                            r.push(item + ":" + me.toString(obj[item]));
                    }
                    if (!!window.document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(obj.toString)) {
                        r.push("toString:" + obj.toString.toString());
                    }
                    r = "{" + r.join(", ") + "}";
                } else {
                    for (var i = 0; i < obj.length; i++) {
                        r.push(me.toString(obj[i]));
                    }
                    r = "[" + r.join(", ") + "]";
                }
                return r;
            }
        } else if (typeof obj == "number") {
            if (('' + obj).test(/^[0-9.]+e\+\w+$/)) {
                var _temp = ('' + obj);
                var _num = Number(_temp.substring(0, _temp.indexOf("e")));
                var _length = parseInt(_temp.substring(_temp.indexOf("e+") + 2));
                var _decimallen = ('' + _num).length - ('' + _num).indexOf(".") - 1;
                if (_length > _decimallen) {
                    for (var i = 0; i < _decimallen; i++) {
                        _num = _num * 10;
                    }
                    _num = '' + _num;
                    _length = _length - _decimallen;
                    for (var i = 0; i < _length; i++) {
                        _num = _num + "0";
                    }
                } else {
                    for (var i = 0; i < _length; i++) {
                        _num = _num * 10;
                    }
                    _num = '' + _num;
                }
                return _num;
            }
        } else {
            return '' + obj;
        }
    };
    /**
     * @method 将字符串转换为数字类型
     * @param {Number} [defaultNumber=0] 不合规的情况下返回的默认值
     * @member HakuJs
     * @return {Number} 转换后的值
     */
    me.toNumber = function (data, defaultNumber) {
        if (data == null) return defaultNumber || 0;
        data = data.valueOf();
        if (isNaN(data) || data == "Infinity") return defaultNumber || 0;
        try {
            if (HakuJs.GetType(data) == "String") {
                return Number(data.replace(/,/g, ''));
            } else {
                return Number(data);
            }
        } catch (e) {
            return defaultNumber || 0;
        }
    };
    /**
     * @method 获取任意值的类型（字符串）
     * @param {Object} obj 需要获取类型的对象
     * @member HakuJs
     * @return {String} 类型名称
     * 
     *     @example
     *     //函数调用示例
     *     HakuJs.GetType(con);  //XptRadioListControl
     *     HakuJs.GetType({});   //Object
     *     HakuJs.GetType(1);    //Number
     *     HakuJs.GetType(null); //Null
     *     HakuJs.GetType("");   //String
     *     HakuJs.GetType([]);   //Array
     *     
     */
    me.GetType = function (obj) {
        if (obj === undefined) return "Null";
        var result = Object.prototype.toString.call(obj).slice(8, -1);
        if (result == "Object") {
            return obj.constructor.name || obj.toString().slice(8, -1);
        } else return result;
    };
    me.GetAttrBoolean = function (str) {
        return str == null ? false : (str.toLowerCase() == "false" ? false : true);
    };
    /**
     * @method 设置对象的一些值
     * 
     *     @example
     *     //函数调用示例
     *     var obj = {id: 1, name: "张三"};
     *     HakuJs.SetPropertys(obj, {age: 15, sex:"男"});
     *     //obj = {id: 1, name: "张三", age: 15, sex:"男"}
     *
     * @param {Object} obj 原对象
     * @param {Object} propertys 赋值的内容
     * @member HakuJs
     *
     */
    me.SetPropertys = function (obj, propertys) {
        for (var item in propertys) {
            obj[item] = propertys[item];
        }
        return obj;
    };
    /**
     * @method 获取新的GUID
     * @member HakuJs
     * @return {String} 字符串GUID
     */
    me.NewGUID = function () {
        var s = [];
        var hexDigits = "0123456789ABCDEF";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    };

    /**
     * @method 获取节点（可能为html、节点对象、css表达式）
     * @param {String} selector 查询表达式
     * @return {HTMLElement} 节点
     */
    me.getElement = function (selector) {
        if (selector.constructor == String) {
            var element = null;
            selector = selector.trim();
            if ((selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3)) {
                var _nt = selector.match(/^<[a-zA-Z0-9-]{1,}/)[0].substr(1).toLowerCase();
                switch (_nt) {
                    case "tr":
                        if (me.IsIE9) {
                            element = window.document.createElement('div');
                            element.innerHTML = '<table>' + selector + '</table>';
                            return element.firstChild.firstChild.firstChild;
                        } else {
                            element = window.document.createElement("table");
                            element.innerHTML = selector;
                            return element.children[0].children[0];
                        }
                        break;
                    case "th":
                    case "td":
                        if (me.IsIE9) {
                            element = window.document.createElement('div');
                            element.innerHTML = '<table><tr>' + selector + '</tr></table>';
                            return element.firstChild.firstChild.firstChild.firstChild;
                        } else {
                            element = window.document.createElement("tr");
                            element.innerHTML = selector;
                        }
                        break;
                    case "tfoot":
                    case "thead":
                    case "tbody":
                        if (me.IsIE9) {
                            element = window.document.createElement('div');
                            element.innerHTML = '<table>' + selector + '</table>';
                            return element.firstChild.firstChild;
                        } else {
                            element = window.document.createElement("table");
                            element.innerHTML = selector;
                            return element.children[0];
                        }
                    default:
                        element = window.document.createElement("div");
                        element.innerHTML = selector;
                }
                return element.children[0];
            } else {
                var _element = window.document.querySelectorAll(selector);
                if (_element.length > 1) return _element;
                else return _element[0];
            }
        } else if (selector.nodeType) {
            return selector;
        } else {
            var _element = window.document.querySelectorAll(selector);
            if (_element.length > 1) return _element;
            else return _element[0];
        }
    };
    //遍历
    me.NodeListEach = function (control, fun) {
        if (!!fun) for (var i = 0; i < control.length; i++) if (me.IsElement(control[i])) fun(control[i]);
    };
    //方便的获取方法
    window.el = window.document.element = me.getElement;
    //测试方法执行时间（执行次数，方法内容）
    window.ftest = function (num, fun) {
        if (num == undefined) num = 1;
        if (!!fun) {
            window.console.time("execute");
            for (var i = 0; i < num; i++) fun(i);
            window.console.timeEnd("execute");
        } else window.console.error("未找到对应方法");
    };

    /**
     * @class _Object
     * @author 李典
     * @license HakuJs框架——JS基本对象附加函数部分
     * 注：Object类本身不能附加函数否则jquery可能会报错。其他类则尽可能为了方便附加了特定的一些操作函数。
     */
    me.Method = {
        /**
         * 字符串类
         * @class String
         * @extends {_Object}
         */
        String: {
            /**
             * @member String
             * @method 清空字符串前后空格（也可以更改为指定文本）
             * @param {String} [text] 
             * @return {String} 处理后的字符串
             *
             *     @example
             *     //示例
             *     "XXX".trim();
             *
             */
            trim: function (text) {
                if (text == null) text = "";
                return this.replace(/(^\s*)|(\s*$)/g, text);
            },

            upperFirst: function () {
                return this.replace(/^(\w)/, function ($1) { return $1.toUpperCase(); });
            },

            lowerFirst: function () {
                return this.replace(/^(\w)/, function ($1) { return $1.toLowerCase(); });
            },
            /**
             * @member String
             * @method 字符串填充方法
             * @param {String} args 参数集合
             * @return {String} 处理后的字符串
             *
             *     @example
             *     //示例：第一种方式
             *     "XX{0}XX{1}XX".trim("a", "b");
             *     //示例：第二种方式
             *     "XX{a}XX{b}XX".trim({
             *         a:"a", 
             *         b:"b"
             *     });
             *
             */
            format: function (args) {
                if (arguments.length > 0) {
                    var result = this;
                    if (arguments.length == 1 && (typeof (args)).toLowerCase() == "object") {
                        for (var key in args) {
                            var reg = new RegExp("({" + key + "})", "g");
                            result = result.replace(reg, args[key]);
                        }
                    } else {
                        for (var i = 0; i < arguments.length; i++) {
                            if (arguments[i] == undefined) {
                                return "";
                            }
                            else {
                                var reg = new RegExp("({[" + i + "]})", "g");
                                result = result.replace(reg, arguments[i]);
                            }
                        }
                    }
                    return result;
                }
                else {
                    return this;
                }
            },
            /**
             * @member String
             * @method 将字符串转换为日期类型（格式必须正确，否则返回null）
             * @return {String} 处理后的字符串
             */
            toDate: function () {
                var date = this.replace(/\\/g, "-").trim();
                var obj = { year: 0, month: 0, day: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 };
                if (date.indexOf('.') >= 0) date = date.substr(0, date.lastIndexOf('.'));
                if (date.test(/^\d{1,2}-\d{1,2}$/)) {
                    var sps = date.split("-");
                    obj.year = new Date().getFullYear();
                    obj.month = parseInt(sps[0]) - 1;
                    obj.day = parseInt(sps[1]);
                } else if (date.test(/^\d{2}-\d{1,2}-\d{1,2}$/)) {
                    var sps = date.split("-");
                    obj.year = parseInt("19" + sps[0]);
                    obj.month = parseInt(sps[1]) - 1;
                    obj.day = parseInt(sps[2]);
                } else if (date.test(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                    var sps = date.split("-");
                    obj.year = parseInt(sps[0]);
                    obj.month = parseInt(sps[1]) - 1;
                    obj.day = parseInt(sps[2]);
                } else if (date.test(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}$/)) {
                    var sps = date.split(" ");
                    var date = sps[0].split("-");
                    var time = sps[1].split(":");
                    obj.year = parseInt(date[0]);
                    obj.month = parseInt(date[1]) - 1;
                    obj.day = parseInt(date[2]);
                    obj.hours = parseInt(time[0]);
                    obj.minutes = parseInt(time[1]);
                } else if (date.test(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/)) {
                    var sps = date.split(" ");
                    var date = sps[0].split("-");
                    var time = sps[1].split(":");
                    obj.year = parseInt(date[0]);
                    obj.month = parseInt(date[1]) - 1;
                    obj.day = parseInt(date[2]);
                    obj.hours = parseInt(time[0]);
                    obj.minutes = parseInt(time[1]);
                    obj.seconds = parseInt(time[2]);
                } else if (date.test(/^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}$/)) {
                    var sps = date.split("T");
                    var date = sps[0].split("-");
                    var time = sps[1].split(":");
                    obj.year = parseInt(date[0]);
                    obj.month = parseInt(date[1]) - 1;
                    obj.day = parseInt(date[2]);
                    obj.hours = parseInt(time[0]);
                    obj.minutes = parseInt(time[1]);
                    obj.seconds = parseInt(time[2]);
                } else {
                    return new Date(date);
                }
                //
                var result = new Date(obj.year, obj.month, obj.day, obj.hours, obj.minutes, obj.seconds, obj.ms);
                return result;
            },
            /**
             * @method test 检测字符串是否符合正则表达式（兼容不支持的浏览器用）
             * @param {RegExp} regex 正则表达式
             * @return {Boolean} 是否符合
             */
            test: function (regex) {
                if (regex) return regex.test('' + this);
                else return false;
            }
        },
        /**
         * 文本节点类
         * @class Text
         * @extends {_Object}
         */
        Text: {
            next: function () { return this.nextSibling; }
        },
        /**
         * @member _Object
         * @class Number 数字类
         * @extends {_Object}
         */
        Number: {
            /**
             * @member Number
             * @method 将浮点数转换为对应精度的字符串
             * @param {Number} num 需要保留的精度
             * @return {String} 处理后的字符串
             */
            toFixed: function (d) {
                var s = this + "";
                if (!d) d = 0;
                else d = +d;
                if (s.indexOf(".") == -1) s += ".";
                s += new Array(d + 1).join("0");
                if (new RegExp("^(-|\\+)?(\\d+(\\.\\d{0," + (d + 1) + "})?)\\d*$").test(s)) {
                    var s = "0" + RegExp.$2, pm = RegExp.$1, a = RegExp.$3.length, b = true;
                    if (a == d + 2) {
                        a = s.match(/\d/g);
                        if (parseInt(a[a.length - 1]) > 4) {
                            for (var i = a.length - 2; i >= 0; i--) {
                                a[i] = parseInt(a[i]) + 1;
                                if (a[i] == 10) {
                                    a[i] = 0;
                                    b = i != 1;
                                } else break;
                            }
                        }
                        s = a.join("").replace(new RegExp("(\\d+)(\\d{" + d + "})\\d$"), "$1.$2");

                    } if (b) s = s.substr(1);
                    return (pm + s).replace(/\.$/, "");
                } return this + "";
            },
            /**
             * @member Number
             * @method toMoney 将浮点数转换为对应精度的字符串
             * @param {Number} d 需要保留的精度
             * @return {String} 处理后的字符串
             */
            toMoney: function (d) {
                if (d == undefined) d = 2;
                var _str = this.toFixed(d),
                    _numcount = _str.lastIndexOf(".") >= 0 ? _str.lastIndexOf(".") : _str.length - 1, result = "",
                    _minIndex = _str[0] == "-" ? 1 : 0;
                for (var i = _str.length - 1; i >= _minIndex; i--) {
                    if ((_str.length - i) % 3 == 1 && i < _numcount - 1) result = "," + result;
                    result = _str[i] + result;
                }
                if (_minIndex == 1) result = "-" + result;
                return result;
            },
            /**
             * @member Number
             * @method 加法函数，用来得到精确的加法结果
             * @param {Number} num 参与计算的数值，可为多个参数
             * @return {Number} 结果值
             *
             *     @example
             *     var num = 10;
             *     //示例，结果均为30，此函数可以和其他计算类函数配合使用
             *     num.add(20);
             *     num.add(10).add(10);
             *     num.add(10, 10);
             *     num.add(10, [5, 5]);
             *     (10).add(10, 10);    //（直接写10.add会报错，会把.认为是小数点）
             *
             */
            add: function (num) {
                var args = Array.prototype.slice.call(arguments);
                args.splice(0, 0, HakuJs.toNumber(this));
                for (var i = args.length - 1; i >= 0; i--) {
                    if (args[i] instanceof Array) {
                        var _temp = args[i];
                        for (var o = 0; o < _temp.length; o++) {
                            if (o == 0) args.splice(i, 1, _temp[0]);
                            else args.splice(i + o, 0, _temp[o]);
                        }
                    }
                }

                var fn = function () {
                    var arg_fn = Array.prototype.slice.call(arguments);
                    return add.apply(null, args.concat(arg_fn));
                };

                fn.valueOf = function () {
                    return args.reduce(function (arg1, arg2) {
                        var r1, r2, m, c;
                        try {
                            r1 = (arg1 || "").toString().split(".")[1].length;
                        }
                        catch (e) {
                            r1 = 0;
                        }
                        try {
                            r2 = (arg2 || "").toString().split(".")[1].length;
                        }
                        catch (e) {
                            r2 = 0;
                        }
                        c = Math.abs(r1 - r2);
                        m = Math.pow(10, Math.max(r1, r2));
                        if (c > 0) {
                            var cm = Math.pow(10, c);
                            if (r1 > r2) {
                                arg1 = Number((arg1 || "").toString().replace(".", ""));
                                arg2 = Number((arg2 || "").toString().replace(".", "")) * cm;
                            } else {
                                arg1 = Number((arg1 || "").toString().replace(".", "")) * cm;
                                arg2 = Number((arg2 || "").toString().replace(".", ""));
                            }
                        } else {
                            arg1 = Number((arg1 || "").toString().replace(".", ""));
                            arg2 = Number((arg2 || "").toString().replace(".", ""));
                        }
                        return (arg1 + arg2) / m;
                    });
                };

                return fn.valueOf();
            },
            /**
             * @member Number
             * @method 减法函数，用来得到精确的减法结果
             * @param {Number} num 参与计算的数值，可为多个参数
             * @return {Number} 结果值
             *
             *     @example
             *     var num = 100;
             *     //示例，结果均为80，此函数可以和其他计算类函数配合使用
             *     num.sub(20);
             *     num.sub(10).sub(10);
             *     num.sub(10, 10);
             *     num.sub(10, [5, 5]);
             *     (100).sub(10, 10);    //（直接写100.sub会报错，会把.认为是小数点）
             *
             */
            sub: function (num) {
                var args = Array.prototype.slice.call(arguments);
                args.splice(0, 0, HakuJs.toNumber(this));
                for (var i = args.length - 1; i >= 0; i--) {
                    if (args[i] instanceof Array) {
                        var _temp = args[i];
                        for (var o = 0; o < _temp.length; o++) {
                            if (o == 0) args.splice(i, 1, _temp[0]);
                            else args.splice(i + o, 0, _temp[o]);
                        }
                    }
                }

                var fn = function () {
                    var arg_fn = Array.prototype.slice.call(arguments);
                    return add.apply(null, args.concat(arg_fn));
                };

                fn.valueOf = function () {
                    return args.reduce(function (arg1, arg2) {
                        var r1, r2, m, n;
                        try {
                            r1 = (arg1 || "").toString().split(".")[1].length;
                        }
                        catch (e) {
                            r1 = 0;
                        }
                        try {
                            r2 = (arg2 || "").toString().split(".")[1].length;
                        }
                        catch (e) {
                            r2 = 0;
                        }
                        m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
                        n = (r1 >= r2) ? r1 : r2;
                        return Number((arg1 * m - arg2 * m) / m);
                    });
                };

                return fn.valueOf();
            },
            /**
             * @member Number
             * @method 乘法函数，用来得到精确的乘法结果
             * @param {Number} num 参与计算的数值，可为多个参数
             * @return {Number} 结果值
             *
             *     @example
             *     var num = 10;
             *     //示例，结果均为40，此函数可以和其他计算类函数配合使用
             *     num.mul(4);
             *     num.mul(2).mul(2);
             *     num.mul(2, 2);
             *     num.mul(2, [2]);
             *     (10).mul(2, 2);    //（直接写10.mul会报错，会把.认为是小数点）
             *
             */
            mul: function (num) {
                var args = Array.prototype.slice.call(arguments);
                args.splice(0, 0, HakuJs.toNumber(this));
                for (var i = args.length - 1; i >= 0; i--) {
                    if (args[i] instanceof Array) {
                        var _temp = args[i];
                        for (var o = 0; o < _temp.length; o++) {
                            if (o == 0) args.splice(i, 1, _temp[0]);
                            else args.splice(i + o, 0, _temp[o]);
                        }
                    }
                }

                var fn = function () {
                    var arg_fn = Array.prototype.slice.call(arguments);
                    return add.apply(null, args.concat(arg_fn));
                };

                fn.valueOf = function () {
                    return args.reduce(function (arg1, arg2) {
                        var m = 0, s1 = (arg1 || "").toString(), s2 = (arg2 || "").toString();
                        try {
                            m += s1.split(".")[1].length;
                        }
                        catch (e) {
                        }
                        try {
                            m += s2.split(".")[1].length;
                        }
                        catch (e) {
                        }
                        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
                    });
                };

                return fn.valueOf();
            },
            /**
             * @member Number
             * @method 除法函数，用来得到精确的除法结果
             * @param {Number} num 参与计算的数值，可为多个参数
             * @return {Number} 结果值
             *
             *     @example
             *     var num = 100;
             *     //示例，结果均为25，此函数可以和其他计算类函数配合使用
             *     num.div(4);
             *     num.div(2).div(2);
             *     num.div(2, 2);
             *     num.div(2, [2]);
             *     (100).div(2, 2);    //（直接写100.div会报错，会把.认为是小数点）
             *
             */
            div: function (num) {
                var args = Array.prototype.slice.call(arguments);
                args.splice(0, 0, HakuJs.toNumber(this));
                for (var i = args.length - 1; i >= 0; i--) {
                    if (args[i] instanceof Array) {
                        var _temp = args[i];
                        for (var o = 0; o < _temp.length; o++) {
                            if (o == 0) args.splice(i, 1, _temp[0]);
                            else args.splice(i + o, 0, _temp[o]);
                        }
                    }
                }

                var fn = function () {
                    var arg_fn = Array.prototype.slice.call(arguments);
                    return add.apply(null, args.concat(arg_fn));
                };

                fn.valueOf = function () {
                    return args.reduce(function (arg1, arg2) {
                        var t1 = 0, t2 = 0, r1, r2;
                        try {
                            t1 = (arg1 || "").toString().split(".")[1].length;
                        }
                        catch (e) {
                        }
                        try {
                            t2 = (arg2 || "").toString().split(".")[1].length;
                        }
                        catch (e) {
                        }
                        r1 = Number((arg1 || "").toString().replace(".", ""));
                        r2 = Number((arg2 || "").toString().replace(".", ""));
                        return (r1 / r2) * Math.pow(10, t2 - t1);
                    });
                };

                return fn.valueOf();
            }
        },
        /**
         * 页面元素类
         * @class HTMLElement
         * @extends {_Object}
         */
        HTMLElement: {
            /**
             * @method 获取元素本身包括其内容
             * @return {String} 返回元素及其内容文本
             */
            OuterHTML: function () {
                if (this.outerHTML) return this.outerHTML;
                else {
                    var _div = window.document.createElement("div");
                    _div.appendChild(this.cloneNode(true));
                    var _contents = div.innerHTML;
                    _div = null;
                    return _contents;
                }
            },
            /**
             * @method 获取下一个元素
             * @return {HTMLElement} 返回元素
             */
            next: function () {
                if (this.nextSibling == null) return null;
                if (this.nextSibling.nodeType == 1) { return this.nextSibling; }
                else if (this.nextSibling.nodeType == 3) { return this.nextSibling.next(); }
            },
            /**
             * @method 获取上一个元素
             * @return {HTMLElement} 返回元素
             */
            prev: function () {
                return sibling(this, "previousSibling");
            },
            /**
             * @method 移除元素
             */
            remove: function () {
                if (this.parentNode) this.parentNode.removeChild(this);
            },
            /**
             * @method 给元素增加类样式
             * @param {Object} className 类样式，可以为字符串或数组
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            addClass: function (className) {
                var _eClass = this.className;
                if (className) {
                    if (className.constructor == String) {
                        if (_eClass.split(" ").indexOf(className) >= 0) return;
                        _eClass += (_eClass && " ") + className;
                    } else if (className.constructor == Array) {
                        for (var i = 0; i < className.length; i++) {
                            if (_eClass.indexOf(className[i]) < 0) _eClass += " " + className[i];
                        }
                    }
                    this.className = _eClass;
                }
                return this;
            },
            /**
             * @method 给元素移除类样式
             * @param {Object} className 类样式，可以为字符串或数组
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            removeClass: function (className) {
                if (!this.className) return this;
                if (className) {
                    var _arr = this.className.split(" ");
                    if (className.constructor == String) {
                        var _index = _arr.indexOf(className);
                        if (_index < 0) return this;
                        _arr.splice(_index, 1);
                    } else if (className.constructor == Array) {
                        for (var i = 0; i < className.length; i++) {
                            var _index = _arr.indexOf(className[i]);
                            if (_index >= 0) {
                                _arr.splice(_index, 1);
                            }
                        }
                    }
                    this.className = _arr.join(" ");
                } else this.className = "";
                return this;
            },
            /**
             * @method 切换类样式，如果有则删除，无则增加
             * @param {Object} className 类样式，可以为字符串或数组
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            toggleClass: function (className) {
                if (className) {
                    var _arr = this.className.split(" ");
                    if (className.constructor == String) {
                        var _index = _arr.indexOf(className);
                        if (_index < 0) _arr.push(className);
                        else _arr.splice(_index, 1);
                    } else if (className.constructor == Array) {
                        for (var i = 0; i < className.length; i++) {
                            var _index = _arr.indexOf(className[i]);
                            if (_index >= 0) _arr.splice(_index, 1);
                            else _arr.push(className[i]);
                        }
                    }
                    this.className = _arr.join(" ");
                }
                return this;
            },
            /**
             * @method 判断元素是否有某个类样式
             * @param {Object} className 类样式，可以为字符串或数组，当参数为数组时全部都有返回true，否则为false
             * @return {Boolean} 判断结果
             */
            hasClass: function (className) {
                var cnames = (this.className || "").replace(/  /g, " ").split(" ");
                if (className.constructor == String) {
                    return cnames.indexOf(className) >= 0;
                } else if (className.constructor == Array) {
                    for (var i = 0; i < className.length; i++) {
                        if (cnames.indexOf(className) < 0) return false;
                    }
                    return true;
                }
            },
            /**
             * @method 给元素设置行内样式（不推荐使用）
             * @param {Object} key 键，为string时则value为必须，为object时则为键值对
             * @param {Object} [value] 值，当key为字符串时则value为必要参数
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            css: function (key, value) {
                if (key.constructor == String) {
                    this.style[key] = value;
                } else {
                    for (var item in key) {
                        this.style[item] = key[item];
                    }
                }
                return this;
            },
            /**
             * @method 隐藏元素（增加hidden类样式）
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            hide: function () {
                this.addClass("hidden");
                return this;
            },
            /**
             * @method 显示元素（移除hidden类样式，不一定会显示，需要和hide配合使用）
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            show: function () {
                this.removeClass(["hidden", "hide"]);
                return this;
            },
            /**
             * @method 获取元素的所有属性
             * @return {Object} 属性集合
             */
            allAttr: function () {
                var _html = /<[^/]\S+?\s+?.*?(?=>)/.exec(this.OuterHTML())[0];
                var patt = /\S+?(?==")/g;
                var html = _html.substring(_html.indexOf(" ") + 1);
                var _arr = html.match(patt);
                var obj = {};
                for (var i = 0; i < _arr.length; i++) {
                    obj[_arr[i]] = this.getAttribute(_arr[i]);
                }
                return obj;
            },
            /**
             * @method 设置元素属性
             * @param {Object} key 键，为string时则value为必须，为object时则为键值对
             * @param {Object} [value] 值，当key为字符串时则value为必要参数
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            attr: function (key, value) {
                if (key.constructor == String) {
                    if (value === undefined) return this.getAttribute(key);
                    else if (value === null) this.removeAttribute(key);
                    else this.setAttribute(key, value);
                } else if (key.constructor == Object) {
                    for (var item in key) {
                        if (key[item] === undefined) return this.getAttribute(item);
                        else if (key[item] === null) this.removeAttribute(item);
                        else this.setAttribute(key, key[item]);
                    }
                }
                return this;
            },
            /**
             * @method 移除元素属性
             * @param {Object} key 键，可以为字符串或数组
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            removeAttr: function (key) {
                var _type = me.GetType(key);
                if (_type == "String") {
                    this.removeAttribute(key);
                } else if (_type == "Array") {
                    for (var i = 0; i < key.length; i++) {
                        this.removeAttribute(key[i]);
                    }
                }
                return this;
            },
            /**
             * @method 查询当前元素的子/叶元素
             * @param {Object} query 查询表达式
             * @return {Array} 查询到的元素列表
             */
            find: function (query) {
                return this.querySelectorAll(query || "*");
            },
            /**
             * @method 查询当前元素的父元素
             * @param {Object} query 查询表达式
             * @return {Array} 父元素列表
             */
            parents: function (query) {
                var t = this, list = [];
                if (t.constructor == (typeof (HTMLDocument) != "undefined" ? HTMLDocument : HTMLBodyElement)) return list;
                if (!query) {
                    list.push(t);
                } else if (t.equal(query)) {
                    list.push(t);
                }
                while (t = t.parentNode) {
                    if (t.constructor == HTMLBodyElement) {
                        if (t.equal(query)) {
                            list.push(t);
                        }
                        return list;
                    }
                    if (!query) {
                        list.push(t);
                    } else if (t.equal(query)) {
                        list.push(t);
                    }
                }
                return list;
            },
            /**
             * @method 根据表达式筛选元素的子元素并返回
             * @param {Object} [query] 不赋值则代表获取所有子元素
             * @return {Array} 符合条件的子元素列表
             */
            childrens: function (query) {
                var _arr = this.children;
                if (!query) return _arr;
                var _result = [];
                for (var i = 0; i < _arr.length; i++) {
                    if (_arr[i].equal(query)) {
                        _result.push(_arr[i]);
                    }
                }
                return _result;
            },
            /**
             * @method 在元素内的尾部新增元素
             * @param {Object} [html] 可以为元素、字符串
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            append: function (html) {
                if (!html) return this;
                var ele = me.getElement(html);
                this.appendChild(ele);
                return this;
            },
            /**
             * @method 在元素内的头部新增元素？
             * @param {Object} [html] 可以为元素、字符串
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            prepend: function (html) {
                if (html.constructor == String) {
                    var _tnode = me.getElement(html);
                    this.insertBefore(_tnode, this.children[0]);
                } else {
                    this.innerHTML = html.outerHTML + this.innerHTML;
                }
                return this;
            },
            /**
             * @method 在元素之前新增元素？
             * @param {Object} [html] 可以为元素、字符串
             * @return {HTMLElement} 返回新增的元素
             */
            before: function (html) {
                var element = me.getElement(html);
                this.parentNode.insertBefore(element, this);
                return element;
            },
            /**
             * @method 用某个元素包含当前元素
             * @param {Object} [html] 可以为元素、字符串
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            warp: function (html) {
                var element = me.getElement(html);
                this.after(element);
                //element.insertBefore(this, element.childNodes[0]);
                element.appendChild(this);
                return this;
            },
            /**
             * @method 在元素之后新增元素？
             * @param {Object} [html] 可以为元素、字符串
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            after: function (html) {
                if (this.parentNode) {
                    var element = me.getElement(html);
                    this.parentNode.insertBefore(element, this.nextSibling);
                    return element;
                }
                return null;
            },
            /**
             * @method 在符合条件的元素中寻找当前元素的下标，当前元素一定要在选择队伍中，否则返回-1
             * @param {String} [query] 选择字符串
             * @return {Number} 返回元素下标，找不到则返回-1
             */
            index: function (query) {
                if (!this.parentNode) return null;
                var _childrens = this.parentNode.childrens(query);
                for (var i = 0; i < _childrens.length; i++) {
                    if (_childrens[i].isSameNode) {
                        if (_childrens[i].isSameNode(this)) return i;
                    } else {
                        if (_childrens[i] === this) return i;
                    }
                }
                return -1;
            },
            /**
             * @method 在当前元素上寻找属性的下标，找不到则返回-1
             * @param {String} [key] 需要查找的属性名
             * @return {Number} 返回属性下标，找不到则返回-1
             */
            indexOfAttr: function (key) {
                var nodes = this.parentNode.childrens("[" + key + "]");
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].isSameNode(this)) return i;
                }
                return -1;
            },
            //鼠标点击事件
            click: function (click) {
                if (click) this.onclick = click;
            },
            /**
             * @method 绑定事件函数
             * @param {String} event 事件类型，可以是字符串或数组。注：不带'on'
             * @param {Function} fun 回调函数。
             */
            on: function (event, fun) {
                if (event) {
                    var _type = me.GetType(event);
                    var control = this;
                    if (_type == "Array") {
                        for (var i = 0; i < event.length; i++) {
                            addEvent(control, event[i], fun, { capture: false });
                        }
                    } else if (_type == "String") {
                        addEvent(control, event, fun, { capture: false });
                    }
                }
                return this;
            },
            /**
             * @method 判断节点是否有某种事件或事件包含某个函数
             * @param {String} event 事件类型，可以是字符串或数组。注：不带'on'
             * @param {Function} fun 事件对应的回调函数
             * @param {Boolean} [isTrueEvent=false] 是否判断真实事件，默认为判断封装后的事件。
             * @return {Number} 是否有当前类型的事件绑定
             */
            hasEvent: function (event, fn, isTrueEvent) {
                if (event) {
                    if (isTrueEvent == undefined) isTrueEvent = false;
                    var _type = me.GetType(event);
                    var control = this;
                    if (_type == "String") {
                        if (control && control.Events && control.Events[event] && control.Events[event].length > 0) {
                            if (fn) {
                                for (var i = 0; i < control.Events[event].length; i++) {
                                    if (!isTrueEvent && control.Events[event][i].fn == fn) {
                                        return true;
                                    } else if (isTrueEvent && control.Events[event][i].trueFn == fn) {
                                        return true;
                                    }
                                }
                                return false;
                            } else {
                                return true;
                            }
                        } else return false;
                    } else {
                        throw ("hasEvent参数必须为字符串。");
                    }
                }
                throw ("hasEvent参数为空。");
            },
            /**
             * @method 解绑事件函数
             * @param {String} event 事件类型，可以是字符串或数组。注：不带'on'
             * @param {Function} fun 回调函数。
             */
            off: function (event, fun, useCapture) {
                if (event) {
                    if (useCapture === undefined) useCapture = false;
                    var control = this;
                    removeEvent(control, event, fun, useCapture);
                }
                return this;
            },
            /**
             * @method 仅一次绑定事件，触发后则自动移除事件
             * @param {String} event 事件类型，可以是字符串或数组。注：不带'on'
             * @param {Function} fun 回调函数。注：返回值里不能用this，用this会取得window
             */
            one: function (event, fun) {
                if (event) {
                    var _type = me.GetType(event);
                    var control = this;
                    if (_type == "Array") {
                        for (var i = 0; i < event.length; i++) {
                            addEvent(control, event[i], fun, { capture: false, once: true });
                        }
                    } else if (_type == "String") {
                        addEvent(control, event, fun, { capture: false, once: true });
                    }
                }
                return this;
            },
            /**
             * @method 从父级绑定事件，同Jquery的live
             * @param {String} query 用于选择触发事件的子元素的选择器
             * @param {String} event 事件类型，可以是字符串或数组。注：不带'on'
             * @param {Function} fun 回调函数。注：返回值里不能用this，用this会取得window
             * @param {Boolean} [isParent] 是否为父节点（不推荐使用）
             */
            live: function (query, event, fun, isParent) {
                if (event) {
                    this.on(event, function (e) {
                        var target = e.srcElement || e.target;
                        if (isParent) {
                            var _node = target.parents(query);
                            if (_node.length > 0) {
                                fun.call(target, e, _node[0]);
                            }
                        } else if (target.equal(query)) {
                            fun.call(target, e, target);
                        }
                    });
                }
                return this;
            },
            /**
             * @method 判断两个元素是否相同，或者一个元素是否符合某个选择字符串
             * @param {Object} query HTMLElement类型元素或者String类型选择字符串
             * @return {Boolean} 是否相同
             */
            equal: function (query) {
                if (me.IsElement(query)) {
                    return this.isEqualNode(query);
                } else if (me.GetType(query) == "String") {
                    var _target = this;
                    var _f = function (query, target) {
                        if (query[0] == "[" && query[query.length - 1] == "]") {
                            var regKey = /[^\[='"]+(?==?.*?\])/;
                            var regValue = /[^\[='"]*?(?=['"]?\])/;

                            var _tKey = regKey.exec(query)[0], _tValue = regValue.exec(query)[0];
                            if (_tKey == _tValue && target.getAttribute(_tKey) != null) return true;
                            else if (target.getAttribute(_tKey) == _tValue) return true;

                        } else if (query[0] == ".") {
                            var _classList = query.split(".")[1];
                            if (target.className.split(" ").indexOf(_classList) >= 0) {
                                return true;
                            }
                        } else if (query[0] == "#") {
                            if (target.id == query.split("#")[1]) {
                                return true;
                            }
                        } else {
                            if (target.tagName.toLowerCase() == query.toLowerCase()) return true;
                        }
                    };

                    if (query.indexOf(",") > 0) {
                        var isTrue = false;
                        var arrQuerys = query.split(",");
                        for (var i = 0; i < arrQuerys.length; i++) {
                            if (_f(arrQuerys[i], _target) == true) {
                                isTrue = true;
                                break;
                            }
                        }
                        return isTrue;
                    } else {
                        return _f(query, _target);
                    }
                }
                return false;
            },
            /**
             * @new
             * @method 绑定节流事件
             * @param {String} event 事件类型
             * @param {Function} fn 事件绑定的函数
             * @param {Number} delay 最短触发时间
             * @param {Number} [maxdelay] 最大触发时间
             * @return {HTMLElement} 返回调用元素本身以完成链式调用
             * @chainable
             */
            throttle: function (event, fn, delay, maxdelay) {
                var context = null;
                var control = this;
                this.on(event, function (event) {
                    clearTimeout(fn.timer);
                    fn._cur = Date.now();
                    if (!fn._start) {
                        fn._start = fn._cur;
                    }
                    if ((maxdelay != undefined) && (fn._cur - fn._start > maxdelay)) {
                        fn.call(context, event, control);
                        fn._start = fn._cur;
                    } else {
                        fn.timer = setTimeout(function () {
                            fn.call(context, event, control);
                        }, delay);
                    }
                });
                return this;
            },
            /**
             * @method 获取元素相对窗口的Y坐标
             * @return {Number} Y坐标值
             */
            GetTop: function () {
                function _getTop(e) {
                    var offset = e.offsetTop;
                    if (e.offsetParent != null) offset += _getTop(e.offsetParent);
                    return offset;
                }
                return _getTop(this);
            },
            /**
             * @method 获取元素相对窗口的X坐标
             * @return {Number} X坐标值
             */
            GetLeft: function () {
                function _getLeft(e) {
                    var offset = e.offsetLeft;
                    if (e.offsetParent != null) offset += _getLeft(e.offsetParent);
                    return offset;
                }
                return _getLeft(this);
            },
            /**
             * @method 获取/设置元素的内容（不建议使用）
             * @return {String} 内容
             */
            content: function (html) {
                if (html == undefined) {
                    switch (this.nodeName) {
                        case "INPUT":
                        case "SELECT":
                        case "TEXTAREA":
                            return this.value;
                        default:
                            return this.innerHTML;
                    }
                } else {
                    if (html.constructor == Object) {
                        html = me.toString(html);
                    }
                    switch (this.nodeName) {
                        case "INPUT":
                        case "SELECT":
                        case "TEXTAREA":
                            this.value = html;
                            break;
                        default:
                            this.innerHTML = html;
                    }
                }
                return null;
            },
        },
        //———————————————节点列表函数———————————————————
        /**
         * 节点列表类
         * @class NodeList
         * @extends {_Object}
         */
        NodeList: {
            find: function (query) {
                var _arr = [], _arr2 = [];
                for (var i = 0; i < this.length; i++) {
                    if (me.IsElement(this[i])) {
                        _arr2 = this[i].find(query);
                        for (var o = 0; o < _arr2.length; o++) {
                            _arr[_arr.length] = _arr2[o];
                        }
                    }
                }
                return _arr;
            },
            childrens: function (query) {
                var _arr = [], _arr2 = [];
                for (var i = 0; i < this.length; i++) {
                    if (me.IsElement(this[i])) {
                        _arr2 = this[i].childrens(query);
                        for (var o = 0; o < _arr2.length; o++) {
                            _arr[_arr.length] = _arr2[o];
                        }
                    }
                }
                return _arr;
            },
            append: function (html) {
                me.NodeListEach(this, function (con) { con.append(html); });
                return this;
            },
            prepend: function (html) {
                me.NodeListEach(this, function (con) { con.prepend(html); });
                return this;
            },
            addClass: function (className) {
                me.NodeListEach(this, function (con) { con.addClass(className); });
                return this;
            },
            removeClass: function (className) {
                me.NodeListEach(this, function (con) { con.removeClass(className); });
                return this;
            },
            html: function (html) {
                me.NodeListEach(this, function (con) { con.content(html); });
                return this;
            },
            css: function (key, value) {
                me.NodeListEach(this, function (con) { con.css(key, value); });
                return this;
            },
            show: function (key, value) {
                me.NodeListEach(this, function (con) { con.show(key, value); });
                return this;
            },
            hide: function (key, value) {
                me.NodeListEach(this, function (con) { con.hide(key, value); });
                return this;
            },
            attr: function (key, value) {
                if (value === undefined) {
                    if (me.IsElement(this[0])) {
                        return this[0].attr(key);
                    }
                } else {
                    me.NodeListEach(this, function (con) { con.attr(key, value); });
                    return this;
                }
            },
            removeAttr: function (key, value) {
                me.NodeListEach(this, function (con) { con.removeAttr(key, value); });
            },
            remove: function (query) {
                if (query !== undefined) {
                    switch (query.constructor.name) {
                        case "Function":
                            me.NodeListEach(this, function (i) {
                                if (query(this[i]) === true) {
                                    this[i].remove();
                                }
                            });
                            break;
                        case "String":
                            window.queryElement(query).remove();
                            break;
                        default:
                    }
                } else {
                    me.NodeListEach(this, function (con) { con.remove(); });
                }
            },
            on: function (event, fun) {
                //这里还要改，目前只能传一个参数
                me.NodeListEach(this, function (con) { con.on(event, fun); });
                return this;
            },
            first: function () {
                if (this.length > 0) return this[0];
                else return null;
            },
            last: function () {
                if (this.length > 0) return this[this.length - 1];
                else return null;
            }
        },
        /**
         * 日期类
         * @class Date
         * @extends {_Object}
         */
        Date: {
            /**
             * @method 日期格式化方法
             * @param {String} format 格式化字符串
             * @return {String} 格式化之后的字符串
             */
            format: function (format) {
                var o = {
                    "M+": this.getMonth() + 1, //month
                    "d+": this.getDate(), //day
                    "h+": this.getHours(), //hour
                    "H+": this.getHours(), //hour
                    "m+": this.getMinutes(), //minute
                    "s+": this.getSeconds(), //second
                    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
                    "S": this.getMilliseconds() //millisecond
                };
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
                return format;
            }
        },
        /**
         * 布尔类，值只有true或者false。
         * @class Boolean
         * @extends {_Object}
         */
        Boolean: {

        },
        /**
         * 数组类
         * @class Array
         * @extends {_Object}
         */
        Array: {
            /**
             * @method 循环遍历数组
             * @param {Function} fun 遍历值执行的函数
             * @param {Number} [type=0] 特殊循环，需要返回值。【0、不做任何操作。1、循环累加。2、求最大值。】
             */
            forEach: function (fun, type) {
                if (type == undefined) type = 0;
                var temp = null, _result = 0;
                for (var i = 0; i < this.length; i++) {
                    temp = fun.call(this[i], this[i], i);
                    if (temp !== undefined) {
                        if (temp === true) continue;
                        else if (temp === false) break;
                        else {
                            switch (type) {
                                case 1:
                                    _result = _result.add(temp);
                                    break;
                                case 2:
                                    if (_result < temp) _result = temp;
                                    break;
                                default:
                            }
                        }
                    }
                }
                return _result;
            },
            /**
             * @method 拍平数组
             * @chainable
             */
            clap: function () {
                var newarr = [],
                    arrTypeList = ['HTMLCollection', 'NodeList', 'Array'],
                    fn = function (arr) {
                        for (var i = 0; i < arr.length; i++) {
                            if (arrTypeList.indexOf(HakuJs.GetType(arr[i])) < 0) {
                                newarr.push(arr[i]);
                            } else {
                                fn(arr[i]);
                            }
                        }
                        return newarr;
                    }
                fn(Array.prototype.slice.call(this));
                return newarr;
            },
            /**
             * @method 删除数组中的元素并返回数组本身
             * @param {Function} data 可以是遍历值执行的函数、数组、正则表达式或值。
             * @chainable
             */
            remove: function () {
                var args = Array.prototype.slice.call(arguments).clap(),
                    arr = [],
                    fn = function (data) {
                        for (var i = 0; i < args.length; i++) {
                            var _type = HakuJs.GetType(args[i]);
                            if (_type === "Function") {
                                if (args[i](data, i) === true) return;
                            } else if (_type === "Object") {
                                if (JSON.stringify(args[i]) === JSON.stringify(data)) return;
                            } else if (_type === "RegExp") {
                                if (args[i].test(data) === true) return;
                            } else {
                                if (args[i] === data) return;
                            }
                        }
                        arr.push(data);
                    };
                for (var i = 0; i < this.length; i++) fn(this[i]);
                return arr;
            }
        },
    };
    var item = null;
    for (item in me.Method.Number) {
        window.Number.prototype[item] = me.Method.Number[item];
    }
    for (item in me.Method.Text) {
        window.Text.prototype[item] = me.Method.Text[item];
    }
    for (item in me.Method.String) {
        window.String.prototype[item] = me.Method.String[item];
    }
    for (item in me.Method.HTMLElement) {
        HTMLElement.prototype[item] = me.Method.HTMLElement[item];
    }
    for (item in me.Method.Date) {
        Date.prototype[item] = me.Method.Date[item];
    }
    for (item in me.Method.Array) {
        window.Array.prototype[item] = me.Method.Array[item];
        window.NodeList.prototype[item] = me.Method.Array[item];
        window.HTMLCollection.prototype[item] = me.Method.Array[item];
    }
    for (item in me.Method.NodeList) {
        window.NodeList.prototype[item] = me.Method.NodeList[item];
        window.HTMLCollection.prototype[item] = me.Method.NodeList[item];
    }
})(window);
if (Object.freeze) Object.freeze(HakuJs);