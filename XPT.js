/// <reference path="XPTControl.js" />
/// <reference path="XPT_DetailTable.js" />
/**
 * XPT框架
 * 
 *     @example
 *     //获取明细表本身（用于执行明细表的功能，比如删除/新增/清空行等）
 *     XPT.Controls._TempControl.明细表名
 *     //获取当前流程表单的数据
 *     //主表数据
 *     XPT.TaskData.主表名.字段名
 *     //明细表数据
 *     XPT.TaskData.明细表名[行索引].字段名
 *     //主表控件
 *     XPT.Controls.主表名.字段名
 *     //明细表控件
 *     XPT.Controls.明细表名[行索引].字段名
 *     
 *
 * @class XPT
 * @author 李典
 * @requires HakuJs
 * @singleton
 *
 * @license XPT框架——基本信息
 * 作者：李典。框架版本：1.0。创建时间：2017-04-12，更新时间：2017-11-20。兼容IE版本：IE9+
 *
 * @license XPT框架——框架说明
 * 流程表单内核框架，主要功能为支持流程表单的发起、编辑、验证等，仅用于流程开发。
 *
 * @license XPT框架——问题修复/更新
 *
 * @p 2017-04-23 封闭XPT对象及Flow对象。
 * @p 2017-04-23 封闭XPT。
 * @p 2017-04-26 增加截图函数。
 * @p 2017-04-26 增加页面/div滚动函数。
 * @p 2017-04-28 增加页面截图并下载函数。
 * @p 2017-07-11 增加URL参数的增删改函数。
 */
var XPT = new (function (window) {
    var me = this;
    /**
     * @property {Array} _checkControl 验证的控件集合
     * @private
     */
    var _checkControl = [];
    /**
     * @property {Object} _alerts 弹出框集合
     * @private
     */
    var _alerts = {};
    /**
     * @property {Number} [_errorCount=0] 错误次数，错误时会自增长
     * @private
     */
    var _errorCount = 0;
    /**
     * @property {Number} [_maxErrorCount=5] 最大错误次数，错误次数到达此限制后不会再弹出框
     * @private
     */
    var _maxErrorCount = 5;
    /**
     * @property {Number} [_completeFunc=new Array()] XPT初始化完成调用函数列表
     * @private
     */
    var _completeFunc = [];
    /**
     * @property {Boolean} [_isFullScreen=false] 当前页面是否全屏
     * @private
     */
    var _isFullScreen = false;
    /**
     * @property {Object} 初始化语言集
     * @private
     */
    var _defaultLang = [
        { code: 'Operate', 'zh-CN': '操作', 'en': 'Operate' },
        { code: 'No', 'zh-CN': '序号', 'en': 'No.'},
        { code: 'Add', 'zh-CN': '增加', 'en': 'Add' },
        { code: 'RemoveMult', 'zh-CN': '批量删除', 'en': 'Remove' },
        { code: 'CheckAll', 'zh-CN': '全选', 'en': 'Check All' },
        { code: 'Inverse', 'zh-CN': '反选', 'en': 'Inverse' },
        { code: 'synchrodata', 'zh-CN': '同步数据', 'en': 'Synchrodata' },
        { code: 'BasicInfo', 'zh-CN': '基本信息', 'en': 'Basic Info' },
        { code: 'Applicant', 'zh-CN': '申请人', 'en': 'Applicant' },
        { code: 'RequestDate', 'zh-CN': '申请时间', 'en': 'Request Date' },
        { code: 'Department', 'zh-CN': '所属部门', 'en': 'Department' },
        { code: 'RequestNo', 'zh-CN': '申请单号', 'en': 'Request No.' },
        { code: 'CompanyInfo', 'zh-CN': '公司信息', 'en': 'Company Info' },
        { code: 'Email', 'zh-CN': '邮箱', 'en': 'Email' },
        { code: 'ApprovalHistroy', 'zh-CN': '审批历史记录', 'en': 'Approval Histroy' },
        { code: 'ApproveName', 'zh-CN': '审批人姓名', 'en': 'ApproveName' },
        { code: 'No', 'zh-CN': '序号', 'en': 'No.' },
        { code: 'StepName', 'zh-CN': '步骤名', 'en': 'Step Name' },
        { code: 'Position', 'zh-CN': '岗位', 'en': 'Position' },
        { code: 'ApproveComments', 'zh-CN': '审批意见', 'en': 'Comments' },
        { code: 'ApproveResult', 'zh-CN': '审批结果', 'en': 'Result' },
        { code: 'ApproveDate', 'zh-CN': '审批时间', 'en': 'Approve Time' },
        { code: 'Comments', 'zh-CN': '备注', 'en': 'Comments' },
        { code: 'FileName', 'zh-CN': '文件名称', 'en': 'File Name' },
        { code: 'CreateName', 'zh-CN': '创建人', 'en': 'Creator Name' },
        { code: 'OperateTime', 'zh-CN': '处理时间', 'en': 'Operate Time' },
        { code: 'Operator', 'zh-CN': '操作', 'en': 'Operator' },
        { code: 'Delete', 'zh-CN': '删除', 'en': 'Delete' },
        { code: 'Attachment', 'zh-CN': '附件', 'en': 'Attachment' },
        { code: 'AttachmentNotice', 'zh-CN': '注：支持office文件/图片文件/PDF文件/TXT文件', 'en': 'Support office file/picture file/PDF file/TXT file' },
        { code: 'CostCenter', 'zh-CN': '成本中心', 'en': 'Cost Center' },
        { code: 'ClickExpand', 'zh-CN': '点击展开', 'en': 'Expanse' },
        { code: 'ClickCollapse', 'zh-CN': '点击折叠', 'en': 'Collapse' },
        { code: 'ExpandDetail', 'zh-CN': '展开明细', 'en': 'Details' },
        { code: 'CollapseDetail', 'zh-CN': '折叠明细', 'en': 'Details' },
        { code: 'MaxChars', 'zh-CN': '最大长度1000字符,已输入', 'en': 'Max 1000 Char.Key in ' },
        { code: 'Chars', 'zh-CN': '字符', 'en': 'chars ' },
        { code: 'OrderNumber', 'zh-CN': '序号', 'en': 'No.' }
    ];

    /**
     * @property {Object} 语言集
     * @private
     */
    var _lang = {};
    /** 
     * @method 获取页面多语言文本（目前仅针对表单多语言）
     * @param {String} code 多语言Code
     * @return {String} 多语言文本
     */
    window.L = me.L = function (code) { if (_lang && _lang[code]) return _lang[code]; else throw ('语言集' + code + '不存在'); }
    /**
     * @property {Object} 控件集合，一般情况下不需要手动调用，如需要查询控件请使用XPT.ControlList或XPT.ControlHashTable。
     */
    me.Controls = {
        _TempControl: {
            IsControlList: true
        }
    };
    /**
     * @property {Boolean} 是否初始化完成
     */
    me.IsInit = false;
    /**
     * @property {Object} TaskData 页面数据集（使用临时从表单控件取数据的方式）
     */
    me.TaskData = {};

    Object.defineProperties(me, {
        Version: {
            value: "v1.0"
        },
        /**
         * @property {Number} 浏览器窗口宽度
         * @readonly
         */
        WindowWidth: {
            get: function () {
                return window.innerWidth;
            }
        },
        /**
         * @property {Number} 浏览器窗口高度
         * @readonly
         */
        WindowHeight: {
            get: function () {
                return window.innerHeight;
            }
        },
        /**
         * @property {Number} 浏览器加载方式（1、通过点击链接、地址栏输入、表单提交、脚本操作等方式加载。2、通过重新加载按钮或location.reload()方法加载。3、通过前进或后退按钮加载。4、其他来源的加载。）
         * @readonly
         */
        NavigationType: {
            get: function () {
                return performance && performance.navigation && performance.navigation.type;
            }
        },
        /**
         * @property {Object} ControlList [GET]动态获取控件数组
         * @readonly
         */
        ControlList: {
            get: function () {
                var arr = [];
                var func = function (items) {
                    for (var item in items) {
                        if ((items[item] instanceof Array)) {
                            for (var i = 0; i < items[item].length; i++) {
                                func(items[item][i]);
                            }
                        } else if (items[item].IsControlList == true) {
                            func(items[item]);
                        } else if (items[item].GUID != null) {
                            arr.push(items[item]);
                        }
                    }
                };
                func(XPT.Controls);
                return arr;
            }
        },
        /**
         * @property {Object} ControlHashTable [GET]动态获取控件哈希表（guid为键）
         * @readonly
         */
        ControlHashTable: {
            get: function () {
                var hashtable = {};
                var func = function (items) {
                    for (var item in items) {
                        if ((items[item] instanceof Array)) {
                            for (var i = 0; i < items[item].length; i++) {
                                func(items[item][i]);
                            }
                        } else if (items[item].IsControlList == true) {
                            func(items[item]);
                        } else if (items[item].GUID != null) {
                            hashtable[items[item].GUID] = items[item];
                        }
                    }
                };
                func(XPT.Controls);
                return hashtable;
            }
        },
    });

    /**
     * @method ChangeConfig 将config配置转换为对象标准属性，将config及defaultData一起加入obj。（一般情况下不需要手动调用）
     * @param {Object} obj 对象添加的位置
     * @param {Object} config 传入配置
     * @param {Object} defaultData 默认配置
     */
    me.ChangeConfig = function (obj, config, defaultData) {
        var _newConfig = {},
            item = null;
        for (item in config) {
            _newConfig[item.substring(0, 1).toUpperCase() + item.substring(1)] = config[item];
        }
        var _newDefaultConfig = {};
        for (item in defaultData) {
            _newDefaultConfig[item.substring(0, 1).toUpperCase() + item.substring(1)] = defaultData[item];
        }
        for (item in _newConfig) {
            if (HakuJs.GetType(_newDefaultConfig[item]) == "Object") {
                for (var item2 in _newDefaultConfig[item]) {
                    if (!_newDefaultConfig[item]) {
                        _newDefaultConfig[item] = {};
                    }
                    if (_newDefaultConfig[item]) {
                        if (_newConfig[item][item2]) _newDefaultConfig[item][item2] = _newConfig[item][item2];
                    }
                }
            } else {
                if (_newConfig[item] != null) _newDefaultConfig[item] = _newConfig[item];
            }
        }
        for (item in _newDefaultConfig) {
            obj[item] = _newDefaultConfig[item];
        }
    };
    /** 
     * @method 设置URL参数并返回URL
     * @param {String} key 参数名
     * @param {String} value 参数值
     * @return {String} 参数值
     */
    me.SetUrlParam = function (key, value) {
        var _istrue = false;
        var _loc = location.href.replace(new RegExp("[|?&]" + key + "=[a-zA-Z0-9_%]*", "i"), function (item) {
            _istrue = true;
            return item[0] + key + "=" + value;
        });
        if (!_istrue) {
            return location.href + (location.href.indexOf("?") >= 0 ? "&" : "?") + key + "=" + value;
        }
        return _loc;
    };
    /** 
     * @method 删除URL参数并返回URL
     * @param {String} key 参数名
     * @param {String} value 参数值
     * @return {String} 参数值
     */
    me.DelUrlParam = function (key) {
        return location.href.replace(new RegExp("[|?&]" + key + "=[a-zA-Z0-9_%]*", "i"), function (item) {
            return "";
        });
    };
    /** 
     * @method 获取URL参数
     * @param {String} key 参数名
     * @return {String} 参数值
     */
    me.GetUrlParam = function (key) {
        if (location.href.indexOf("?") >= 0 && key) {
            var _val = "";
            location.href.substr(location.href.indexOf("?") + 1).split("&").forEach(function (item) {
                if (item.split("=")[0].toLowerCase() == key.toLowerCase()) {
                    _val = item.split("=")[1];
                    return false;
                }
            });
            return _val;
        }
        return null;
    };
    /** 
     * @method 获取全部URL参数
     * @return {Object} 参数对象表
     */
    me.GetAllUrlParams = function () {
        var params = {};
        if (location.href.indexOf("?") >= 0) {
            location.href.substr(location.href.indexOf("?") + 1).split("&").forEach(function (item) {
                params[item.split("=")[0]] = item.split("=")[1];
            });
        }
        return params;
    };
    /** 
     * @method 根据对象设置URL参数并返回URL
     * @return {Object} 参数对象表
     */
    me.SetAllUrlParams = function (obj) {
        var href = location.href;
        if (href.indexOf("?") >= 0) {
            href = href.substr(0, href.indexOf("?"));
            var params = XPT.GetAllUrlParams();
            for (var item in obj) {
                switch (HakuJs.GetType(obj[item])) {
                    case "String":
                    case "Number":
                        params[item] = obj[item];
                        break;
                    default:
                }
            }
            for (var item in params) {
                href = href + item + "=" + params[item] + "&";
            }
            href = href.substr(0, href.length - 1);
        }
        return href;
    };
    /** 
     * @method BytesToSize 字节转换为合适数据容量（kb/mb/gb等）
     * @param {Number} bytes 字节数
     * @return {Object} 参数对象表
     */
    me.BytesToSize = function (bytes) {
        if (bytes === 0) return '0 B';
        var k = 1024, // or 1024
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));

        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    };
    me.RequestFullScreen = function (element) {
        if (element === undefined) element = document;
        var requestMethod = element.requestFullScreen ||
            element.webkitRequestFullScreen ||
            element.mozRequestFullScreen ||
            element.msRequestFullScreen;
        if (requestMethod) {
            requestMethod.call(element);
        }
        else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
        _isFullScreen = true;
    };
    me.CancelFullScreen = function (element) {
        element = document;
        var exitMethod = element.exitFullscreen ||
            element.mozCancelFullScreen ||
            element.webkitExitFullscreen ||
            element.msExitFullscreen;
        if (exitMethod) {
            exitMethod.call(element);
        }
        else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
        _isFullScreen = false;
    };
    /** 
     * @method FullScreen 切换全屏状态
     * @param {HTMLElement} [element=document] 使元素全屏显示，默认为document
     * @param {Boolean} [iscancel=false] 全屏或者退出全屏，默认为false，在此种状态下
     */
    me.FullScreen = function (element, iscancel) {
        if (iscancel === undefined) {
            if (_isFullScreen) {
                me.CancelFullScreen(element);
            } else {
                me.RequestFullScreen(element);
            }
        } else if (iscancel === true) {
            me.CancelFullScreen(element);
        } else if (iscancel === false) {
            me.RequestFullScreen(element);
        }
    };
    /**
     * @method 获取流程表单填入的所有数据
     * @return {Object} 所有表单数据
     */
    me.GetActualData = function () {
        var obj = {};
        obj[XPT.InitData.MasterTable] = {};
        var _detailTables = XPT.InitData.DetailTable.split(",");
        for (var i = 0; i < _detailTables.length; i++) {
            obj[_detailTables[i]] = [];
        }
        var func = function (items, tablename, rowindex) {
            for (var item in items) {
                if (items[item] instanceof Object || items[item] instanceof Array) {
                    if (!isNaN(item)) {
                        func(items[item], tablename, item);
                    } else {
                        func(items[item], item);
                    }
                } else {
                    if ("function,array".indexOf((typeof (items[item.substr(1)])).toLowerCase()) < 0) {
                        if (items[item.substr(1)] instanceof Date && items[item.substr(1)] == 'Invalid Date') {
                            if (tablename == XPT.InitData.MasterTable) obj[tablename][item.substr(1)] = null;
                            else {
                                if (obj[tablename][parseInt(rowindex)] == undefined) obj[tablename][parseInt(rowindex)] = {};
                                obj[tablename][parseInt(rowindex)][item.substr(1)] = null;
                            }
                        } else {
                            if (tablename == XPT.InitData.MasterTable) obj[tablename][item.substr(1)] = items[item.substr(1)];
                            else {
                                if (obj[tablename][parseInt(rowindex)] == undefined) obj[tablename][parseInt(rowindex)] = {};
                                obj[tablename][parseInt(rowindex)][item.substr(1)] = items[item.substr(1)];
                            }
                        }
                    }
                }
            }
        };
        func(XPT.TaskData, "");
        return obj;
    };
    /**
     * @method 获取用于传递给后端的数据，一般情况下不需要手动调用
     * @return {Object} 后端使用的键值对数据
     */
    me.GetTaskData = function () {
        var arr = [];
        var func = function (items, tablename) {
            for (var item in items) {
                if (items[item] instanceof Object || items[item] instanceof Array) {
                    if (!isNaN(item)) {
                        func(items[item], tablename);
                    } else {
                        func(items[item], item);
                    }
                } else {
                    if (item[0] != "$") {
                        if ("function,array,object".indexOf((typeof (items[item.substr(1)])).toLowerCase()) < 0) {
                            arr.push({ "Name": tablename + "." + item.substr(1), "Value": items[item.substr(1)] });
                        } else if (items[item.substr(1)] instanceof Date) {
                            if (items[item.substr(1)] != 'Invalid Date') arr.push({ "Name": tablename + "." + item.substr(1), "Value": items[item.substr(1)].format("yyyy-MM-dd HH:mm:ss") });
                            else arr.push({ "Name": tablename + "." + item.substr(1), "Value": "" });
                        } else if (items[item.substr(1)] === null) {
                            arr.push({ "Name": tablename + "." + item.substr(1), "Value": "" });
                        }
                    }
                }
            }
        };
        func(XPT.TaskData, "");
        return { NameValues: arr };
    };
    /**
     * @method 根据元素查询控件集（不包含输出为span的情况）
     * @param {HTMLElement} element 用于查询的控件，或查询字符串
     * @return {XptControl[]} 获取的XPT控件数组
     */
    me.GetControlByElement = function (element) {
        var arr = [];
        var hashtable = XPT.ControlHashTable;
        if ((typeof (element)).toLowerCase() == "string") element = document.querySelector(element);
        [].forEach.call(element.find("[xpt]"), function (item, value) {
            var _tcon = hashtable[item.getAttribute("xpt")];
            if (_tcon) arr.push(_tcon);
        });
        return arr;
    };
    /**
     * @method 根据GUID查询控件集
     * @param {String} guid 用于查询的GUID
     * @return {XptControl} 获取的XPT控件
     */
    me.GetControlByGuid = function (guid) {
        var _con = null, _isTrue = false;
        var func = function (items) {
            if (_isTrue) return;
            for (var item in items) {
                if (_isTrue) return;
                if ((items[item] instanceof Array)) {
                    for (var i = 0; i < items[item].length; i++) {
                        if (_isTrue) return;
                        func(items[item][i]);
                    }
                } else if (items[item].IsControlList == true) {
                    func(items[item]);
                } else if (items[item].GUID != null) {
                    if (items[item].GUID == guid) {
                        _con = items[item];
                        _isTrue = true;
                        return;
                    }
                }
            }
        };
        func(XPT.Controls);
        return _con;
    };
    /**
     * @method 根据字段名获取主表的HTML控件（非XPT控件，主要用于控件输出为span的情况下）
     * @param {String} colname 字段名，区分大小写
     * @return {HTMLElement} 获取的HTML控件，为空则返回null
     */
    me.GetMainControl = function (colname) {
        var _el = document.querySelector("[colname='" + XPT.InitData.MasterTable + "." + colname + "']");
        if (_el != null) {
            return _el;
        } else {
            _el = document.querySelector("[colname='" + colname + "']");
            if (_el != null && _el.parents("[xpt-detailtable]").length == 0) {
                return _el;
            }
            return null;
        }
    };
    /**
     * @method 根据表名和字段名获取子表的HTML控件（非XPT控件，主要用于控件输出为span的情况下，区分大小写）
     * @param {String} tablename 表名，区分大小写
     * @param {String} colname 字段名，区分大小写
     * @return {HTMLElement[]} 获取的HTML控件数组
     */
    me.GetDetailControl = function (tablename, colname) {
        var _arr = [];
        var _el = document.querySelector("[colname='" + tablename + "." + colname + "']");
        if (_el != null) {
            return _el;
        } else {
            _el = document.querySelector("[colname='" + colname + "']");
            if (_el != null && _el.parents("[xpt-detailtable]").length == 0) {
                return _el;
            }
        }
        return _arr;
    };

    /**
     * @method Post提交
     *
     *     @example
     *     //调用Post方法示例
     *     XPT.Post({
     *         url: "/FunControl/Ultimus.UWF.Common/ReadViewData.ashx",
     *         params: {
     *             code: "aaa",
     *             startdate: "2017-03-01"
     *         },
     *         success: function () {},
     *         error: function () {}
     *     });
     *
     * @param {Object} config 配置参数集
     * @param {String} config.url 提交地址
     * @param {String} [config.params] 参数
     * @param {Boolean} [config.async=true] 是否为异步提交
     * @param {Boolean} [config.hasLoading=false] 是否自动弹出加载框（完成后会自动关闭）
     * @param {Function} [config.success] 成功时调用的函数
     * @param {Function} [config.error] 错误时调用的函数
     * @param {Function} [config.contentType] 在调用静态函数时设置值为"application/json"
     */
    me.Post = function (config) {
        if (config == null) throw ("Post提交初始化参数为空。");

        var me = {};
        XPT.ChangeConfig(me, config, {
            IsEscape: true,
            Async: true,
            ContentType: "application/x-www-form-urlencoded;",
            Success: function () { },
            Error: function () { }
        });
        if (me.Url == null) throw ("URL地址参数为空。");
        var xmlobj;  //定义XMLHttpRequest对象
        if (window.ActiveXObject) //如果当前浏览器支持Active Xobject，则创建ActiveXObject对象
        {
            //xmlobj = new ActiveXObject("Microsoft.XMLHTTP");  
            try {
                xmlobj = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlobj = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    xmlobj = false;
                }
            }
        }
        else if (window.XMLHttpRequest) //如果当前浏览器支持XMLHttp Request，则创建XMLHttpRequest对象  
        {
            xmlobj = new XMLHttpRequest();
        }
        var _guid = "";
        if (me.HasLoading) _guid = XPT.Loading();
        xmlobj.open("POST", me.Url, me.Async);
        xmlobj.setRequestHeader("cache-control", "no-cache");
        xmlobj.setRequestHeader("contentType", "text/html;charset=uft-8"); //指定发送的编码
        xmlobj.setRequestHeader("Content-Type", me.ContentType);   //设置请求头信息   application/x-www-form-urlencoded;
        //xmlobj.setRequestHeader("x-requested-with", "XMLHttpRequest");   //设置请求头信息
        xmlobj.onreadystatechange = function () {
            if (xmlobj.readyState == 4) {
                XPT.CloseAlert(_guid);
                switch (xmlobj.status) {
                    case 200:
                        if (!xmlobj.responseText) {
                            me.Error({ isSuccess: false, exception: "返回了空字符串。" });
                            return;
                        }
                        //console.log(xmlobj.responseText);
                        if (xmlobj.responseText.indexOf('<!DOCTYPE html>') >= 0) {
                            window.open(URL.createObjectURL(new Blob([xmlobj.responseText], {
                                'type': 'text/html'
                            })));
                        } else {
                            var json = JSON.parse(xmlobj.responseText.replace(/null,/g, '"",'));
                            if (!json.isAuthorized) {
                                me.Error(json);
                            } else {
                                if (json.isSuccess) {
                                    me.Success(json);
                                } else {
                                    me.Error(json);
                                }
                            }
                        }
                        break;
                    case 400:
                        me.Error({ isSuccess: false, exception: "[400]客户端请求中的语法错误。<br />" + me.Url });
                        break;
                    case 401:
                        me.Error({ isSuccess: false, exception: "[401]客户端在授权头信息中没有有效的身份信息时访问受到密码保护的页面。这个响应必须包含一个WWW-Authenticate的授权信息头。<br />" + me.Url });
                        break;
                    case 403:
                        me.Error({ isSuccess: false, exception: "[401]服务器拒绝提供所请求的资源。这个状态经常会由于服务器上的损坏文件或目录许可而引起。<br />" + me.Url });
                        break;
                    case 404:
                        me.Error({ isSuccess: false, exception: "[404]找不到指定路径的页面。<br />" + me.Url });
                        break;
                    case 408:
                        me.Error({ isSuccess: false, exception: "[408]服务端等待客户端发送请求的时间过长。<br />" + me.Url });
                        break;
                    case 414:
                        me.Error({ isSuccess: false, exception: "[414]请求URI过长，这里所指的“URI”是指URL中主机、域名及端口号之后的内容。<br />" + me.Url });
                        break;
                    case 500:
                        var errroObj = JSON.parse(xmlobj.responseText);
                        me.Error({
                            isSuccess: false, Exception: "[500]" + xmlobj.statusText + "<br />信息：" + errroObj.Message + "<br />地址:" + xmlobj.responseURL + "<br />" + me.Url
                        });
                        break;
                    case 504:
                        me.Error({ isSuccess: false, exception: "[504]网关超时，接收服务器没有从远端服务器得到及时的响应。<br />" + me.Url });
                        break;
                    default:
                        me.Error({ isSuccess: false, exception: HakuJs.toString(xmlobj) });
                }
            }
        };
        //判断URL调用的状态值并处理
        if (me.ContentType.indexOf("json") > 0) {
            var datastr = {};
            for (var item in me.Params) {
                datastr[item] = (me.IsEscape ? (escape(me.Params[item])) : me.Params[item]);
            }
            datastr = JSON.stringify(datastr);
        }
        else {
            var datastr = [];
            for (var item in me.Params) {
                datastr.push(item + "=" + (me.IsEscape ? (escape(me.Params[item])) : me.Params[item]));
            }
            datastr = datastr.join("&");
        }

        try {
            xmlobj.send(datastr); //设置为发送给服务器数据
        } catch (e) {
            me.Error({ isSuccess: false, exception: e.message });
        }
    };
    //获取基础数据
    me.GetBasicData = function (code, param, async, callback, errorback) {
        XPT.Post({
            url: XPT.Url.ReadView,
            async: async,
            params: {
                Code: code,
                Filters: param
            },
            IsEscape: false,
            ContentType: "application/json;charset=UTF-8",
            success: function (json) {
                if (json) {
                    if (callback) {
                        callback(json.result);
                    }
                }
            },
            error: function (json) {
                XPT.ShowError("读取数据失败");
                if (errorback) {
                    errorback(json.exception);
                }
            }
        });
    };
    //获取数据源
    me.GetViewData = function (code, param, async, callback, errorback) {
        XPT.Post({
            url: XPT.Url.ReadView,
            async: async,
            params: {
                Code: code,
                Filters: param
            },
            IsEscape: false,
            ContentType: "application/json;charset=UTF-8",
            success: function (json) {
                if (json) {
                    if (callback) {
                        callback(json.result.viewResult || json.result.viewTable);
                    }
                }
            },
            error: function (json) {
                XPT.ShowError("读取数据失败");
                if (errorback) {
                    errorback(json.exception);
                }
            }
        });
    };
    //处理任务
    me.PostTask = function (action, successmsg, successcontent, errormsg) {
        setTimeout(function () {
            XPT.Post({
                url: "NewRequest.aspx" + window.location.search,
                params: {
                    PostMethod: action,
                    PostData: JSON.stringify({
                        InitData: XPT.InitData,
                        ApplicantData: XPT.ApplicantData,
                        FormData: XPT.GetTaskData(),
                        ArrList: []
                    })
                },
                hasLoading: true,
                success: function (data) {
                    successcontent = successcontent.format(data.result.nextUser || "");
                    if (data.result.end) {
                        successcontent = "流程审批完成";
                    }
                    //AfterSubmit, 流程成功提交之后触发事件
                    if (Flow.Event && Flow.Event.AfterSubmit) {
                        Flow.Event.AfterSubmit();
                    }
                    XPT.Alert({
                        isshadecancel: true,
                        alerttype: XPT.AlertType.Info,
                        buttontype: XPT.AlertButtonType.OK,
                        title: successmsg,
                        content: successcontent,
                        buttonevent: function (type) {
                            this.Close();
                            XPT.Handle.Close();
                        }
                    });
                    if (window.opener) {
                        try {
                            window.opener.iframeAutoFit();
                            window.open('', '_self');
                        }
                        catch (e) {

                        }
                    }
                },
                error: function (data) {
                    XPT.ShowError(errormsg, data.exception);
                },
            });
        }, 0);
    };
    /**
     * @method 轻松的调用NewRequest.aspx页面后台的方法
     * @param {String} action 方法名
     * @param {Object} params 参数集
     * @param {Function} [successCallBack] 执行成功的返回函数
     * @param {Function} [errorCallBack] 执行失败的返回函数，没有则会弹出错误提示框
     */
    me.PostProcess = function (action, params, successCallBack, errorCallBack) {
        XPT.Post({
            url: "NewRequest.aspx" + window.location.search,
            params: {
                PostMethod: "Process_" + action,
                PostData: JSON.stringify(params)
            },
            hasLoading: true,
            success: function (data) {
                successCallBack && successCallBack(data);
            },
            error: function (data) {
                if (errorCallBack) {
                    errorCallBack(data);
                } else {
                    XPT.ShowError("错误", data.exception);
                }
            },
        });
    };
    /**
     * @method 在表单上获取流程的默认标题（根据控件的summary-order属性去依次获取值或内容）
     * @param {String} [splitchar=" "] 分割项的自定义字符串，没有则会用默认半角空格分割
     * @return {String} 流程的默认标题
     */
    me.GenerateSummary = function (splitchar) {
        var arr = [];
        document.querySelectorAll("[summary-order]").forEach(function (item, index) {
            arr[parseInt(item.getAttribute("summary-order"))] = item.value || (item.innerHTML || "").trim();
        });
        //如果没有Summarysplit指定分隔符则用单个空格分割
        return arr.join(XPT.InitData.Summarysplit || splitchar || " ").trim();
    };
    /**
     * @method 打开流程页面
     * @param {String} sn sn编号
     */
    me.ShowTask = function (sn) {
        if (sn) {
            window.open('/SysPages/SnNumber?id=' + sn);
        }
    };
    /**
     * @method 根据页面元素打开流程页面
     * @param {String} con 页面元素，多用this
     */
    me.ShowTaskByElement = function (con) {
        var _sn = _sn.getAttribute('documentno') || con.value || con.innerText.trim();
        if (_sn) {
            me.ShowTask(_sn);
        }
    }
    /**
     * @new
     * @method 信息提示框{@img alert_info.png 信息提示框}错误提示框{@img alert_error.png 错误提示框}加载框{@img alert_loading.png 加载框}
     *
     *     @example
     *     //弹出一个普通的信息框
     *     XPT.Alert({
     *          isshadecancel: true,
     *          alerttype: XPT.AlertType.Info,
     *          buttontype: XPT.AlertButtonType.OKCancel,
     *          title: "信息",
     *          content: "示例文本信息",
     *          buttonevent: function (result) {
     *              if(result == XPT.AlertReturnType.OK) {
     *                  this.Close();
     *              }
     *          }
     *      });
     *
     * @param {Object} config 参数集
     * @param {Function} config.buttonevent 按钮事件
     * @param {XPT.AlertButtonType} config.buttontype 按钮类型
     * @param {XPT.AlertType} config.alerttype 弹出框类型（警告/错误类型会自动在控制台记录调用堆栈）
     * @param {Boolean} config.isshade 是否有遮罩
     * @param {Boolean} config.isshadecancel 是否点击遮罩关闭弹出框
     * @param {Number} config.closetime 遮罩层自动关闭时间（毫秒）
     * @return {String} 弹出框GUID
     */
    me.Alert = function (config) {
        //初始化配置参数
        if (!config) XPT.ShowError("错误", "未传入config参数。");
        if (!config.buttontype) config.buttontype = XPT.AlertButtonType.OK;
        if (!config.alerttype) config.alerttype = XPT.AlertType.Info;
        if (config.isshade == null) config.isshade = true;
        if (config.isshadecancel == null) config.isshadecancel = false;
        if (config.buttonevent == null) config.buttonevent = function () { };
        //弹出框类型
        switch (config.alerttype) {
            case XPT.AlertType.Info:
                if (!config.title) config.title = "提示";
                break;
            case XPT.AlertType.Success:
                if (!config.title) config.title = "成功";
                break;
            case XPT.AlertType.Danger:
                if (!config.title) config.title = "错误";
                try { if (console) { if (XPT.IsIE) { console.log && console.log("[ERROR]" + config.content); console.trace && console.trace(config.content); } else { console.error && console.error(config.content); } } } catch (e) { }
                break;
            case XPT.AlertType.Warning:
                if (!config.title) config.title = "警告";
                try { if (console) { if (XPT.IsIE) { console.log && console.log("[WARNING]" + config.content); console.trace && console.trace(config.content); } else { console.warn && console.warn(config.content); } } } catch (e) { }
                break;
            case XPT.AlertType.Loading:
                if (!config.content) config.content = "Loading...";
                config.content = '<div class="alert-loading-icon">' + config.content + '</div>';
                config.isshadecancel = false;
                break;
            default:
        }
        var guid = HakuJs.NewGUID();
        var dom = document.body.append('<div xpt-alert guid="' + guid + '" class="xpt-alert ' + config.alerttype + ' ' + (config.isshade ? 'isshade' : '') + ' alert-hide">' +
            '<div class="xpt-alert-body">' +
            '<div class="xpt-alert-close"></div>' +
            (config.title ? ('<div class="xpt-alert-header">' + config.title + '</div>') : '') +
            '<div class="xpt-alert-content">' + config.content + '</div>' +
            '<div class="xpt-alert-footer">' + config.buttontype + '</div>' +
            '</div>' +
            '</div>').lastChild;
        _alerts[guid] = { id: guid, element: dom, title: config.title, content: config.content, alertType: config.alerttype, buttonType: config.buttontype, isShade: config.isshade, isShadeCancel: config.isshadecancel, creation: Date.now(), Close: function () { XPT.CloseAlert(guid); } };

        //绑定按钮事件
        [].forEach.call(dom.querySelectorAll(".xpt-alert-footer input[type=button]"), function (item, index) {
            switch (config.buttontype) {
                case XPT.AlertButtonType.OK:
                    if (index == 0) item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.OK); event.stopPropagation(); });
                    break;
                case XPT.AlertButtonType.OKCancel:
                    if (index == 0) item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.OK); event.stopPropagation(); });
                    else if (index == 1) {
                        item.on("click", function (event) { XPT.CloseAlert(guid); event.stopPropagation(); });
                        item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.Cancel); event.stopPropagation(); });
                    }
                    break;
                case XPT.AlertButtonType.YesNo:
                    if (index == 0) item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.Yes); event.stopPropagation(); });
                    else if (index == 1) item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.No); event.stopPropagation(); });
                    break;
                case XPT.AlertButtonType.YesNoCancel:
                    if (index == 0) item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.Yes); event.stopPropagation(); });
                    else if (index == 1) item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.No); event.stopPropagation(); });
                    else if (index == 2) {
                        item.on("click", function (event) { XPT.CloseAlert(guid); event.stopPropagation(); });
                        item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.Cancel); event.stopPropagation(); });
                    }
                    break;
                case XPT.AlertButtonType.RetryCancel:
                    if (index == 0) item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.Retry); event.stopPropagation(); });
                    else if (index == 1) {
                        item.on("click", function (event) { XPT.CloseAlert(guid); event.stopPropagation(); });
                        item.on("click", function (event) { config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.Cancel); event.stopPropagation(); });
                    }
                    break;
                default:
            }
        });
        //如果点击遮罩层关闭则绑定事件
        if (config.isshadecancel) {
            dom.on("click", function (event) {
                config.buttonevent.call(_alerts[guid], XPT.AlertReturnType.Cancel);
                XPT.CloseAlert(guid);
                event.stopPropagation();
            });
            dom.firstChild.on("click", function (event) {
                event.stopPropagation();
            });
        }
        //键盘按键事件
        dom.firstChild.on("keydown", function (e) {
            switch (e.keyCode) {
                case 27:
                    XPT.CloseAlert(guid);
                    break;
                default:
            }
        });
        if (config.buttontype != XPT.AlertButtonType.None) dom.querySelector("[btn-ok],[btn-yes],[btn-retry]").focus();
        else dom.querySelectorAll(".xpt-alert-footer").hide();

        dom.className = dom.className.replace("alert-hide", "alert-show");

        if (config.closetime != null) {
            window.setTimeout(function () {
                XPT.CloseAlert(guid);
            }, config.closetime);
        }

        return guid;
    };
    /**
     * @method 弹出加载框
     * @param {String} [title] 加载框标题
     * @param {Number} [timeout] 超时时间（毫秒），不传入则默认永不超时
     * @param {Function} [fn] 超时后执行的函数，未传入则自动弹出超时错误框。（return false时不自动关闭加载框，其他情况将自动关闭）
     * @return {String} 生成弹出框的GUID
     */
    me.Loading = function (title, timeout, fn) {
        var guid = XPT.Alert({
            alerttype: XPT.AlertType.Loading,
            title: title
        });
        if (timeout != undefined) {
            window.setTimeout(function () {
                if (_alerts[guid] != undefined) {
                    if (fn && fn() !== false) {
                        XPT.CloseAlert(guid);
                    } else if (!fn) {
                        XPT.ShowError("错误", "执行超时");
                    }
                }
            }, timeout);
        }
        return guid;
    };
    /**
     * @method ShowError 显示错误/警告信息
     * @param {String} [title='错误'] 标题
     * @param {String} [content=''] 内容
     * @param {String} [fun] 点击确认后的回调函数
     */
    me.ShowError = function (title, content, fun) {
        for (var guid in _alerts) {
            if (_alerts[guid].alertType == XPT.AlertType.Loading) {
                XPT.CloseAlert(guid);
            }
        }
        XPT.Alert({
            isshadecancel: true,
            alerttype: XPT.AlertType.Danger,
            buttontype: XPT.AlertButtonType.OK,
            title: title || "错误",
            content: content || "",
            buttonevent: function (type) {
                if (fun && fun() !== false) {
                    this.Close();
                } else if (!fun) {
                    this.Close();
                }
            }
        });
    };
    /**
     * @method ShowMessage 显示普通信息
     * @param {String} [title='信息'] 标题
     * @param {String} [content=''] 内容
     * @param {String} [fun] 点击确认后的回调函数
     */
    me.ShowMessage = function (title, content, fun) {
        XPT.Alert({
            isshadecancel: true,
            alerttype: XPT.AlertType.Info,
            buttontype: XPT.AlertButtonType.OK,
            title: title || "信息",
            content: content || "",
            buttonevent: function (type) {
                if (fun && fun() !== false) {
                    this.Close();
                } else if (!fun) {
                    this.Close();
                }
            }
        });
    };
    /**
     * @method ShowSuccess 显示成功/正确信息
     * @param {String} [title='信息'] 标题
     * @param {String} [content=''] 内容
     * @param {String} [fun] 点击确认后的回调函数
     */
    me.ShowSuccess = function (title, content, fun) {
        XPT.Alert({
            isshadecancel: true,
            alerttype: XPT.AlertType.Success,
            buttontype: XPT.AlertButtonType.OK,
            title: title || "信息",
            content: content || "",
            buttonevent: function (type) {
                if (fun && fun() !== false) {
                    this.Close();
                } else if (!fun) {
                    this.Close();
                }
            }
        });
    };
    /**
     * @method 根据GUID关闭某个弹窗
     * @param {String} guid 弹出框GUID
     */
    me.CloseAlert = function (guid) {
        if (guid) {
            if (_alerts[guid]) {
                if (_alerts[guid].element) {
                    _alerts[guid].element.addClass("alert-hide");
                }
            }
            window.setTimeout(function () {
                if (_alerts[guid]) {
                    if (_alerts[guid].element) {
                        _alerts[guid].element.remove();
                    }
                    delete _alerts[guid];
                }
            }, 300);
        }
    };
    /**
     * @method 获取所有弹出框
     * @param {XPT.AlertType} [alertType] 弹出框类型
     */
    me.GetAllAlerts = function (alertType) {
        var _arr = [];
        if (alertType == undefined) for (var item in _alerts) _arr.push(_alerts[item]);
        else for (var item in _alerts) if (_alerts[item].alertType == alertType) _arr.push(_alerts[item]);
        return _arr;
    };
    /**
     * @method 修改弹出框信息（暂时考虑用在加载弹出框的加载文本上）
     * @param {String} guid 弹出框GUID
     * @param {String} text 弹出框显示文本
     */
    me.ChangeAlertContent = function (guid, text) {
        if (guid) {
            var alert = document.querySelector("[guid='" + guid + "']");
            if (alert != null) {
                if (alert.hasClass("alert-loading")) {
                    var ele = alert.querySelector(".alert-loading-icon");
                    if (ele != null) {
                        ele.innerHTML = text;
                    }
                }
            }
        }
    };
    /**
     * @method 关闭所有弹窗
     */
    me.CloseAllAlert = function () {
        for (var item in _alerts) {
            XPT.CloseAlert(_alerts[item].id);
        }
        window.setTimeout([].forEach.call(document.querySelectorAll("[xpt-alert]"), function (item, index) {
            XPT.CloseAlert(item.getAttribute("guid"));
        }), 1000);
    };
    /**
     * @method 查询所有未通过验证的控件列表
     * @param {Boolean} [isRequery=false] 是否重新查询，重新查询时会弹出验证错误提示
     * @return {Array} 控件列表
     */
    me.GetInvalidControls = function (isRequery) {
        if (isRequery == undefined) isRequery = false;
        if (isRequery == true) {
            _checkControl = [];
            [].forEach.call(XPT.ControlList, function (item, index) {
                var checkitem = {
                    control: item,
                    message: "",
                    ischeck: true
                };
                if (item.Check && item.Check() === false) {
                    checkitem.message = item.CheckMessage;
                    checkitem.ischeck = false;
                }
                _checkControl.push(checkitem);
            });
        }
        var _arr = [];
        for (var i = 0; i < _checkControl.length; i++) {
            if (!_checkControl[i].ischeck) _arr.push(_checkControl[i]);
        }
        return _arr;
    };
    /**
     * @method 函数单元测试方法
     * @param {Function} fun 运行的函数
     * @param {Object} yuqi 预期结果
     */
    me.TestFunc = function (fun, yuqi) {
        var result = fun.apply(this, [].slice.call(arguments, 2));
        if (result == yuqi) {
            return true;
        } else {
            return false;
        }
    };
    /**
     * @method 页面DOM截图并保存到服务器
     * @param {String} filename 文件名
     * @param {Function} [fn] 回调函数
     */
    me.PrintScreen = function (filename, fn) {
        var mainDiv = document.getElementById("myDiv");
        if (mainDiv) {
            mainDiv.addClass("print");
            html2canvas(mainDiv, {
                allowTaint: true,
                taintTest: false,
                onrendered: function (canvas) {
                    canvas.id = "mycanvas";
                    //document.body.appendChild(canvas);
                    //生成base64图片数据
                    var dataUrl = canvas.toDataURL();
                    XPT.Post({
                        url: XPT.Url.SaveBase64Image,
                        params: {
                            basecode: dataUrl,
                            filename: filename
                        },
                        success: function (a) {
                            fn(filename);
                        },
                        error: function (a) {
                            XPT.ShowError("错误", a.exception);
                        }
                    });
                    mainDiv.removeClass("print");
                }
            });
        } else {
            if (fn != null) fn();
        }
    };
    /**
     * @new
     * @method 页面DOM截图并保存到本地
     * @param {HTMLElement} element HTML节点
     * @param {String} filename 文件名（不支持IE浏览器）
     */
    me.SaveScreen = function (element, filename) {
        var mainDiv = element || document.body;
        if (mainDiv) {
            html2canvas(mainDiv, {
                allowTaint: true,
                taintTest: false,
                onrendered: function (canvas) {
                    canvas.id = "mycanvas";
                    //document.body.appendChild(canvas);
                    //生成base64图片数据
                    var dataUrl = canvas.toDataURL();
                    var type = 'png';
                    /**
                     * @method 获取mimeType
                     * @param  {String} type the old mime-type
                     * @return the new mime-type
                     * @private
                     */
                    var _fixType = function (type) {
                        type = type.toLowerCase().replace(/jpg/i, 'jpeg');
                        var r = type.match(/png|jpeg|bmp|gif/)[0];
                        return 'image/' + r;
                    };

                    // 加工image data，替换mime type
                    dataUrl = dataUrl.replace(_fixType(type), 'image/octet-stream');


                    /**
                     * @method 在本地进行文件保存
                     * @param  {String} data     要保存到本地的图片数据
                     * @param  {String} filename 文件名
                     * @private
                     */
                    var saveFile = function (data, filename) {
                        var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                        save_link.href = data;
                        save_link.download = filename;

                        var event = document.createEvent('MouseEvents');
                        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        save_link.dispatchEvent(event);
                    };

                    if (HakuJs.AppInfo.msie) {
                        var l = canvas.toDataURL(type);
                        var k = window.open();
                        k.document.write('<img src="' + l + '" />');
                        k.document.close();
                    } else {
                        var _filename = (filename || (XPT.InitData.ProcessName + '_' + (new Date()).getTime())) + '.' + type;
                        saveFile(dataUrl, _filename);
                    }
                }
            });
        } else {
            if (fn != null) fn();
        }
    };
    /**
     * @method 将元素的滚动条滑动到某个位置
     * @param {Number} location 竖向滚动的位置（Y坐标）
     * @param {HTMLElement} [control=document.body] 需要滚动的元素
     * @param {Number} [speed=12] 速度，数值越小越快，建议值6~20
     * @param {Function} [fn] 回调函数
     */
    me.SetScroll = function (location, control, speed, fn) {
        if (location < 0) location = 0;
        if (control === undefined) {
            control = HakuJs.IsWeChat ? document.body : document.documentElement;
            if (document.body.clientHeight < document.documentElement.clientHeight) {
                fn && fn(); return;
            } else if (location + document.documentElement.clientHeight > document.body.clientHeight) {
                fn && fn(); return;
            }
        }
        if (speed === undefined) speed = 12;
        var newlocation = 0, oldY = control.scrollTop;

        if (speed == 0) {
            control.scrollTop = location;
        } else {
            var close = function () {
                clearInterval(_timer);
                _timer = null;
                newlocation = 0;
                fn && fn();
                close = null;
            };
            var _timer = window.setInterval(function () {
                if (location > control.scrollTop + 2) {
                    newlocation = (control.scrollTop - location) / speed;
                    if (Math.round(newlocation) == 0) {
                        control.scrollTop = location;
                        close();
                    }
                    control.scrollTop -= Math.round(newlocation);
                } else if (location < control.scrollTop - 2) {
                    newlocation = (location - control.scrollTop) / speed;
                    if (Math.ceil(newlocation) == 0) {
                        control.scrollTop = location;
                        close();
                    }
                    control.scrollTop += Math.ceil(newlocation);
                } else {
                    close();
                }
            }, 15);
            window.setTimeout(function () {
                clearInterval(_timer);
            }, 2000);
        }
    };
    /**
     * @new
     * @method 在元素上显示一个二维码
     * @param {HTMLElement} element 显示二维码的元素
     * @param {String} txt 生成二维码的文本
     * @param {Number} [width=256] 生成二维码的大小（像素）
     * @param {Number} [level=2] 生成精度，L级[1]：约可纠错7%的数据码字，M级[0]：约可纠错15%的数据码字，Q级[3]：约可纠错25%的数据码字，H级[2]：约可纠错30%的数据码字
     */
    me.ShowQRCode = function (element, txt, width, level) {
        if (element == undefined) XPT.ShowError("警告", "用于显示二维码的元素为NULL");
        if (!txt) XPT.ShowError("警告", "用于显示二维码的文本为空");
        if (window.$) {
            if (window.QRCode) {
                var qrcode = new QRCode(element, {
                    text: txt,
                    width: width || 256,
                    height: width || 256,
                    correctLevel: level || QRCode.CorrectLevel.H
                });
            } else XPT.ShowError("警告", "QRCode未加载。");
        } else XPT.ShowError("警告", "Jquery未加载。");
    };
    /**
     * @method 根据HTML元素初始化控件
     * @param {HTMLElement} element 需要初始化的控件
     */
    me.InitControl = function (element) {
        var basicControls = element, labelControls = element;
        if ([1, 9].indexOf(element.nodeType) >= 0) {
            basicControls = element.querySelectorAll("[xpt-input],[xpt-label],[xpt-select],[xpt-radiolist],[xpt-checkbox],[xpt-fileupload]");
            labelControls = element.querySelectorAll("span[xpt-label-value][colname]");
        } else if (HakuJs.GetType(element) == "String") {
            basicControls = document.querySelector(element).querySelectorAll("[xpt-input],[xpt-label],[xpt-select],[xpt-radiolist],[xpt-checkbox],[xpt-fileupload]");
            labelControls = document.querySelector(element).querySelectorAll("span[xpt-label-value][colname]");
        } else if (HakuJs.GetType(element) == "NodeList") {
            labelControls = [];
        }
        //初始化标准控件
        [].forEach.call(basicControls, function (e) {
            var pElement = e.parents("[xpt-repeat]");
            var columnName = e.getAttribute("colname");
            var tablename = "";
            var rIndex = null;
            if (columnName != null) {
                if (e.parents("[template]").length > 0) return;
                if (pElement.length > 0) {
                    if (columnName.indexOf(".") >= 0) {
                        tablename = columnName.split(".")[0];
                        columnName = columnName.split(".")[1];
                    } else {
                        tablename = e.parents("[xpt-detailtable]")[0].getAttribute("xpt-detailtable");
                    }
                    rIndex = pElement[0].index("[xpt-repeat]");
                    if (XPT.Controls[tablename][rIndex] == undefined) {
                        XPT.Controls[tablename][rIndex] = {};
                    }
                    if (XPT.TaskData[tablename][rIndex] == undefined) {
                        XPT.TaskData[tablename][rIndex] = {};
                        XPT.__moon.set(tablename + '[' + rIndex + ']', {});
                    }
                    if (XPT.Controls[tablename][rIndex][columnName]) {
                        XPT.ShowError("页面配置错误", "明细配置表字段控件出现重复，重复值：第" + rIndex + "行" + tablename + "." + columnName, function (type) {
                            e.style.backgroundColor = "red";
                            XPT.CloseAlert(sguid);
                        });
                        return;
                    }
                    if (e.getAttribute("xpt-input") != null) {
                        XPT.Controls[tablename][rIndex][columnName] = new XptTextControl(e, rIndex);
                    } else if (e.getAttribute("xpt-label") != null) {
                        XPT.Controls[tablename][rIndex][columnName] = new XptLabelControl(e, rIndex);
                    } else if (e.getAttribute("xpt-select") != null) {
                        XPT.Controls[tablename][rIndex][columnName] = new XptSelectControl(e, rIndex);
                    } else if (e.getAttribute("xpt-radiolist") != null) {
                        XPT.Controls[tablename][rIndex][columnName] = new XptRadioListControl(e, rIndex);
                    } else if (e.getAttribute("xpt-checkbox") != null) {
                        XPT.Controls[tablename][rIndex][columnName] = new XptCheckBoxControl(e, rIndex);
                    } else if (e.getAttribute("xpt-fileupload") != null) {
                        throw ("暂未实现明细行配置文件上传");
                    }
                } else {
                    if (columnName.indexOf(".") >= 0) {
                        tablename = columnName.split(".")[0];
                        columnName = columnName.split(".")[1];
                    } else {
                        tablename = XPT.InitData.MasterTable;
                    }
                    if (XPT.Controls[tablename][columnName]) {
                        var sguid = XPT.ShowError("页面配置错误", "配置表字段控件出现重复，重复值：" + tablename + "." + columnName, function (type) {
                            e.style.backgroundColor = "red";
                            XPT.CloseAlert(sguid);
                        });
                        return;
                    }
                    if (e.getAttribute("xpt-input") != null) {
                        XPT.Controls[tablename][columnName] = new XptTextControl(e);
                    } else if (e.getAttribute("xpt-label") != null) {
                        XPT.Controls[tablename][columnName] = new XptLabelControl(e);
                    } else if (e.getAttribute("xpt-select") != null) {
                        XPT.Controls[tablename][columnName] = new XptSelectControl(e);
                    } else if (e.getAttribute("xpt-radiolist") != null) {
                        XPT.Controls[tablename][columnName] = new XptRadioListControl(e);
                    } else if (e.getAttribute("xpt-checkbox") != null) {
                        XPT.Controls[tablename][columnName] = new XptCheckBoxControl(e);
                    } else if (e.getAttribute("xpt-fileupload") != null) {
                        throw ("文件上传控件不应配置ColumnName");
                    }
                }
            } else {
                if (e.getAttribute("xpt-input") != null) {
                    XPT.Controls._TempControl[e.id] = new XptTextControl(e);
                } else if (e.getAttribute("xpt-label") != null) {
                    XPT.Controls._TempControl[e.id] = new XptLabelControl(e);
                } else if (e.getAttribute("xpt-select") != null) {
                    XPT.Controls._TempControl[e.id] = new XptSelectControl(e);
                } else if (e.getAttribute("xpt-radiolist") != null) {
                    XPT.Controls._TempControl[e.id] = new XptRadioListControl(e);
                } else if (e.getAttribute("xpt-checkbox") != null) {
                    XPT.Controls._TempControl[e.id] = new XptCheckBoxControl(e);
                } else if (e.getAttribute("xpt-fileupload") != null) {
                    XPT.Controls._TempControl[e.id] = new XPTFileUpload(e);
                }
            }
        });

        //初始化标签控件
        //遍历明细表外面的span绑定控件
        [].forEach.call(labelControls, function (con, index) {
            var _con = con;
            if (_con.parents("[template]").length > 0) return;

            var pElement = _con.parents("[xpt-repeat]");
            var rColumnName = _con.getAttribute("colname");
            var rIndex = null;
            var _tobj = null;

            var _columnName = "";
            var _tableName = "";

            if (pElement.length > 0) {
                rIndex = pElement[0].index("[xpt-repeat]");
                _con.RowIndex = rIndex;
            }

            if (rColumnName) {
                if (rColumnName.indexOf(".") > 0) {
                    _columnName = rColumnName.split(".")[1];
                    //表名
                    _tableName = rColumnName.split(".")[0];
                } else {
                    _columnName = rColumnName;
                    //表名
                    if (rIndex == null) _tableName = XPT.InitData.MasterTable;
                    else _tableName = _con.parents("[xpt-detailtable]")[0].getAttribute("xpt-detailtable");
                }
            }

            _con.GUID = HakuJs.NewGUID();
            _con.setAttribute("guid", _con.GUID);
            _con.element = _con;
            _con.IsLabel = true;
            _con.CancelError = function () { };
            _con.ShowError = function () { };
            _con.Hide = function () { _con.element.hide(); return _con.element; };
            _con.Show = function () { _con.element.show(); return _con.element; };

            Object.defineProperty(_con, "value", {
                Configurable: false,
                get: function () {
                    return _con.element.getAttribute("dbvalue") || _con.element.getAttribute("bindtext") || _con.element.innerHTML;
                },
                set: function (value) {
                    value = value == null ? "" : value;
                    _con.element.setAttribute("dbvalue", value);
                    _con.element.innerHTML = value == null ? "" : value;
                }
            });

            if (pElement.length > 0) {
                XPT.TaskData[_tableName][rIndex][_columnName] = undefined;
                XPT.__moon.set(_tableName + '[' + rIndex + '].' + _columnName.substr(1), _con.value);
                XPT.Controls[_tableName][rIndex][_columnName.substr(1)] = _con;
                _tobj = XPT.TaskData[_tableName][rIndex];
            } else {
                XPT.TaskData[_tableName][_columnName] = undefined;
                XPT.__moon.set(_tableName + '.' + _columnName.substr(1), _con.value);
                XPT.Controls[_tableName][_columnName.substr(1)] = _con;
                _tobj = XPT.TaskData[_tableName];
            }
            Object.defineProperty(_tobj, rColumnName.substr(1), {
                Configurable: false,
                get: function () {
                    return _con.getAttribute("value") || _con.innerHTML;
                },
                set: function (value) {
                    value = value == null ? "" : value;
                    if (pElement.length > 0) {
                        delete XPT.TaskData[_tableName][rIndex][_columnName];
                        XPT.TaskData[_tableName][rIndex]["_" + _columnName.substr(1)] = undefined;
                    } else {
                        delete XPT.TaskData[_tableName][_columnName];
                        XPT.TaskData[_tableName]["_" + _columnName.substr(1)] = undefined;
                    }
                    _con.innerHTML = value;
                }
            });
        });
    };
    /**
     * @class XPT.Handle 表单操作（一般情况下不需要手动调用）
     * @member XPT
     */
    me.Handle = {
        /** @method CallSubmit 提交/审批：所有关键信息必填且执行自定义验证（其他操作没有执行自定义验证） */
        CallSubmit: function (btn) {
            //动作
            XPT.InitData.ActionId = btn.getAttribute("actionid");
            if (!XPT.InitData.ActionId) {
                XPT.InitData.Action = btn.value;
            }
            switch (btn.getAttribute("actiontype")) {
                case "event_Submit":
                    me.Handle.Submit(btn);
                    break;
                case "event_SaveToDraft":
                    me.Handle.SaveDraft(btn);
                    break;
                case "event_SaveForm":
                    me.Handle.SaveBusiness(btn);
                    break;
                case "event_SaveToTemplate":
                    me.Handle.SaveDraft(btn);
                    break;
                case "event_Delete":
                    me.Handle.Reject(btn);
                    break;
                case "event_Agree":
                    me.Handle.Submit(btn);
                    break;
                case "event_RecedeToProposer":
                    me.Handle.Restart(btn);
                    break;
                case "event_Reject":
                    me.Handle.Cancel(btn);
                    break;
                case "event_TurnOver":
                    me.Handle.Inquire(btn);
                    break;
                case "event_Copy":
                    me.Handle.Submit(btn);
                    break;
                case "event_Waiting":
                    me.Handle.Submit(btn);
                    break;
                case "event_Recede":
                    me.Handle.Revoke(btn);
                    break;
                case "event_RecedeToPreviousStep":
                    me.Handle.Submit(btn);
                    break;
                case "event_RecedeToAnyStep":
                    me.Handle.Submit(btn);
                    break;
                case "event_AdditionalSigner":
                    me.Handle.Inquire(btn);
                    break;
                case "event_Answer":
                    me.Handle.Answer(btn);
                    break;
            }
        },
        /** @method Submit 提交/审批：所有关键信息必填且执行自定义验证（其他操作没有执行自定义验证） */
        Submit: function (btn) {
            if (Flow && Flow.Func && Flow.Func.BeforeSubmit) {
                if (Flow.Func.BeforeSubmit() === false) {
                    return false;
                }
            }
            var _submit = function (result) {
                if (result !== false) {
                    //发起提交时生成流程名称，如果特殊生成方法则使用，否则按照SummaryOrder来生成
                    if (Flow.Func.GetTaskSummary) {
                        XPT.InitData.Summary = Flow.Func.GetTaskSummary();
                    } else {
                        XPT.InitData.Summary = XPT.GenerateSummary();
                    }
                    //赋值备注
                    if (!!XPT.Controls._TempControl.comment)
                        XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;

                    //提交
                    XPT.PostTask("Submit", "流程提交成功", "已提交到[{0}]审批。", "流程提交失败");
                }
            };
            //验证数据
            XPT.Handle.CheckForm(_submit);
        },
        /** @method Answer 回答：验证备注必填 */
        Answer: function () {
            if (XPT.Controls._TempControl.comment) {
                if (!XPT.Controls._TempControl.comment.value) {
                    XPT.Controls._TempControl.comment.ShowError("备注信息必填。", 8000);
                    return false;
                }
            }
            //赋值备注
            if (!!XPT.Controls._TempControl.comment)
                XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;
            //回答时触发的事件
            if (Flow && Flow.Event && Flow.Event.AnswerEvent) {
                if (Flow.Event.AnswerEvent() === false) {
                    return false;
                }
            }
            XPT.PostTask("Answer", "回答成功", "已回答[{0}]", "回答失败");
        },
        /** @method Discuss 讨论：验证备注必填 */
        Discuss: function () {
            var inquireDialog = new Dialog({
                title: "发起讨论",
                classCss: 'size-xs auto-height',
                element: '<div class="form-question">' +
                '<table>' +
                '<tr>' +
                '<td>询问人</td><td><div form-inquire-user class="xpt-text xpt-select-input disabled" xpt><input disabled xpt-input type="text" value="' + (XPT.ApplicantData.ApplicantUserName || "") + '" placeholder="选择讨论人" /></div></td>' +
                '</tr>' +
                '<tr>' +
                '<td>询问内容</td><td><div form-inquire-comment class="xpt-text" xpt><textarea xpt-input placeholder="问题描述" >' + (XPT.Controls._TempControl.comment.value || "") + '</textarea></div></td>' +
                '</tr>' +
                '</table>' +
                '</div>',
                initFunc: function (me) {
                    me.Element.querySelector("[form-inquire-comment] > [xpt-input]").on("input", function (event, con) {
                        XPT.Controls._TempControl.comment.value = con.value;
                    });

                    XPT.ApplicantData.AssignToUserJobId = XPT.ApplicantData.ApplicantJobId;
                    me.Element.querySelector("[form-inquire-user]").on("click", function () {
                        new Dialog({
                            title: "选择讨论人",
                            url: XPT.Url.ReadView,
                            params: {
                                Code: "Src_GetAllUsers",
                                Filters: { FormEnterpriseId: XPT.InitData.EnterpriseId }
                            },
                            buttonEvent: function (type, con) {
                                if (type == XPT.AlertReturnType.OK) {
                                    me.Element.querySelector("[form-inquire-user] > [xpt-input]").value = con.SelectData[0].chName + con.SelectData[0].enName;
                                    XPT.ApplicantData.AssignToUserJobId = con.SelectData[0].id;
                                }
                                con.Close();
                            }
                        });
                    });
                },
                buttonEvent: function (type, con) {
                    if (type == XPT.AlertReturnType.OK) {
                        XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;
                        if (!XPT.InitData.Comments) {
                            XPT.ShowError("提示", "备注信息必填。");
                        } else if (!XPT.ApplicantData.AssignToUserJobId) {
                            XPT.ShowError("提示", "讨论人必选。");
                        } else {
                            XPT.PostTask("Discuss", "提交成功", "已发送至讨论人。", "提交失败");
                        }
                    }
                }
            });
        },
        /** @method CompleteDiscuss 讨论结束：验证备注必填 */
        CompleteDiscuss: function () {
            if (XPT.Controls._TempControl.comment) {
                if (!XPT.Controls._TempControl.comment.value) {
                    XPT.Controls._TempControl.comment.ShowError("备注信息必填。", 8000);
                    return false;
                }
            }
            //赋值备注
            if (!!XPT.Controls._TempControl.comment)
                XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;
            XPT.PostTask("CompleteDiscuss", "回答成功", "已回答[{0}]", "回答失败");
        },
        /** @method Inquire 询问：验证备注必填 */
        Inquire: function () {
            var _username = (XPT.ApplicantData.ApplicantUserName || "");
            var inquireDialog = new Dialog({
                title: "发起询问",
                classCss: 'size-xs auto-height',
                element: '<div class="form-question">' +
                '<table>' +
                '<tr>' +
                '<td>询问人</td><td><div form-inquire-user class="xpt-text xpt-select-input disabled" xpt><input disabled xpt-input type="text" value="' + (XPT.ApplicantData.ApplicantUserName || "") + '" placeholder="选择询问人" /></div></td>' +
                '</tr>' +
                '<tr>' +
                '<td>询问内容</td><td><div form-inquire-comment class="xpt-text" xpt><textarea xpt-input placeholder="询问描述" >' + (XPT.Controls._TempControl.comment.value || "") + '</textarea></div></td>' +
                '</tr>' +
                '</table>' +
                '</div>',
                initFunc: function (me) {
                    me.Element.querySelector("[form-inquire-comment] > [xpt-input]").on("input", function (event, con) {
                        XPT.Controls._TempControl.comment.value = con.value;
                    });

                    XPT.ApplicantData.AssignToUserJobId = XPT.ApplicantData.ApplicantJobId;
                    me.Element.querySelector("[form-inquire-user]").on("click", function () {
                        new Dialog({
                            title: "选择询问人",
                            url: XPT.Url.ReadView,
                            params: {
                                Code: "Src_GetAllUsers",
                                Filters: { FormEnterpriseId: XPT.InitData.EnterpriseId }
                            },
                            buttonEvent: function (type, con) {
                                if (type == XPT.AlertReturnType.OK) {
                                    me.Element.querySelector("[form-inquire-user] > [xpt-input]").value = con.SelectData[0].chName + '' + con.SelectData[0].enName;
                                    XPT.ApplicantData.AssignToUserJobId = con.SelectData[0].jobId;
                                    _username = con.SelectData[0].chName;
                                }
                                con.Close();
                            }
                        });
                    });
                },
                buttonEvent: function (type, con) {
                    if (type == XPT.AlertReturnType.OK) {
                        XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;
                        if (!XPT.InitData.Comments) {
                            XPT.ShowError("提示", "备注信息必填。");
                        } else if (!XPT.ApplicantData.AssignToUserJobId) {
                            XPT.ShowError("提示", "询问人必选。");
                        } else {
                            XPT.PostTask("Inquire", "提交成功", "已发送至[{0}]。", "提交失败");
                        }
                    }
                }
            });
        },
        /** @method Restart 拒绝：验证备注必填 */
        Restart: function () {
            if (XPT.Controls._TempControl.comment) {
                if (!XPT.Controls._TempControl.comment.value) {
                    XPT.Controls._TempControl.comment.ShowError("备注信息必填。", 8000);
                    return false;
                }
            }
            //赋值备注
            if (!!XPT.Controls._TempControl.comment)
                XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;
            XPT.PostTask("Restart", "已退回申请人", "已退回申请人。", "退回申请人失败");
        },
        /** @method SaveDraft 保存草稿 */
        SaveDraft: function () {
            if (Flow.Func.GetTaskSummary) {
                XPT.InitData.Summary = Flow.Func.GetTaskSummary();
            } else {
                var arr = [];
                [].forEach.call(document.querySelectorAll("[summary-order]"), function (item, index) {
                    arr[parseInt(item.getAttribute("summary-order"))] = item.value;
                });
                //如果没有Summarysplit指定分隔符则用单个空格分割
                XPT.InitData.Summary = arr.join(XPT.InitData.Summarysplit || " ");
            }
            XPT.PostTask("SaveDraft", "保存成功", "请在草稿箱中查看。", "保存失败");
        },
        /** @method SaveBusiness 运维工具保存业务数据 */
        SaveBusiness: function () {
            if (Flow.Func.GetTaskSummary) {
                XPT.InitData.Summary = Flow.Func.GetTaskSummary();
            } else {
                var arr = [];
                [].forEach.call(document.querySelectorAll("[summary-order]"), function (item, index) {
                    arr[parseInt(item.getAttribute("summary-order"))] = item.value;
                });
                //如果没有Summarysplit指定分隔符则用单个空格分割
                XPT.InitData.Summary = arr.join(XPT.InitData.Summarysplit || " ");
            }
            XPT.PostTask("SaveBusiness", "保存成功", "业务数据已保存。", "保存失败");
        },
        /** @method Revoke 撤回 */
        Revoke: function () {
            XPT.PostTask("Revoke", "撤销成功", "撤销成功。", "撤销失败");
        },
        /** @method Urgent 催办 */
        Urgent: function () {
            XPT.PostTask("Urgent", "已催办", "您的催办请求已经发送给审批人！<br/>Your notification Have been send to approver！。", "失败");
        },
        /** @method Cancel 取消 */
        Cancel: function () {
            if (XPT.Controls._TempControl.comment) {
                if (!XPT.Controls._TempControl.comment.value) {
                    XPT.Controls._TempControl.comment.ShowError("备注信息必填。", 8000);
                    return false;
                }
            }
            //赋值备注
            if (!!XPT.Controls._TempControl.comment)
                XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;
            XPT.PostTask("Cancel", "取消成功", "取消成功。", "取消失败");
        },
        /** @method AutoTest 自动测试 */
        AutoTest: function () {
            if (Flow && Flow.Func && Flow.Func.BeforeSubmit) {
                if (Flow.Func.BeforeSubmit() === false) {
                    return false;
                }
            }
            var _submit = function (result) {
                if (result !== false) {
                    //发起提交时生成流程名称，如果特殊生成方法则使用，否则按照SummaryOrder来生成
                    if (Flow.Func.GetTaskSummary) {
                        XPT.InitData.Summary = Flow.Func.GetTaskSummary();
                    } else {
                        XPT.InitData.Summary = XPT.GenerateSummary();
                    }
                    //赋值备注
                    if (!!XPT.Controls._TempControl.comment)
                        XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;

                    XPT.PreProcId = "";
                    XPT.InitData.Action = "自动测试";
                    XPT.InitData.Comments = "自动测试";
                    XPT.Handle.AutoSubmit();
                }
            };
            //验证数据
            XPT.Handle.CheckForm(_submit);
        },
        /** @method AutoSubmit 自动提交 */
        AutoSubmit: function () {
            if (XPT.PreProcId == XPT.InitData.ProcId)
                return;
            XPT.PreTaskId = XPT.InitData.ProcId;
            XPT.Post({
                url: "NewRequest.aspx" + window.location.search,
                params: {
                    PostMethod: "Submit",
                    PostData: JSON.stringify({
                        InitData: XPT.InitData,
                        ApplicantData: XPT.ApplicantData,
                        FormData: XPT.GetTaskData()
                    })
                },
                hasLoading: true,
                success: function (data) {
                    //审批完成
                    if (data.result.end) {
                        XPT.Alert({
                            isshadecancel: true,
                            alerttype: XPT.AlertType.Info,
                            buttontype: XPT.AlertButtonType.OK,
                            title: "提交成功",
                            content: "流程审批结束",
                            buttonevent: function (type) {
                                this.Close();
                                XPT.Handle.Close();
                            }
                        });
                    }
                    else {
                        var sguid = XPT.Alert({
                            isshadecancel: true,
                            alerttype: XPT.AlertType.Info,
                            title: "提交成功",
                            content: "转到到下一步审批" + data.result.nextUser
                        });
                        if (data.result.nextProcs.count > 0) {
                            var nextproc = data.result.nextProcs.arrayProcs[0];
                            //继续审批到下一节点
                            XPT.ApplicantData.DocumentNo = data.result.documentNo;
                            XPT.InitData.TaskId = nextproc.taskId;
                            XPT.InitData.NodeId = nextproc.nodeId;
                            XPT.InitData.NodeCode = nextproc.nodeCode;
                            XPT.InitData.ProcId = nextproc.procId;
                            XPT.InitData.PageId = nextproc.pageId;
                            XPT.InitData.DetailTable = "";
                            XPT.InitData.IsStartStep = false;
                            XPT.InitData.IsAutoTest = true;

                            XPT.CloseAlert(sguid);
                            XPT.Handle.AutoSubmit();
                        }
                    }
                },
                error: function (data) {
                    XPT.ShowError("提交报错", data.exception);
                },
            });
        },
        /** @method Print 打印 */
        Print: function () {
            if (Flow.Func.Print) {
                Flow.Func.Print();
            }
            else {
                window.print();
            }
        },
        /** @method CheckForm 检查表单 */
        CheckForm: function (submitFunc) {
            //1、自动基础验证
            var isTrue = true;
            _checkControl = [];
            [].forEach.call(XPT.ControlList, function (item, index) {
                var checkitem = {
                    control: item,
                    message: ""
                };
                if (item.Check && item.Check() === false) {
                    checkitem.message = item.CheckMessage;
                    checkitem.ischeck = false;
                    isTrue = false;
                } else {
                    checkitem.ischeck = true;
                }
                _checkControl.push(checkitem);
            });
            if (isTrue === false) {
                for (var i = 0; i < _checkControl.length; i++) {
                    if (_checkControl[i].ischeck == false) {
                        XPT.SetScroll(_checkControl[i].control.element.GetTop() - 60);
                        break;
                    }
                }
                submitFunc && submitFunc(false);
                return;
            }
            //2、表单验证
            if (Flow.Func && Flow.Func.DataCheck) {
                Flow.Func.DataCheck(submitFunc);
            } else {
                submitFunc && submitFunc(true);
            }
        },
        /** @method Close 关闭页面 */
        Close: function () {
            if (HakuJs.IsWeChat) {
                setTimeout(function () {
                    history.back();
                    location.href = "/#/my"; //localStorage.historyPage || 
                }, 10);
            } else {
                if (window.opener) {
                    if (window.opener.ReloadData) {
                        window.opener.ReloadData();
                    }
                }
                window.close();
                window.open("about:blank", "_self").close();
            }
        }
    };
    /**
     * @class XPT.InitData 流程初始化数据
     * @member XPT
     */
    me.InitData = {
        /** @property {String} MasterTable 流程主表名 */
        MasterTable: null,
        /** @property {String} DetailTable 流程明细表名（用英文逗号分隔） */
        DetailTable: null,
        /** @property {String} DraftId 草稿ID */
        DraftId: null,
        /** @property {String} NowDate 当前时间？？*/
        NowDate: null,
        /** @property {String} OpenType 页面打开方式（0:打印，1:从新发起，2:从待办任务，3:从我的申请，4:从已办任务，5:从草稿）*/
        OpenType: null,
        /** @property {String} TaskId 任务ID*/
        TaskId: null,
        /** @property {String} NodeId 节点ID*/
        NodeId: null,
        /** @property {String} PageId 页面ID*/
        PageId: null,
        /** @property {String} ProcId 审批步骤ID*/
        ProcId: null,
        /** @property {String} NodeCode 节点编号*/
        NodeCode: null,
        /** @property {String} WfdId 流程ID*/
        WfdId: null,
        /** @property {String} Summary 流程标题*/
        Summary: "",
        /** @property {String} Action 动作*/
        Action: "",
        /** @property {String} Comments 审批备注*/
        Comments: "",
        //是否自动测试
        IsAutoTest: false,
    };
    /**
     * @class XPT.ApplicantData 流程初始化时，发起人的相关数据
     * @member XPT
     */
    me.ApplicantData = {
        /** @property {String} OpenFormUserAccount 打开表单的用户账号1？*/
        OpenFormUserAccount: null,
        /** @property {String} UserAccount 打开表单的用户账号2？*/
        UserAccount: null,
        /** @property {String} UserName 用户名称*/
        UserName: null,
        /** @property {String} UserJobId 用户岗位ID*/
        UserJobId: null,
        /** @property {String} CompanyCode 公司代码*/
        CompanyCode: null,
        /** @property {String} CompanyName 公司名称*/
        CompanyName: null,
        /** @property {String} CostPrefix 公司成本前缀*/
        CostPrefix: null,
        /** @property {String} FactoryCode 工厂代码*/
        FactoryCode: null,
        /** @property {String} FactoryName 工厂名称*/
        FactoryName: null,
        /** @property {String} Location 邮箱？*/
        Location: null,
        /** @property {String} CostCenter 成本中心代码*/
        CostCenter: null,
        /** @property {String} Department 部门*/
        Department: null,
        /** @property {String} RequestDate 发起流程日期*/
        RequestDate: null
    };
    /**
     * 浮动靠边方向
     * @enum {Number} XPT.Dock
     * @member XPT
     */
    me.Dock = {
        /** 没有靠边 */
        None: 0,
        /** 靠上 */
        Top: 1,
        /** 靠下 */
        Bottom: 2,
        /** 靠左 */
        Left: 3,
        /** 靠右 */
        Right: 4,
        /** 绝对居中 */
        Center: 5
    };
    /**
     * 弹出框类型
     * @enum {String} XPT.AlertType
     * @member XPT
     */
    me.AlertType = {
        /** 普通信息框（默认） */
        Info: 'alert-info',
        /** 成功框 */
        Success: 'alert-success',
        /** 错误框 */
        Danger: 'alert-danger',
        /** 警告框 */
        Warning: 'alert-warning',
        /** 加载框 */
        Loading: 'alert-loading'
    };
    /**
     * 弹出框返回值
     * @enum {Number} XPT.AlertReturnType
     * @member XPT
     */
    me.AlertReturnType = {
        /** 无 */
        None: 0,
        /** OK按钮 */
        OK: 1,
        /** YES按钮 */
        Yes: 2,
        /** NO按钮 */
        No: 3,
        /** Cancel按钮 */
        Cancel: 4,
        /** Retry按钮 */
        Retry: 5
    };
    /**
     * 弹出框按钮
     * @enum {String} XPT.AlertButtonType
     * @member XPT
     */
    me.AlertButtonType = {
        /** 没有按钮 */
        None: '',
        /** 包含确定按钮 */
        OK: '<input btn-ok class="alert-btn" type="button" value="确认/OK" />',
        /** 包含确定和取消按钮 */
        OKCancel: '<input btn-ok class="alert-btn" type="button" value="确认/OK" /><input btn-cancel class="alert-btn" type="button" value="取消/Cancel" />',
        /** 包含重试和取消按钮 */
        RetryCancel: '<input btn-retry class="alert-btn" type="button" value="重试/Retry" /><input btn-no class="alert-btn" type="button" value="取消/Cancel" />',
        /** 包含是和否按钮 */
        YesNo: '<input btn-yes class="alert-btn" type="button" value="是/Yes" /><input btn-no class="alert-btn" type="button" value="否/No" />',
        /** 包含是、否和取消按钮 */
        YesNoCancel: '<input btn-yes class="alert-btn" type="button" value="是/Yes" /><input btn-no class="alert-btn" type="button" value="否/No" /><input btn-cancel class="alert-btn" type="button" value="取消/Cancel" />'
    };
    /**
     * 常用URL集合
     * @enum {String} XPT.Url
     * @member XPT
     */
    me.Url = {
        /** 查询SQL视图的url地址 */
        ReadView: "/api/webForm/GetViewTable",
        /** 查询SQL视图条数的url地址 */
        ReadViewCount: "/api/webForm/GetViewTableCount",
        /** Base64编码转图片并通过后台保存的地址 */
        SaveBase64Image: "/FunControl/Ultimus.UWF.Common/SaveBase64Image.ashx",
        /** 多文件上传 */
        FilesUpload: "/fileApi/Attachment/UploadFiles",
        /** 文件无效 */
        FileDisabled: "/api/File/DeleteFile",
        /** 文件删除 */
        FileDelete: "/api/File/RemoveFile"
    };
    /**
     * @new
     * @class XPT.CallBack 将异步函数同步调用
     * 
     *     @example
     *     //模拟真实调用的异步函数
     *       var tempFn = function(txt, next) {
     *           var temp = this;
     *           window.setTimeout(function() {
     *           console.log(new Date(), txt, temp.msg);
     *           //这样调用下一步函数，传参true代表执行完成，false代表出错，不传参或者参数为其他值则继续执行
     *           next && next(txt != "王五" ? null : false, {msg: txt});
     *           }, 1000);
     *       }
     * 
     *     //调用CallBack方法示例
     *     CallBack(true)
     *        .next(tempFn, ["张三"], {a:"123"})
     *        .next(tempFn, ["李四"], {a:"324"})
     *        .next(tempFn, ["王五"], {a:"324"})
     *        .success(function(){ console.info("执行成功"); })
     *        .error(function(){ console.info("执行失败"); });
     *
     * 
     * @param {Object} automatic 是否自动调用
     */
    me.CallBack = function (automatic) {
        var _arr = [], _i = 0, _me = {}, _success = function () { }, _error = function () { };
        /**
         * @private
         * @property {Boolean} _state 当前回调的状态 null:无状态，true:成功，false:失败
         */
        var _state = null;
        var _fun = function (state, result) {
            if (state != undefined) {
                if (state === false) {
                    _state = false;
                    _error(result);
                } else if (state === true) {
                    _state = true;
                    _success(result);
                }
            } else if (_i < _arr.length) {
                _arr[_i].fn.apply(result || _arr[_i].that || undefined, _arr[_i].param && _arr[_i].param.length > 0 ? _arr[_i].param.concat(_fun) : [_fun]);
                _i++;
            } else {
                _state = true;
                _success(result);
            }
        };
        /**
         * @property {Boolean} automatic 是否自动执行
         */
        _me.automatic = automatic || false;
        /**
         * @method getstate 获取当前状态
         * @return {Boolean}
         */
        _me.getstate = function () {
            return _state;
        };
        /**
         * @chainable
         * @method reset 重置，如果automatic为true则自动执行
         * @param {Number} num 重置到第几步
         * @return {XPT.CallBack}
         */
        _me.reset = function (num) {
            _state = null;
            _i = num || 0;
            automatic && this.run();
            return _me;
        };
        /**
         * @chainable
         * @method next 新增链式函数
         * @param {Function} fun 函数
         * @param {Array} [param] 参数
         * @param {Object} [bindobj] 绑定的this值（如果有上一步的参数则会被上一步的参数覆盖）
         * @return {XPT.CallBack}
         */
        _me.next = function (fun, param, bindobj) {
            _arr.push({ fn: fun, param: param, that: bindobj });
            _me.automatic && this.run(_arr.length - 1);
            return _me;
        };
        /**
         * @chainable
         * @method run 开始执行
         * @param {Number} num 从第几步开始，一般情况下不需要手动传值
         * @return {XPT.CallBack}
         */
        _me.run = function (num) {
            if (num <= _i + 1) return _me;
            _fun();
            return _me;
        };
        /**
         * @chainable
         * @method error 设置执行失败状态调用函数，如果没传参数则为手动触发错误函数
         * @param {Function} fun 错误时的函数
         * @return {XPT.CallBack}
         */
        _me.error = function (fun) {
            if (fun !== undefined) _error = fun;
            else _error();
            return _me;
        };
        /**
         * @chainable
         * @method success 设置执行成功状态调用函数，如果没传参数则为手动触发成功函数
         * @param {Function} fun 成功时的函数
         * @return {XPT.CallBack}
         */
        _me.success = function (fun) {
            if (fun !== undefined) _success = fun;
            else _success();
            return _me;
        };
        return _me;
    }
    //框架初始化
    me.Init = function (initdata, applicantData, flowVariable, languageData) {
        if (initdata) {
            for (var item in initdata) {
                XPT.InitData[item] = initdata[item];
            }
        }
        //初始化后台输出的变量
        if (flowVariable) {
            for (var item in flowVariable) {
                Flow.Variable[item] = flowVariable[item];
            }
        }
        if (applicantData) XPT.ApplicantData = applicantData;

        if (!XPT.ApplicantData.LanguageCultue) XPT.ApplicantData.LanguageCultue = 'zh-CN';

        _defaultLang.forEach(function (item) { _lang[item.code] = item[XPT.ApplicantData.LanguageCultue]; });

        if (languageData && languageData.length > 0) {
            languageData.forEach(function (item) {
                _lang[item.Key] = item.NameValues.filter(function (value) {
                    return value.Name == XPT.ApplicantData.LanguageCultue
                })[0].Value;
            });
        }
        if (Flow && Flow.Variable) {
            for (var item in Flow.Variable) {
                _lang[item] = Flow.Variable[item];
            }
        }

        //针对isdebugger=1的情况隐藏明细行编辑功能
        if (XPT.GetUrlParam("isdebugger") == "1") {
            document.querySelectorAll("[xpt-detailtable]").attr("readonly", "");
        }

        //多语言JS框架Moon初始化
        XPT.__moon = new Moon({
            el: "#myDiv",
            data: _lang,
            methods: Flow.Func
        });

        //基本验证
        if (!XPT.InitData.MasterTable) {
            XPT.ShowError("错误", "传入的主表XPT.InitData.MasterTable不能为空");
            return;
        }

        XPT.Controls[XPT.InitData.MasterTable] = { IsControlList: true };
        XPT.__moon.set(XPT.InitData.MasterTable, {});
        XPT.TaskData[XPT.InitData.MasterTable] = {};
        (XPT.InitData.DetailTable || "").split(',').forEach(function (item, index) {
            XPT.__moon.set(item, []);
            XPT.Controls[item] = [];
            XPT.TaskData[item] = [];
        });

        var _detaltables = document.querySelectorAll("[xpt-detailtable]");
        if (_detaltables) {
            [].forEach.call(_detaltables, function (e, index) {
                var _tablename = e.getAttribute("xpt-detailtable");
                //XPT.Controls[_tablename].IsControlList = true;
                XPT.Controls._TempControl[_tablename] = new XptDetailTable(e);
            });
        }

        XPT.InitControl(document);

        //在明细行生成必要的行号（有可能会覆盖原始行号）
        if (XPT.InitData.DetailTable) {
            XPT.InitData.DetailTable.split(",").forEach(function (item, index) {
                if (XPT.Controls._TempControl[item] && XPT.Controls._TempControl[item].RefreshRowIndex)
                    XPT.Controls._TempControl[item].RefreshRowIndex();
            });
        }

        if (document.querySelector("[xpt-comment]")) {
            XPT.Controls._TempControl.comment = new XptTextControl(document.querySelector("[xpt-comment]"));
            XPT.Controls._TempControl.comment.element.on("input", function () {
                XPT.InitData.Comments = XPT.Controls._TempControl.comment.value;
            });
            XPT.Controls._TempControl.comment.element.setAttribute("xpt-input", "");
        }

        document.querySelectorAll(".banner").on("click", function () {
            var _con = this.parents("table");
            if (_con && _con.length > 0) {
                var _table = _con[_con.length - 1];
                if (_table.attr("extend")) {
                    document.querySelectorAll("table[extend='" + _table.attr("extend") + "']").forEach(function () {
                        if (this.hasClass("extend")) {
                            this.removeClass("extend");
                        } else {
                            this.addClass("extend");
                        }
                    });
                } else {
                    if (_table.hasClass("extend")) {
                        _table.removeClass("extend");
                    } else {
                        _table.addClass("extend");
                    }
                }
            }
        });

        //for (var i = 0; i < XPT.InitList.length; i++) {
        //    XPT.InitList[i]();
        //}
        me.IsInit = true;
        for (var i = 0; i < _completeFunc.length; i++) {
            _completeFunc[i] && _completeFunc[i]();
        }
    };
    //初始化
    me.ready = function (fun) {
        (function (fn) {
            if (document.readyState == "complete") {
                fn && fn();
                return;
            }
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", function () {
                    document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                    fn();
                });
            } else {
                IEContentLoaded(window, fn);
            }
            function IEContentLoaded(w, fn) {
                var d = w.document, done = false,
                    init = function () {
                        if (!done) {
                            done = true;
                            fn();
                        }
                    }
                        (function () {
                            try {
                                //在documentready之前会报错，所以会进入settimeout内
                                d.documentElement.doScroll('left');
                            } catch (e) {
                                setTimeout(arguments.callee, 50);
                            }
                            init();
                        })();
                d.onreadystatechange = function () {
                    if (d.readyState == 'complete') {
                        d.onreadystatechange = null;
                        init();
                    }
                };
            }
        })(function () {
            fun && fun();
            if (Object.seal) {
                Object.seal(XPT);
                if (window.Flow) {
                    Flow.IsInit = false;
                    Object.seal(Flow);
                }
            }
            var init_timer_maxcount = 20;
            var init_timer_count = 0;
            var init_timer = function () {
                setTimeout(function () {
                    if (init_timer_count < init_timer_maxcount) {
                        init_timer_count++;
                        if (window.Flow && Flow.Init) {
                            if (Flow.IsInit !== true) {
                                Flow.Init();
                                Flow.IsInit = true;
                            }
                            setTimeout(function () { window.document.body.addClass("init"); }, 10);
                        } else {
                            init_timer();
                        }
                    }
                }, 200);
            };
            init_timer();

            if (!HakuJs.AppInfo.msie) {

            } else {
                switch (HakuJs.AppInfo.version) {
                    case "9.0":
                        window.document.body.addClass("ie9");
                        break;
                    case "10.0":
                        window.document.body.addClass("ie10");
                        break;
                    case "11.0":
                        window.document.body.addClass("ie11");
                        break;
                    default:
                }
            }
        });
    };

    //XPT初始化完成
    me.Complete = function (fun) {
        document.addEventListener("DOMContentLoaded", function (event) {
            if (HakuJs.GetType(fun) == "Function") {
                _completeFunc.push(fun);
            } else {
                XPT.ShowError("错误", "XPT.Complete的参数必须为函数。");
            }
        });
    };
    //去掉页面错误，改用错误div弹窗显示
    me.OnError = function (msg, url, linenum) {
        if (!url) return true;
        if (_errorCount++ < _maxErrorCount) {
            document.body.addClass("init");
            if (_alerts) {
                for (var guid in _alerts) {
                    if (_alerts[guid].alertType == XPT.AlertType.Loading) {
                        XPT.CloseAlert(guid);
                    }
                }
            }
            var filename = "流程错误" + (new Date().format("yyyy-MM-dd HH:mm:ss"));
            //XPT.PrintScreen(filename);//<img style='padding:10px;border:1px solid #AAA;' src='http://10.22.112.23:8090/images/" + filename + ".png' />
            var body = ("当前页面： {0}<br>信息： {1}<br>行号： {2}<br>用户字符串： {3}<br>").format(window.location.href.replace(/&/g, "＆"), msg, linenum, navigator.userAgent);
            XPT.Alert({
                isshadecancel: true,
                alerttype: XPT.AlertType.Danger,
                buttontype: XPT.AlertButtonType.OK,
                title: '页面错误',
                content: ('<table class="error-info-table">' +
                    '<tr><td>信息</td><td>{0}</td></tr>' +
                    '<tr><td>地址</td><td>{1}</td></tr>' +
                    '<tr><td>行号</td><td>{2}</td></tr>' +
                    '<tr><td></td><td><a href="Mailto:season.shao1@nio.com?CC=zhuqing.chen@nio.com,buzz.lu@nio.com&Subject=WF系统错误&Body={3}">点击联系系统管理员</a> </td></tr>' +
                    '</table>').format(msg, url.replace(/\?/g, "?<br />"), linenum, encodeURI(body)),
                buttonevent: function (type) {
                    _errorCount--;
                    this.Close();
                }
            });
        }
    };

    window.onerror = me.OnError;
    if (HakuJs.AppInfo.msie) {
        switch (HakuJs.AppInfo.version) {
            case "9.0":
                document.body.className += " ie9";
                break;
            case "10.0":
                document.body.className += " ie10";
                break;
            case "11.0":
                document.body.className += " ie11";
                break;
            default:

        }
    }
})(window);