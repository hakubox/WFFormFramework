/// <reference path="Haku.js" />
/// <reference path="XPT.js" />

/**
 * 控件基础类，只是一个基础类，没有真实对应的控件
 * @class XptControl
 * @requires HakuJs
 * @requires XPT
 * @abstract
 * @author 李典
 * @constructor 构造函数
 * @param {HTMLElement} e 控件所属元素
 * @param {HTMLElement} [rowindex] 行索引
 */
function XptControl(e, rowindex) {
    /** @attr {String} [ColName] 对应字段名 */
    /** @attr {String} [valuechange] 值改变自动触发的事件，对应Flow.Event里的函数名 */
    /** @attr {String} [EditStepName="Applicant"] 可编辑节点名称（用,隔开） */
    /** @attr {Boolean} [Required] 值是否必填 */
    /** @attr {Number} [SummaryOrder] 自动采集用于生成标题的编号 */
    /** @attr {Boolean} [IsEnable] 在流程之外的状态时控件是否强制可用 */
    /** @attr {String} [State="ControlState.Normal"] 控件状态，此时控制的优先级最高（Label/Normal/ReadOnly/Disabled/Hidden） */
    /** @attr {String} [title] 提示文本 */
    if (!e) throw ("基础控件加载错误");
    var me = this;
    /**
     * @property {Date} [InitDate="new Date()"] 初始化时间
     */
    me.InitDate = new Date();
    /**
     * @property {String} [GUID] 唯一标识符GUID（自动生成）
     */
    me.GUID = HakuJs.NewGUID();
    /** @property {String} [CheckMessage] 控件弹出错误框时的错误文本。 */
    me.CheckMessage = "";
    /**
     * @property {HTMLElement} [element] 控件的内层的原始元素
     */
    me.BtnClick = null;
    if (e.hasAttribute("btn-click") && e.tagName.toLowerCase() == "input") {
        var _div = e.after('<div class="xpt-inputbtn"><div class="xpt-inputbtn-input"><div xpt="' + me.GUID + '"></div></div><div class="xpt-inputbtn-btn"><input type="button" class="wfbtn default small" value="..." /></div></div>');
        _div.querySelector("[xpt]").append(e);
        me.element = _div.querySelector("[xpt-input]");
        me.BtnClick = e.getAttribute("btn-click");
        _div.querySelector("input[type='button']").on("click", function (e) {
            if (Flow && Flow.Event) {
                if (!me.BtnClick) {
                    XPT.ShowError("事件绑定错误", me.TableName + "." + me.ColumnName + "的BtnClick事件绑定值为空。<br>事件应该被定义在Flow.Event内。");
                    me.element.style.backgroundColor = "red";
                } else if (!Flow.Event[me.BtnClick]) {
                    XPT.ShowError("事件未在form.js中编写，请检查Flow.Event." + me.BtnClick + "。");
                    me.element.style.backgroundColor = "red";
                } else {
                    Flow.Event[me.BtnClick].call(me, me.GUID);
                }
            } else {
                XPT.ShowError("调用ValueChange错误", "找不到Flow.Event." + me.BtnClick + "事件。");
            }
        });
    } else if (e.hasAttribute("xpt-checkbox")) {
        var _checkbox = e.querySelector("input");
        if (_checkbox != null) {
            for (var i = 0; i < e.attributes.length; i++) {
                _checkbox.setAttribute(e.attributes[i].name, e.attributes[i].value);
            }
            e.after(_checkbox);
            e.remove();
            e = _checkbox;
        }
        me.element = e.warp('<div xpt="' + me.GUID + '"></div>');
    } else {
        me.element = e.warp('<div xpt="' + me.GUID + '"></div>');
    }
    /**
     * @property {HTMLElement} divElement 控件的外层div元素，会在创建控件时自动生成
     */
    me.divElement = me.element.parentNode;
    if (rowindex != null) {
        /**
         * @property {Number} [RowIndex] 控件为行内控件时的行下标，再明细表内会自动更新
         */
        me.RowIndex = rowindex;
    }
    if (me.element.id) {
        /**
         * @property {Number} [id] 控件的唯一ID
         */
        me.id = me.element.getAttribute("id");
    }


    /**
     * @property {Object} Event 控件的事件集合对象
     */
    me.Event = {
        /**
         * @event ValueChange 值修改事件，元素上使用valuechange属性
         * @param {Object} newvalue 新值
         * @param {Object} oldvalue 旧值
         * @param {XptControl} con 控件本身
         */
        ValueChange: function (newvalue, oldvalue, con) { },
        /**
         * @event BeforeValueChange 值修改前事件，元素上使用beforevaluechange属性（可能会有问题，不建议使用）
         * @param {Object} newvalue 新值
         * @param {Object} oldvalue 旧值
         * @param {XptControl} con 控件本身
         * @preventable
         */
        BeforeValueChange: function (newvalue, oldvalue, con) { }
    }

    if (me.element.hasAttribute("valuechange")) {
        me.Event.ValueChange = function (newvalue, oldvalue, control) {
            if (Flow && Flow.Event) {
                var attr = me.element.getAttribute("valuechange");
                if (!attr) {
                    XPT.ShowError("事件绑定错误", me.TableName + "." + me.ColumnName + "的ValueChange事件绑定值为空。<br>事件应该被定义在Flow.Event内。");
                    me.element.style.backgroundColor = "red";
                } else Flow.Event[attr].call(me, newvalue, oldvalue, control);
            } else {
                XPT.ShowError("调用ValueChange错误", "找不到Flow.Event." + attr + "事件。");
            }
        }
    }

    if (me.element.hasAttribute("beforevaluechange")) {
        me.Event.BeforeValueChange = function (newvalue, oldvalue, control) {
            if (Flow && Flow.Event) {
                var attr = me.element.getAttribute("beforevaluechange");
                if (!attr) {
                    XPT.ShowError("事件绑定错误", me.TableName + "." + me.ColumnName + "的BeforeValueChange事件绑定值为空。<br>事件应该被定义在Flow.Event内。");
                    me.element.style.backgroundColor = "red";
                } else return Flow.Event[attr].call(me, newvalue, oldvalue, control);
            } else {
                XPT.ShowError("调用BeforeValueChange错误", "找不到Flow.Event." + attr + "事件。");
            }
        }
    }

    var attrs = [];
    if (HakuJs.GetAttrBoolean(me.element.getAttribute("readonly"))) me.divElement.setAttribute("readonly", "");
    if (HakuJs.GetAttrBoolean(me.element.getAttribute("disabled"))) me.divElement.setAttribute("disabled", "");
    if (HakuJs.GetAttrBoolean(me.element.getAttribute("required"))) me.divElement.setAttribute("required", "");
    if (HakuJs.GetAttrBoolean(me.element.getAttribute("hidden"))) me.divElement.setAttribute("hidden", "");

    me.divElement.setAttribute("class", me.element.getAttribute("class"));
    me.element.setAttribute("class", "");

    /**
     * @property {Object} [HistoryData] 控件的历史选择数据
     */
    me.HistoryData = null;

    //字段名
    var _cname = me.element.getAttribute("colname");
    if (_cname) {
        if (_cname.indexOf(".") > 0) {
            me.ColumnName = _cname.split(".")[1];
            //表名
            me.TableName = _cname.split(".")[0];
        } else {
            me.ColumnName = _cname;
            //表名
            if (rowindex == null) me.TableName = XPT.InitData.MasterTable;
            else me.TableName = e.parents("[xpt-detailtable]")[0].getAttribute("xpt-detailtable");
        }

        if (!me.TableName) {
            XPT.ShowError("控件属性配置错误", "控件的TableName属性值为空，有可能是ColName属性值格式错误或者为空。");
            me.element.style.backgroundColor = "red";
            document.body.className += "init";
        } else if (!me.ColumnName) {
            XPT.ShowError("控件属性配置错误", "控件的ColumnName属性值为空，有可能是ColName属性值格式错误或者为空。");
            me.element.style.backgroundColor = "red";
            document.body.className += "init";
        } else if (me.ColumnName.indexOf(" ") >= 0) {
            XPT.ShowError("控件属性配置错误", "控件的ColName属性值包含空格。");
            me.element.style.backgroundColor = "red";
            document.body.className += "init";
        }

        var _tobj = null;
        if (me.RowIndex != null) {
            XPT.TaskData[me.TableName][me.RowIndex]["_" + me.ColumnName] = me.value;
            _tobj = XPT.TaskData[me.TableName][me.RowIndex];
        } else {
            XPT.TaskData[me.TableName]["_" + me.ColumnName] = me.value;
            _tobj = XPT.TaskData[me.TableName];
        }

        me.divElement.setAttribute("_colname", me.ColumnName);

        Object.defineProperty(_tobj, me.ColumnName, {
            Configurable: false,
            get: function () {
                return me.value;
            },
            set: function (value) {
                me.HistoryData = me.value;
                me.value = value;
                if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);
            }
        });
    } else {
        if (me.element.getAttribute("xpt-comment") != null) {
        } else {
            return;
        }
    }

    me.value = {};

    /**
     * @method 控件初始化方法
     * @abstract
     */
    me.Init = function () {

    };

    /**
     * @property {Boolean} [IsDisabled=false] 控件是否禁用
     */
    me.IsDisabled = null;
    Object.defineProperty(me, "IsDisabled", {
        Configurable: false,
        get: function () {
            return HakuJs.GetAttrBoolean(me.divElement.getAttribute("disabled"));
        },
        set: function (value) {
            if (value) {
                me.element.setAttribute("disabled", "disabled");
                me.divElement.setAttribute("disabled", "disabled");
                switch (HakuJs.GetType(me)) {
                    case "XptRadioListControl":
                        me.divElement.find("input[type='radio']").attr("disabled", "disabled");
                        break;
                    default:
                        if (me.BtnClick) {
                            me.element.parents(".xpt-inputbtn")[0].setAttribute("disabled", "disabled");
                            me.element.parents(".xpt-inputbtn")[0].querySelector("input[type='button']").setAttribute("disabled", "disabled");
                        } else {
                            me.element.setAttribute("disabled", "disabled");
                        }
                        break;
                }
            } else {
                me.element.removeAttribute("disabled");
                me.divElement.removeAttribute("disabled");
                switch (HakuJs.GetType(me)) {
                    case "XptRadioListControl":
                        me.divElement.find("input[type='radio']").removeAttr("disabled");
                        break;
                    default:
                        if (me.BtnClick) {
                            me.element.parents(".xpt-inputbtn")[0].removeAttribute("disabled");
                            me.element.parents(".xpt-inputbtn")[0].querySelector("input[type='button']").removeAttribute("disabled");
                        } else {
                            me.element.removeAttribute("disabled");
                        }
                        break;
                }
            }
        }
    });
    /**
     * @property {Boolean} [IsReadonly=false] 控件是否只读
     */
    me.IsReadonly = null;
    Object.defineProperty(me, "IsReadonly", {
        Configurable: false,
        get: function () {
            return HakuJs.GetAttrBoolean(me.divElement.getAttribute("readonly"));
        },
        set: function (value) {
            if (value) {
                me.element.setAttribute("readonly", "readonly");
                me.divElement.setAttribute("readonly", "readonly");
                switch (HakuJs.GetType(me)) {
                    case "XptRadioListControl":
                        me.divElement.find("input[type='radio']").attr("readonly", "readonly");
                        break;
                    default:
                        if (me.BtnClick) {
                            me.element.parents(".xpt-inputbtn")[0].setAttribute("readonly", "readonly");
                        } else {
                            me.element.setAttribute("readonly", "readonly");
                        }
                        break;
                }
            } else {
                me.element.removeAttribute("readonly");
                me.divElement.removeAttribute("readonly");
                switch (HakuJs.GetType(me.element)) {
                    case "XptRadioListControl":
                        me.divElement.find("input[type='radio']").removeAttribute("readonly");
                        break;
                    default:
                        if (me.BtnClick) {
                            me.element.parents(".xpt-inputbtn")[0].removeAttribute("readonly");
                        } else {
                            me.element.removeAttribute("readonly");
                        }
                        break;
                }
            }
        }
    });
    /**
     * @property {Boolean} [IsRequired=false] 是否必填
     */
    me.IsRequired = null;
    Object.defineProperty(me, "IsRequired", {
        Configurable: false,
        get: function () {
            if (me.element.parents("[un-required]").length == 0) {
                return HakuJs.GetAttrBoolean(me.divElement.getAttribute("required"));
            }
        },
        set: function (value) {
            if (value) me.divElement.setAttribute("required", "");
            else me.divElement.removeAttribute("required");
        }
    });
    /**
     * @method 检测控件必填校验是否通过
     * @return {Boolean} 必填校验是否通过
     */
    me.CheckRequired = function () {
        if (me.IsRequired && !me.IsDisabled && !me.IsReadonly && !me.IsHidden) {
            var value = me.value;
            if (value === "" || value === null || value === undefined) {
                return false;
            }
        }
        return true;
    }

    /**
     * @property {Boolean} [IsHidden=false] 是否隐藏
     */
    me.IsHidden = null;
    Object.defineProperty(me, "IsHidden", {
        Configurable: false,
        get: function () {
            return HakuJs.GetAttrBoolean(me.divElement.getAttribute("hidden"));
        },
        set: function (value) {
            if (value) {
                me.element.setAttribute("hidden", "");
                me.divElement.setAttribute("hidden", "");
                if (me.BtnClick) {
                    me.divElement.parents(".xpt-inputbtn")[0].setAttribute("hidden", "");
                }
            } else {
                me.element.removeAttribute("hidden");
                me.divElement.removeAttribute("hidden");
                if (me.BtnClick) {
                    me.divElement.parents(".xpt-inputbtn")[0].removeAttribute("hidden");
                }
            }
        }
    });


    /**
     * @method 在控件上显示气泡错误
     * @param {String} msg 错误信息
     * @param {Number} [time] 错误信息，没有则始终显示
     */
    me.ShowError = function (msg, time) {
        var prev = me.element.prev();
        me.CheckMessage = (msg || 'System Error');
        if (!prev || prev.className.indexOf("tooltip") == -1) {
            var tooltip = me.element.before('<div class="xpt-tooltip error">' + me.CheckMessage + '</div>');
            if (tooltip.GetLeft() + tooltip.offsetWidth > document.documentElement.clientWidth - 30) {
                var _rightval = tooltip.GetLeft() + tooltip.offsetWidth - document.documentElement.clientWidth + 30;
                tooltip.setAttribute("style", 'right:calc(' + _rightval + 'px - 80px);');
            }
            tooltip.one("click", function (event) {
                tooltip.addClass("hide");
                setTimeout(function () { tooltip.remove(); }, 150);
                if (event.stopPropagation) event.stopPropagation();
            });
            setTimeout(function () { tooltip.addClass("show"); }, 0);
            //放置的自动隐藏代码
            if (time) {
                var isHover = false;
                tooltip.onmouseover = function () {
                    isHover = true;
                }
                tooltip.onmouseleave = function () {
                    isHover = false;
                }
                setTimeout(function () {
                    var timer = setInterval(function () {
                        if (!isHover) {
                            tooltip.addClass("hide");
                            setTimeout(function () { tooltip.remove(); }, 150);
                            clearInterval(timer);
                        }
                    }, 500);
                }, time);
            }
        }
    };
    /**
     * @method 隐藏气泡错误
     */
    me.CancelError = function () {
        me.CheckMessage = "";
        var _tooltip = me.element.parentNode.querySelector(".xpt-tooltip.error");
        if (_tooltip) {
            _tooltip.addClass("hide");
            setTimeout(function () { _tooltip.remove(); }, 150);
        }
    };
    me.element.on("focus", function () {
        if (!me.IsDisabled) me.divElement.addClass("focus");
    });
    me.element.on("blur", function (e) {
        me.divElement.removeClass("focus");
    });

    me.Hide = function () { if (me.divElement) { me.divElement.hide(); return me.divElement; } else { me.element.hide(); return me.element; } };
    me.Show = function () { if (me.divElement) { me.divElement.show(); return me.divElement; } else { me.element.show(); return me.element; } };
}
XptControl.prototype.constructor = XptControl;


/**
 * XPT控件：文本框{@img textbox.png 文本输入框}日期输入框{@img textbox_datetime.png 日期输入框}
 * @class XptTextControl 
 * @extends {XptControl}
 * @constructor 构造函数
 * @param {HTMLElement} e 控件所属元素
 * @param {HTMLElement} [rowindex] 行索引
 * @return {XptTextControl}
 */
function XptTextControl(e, rowindex) {

    /** @attr {Boolean} [IsMoney=false] 是否为金额 */
    /** @attr {String} [clear] 点击关闭按钮清空文本框时触发的事件，对应Flow.Event里的函数名 */
    /** @attr {String} [mincol] 当前控件为日期/时间类型时，所能选择的最小日期/时间字段，值可为表达式或 表.字段 */
    /** @attr {String} [maxcol] 当前控件为日期/时间类型时，所能选择的最大日期/时间字段，值可为表达式或 表.字段 */
    /** @attr {String} [Pattern] 控制文本的正则表达式 */
    /** @attr {String} [ResultPattern] 最终判断文本是否符合规则的的正则表达式 */
    /** @attr {Object} [DataType="XptTextDataType.String"] 文本的数据类型（String/Int/Double/DateTime/Date/Time） */
    /** @attr {Number} [MaxValue] 当类型为数字框时的控件可输入的最大值 */
    /** @attr {Number} [MinValue] 当类型为数字框时的控件可输入的最小值 */
    /** @attr {Number} [BtnClick] 右侧按钮的绑定事件，此时事件绑定在Flow.Event下 */

    //XptTextControl.prototype = new XptControl(e, rowindex);
    XptTextControl.prototype.constructor = XptTextControl;
    XptControl.apply(this, arguments);
    var me = this;
    me.divElement.className += " xpt-text";
    me.type = (me.element.getAttribute("data-type") || "string").toLowerCase();

    switch (me.type) {
        case "string":
            me.resultPattern = me.element.getAttribute("result-pattern");
            me.pattern = me.element.getAttribute("pattern");
            me.maxlength = HakuJs.toNumber(me.element.getAttribute("maxlength") || 2147483647);

            //添加清空按钮
            if (me.element.getAttribute("clear") !== "" && ((!me.IsReadonly && !me.IsDisabled) || me.element.hasAttribute("btn-click"))) {
                me.element.after('<i xpt-clear title="清空/Clear"></i>');
                me.divElement.querySelector("[xpt-clear]").on("click", function (e) {
                    var attr = me.element.getAttribute("clear");
                    if (!!attr) {
                        if (Flow && Flow.Event) {
                            if (!Flow.Event[attr]) {
                                XPT.ShowError("事件绑定错误", me.TableName + "." + me.ColumnName + "的ValueChange事件绑定值为空。<br>事件应该被定义在Flow.Event内。");
                                me.element.style.backgroundColor = "red";
                            } else {
                                Flow.Event[attr](me);
                                me.element.focus();
                            }
                        } else {
                            XPT.ShowError("调用ValueChange错误", "找不到Flow.Event." + attr + "事件。");
                        }
                    } else {
                        me.element.value = "";
                        me.element.focus();
                    }
                });
            }
            break;
        case "int":
            me.resultPattern = me.element.getAttribute("result-pattern") || "^-?[0-9]{1,20}$";
            me.pattern = me.element.getAttribute("pattern") || "^((-?)|(-?[0-9]{0,20}))$";
            me.maxvalue = me.element.getAttribute("maxvalue") == null ? 2147483647 : HakuJs.toNumber(me.element.getAttribute("maxvalue"));
            me.minvalue = me.element.getAttribute("minvalue") == null ? -2147483648 : HakuJs.toNumber(me.element.getAttribute("minvalue"));
            break;
        case "double":
            /**
             * @property {Number} [IsMoney] 是否为金额类型，是则自动增加千位分隔符（double类型下才可使用）
             */
            me.IsMoney = me.element.hasAttribute("money") ? true : false;
            if (me.IsMoney) {
                if (!me.element.hasAttribute("precision")) {
                    me.element.setAttribute("precision", "2");
                }
                me.element.value = HakuJs.toNumber(me.element.value.trim().replace(/,/g, '')).toMoney(+me.element.getAttribute("precision"));
            }
            /**
             * @property {Number} [Precision] 小数精度（double类型下才可使用）
             */
            me.Precision = me.element.hasAttribute("precision") ? parseInt(me.element.getAttribute("precision")) : null;
            //if (me.Precision != null) {
            //    me.element.setAttribute("dbvalue", me.value != null ? HakuJs.toNumber(me.value).toFixed(me.Precision) : "");
            //}

            me.resultPattern = me.element.getAttribute("result-pattern") || "^-?[0-9]{1,20}[.]?[0-9]{0,10}$";
            me.pattern = me.element.getAttribute("pattern") || "^((-?)|(-?[0-9]{0,20}[.]?[0-9]{0,10}))$";
            me.maxvalue = me.element.getAttribute("maxvalue") == null ? 2147483647 : HakuJs.toNumber(me.element.getAttribute("maxvalue"));
            me.minvalue = me.element.getAttribute("minvalue") == null ? -2147483648 : HakuJs.toNumber(me.element.getAttribute("minvalue"));

            break;
        case "datetime":
            me.element.addClass("Wdate");
            var maxvalue = "",
                minvalue = "";
            me.element.on(["focus", "click"], function () {
                document.activeElement.blur();
                //晚点改成可配置项
                var configDate = {
                    startDate: '%y-%M-%d %H:00:00', autoPickDate: false, maxDate: function () {
                        var maxcol = me.element.getAttribute("maxcol");
                        if (maxcol != null) {
                            var _val = "";
                            if (maxcol.indexOf("=") == 0) {
                                _val = new Function("me", "return " + maxcol.substr(1) + ";")(me);
                            } else {
                                if (maxcol.indexOf(".") > 0) {
                                    if (me.RowIndex != undefined) {
                                        if (HakuJs.GetType(XPT.TaskData[maxcol.split(".")[0]]) == "Array") {
                                            _val = XPT.TaskData[maxcol.split(".")[0]][me.RowIndex][maxcol.split(".")[1]];
                                        }
                                        else {
                                            _val = XPT.TaskData[maxcol.split(".")[0]][maxcol.split(".")[1]];
                                        }
                                    } else {
                                        _val = XPT.TaskData[maxcol.split(".")[0]][maxcol.split(".")[1]];
                                    }
                                } else {
                                    if (me.RowIndex != undefined) {
                                        _val = XPT.TaskData[me.TableName][me.RowIndex][maxcol];
                                    } else {
                                        _val = XPT.TaskData[me.TableName][maxcol];
                                    }
                                }
                            }
                            if (_val == null || _val == "Invalid Date") _val = "";
                            return _val.format("yyyy-MM-dd HH:mm:ss");
                        } else return "";
                    }(), minDate: function () {
                        var mincol = me.element.getAttribute("mincol");
                        if (mincol != null) {
                            var _val = "";
                            if (mincol.indexOf("=") == 0) {
                                _val = new Function("me", "return " + mincol.substr(1) + ";")(me);
                            } else {
                                if (mincol.indexOf(".") > 0) {
                                    if (me.RowIndex != undefined) {
                                        if (HakuJs.GetType(XPT.TaskData[mincol.split(".")[0]]) == "Array") {
                                            _val = XPT.TaskData[mincol.split(".")[0]][me.RowIndex][mincol.split(".")[1]];
                                        } else {
                                            _val = XPT.TaskData[mincol.split(".")[0]][mincol.split(".")[1]];
                                        }
                                    } else {
                                        _val = XPT.TaskData[mincol.split(".")[0]][mincol.split(".")[1]];
                                    }
                                } else {
                                    if (me.RowIndex != undefined) {
                                        _val = XPT.TaskData[me.TableName][me.RowIndex][mincol];
                                    } else {
                                        _val = XPT.TaskData[me.TableName][mincol];
                                    }
                                }
                            }
                            if (_val == null || _val == "Invalid Date") _val = "";
                            return _val.format("yyyy-MM-dd HH:mm:ss");
                        } else return "";
                    }(), dateFmt: 'yyyy-MM-dd HH:mm', onpicked: function (dp) {
                    }, oncleared: function (dp) {
                        setTimeout(function () { me.Check(); }, 100);
                    }, onpicking: function (dp) {
                        dp.show();
                    }, dchanged: function (dp) {
                        dp.dd.querySelector("iframe").contentWindow.document.querySelector(".tB").click();
                        dp.dd.querySelector("iframe").contentWindow.document.querySelector(".tB").focus();
                    }, Hchanged: function (dp) {
                        me.value = dp.cal.getNewDateStr();
                        setTimeout(function () { dp.hide(); me.Check(); }, 100);
                    }
                };
                if (me.element.hasAttribute("minute")) {
                    configDate.Hchanged = function (dp) {
                        setTimeout(function () {
                            dp.dd.querySelector("iframe").contentWindow.document.querySelector(".tE:not([disabled])").click();
                            dp.dd.querySelector("iframe").contentWindow.document.querySelector(".tE:not([disabled])").focus();
                        }, 50);
                    };
                    configDate.mchanged = function (dp) {
                        me.value = dp.cal.getNewDateStr();
                        setTimeout(function () { dp.hide(); me.Check(); }, 100);
                    };
                }
                WdatePicker(configDate);
            });
            break;
        case "date":
            me.element.addClass("Wdate");
            me.element.on(["focus", "click"], function () {
                document.activeElement.blur();
                WdatePicker({
                    startDate: '%y-%M-%d 00:00:00', doubleCalendar: true, dateFmt: 'yyyy-MM-dd', onpicked: function (dp) {
                    }, maxDate: function () {
                        var maxcol = me.element.getAttribute("maxcol");
                        if (maxcol != null) {
                            var _val = "";
                            if (maxcol.indexOf("=") == 0) {
                                _val = new Function("me", "return " + maxcol.substr(1) + ";")(me);
                            } else {
                                if (maxcol.indexOf(".") > 0) {
                                    if (me.RowIndex != undefined) {
                                        if (HakuJs.GetType(XPT.TaskData[maxcol.split(".")[0]]) == "Array") {
                                            _val = XPT.TaskData[maxcol.split(".")[0]][me.RowIndex][maxcol.split(".")[1]];
                                        }
                                        else {
                                            _val = XPT.TaskData[maxcol.split(".")[0]][maxcol.split(".")[1]];
                                        }
                                    } else {
                                        _val = XPT.TaskData[maxcol.split(".")[0]][maxcol.split(".")[1]];
                                    }
                                } else {
                                    if (me.RowIndex != undefined) {
                                        _val = XPT.TaskData[me.TableName][me.RowIndex][maxcol];
                                    } else {
                                        _val = XPT.TaskData[me.TableName][maxcol];
                                    }
                                }
                            }
                            if (_val == null || _val == "Invalid Date") _val = "";
                            return _val.format("yyyy-MM-dd HH:mm:ss");
                        } else return "";
                    }(), minDate: function () {
                        var mincol = me.element.getAttribute("mincol");
                        if (mincol != null) {
                            var _val = "";
                            if (mincol.indexOf("=") == 0) {
                                _val = new Function("me", "return " + mincol.substr(1) + ";")(me);
                            } else {
                                if (mincol.indexOf(".") > 0) {
                                    if (me.RowIndex != undefined) {
                                        if (HakuJs.GetType(XPT.TaskData[mincol.split(".")[0]]) == "Array") {
                                            _val = XPT.TaskData[mincol.split(".")[0]][me.RowIndex][mincol.split(".")[1]];
                                        }
                                        else {
                                            _val = XPT.TaskData[mincol.split(".")[0]][mincol.split(".")[1]];
                                        }
                                    } else {
                                        _val = XPT.TaskData[mincol.split(".")[0]][mincol.split(".")[1]];
                                    }
                                } else {
                                    if (me.RowIndex != undefined) {
                                        _val = XPT.TaskData[me.TableName][me.RowIndex][mincol];
                                    } else {
                                        _val = XPT.TaskData[me.TableName][mincol];
                                    }
                                }
                            }
                            if (_val == null || _val == "Invalid Date") _val = "";
                            return _val.format("yyyy-MM-dd HH:mm:ss");
                        } else return "";
                    }(), oncleared: function (dp) {
                        setTimeout(function () { me.Check(); }, 100);
                    }, dchanged: function (dp) {
                        setTimeout(function () { me.Check(); }, 100);
                    }
                });
            });
            break;
        default:
    }

    me.value = {};
    Object.defineProperty(me, "value", {
        Configurable: false,
        get: function () {
            switch (me.type) {
                case "string":
                    return me.element.value;
                    break;
                case "int":
                    return me.element.value !== "" ? HakuJs.toNumber(me.element.value) : null;
                    break;
                case "double":
                    if (me.IsMoney) return me.element.value !== "" ? HakuJs.toNumber(me.element.value.replace(/,/g, '')) : null;
                    else return me.element.value !== "" ? HakuJs.toNumber(me.element.value) : null;
                    break;
                case "datetime":
                    var _date = new Date(me.element.value.replace(/-/g, "/"));
                    return _date != 'Invalid Date' ? _date : null;
                    break;
                case "date":
                    var _date = new Date(me.element.value.replace(/-/g, "/"));
                    return _date != 'Invalid Date' ? _date : null;
                    break;
                case "time":
                    return me.element.value;
                    break;
                default:
            }
        },
        set: function (value) {
            if (me.Event.BeforeValueChange(value, me.HistoryData, me) === false) {
                me.value = me.HistoryData;
                return;
            }
            if (me.Check(value)) {
                var result = "";
                switch (me.type) {
                    case "string":
                        result = '' + (value !== null ? value : '');
                        break;
                    case "int":
                        result = value !== null && value !== "" && value !== undefined ? value : null;
                        break;
                    case "double":
                        result = value !== null && value !== "" && value !== undefined ? value : null;
                        if (me.IsMoney) {
                            result = HakuJs.toNumber(('' + result).replace(/,/g, '')).toMoney(me.Precision);
                        } else if (me.Precision != null) {
                            result = HakuJs.toNumber(result).toFixed(me.Precision);
                        }

                        break;
                    case "datetime":
                        var _type = HakuJs.GetType(value);
                        switch (_type) {
                            case "Date":
                                result = value.format("yyyy-MM-dd HH:mm");
                                break;
                            case "String":
                                if (HakuJs.GetType(value) == "String") {
                                    if (new Date(value.replace(/-/g, "/")) == "Invalid Date") {
                                        me.ShowError("日期格式错误。");
                                    } else {
                                        result = new Date(value.replace(/-/g, "/")).format("yyyy-MM-dd HH:mm");
                                    }
                                }
                                break;
                            default:
                        }
                        break;
                    case "date":
                        var _type = HakuJs.GetType(value);
                        switch (_type) {
                            case "Date":
                                result = value.format("yyyy-MM-dd");
                                break;
                            case "String":
                                if (HakuJs.GetType(value) == "String") {
                                    if (new Date(value.replace(/-/g, "/").replace(/[TU ]?[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/g, "")) == "Invalid Date") {
                                        me.ShowError("日期格式错误。");
                                    } else {
                                        result = new Date(value.replace(/-/g, "/").replace(/[TU ]?[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/g, "")).format("yyyy-MM-dd");
                                    }
                                }
                                break;
                            default:
                        }
                        break;
                    case "time":
                        result = me.element.value;
                        break;
                    default:
                }
                if (HakuJs.IsIE9 && result == null) me.element.value = "";
                else if (me.element.value != result) {
                    me.element.value = result;
                }
                setTimeout(function () {
                    if (me.IsRequired) {
                        if (me.element.value == "") me.element.setAttribute("title", "请填写。");
                        else me.element.setAttribute("title", me.element.value || "");
                    } else if (!me.IsDisabled && !me.IsReadonly) {
                        me.element.setAttribute("title", me.element.value || "");
                    } else {
                        me.element.removeAttribute("title");
                    }
                }, 10);

                me.Event.ValueChange(value, me.HistoryData, me);
                if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);
            }
        }
    });

    if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);

    me.element.historyData = me.element.value;
    me.element.historySelectionStart = 0;
    me.element.historySelectionEnd = 0;
    //输入检测
    me.element.on("input", function (e) {
        var _txt = me.element.value;
        switch (me.type) {
            case "date":
            case "datetime":
            case "time":
                break;
            case "double":
                if (me.IsMoney) {
                    _txt = _txt.replace(/,/g, '');
                }
            default:
                try {
                    if (me.pattern) {
                        if (!new RegExp(me.pattern, "g").test(_txt)) {
                            me.ShowError("输入字符串格式有误。", 2000);
                            me.element.historySelectionStart = me.element.selectionStart;
                            me.element.historySelectionEnd = me.element.selectionEnd;
                            me.element.value = me.element.historyData;
                            me.element.selectionStart = me.element.historySelectionStart - 1;
                            me.element.selectionEnd = me.element.historySelectionEnd - 1;
                        } else {
                            me.CancelError();
                            me.element.historyData = me.element.value;
                            me.element.historySelectionStart = me.element.selectionStart;
                            me.element.historySelectionEnd = me.element.selectionEnd;
                            return;
                        }
                    } else {
                        me.element.historySelectionStart = me.element.selectionStart;
                        me.element.historySelectionEnd = me.element.selectionEnd;
                    }
                } catch (e) {

                }
                if (!me.pattern) {
                    me.value = me.element.value;
                    me.element.selectionStart = me.element.historySelectionStart;
                    me.element.selectionEnd = me.element.historySelectionEnd;
                }
                break;
        }
    });

    //输入检测2：焦点离开后验证
    me.element.on("blur", function (e) {
        //首先去除前后空格
        if (me.type != "string" && me.element.value) me.element.value = me.element.value.trim();
        switch (me.type) {
            case "date":
            case "datetime":
                break;
            case "double":
                if (me.IsMoney) {
                    me.value = me.value != null ? HakuJs.toNumber(me.value).toMoney(me.Precision) : null;
                } else if (me.Precision != null) {
                    me.value = me.value != null ? HakuJs.toNumber(me.value).toFixed(me.Precision) : null;
                }
                break;
            default:
                if (!me.IsDisabled && !me.IsReadonly) me.Check();
        }
        if (me.pattern) {
            me.value = me.element.value;
        }
    });
    //附加按键功能
    me.element.on("keydown", function (e) {
        switch (me.type) {
            case "int":
            case "double":
                switch (e.keyCode) {
                    case 38:
                        me.value = me.value + 1;
                        e.preventDefault();
                        break;
                    case 40:
                        me.value = me.value - 1;
                        e.preventDefault();
                        break;
                }
                break;
        }
    });

    /**
     * @method 基础格式错误验证
     * @param {String} [val] 代替this.value进行验证的参数，赋null时可跳过验证
     * @return {Boolean} 是否验证通过
     */
    me.Check = function (val) {
        if (val === null) {
            me.CancelError();
            return true;
        }
        var value = val != null ? val : me.element.value;
        //包含大部分的基础验证
        if (value !== "" && value != null) {
            //类型验证
            switch (me.type) {
                case "string":
                    value = ('' + value).trim();
                    //字数验证
                    if (me.maxlength && value.length > me.maxlength) {
                        me.ShowError("输入字数过多，最多为" + me.maxlength + "字。");
                        return false;
                    }
                    //正则验证
                    if (me.pattern && !(me.element.value == "" || new RegExp(me.pattern, "g").test(me.element.value))) {
                        me.ShowError("输入内容格式不正确。");
                        return false;
                    }
                    if (me.resultPattern && !(me.element.value == "" || new RegExp(me.resultPattern, "g").test(me.element.value))) {
                        me.ShowError("输入内容格式不正确。");
                        return false;
                    }
                    break;
                case "int":
                    if (!/^-?[0-9]+$/.test(value)) {
                        me.ShowError("不符合整数格式。");
                        return false;
                    }
                    //数字大小验证
                    if (me.maxvalue && HakuJs.toNumber(value) > me.maxvalue) {
                        me.ShowError("输入值过大。");
                        return false;
                    }
                    if (me.minvalue && HakuJs.toNumber(value) < me.minvalue) {
                        me.ShowError("输入值过小。");
                        return false;
                    }
                    break;
                case "double":
                    if (me.IsMoney) value = ('' + value).replace(/,/g, '');
                    if (!/^-?[0-9]+.?[0-9]*$/.test('' + value) || ('' + value) == "" && me.IsRequired) {
                        me.ShowError("不符合小数格式。");
                        return false;
                    }
                    //数字大小验证
                    if (me.maxvalue && HakuJs.toNumber(value) > me.maxvalue) {
                        me.ShowError("输入值过大。");
                        return false;
                    }
                    if (me.minvalue && HakuJs.toNumber(value) < me.minvalue) {
                        me.ShowError("输入值过小。");
                        return false;
                    }
                    break;
                case "date":
                    if (HakuJs.GetType(value) == "Date") break;
                    value = value.replace(/\//g, "-").replace(/[TU ]?[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/g, "");
                    if (!/^(20||19)?[0-9]{2}-[0-9]{1,2}-[0-9]{1,2}$/.test(value) && new Date(value.replace(/-/g, "/"))) {
                        me.ShowError("输入值不符合日期类型。");
                        return false;
                    }
                    break;
                case "time":
                    if (!/^[0-2]\d:\d{2}(:\d{2})?$/.test(value)) {
                        me.ShowError("输入值不符合时间类型。");
                        return false;
                    }
                    break;
                default:
            }
        } else if (me.IsRequired && !me.IsHidden && !me.IsDisabled && value !== null) {
            me.ShowError("输入值不能为空。", 30000);
            return false;
        }
        me.CancelError();
        return true;
    }
    me.element.Check = me.Check;
}


/**
 * XPT控件：标签
 * @class XptLabelControl
 * @extends {XptControl}
 * @constructor 构造函数
 * @param {HTMLElement} e 控件所属元素
 * @param {HTMLElement} [rowindex] 行索引
 * @return {XptLabelControl}
 */
function XptLabelControl(e, rowindex) {
    XptLabelControl.prototype.constructor = XptLabelControl;
    XptControl.apply(this, arguments);
    var me = this;
    me.divElement.className += " xpt-label";
    me.type = (me.element.getAttribute("data-type") || "string").toLowerCase();

    //初始化
    if (me.RowIndex != null) XPT.TaskData[me.TableName][me.RowIndex][me.ColumnName] = me.element.innerHTML;
    else XPT.TaskData[me.TableName][me.ColumnName] = me.element.innerHTML;

    if (me.element.hasAttribute("money")) {
        if (!me.element.hasAttribute("precision")) {
            me.element.setAttribute("precision", "2");
        }
        var _num = HakuJs.toNumber((me.element.hasAttribute("dbvalue") ? me.element.getAttribute("dbvalue") : me.element.innerHTML).replace(/,/g, ""));
        me.element.setAttribute("dbvalue", '' + _num);
        me.element.innerHTML = _num.toMoney(me.element.getAttribute("precision"));
    }
    if (me.type == "date")
    {
        var _d = me.element.innerHTML;
        me.element.innerHTML = (_d && _d != "Invalid Date") ? _d.toDate().format("yyyy-MM-dd") : "";
    }

    //value属性
    Object.defineProperty(me, "value", {
        Configurable: false,
        get: function () {
            if (me.element.hasAttribute("money")) {
                return HakuJs.toNumber((me.element.hasAttribute("dbvalue") ? me.element.getAttribute("dbvalue") : me.element.innerHTML).replace(/,/g, ""));
            } else if (me.element.hasAttribute("precision")) {
                return HakuJs.toNumber((me.element.hasAttribute("dbvalue") ? me.element.getAttribute("dbvalue") : me.element.innerHTML));
            } else {
                return me.element.hasAttribute("dbvalue") ? me.element.getAttribute("dbvalue") : me.element.innerHTML;
            }
        },
        set: function (value) {
            if (me.element.hasAttribute("money")) {
                me.element.innerHTML = HakuJs.toNumber(('' + value).replace(/,/g, "")).toMoney(HakuJs.toNumber(me.element.getAttribute("precision")));
            } else if (me.element.hasAttribute("precision")) {
                me.element.innerHTML = HakuJs.toNumber(value).toFixed(parseInt(me.element.getAttribute("precision")));
            } else {
                me.element.innerHTML = value;
            }
            me.element.setAttribute("dbvalue", '' + value);
            if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);
        }
    });

    if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);

    /**
     * @method 基础格式错误验证【注：当前控件下总返回True】
     * @param {String} [val] 代替this.value进行验证的参数
     * @return {Boolean} 是否验证通过（返回True）
     */
    me.Check = function (val) {
        return true;
    }

    me.Init();
}


/**
 * XPT控件：下拉选择框{@img dropdownlist.png 下拉选择框}
 *
 *     @example
 *     //单个Item属性值的构造如下，暂不支持属性赋值操作
 *     {Index: 0, Text: "Yes", Value: "1", IsDisabled: false, IsChecked: true}
 *
 * @class XptSelectControl 
 * @extends {XptControl}
 * @constructor 构造函数
 * @param {HTMLElement} e 控件所属元素
 * @param {HTMLElement} [rowindex] 行索引
 * @return {XptSelectControl}
 */
function XptSelectControl(e, rowindex) {
    /** @attr {String} [ViewCode] 过滤条件（在COM_View表中添加数据，ViewType=2） */
    /** @attr {String} [DefaultText] 默认显示文本 */
    /** @attr {String} [BlankText] 默认空白文本 */
    /** @attr {String} [BindText] 在明细表用于绑定值的属性 */
    /** @attr {String} [SourceTable] 数据源表名（不推荐使用） */
    /** @attr {String} [Filter] 过滤条件（不推荐使用） */
    XptLabelControl.prototype.constructor = XptLabelControl;
    XptControl.apply(this, arguments);
    var me = this;
    me.divElement.className += " xpt-select";

    //初始化
    if (me.RowIndex != null) XPT.TaskData[me.TableName][me.RowIndex][me.ColumnName] = me.element.innerHTML;
    else XPT.TaskData[me.TableName][me.ColumnName] = me.element.innerHTML;
    //value属性
    Object.defineProperty(me, "value", {
        Configurable: false,
        get: function () {
            return me.element.value;
        },
        set: function (value) {
            if (me.Event.BeforeValueChange(value, me.HistoryData, me) === false) {
                me.value = me.HistoryData;
                return;
            }
            var _con = me.element.querySelector("option[value='" + value + "']");
            if (_con) {
                me.element.value = value;
                me.Event.ValueChange(value, me.HistoryData, me);
                me.HistoryData = value;
                if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);
            } else {
                me.ShowError("未查询到值'" + value + "'。");
            }
        }
    });

    /**
     * @property {Object} Items 下拉列表的所有项
     */
    Object.defineProperty(me, "Items", {
        Configurable: false,
        get: function () {
            var _obj = {};
            me.element.querySelectorAll("option").forEach(function (item, index) {
                _obj[item.getAttribute("value") || item.innerHTML] = {
                    Index: index,
                    Text: item.innerHTML,
                    Value: item.getAttribute("value") || item.innerHTML,
                    IsDisabled: item.hasAttribute("disabled"),
                    IsChecked: me.value == (item.getAttribute("value") || item.innerHTML)
                };
            });
            return _obj;
        },
        set: function (value) {
            var _value = me.value;
            me.Clear();
            var _keys = [];
            var _propertys = Object.keys(value);
            for (var i = 0; i < _propertys.length; i++) {
                _keys.push(value[_propertys[i]].val);
                me.AddItem(value[_propertys[i]].txt, value[_propertys[i]].val);
            }
            if (_keys.indexOf(_value) >= 0) me.value = _value;

            setTimeout(function () {
                if (me.IsRequired) {
                    if (me.element.value == "") me.element.setAttribute("title", "请选择。");
                    else me.element.setAttribute("title", me.element.value || "");
                } else if (!me.IsDisabled && !me.IsReadonly) {
                    me.element.setAttribute("title", me.element.value || "");
                } else {
                    me.element.removeAttribute("title");
                }
            }, 10);
        }
    });
    /**
     * @property {Object} SelectedItem 当前选中的下拉列表项
     */
    Object.defineProperty(me, "SelectedItem", {
        Configurable: false,
        get: function () {
            var _items = this.element.options;
            for (var i = 0; i < _items.length; i++) {
                if (_items[i].selected) {
                    return {
                        Index: i,
                        Text: _items[i].text,
                        Value: _items[i].value || _items[i].text,
                        IsDisabled: _items[i].disabled,
                        IsChecked: _items[i].selected
                    };
                }
            }
            return null;
        }
    });

    /**
     * @method Clear 清空下拉列表项
     */
    me.Clear = function () {
        me.element.innerHTML = "";
    };

    /**
     * @method AddItem 增加单个下拉列表项
     * @param {String} text 文本
     * @param {String} [value] 值
     * @param {String} [index] 下标
     */
    me.AddItem = function (text, value, index) {
        if (value === undefined) value = text;
        if (index === undefined) {
            me.element.add(new Option(text, value));
        } else {
            me.element.add(new Option(text, value), me.element.querySelectorAll("option")[index]);
        }
    };

    /**
     * @method AddItemRange 批量增加下拉列表项（固定加到末尾）
     * @param {Object} items 需要增加项的集合(Array:String/Object)
     */
    me.AddItemRange = function (items) {
        var _type = HakuJs.GetType(items);
        switch (_type) {
            case "Array":
                for (var i = 0; i < items.length; i++) {
                    me.AddItem(items[i].text, items[i].value);
                }
                break;
            case "Object":
                for (var item in items) {
                    me.AddItem(items[item], item);
                }
                break;
            default:
        }
    };

    /**
     * @method 根据值删除下拉列表项
     * @param {String} value 下拉列表项的值
     */
    me.RemoveItemByValue = function (value) {
        if (value !== undefined) {
            var options = me.element.querySelectorAll("option");
            for (var i = 0; i < options.length; i++) {
                if (options[i].getAttribute("value") == value) {
                    options[i].remove();
                    break;
                }
            }
        }
    };

    /**
     * @method 根据值批量删除下拉列表项
     * @param {Array} array 需要删除项的值的数组(Array:String)
     */
    me.RemoveItemRangeByValue = function (array) {
        if (array !== undefined) {
            var options = me.element.querySelectorAll("option");
            for (var i = 0; i < array.length; i++) {
                for (var o = 0; o < options.length; o++) {
                    if (options[o].getAttribute("value") == array[i]) {
                        options[o].remove();
                        break;
                    }
                }
            }
        }
    };

    /**
     * @method 根据索引删除项
     * @param {Number} index 索引
     */
    me.RemoveItemByIndex = function (index) {
        if (index !== undefined) {
            var options = me.element.querySelectorAll("option");
            for (var i = 0; i < options.length; i++) {
                if (index == i) {
                    options[i].remove();
                    break;
                }
            }
        }
    };

    /**
     * @method 根据值禁用某项
     * @param {String} value
     */
    me.DisabledByValue = function (value) {
        me.element.querySelector("[value='" + value + "']").setAttribute("disabled", "disabled");
    };

    /**
     * @method 根据值启用某项
     * @param {String} value
     */
    me.EnabledByValue = function (value) {
        me.element.querySelector("[value='" + value + "']").removeAttribute("disabled");
    };

    //输入检测
    me.element.on("change", function (e) {
        me.value = me.element.value;
    });

    //输入检测2：焦点离开后验证
    me.element.on("blur", function (e) {
        //首先去除前后空格
        if (me.type != "string" && me.element.value) me.element.value = me.element.value.trim();
        //再验证格式/数据
        me.Check();
        //me.value = this.value;
    });

    /**
     * @method 基础格式错误验证（仅包含空值校验）
     * @param {String} [val] 代替this.value进行验证的参数
     * @return {Boolean} 是否验证通过
     */
    me.Check = function (val) {
        var value = val != null ? val : me.element.value;
        if (!me.CheckRequired()) {
            me.ShowError("选择项不能为空。", 30000);
            return false;
        }
        me.CancelError();
        return true;
    }

    if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);

    me.Init();

    me.element.innerHTML = me.element.innerHTML.trim();
}


/**
 * XPT控件：单选列表控件{@img radiolist.png 单选列表控件}
 *
 *     @example
 *     //单个Item属性值的构造如下，暂不支持属性赋值操作
 *     {Index: 0, Text: "Yes", Value: "1", IsDisabled: false, IsChecked: true}
 *
 * @class XptRadioListControl 
 * @extends {XptControl}
 * @constructor 构造函数
 * @param {HTMLElement} e 控件所属元素
 * @param {HTMLElement} [rowindex] 行索引
 * @return {XptRadioListControl}
 *
 */
function XptRadioListControl(e, rowindex) {
    /** @attr {Boolean} [IsShowOptions='false'] 是否在审批时显示所有项 */

    XptRadioListControl.prototype.constructor = XptRadioListControl;
    XptControl.apply(this, arguments);
    var me = this;
    me.divElement.className += " xpt-radiolist";
    me.GroupName = me.element.querySelector("li") != null ? me.element.querySelector("li").querySelector("input").getAttribute("name") : HakuJs.NewGUID();

    //value属性
    Object.defineProperty(me, "value", {
        Configurable: false,
        get: function () {
            if (me.element.querySelectorAll("input[type='radio']:checked").length > 0) return me.element.querySelectorAll("input[type='radio']:checked")[0].value;
            else return null;
        },
        set: function (value) {
            if (me.Event.BeforeValueChange(value, me.HistoryData, me) === false) {
                me.value = me.HistoryData;
                return;
            }
            var _con = me.element.querySelector("input[type='radio'][value='" + value + "']");
            if (_con) {
                if (_con) {
                    _con.checked = true;
                    _con.setAttribute("checked", "checked");
                }
                me.Event.ValueChange(me.value, me.HistoryData, me);
                me.HistoryData = value;
            } else {
                _con = me.element.querySelector("input[type='radio']:checked");
                if (_con) {
                    _con.checked = false;
                    _con.removeAttribute("checked");
                }
                me.Event.ValueChange(me.value, me.HistoryData, me);
            }
            if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);
        }
    });

    if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);

    //输入检测
    me.element.live("[type='radio']", "change", function (e) {
        me.value = me.value;
    });

    /**
     * @method 基础格式错误验证（仅包含空值校验）
     * @param {String} [val] 代替this.value进行验证的参数
     * @return {Boolean} 是否验证通过
     */
    me.Check = function (val) {
        var value = val != null ? val : this.value;
        if (!me.CheckRequired()) {
            me.ShowError("输入值不能为空。", 30000);
            return false;
        }
        me.CancelError();
        return true;
    };

    /**
     * @property {Object} Items 单选列表的所有项
     */
    Object.defineProperty(me, "Items", {
        Configurable: false,
        get: function () {
            var _obj = {};
            me.element.querySelectorAll("li").forEach(function (item, index) {
                var _val = item.querySelector("input").getAttribute("value"), _txt = item.querySelector("label").innerHTML;
                _obj[_val] = {
                    Index: index,
                    Text: _txt,
                    Value: _val,
                    IsDisabled: item.hasAttribute("disabled"),
                    IsChecked: me.value == _val
                };
            });
            return _obj;
        },
        set: function (value) {
            var _value = me.value;
            me.Clear();
            me.AddItemRange(value);
            me.value = _value;
        }
    });

    /**
     * @property {Object} SelectItem 当前选择项
     * @readonly
     */
    Object.defineProperty(me, "SelectItem", {
        Configurable: false,
        get: function () {
            var _lis = me.element.querySelectorAll("li");
            for (var i = 0; i < _lis.length; i++) {
                var _input = _lis[i].querySelector("input");
                if (me.value == _input.value) {
                    return {
                        Index: i,
                        Text: _lis[i].querySelector("label").innerHTML,
                        Value: _input.value,
                        IsDisabled: _lis[i].hasAttribute("disabled"),
                        IsChecked: true
                    }
                }
            }
            return null;
        }
    });

    /**
     * @method 清空单选列表项
     */
    me.Clear = function () {
        me.element.innerHTML = "";
    };

    /**
     * @method 增加单个下拉列表项
     * @param {String} text 文本
     * @param {String} [value] 值
     * @param {String} [index] 下标
     */
    me.AddItem = function (text, value, index) {
        if (value === undefined) value = text;
        var _id = HakuJs.NewGUID();
        if (index === undefined) {
            me.element.append('<li><input id="' + _id + '" type="radio" name="' + me.GroupName + '" value="' + value + '"><label for="' + _id + '">' + text + '</label></li>');
        } else {
            me.element.querySelector("li")[index].after('<li><input id="' + _id + '" type="radio" name="' + me.GroupName + '" value="' + value + '"><label for="' + _id + '">' + text + '</label></li>');
        }
    };

    /**
     * @method AddItemRange 批量增加单选项（固定加到末尾）
     * @param {Object} items 需要增加项的集合(Array:String/Object)
     */
    me.AddItemRange = function (items) {
        if (HakuJs.GetType(items) == "Array") {
            for (var i = 0; i < items.length; i++) {
                me.AddItem(items[i].txt, items[i].val);
            }
        } else {
            for (var item in items) {
                me.AddItem(items[item].txt || items[item], items[item].val || item);
            }
        }
    };

    /**
     * @method 根据值删除下拉列表项
     * @param {String} value 下拉列表项的值
     */
    me.RemoveItemByValue = function (value) {
        if (value !== undefined) {
            var options = me.element.querySelectorAll("input[type='radio']");
            for (var i = 0; i < options.length; i++) {
                if (options[i].getAttribute("value") == value) {
                    options[i].parentNode.remove();
                    break;
                }
            }
        }
    };

    /**
     * @method 根据值批量删除下拉列表项
     * @param {Array} array 需要删除项的值的数组(Array:String)
     */
    me.RemoveItemRangeByValue = function (array) {
        if (array !== undefined) {
            var options = me.element.querySelectorAll("input[type='radio']");
            for (var i = 0; i < array.length; i++) {
                for (var o = 0; o < options.length; o++) {
                    if (options[o].getAttribute("value") == array[i]) {
                        options[o].parentNode.remove();
                        break;
                    }
                }
            }
        }
    };

    /**
     * @method 根据索引删除项
     * @param {Number} index 索引
     */
    me.RemoveItemByIndex = function (index) {
        if (index !== undefined) {
            var options = me.element.querySelectorAll("input[type='radio']");
            for (var i = 0; i < options.length; i++) {
                if (i == index) {
                    options[i].parentNode.remove();
                    break;
                }
            }
        }
    };

    var _init = function () {
        if (rowindex != null) {
            var _tgroupid = HakuJs.NewGUID();
            me.divElement.querySelectorAll("li").forEach(function (item, index) {
                var _tguid = HakuJs.NewGUID();
                item.querySelector("input").attr("id", _tguid).attr("name", _tgroupid);
                item.querySelector("label").setAttribute("for", _tguid);
            });
        }
    }

    _init();
}


/**
 * XPT控件：复选框控件{@img checkbox.png 复选框控件}
 * @class XptCheckBoxControl 
 * @extends {XptControl}
 * @constructor 构造函数
 * @param {HTMLElement} e 控件所属元素
 * @param {HTMLElement} [rowindex] 行索引
 * @return {XptCheckBoxControl}
 */
function XptCheckBoxControl(e, rowindex) {
    XptCheckBoxControl.prototype.constructor = XptCheckBoxControl;
    XptControl.apply(this, arguments);
    var me = this;
    me.divElement.className += " xpt-checkbox";
    //value属性
    Object.defineProperty(me, "value", {
        Configurable: false,
        get: function () {
            return me.element.checked == null ? (parseInt(me.element.getAttribute("value") || 0) ? 1 : 0) : (me.element.checked ? 1 : 0);
        },
        set: function (value) {
            if (me.Event.BeforeValueChange(value, me.HistoryData, me) === false) {
                me.value = me.HistoryData;
                return;
            }
            me.element.checked = !!value;
            me.element.setAttribute("value", !!value ? "1" : "0");
            me.Event.ValueChange(value, me.HistoryData, me);
            me.HistoryData = value;
            if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);
        }
    });

    if (me.TableName && me.RowIndex == null) XPT.__moon.set(me.TableName + '.' + me.ColumnName, me.value);

    //输入检测
    me.element.live("[type='checkbox']", "change", function (e) {
        me.value = me.value;
    });

    /**
     * @method 基础格式错误验证【注：当前控件下总返回True】
     * @param {String} [val] 代替this.value进行验证的参数
     * @return {Boolean} 是否验证通过（返回True）
     */
    me.Check = function (val) {
        return true;
    };


    var _init = function () {
    };

    _init();
}


/**
 * XPT控件：图片上传控件（最低支持IE10）{@img fileupload.png 图片上传控件}
 * @class XPTFileUpload 
 * @requires HakuJs
 * @constructor 构造函数
 * @param {HTMLElement} e 控件所属元素
 * @param {Number} [rowindex] 行索引
 * @return {XPTFileUpload}
 */
function XPTFileUpload(e, rowindex) {

    /** @attr {String} [uploadevent] 上传文件时自动触发的事件，对应Flow.Event里的函数名 */
    /** @attr {String} [changeevent] 改变文件时自动触发的事件，对应Flow.Event里的函数名 */
    /** @attr {String} [EditStepName="Applicant"] 可编辑节点名称（用,隔开） */
    /** @attr {Boolean} [Required] 值是否必填 */
    /** @attr {Number} [SummaryOrder] 自动采集用于生成标题的编号 */
    /** @attr {Boolean} [IsEnable] 在流程之外的状态时控件是否强制可用 */
    /** @attr {String} [State="ControlState.Normal"] 控件状态，此时控制的优先级最高（Normal/ReadOnly/Disabled/Hidden） */
    /** @attr {String} [title] 提示文本 */
    /** @attr {String} [FormLocation] 保存文件到数据库的标记点 */
    /** @attr {String} [filetype] 可上传的文件类型，可参考input[type='file']标签的 accept 属性 */
    /** @attr {Number} [MaxLength] 最大文件个数 */

    if (e.parents("[template]").length > 0) return;
    XPTFileUpload.prototype.constructor = XPTFileUpload;
    if (!e) throw ("基础控件加载错误");
    var me = this;
    /** @property {Date} [InitDate="new Date()"] 初始化时间 */
    me.InitDate = new Date();
    /** @property {String} [GUID] 唯一标识符GUID（自动生成） */
    me.GUID = HakuJs.NewGUID();
    /** @property {String} [CheckMessage] 控件弹出错误框时的错误文本。 */
    me.CheckMessage = "";

    /**
     * @property {Object} Event 事件
     */
    me.Event = {
        /**
         * @event Complete 点击节点事件
         */
        ClickItem: function (e, id) { },
        /**
         * @event Success 获取数据成功事件
         */
        Success: function (json) { },
        /**
         * @event Error 获取数据错误事件
         */
        Error: function (json) { },
        /**
         * @event DataChange 数据改变事件
         */
        DataChange: function () { },
        /**
         * @event Upload 上传文件事件
         * @param {Array} files 变更的文件列表
         * @param {HTMLElement} control 当前控件，也可以用this调用
         */
        Upload: function (files, control) {
            if (Flow && Flow.Event) {
                var attr = me.element.getAttribute("uploadevent");
                if (!attr) return;
                if (!Flow.Event[attr]) {
                    XPT.ShowError("事件绑定错误", "Upload事件绑定值为空。<br>事件应该被定义在Flow.Event内。");
                    me.element.style.backgroundColor = "red";
                } else return Flow.Event[attr].call(me, files, control);
            } else {
                XPT.ShowError("调用Upload错误", "找不到Flow.Event." + attr + "事件。");
            }
        },
        /**
         * @event Change 改变文件事件
         * @param {Array} files 变更的文件列表
         * @param {HTMLElement} control 当前控件，也可以用this调用
         */
        Change: function (files, control) {
            if (Flow && Flow.Event) {
                var attr = me.element.getAttribute("changeevent");
                if (!attr) return;
                if (!Flow.Event[attr]) {
                    XPT.ShowError("事件绑定错误", "Change事件绑定值为空。<br>事件应该被定义在Flow.Event内。");
                    me.element.style.backgroundColor = "red";
                } else return Flow.Event[attr].call(me, files, control);
            } else {
                XPT.ShowError("调用Change错误", "找不到Flow.Event." + attr + "事件。");
            }
        }
    };

    me.element = e;
    /** @property {Boolean} [HasRemark=false] 是否包含备注 */
    me.HasRemark = me.element.hasAttribute("remark");
    /** @property {Number} [MaxLength=100] 最大文件数 */
    me.MaxLength = me.element.getAttribute("maxlength") || 100;
    /** @property {String} [FileType] 可选择文件类型 */
    me.FileType = ('' + me.element.getAttribute("filetype")).toLowerCase() || '';
    me.element.removeAttribute("filetype");
    var _fileTypeAccept = {
        image: 'image/jpeg,image/png',
        document: 'application/msword,application/x-xls,application/pdf,text/plain,text/html,application/x-ppt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    me.element.append('<label for="' + me.GUID + '" class="btn" xpt-fileupload-selectbtn>选择</label>')
        .append('<input id="' + me.GUID + '" type="file" ' + (me.FileType == '' ? '' : ('accept="' + me.FileType + '"')) + ' multiple="multiple" />');
    me.FilesElement = me.element.querySelector("[xpt-fileupload-files]");
    me.HistoryFiles = me.element.querySelector("[xpt-fileupload-json]");
    me.SelectBtn = me.element.querySelector('[xpt-fileupload-selectbtn]');
    me.Element = me.InputFile = me.element.querySelector('input[type="file"]');

    me.ImgSize = (me.element.getAttribute("img-size") || "100px,100px").split(",");
    me.OneMaxSize = parseInt(me.element.getAttribute("one-maxsize") || "10485760");
    me.TotalMaxSize = parseInt(me.element.getAttribute("total-maxsize") || "10485760");

    me.InputFile.on("change", function (e, control) {
        if (me.Files.length + control.files.length > me.MaxLength) {
            XPT.ShowError("错误", "当前上传区域最多只能上传" + me.MaxLength + "个附件。");
            try { me.element.querySelector('[type="file"]').value = ""; } catch (e) { }
            return;
        }
        var _files = control.files;
        if (!_files) {
            try {
                var _fso = new ActiveXObject("Scripting.FileSystemObject");
                if (_fso.FileExists(control.value)) {
                    _fileObj = _fso.GetFile(control.value);
                    _files.push(_fileObj);
                }
            } catch (e) {
                console.log("IE浏览器版本过低。");
            }
        }
        me.ReadFiles(_files);// || me.element.querySelector("input[type='file']").value.split(",")
    });

    me.FileLocation = me.element.getAttribute("location") || "1";
    me.IsPreview = me.element.getAttribute("preview") != null;
    /** @property {Boolean} IsDisabled 控件是否禁用 */
    me.IsDisabled = me.element.hasAttribute("disabled");
    /** @property {Boolean} HasFileReader 是否包含FileReader */
    me.HasFileReader = typeof FileReader != undefined;
    /** @property {Boolean} HasFormData 是否包含FormData */
    me.HasFormData = !!window.FormData;
    /** @property {Boolean} CanProgress 是否包含滚动条 */
    me.CanProgress = 'upload' in new XMLHttpRequest;
    if (me.CanProgress) {
        me.element.append('<div class="progress progress-hide"><div class="progress-bar progress-bar-striped active" style="width: 0%;"><span class="progress-bar-value">0%</span></div></div>');
        me.Progress = me.element.querySelector('.progress');
    }


    /** @property {Boolean} CanDraggable 是否支持拖放功能 */
    me.CanDraggable = 'draggable' in document.createElement('span');
    /** @property {Array} Files 文件列表 */
    me.Files = [];
    me.AcceptedTypes = ['image/png', 'image/jpeg', 'image/gif'];

    //var progress = document.getElementById('uploadprogress'),
    //var fileupload = document.getElementById('upload');

    if (HakuJs.IsIE9) me.element.setAttribute("disabled", "disabled");

    /**
     * @private
     * @method 处理文件
     */
    me.PreviewFile = function (file) {
        file.GUID = HakuJs.NewGUID();
        file.IsInit = false;
        me.Files.push(file);
        if (me.HasFileReader === true && me.AcceptedTypes.indexOf(('' + file.type).toLowerCase()) >= 0 && me.IsPreview) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var _img = me.FilesElement.append('<div fileinfo title="' + file.name + '" class="imginfo-init imginfo-uploading" guid="' + file.GUID + '"><img style="max-width:' + me.ImgSize[0] + ';max-height:' + me.ImgSize[1] + ';" src="' + event.target.result + '" /><span class="imgtitle" style="width:' + me.ImgSize[1] + ';">' + file.name + '</span>' + (me.IsDisabled ? '' : '<i class="fa fa-fw fa-remove" title="删除/Delete"></i>') + (me.HasRemark ? '<input name="remark" type="text" placeholder="备注/Remark" value="" />' : '') + '</div>').lastChild;
                setTimeout(function () {
                    _img.removeClass("imginfo-init");
                }, 50);
                if (me.HasRemark) me.FilesElement.lastChild.querySelector('[name="remark"]').on("blur", me.ChangeRemark);
            };
            reader.readAsDataURL(file);
        } else {
            me.FilesElement.innerHTML += '<div fileinfo guid="' + file.GUID + '"><a class="filelink" target="_blank" href="' + event.target.result + '">' + file.name + '</a>' + (me.IsDisabled ? '' : '<i class="fa fa-fw fa-remove" title="删除/Delete"></i>') + (me.HasRemark ? '<input name="remark" type="text" placeholder="备注/Remark" value="" />' : '') + '</div>';
            if (me.HasRemark) me.FilesElement.lastChild.querySelector('[name="remark"]').on("blur", me.ChangeRemark);
        }
    }

    me.ChangeRemark = function (e, control) {
        XPT.Post({
            url: XPT.Url.FilesUpload,
            params: {
                changeremark: "1",
                id: control.parents("[guid]")[0].getAttribute("guid"),
                remark: control.value
            },
            success: function (d) {
            },
            error: function (d) {
                XPT.ShowError("备注修改失败", d.exception);
            }
        });
    }

    /**
     * @method RemoveFile 根据id删除文件
     * @param {Boolean} isfalsedelete 是否假删除
     */
    me.RemoveFile = function (guid, isfalsedelete) {
        var _file = null;
        for (var i = 0; i < me.Files.length; i++) {
            if (me.Files[i].GUID == guid) _file = me.Files[i];
        }

        var _guid = XPT.Alert({
            isshadecancel: true,
            alerttype: XPT.AlertType.Info,
            buttontype: XPT.AlertButtonType.YesNo,
            title: "信息",
            content: "是否删除文件'" + _file.name + "'？",
            buttonevent: function (result) {
                if (result == XPT.AlertReturnType.Yes) {
                    XPT.Post({
                        url: XPT.Url.FileDelete,
                        IsEscape: false,
                        ContentType: "application/json;charset=UTF-8",
                        params: {
                            FileId: _file.id,
                            TaskId: XPT.InitData.TaskId
                        },
                        success: function (d) {
                            var _arrs = [];
                            if (isfalsedelete) {
                                for (var i = 0; i < me.Files.length; i++) {
                                    if (me.Files[i].GUID == guid) {
                                        _arrs.push(me.Files[i]);
                                        me.Files[i].IsFalseDelete = true;
                                        break;
                                    }
                                }
                                me.FilesElement.querySelector("[guid='" + guid + "']").setAttribute("del", "");
                            } else {
                                for (var i = 0; i < me.Files.length; i++) {
                                    if (me.Files[i].GUID == guid) {
                                        _arrs.push(me.Files[i]);
                                        me.Files.splice(i, 1);
                                        break;
                                    }
                                }
                                me.FilesElement.querySelector("[guid='" + guid + "']").addClass("imginfo-init");
                                setTimeout(function () { me.FilesElement.querySelector("[guid='" + guid + "']").remove(); }, 120);
                            }
                            me.Event.Change(_arrs, me);
                        },
                        error: function (d) {
                            XPT.ShowError("文件删除失败", d.exception);
                        }
                    });
                }
                XPT.CloseAlert(_guid);
            }
        });
    };

    /**
     * @method Fill 填充控件的文件列表，但不真实操作文件
     * @param {Array} files 文件对象列表
     * @param {Boolean} [isDelete=true] 是否清空原有文件（默认清空）
     */
    me.Fill = function (files, isDelete) {
        if (isDelete == undefined) isDelete = true;
        if (isDelete == true) {
            me.Files = [];
            me.FilesElement.innerHTML = "";
        }
        var _files = files;

        for (var i = 0; i < _files.length; i++) {
            _files[i].GUID = _files[i].fileId;
            me.Files.push({
                IsInit: true,
                id: _files[i].id,
                fileId: _files[i].fileId,
                GUID: _files[i].id,
                name: _files[i].name,
                path: _files[i].path
            });
            if (!_files[i].remark) _files[i].remark = '';
            if (me.IsPreview) {
                me.FilesElement.append('<div fileinfo ' + (_files[i].isDeleted ? 'del' : '') + ' title="' + _files[i].name + '" guid="' + _files[i].fileId + '"><img style="max-width:' + me.ImgSize[0] + ';max-height:' + me.ImgSize[1] + ';" src="/File/Download?fileId=' + _files[i].fileId + '" /><span class="imgtitle" style="width:' + me.ImgSize[1] + ';">' + _files[i].name + '</span>' + (me.IsDisabled ? '' : '<i class="fa fa-fw fa-remove" title="删除/Delete"></i>') + (me.HasRemark ? (me.IsDisabled ? ('<span title="' + _files[i].remark + '" name="remark">' + _files[i].remark + '</span>') : '<input name="remark" type="text" placeholder="备注/Remark" value="' + _files[i].remark + '" />') : '') + '</div>');
            } else {
                me.FilesElement.append('<div fileinfo ' + (_files[i].isDeleted ? 'del' : '') + ' title="' + _files[i].name + '" guid="' + _files[i].fileId + '"><a class="filelink" target="_blank" href="/File/Download?fileId=' + _files[i].fileId
                    + '">' + _files[i].name + '</a>' + (me.IsDisabled ? '' : '<i class="fa fa-fw fa-remove" title="删除/Delete"></i>') + (me.HasRemark ? (me.IsDisabled ? ('<span title="' + _files[i].remark + '" name="remark">' + _files[i].remark + '</span>') : '<input name="remark" type="text" placeholder="备注/Remark" value="' + _files[i].remark + '" />') : '') + '</div>');
            }
        }
    }

    /**
     * @method ReadFiles 读取文件
     */
    me.ReadFiles = function (files) {
        if (files) {
            var formData = me.HasFormData ? new FormData() : null;
            formData.append("taskId", XPT.InitData.TaskId);
            formData.append("nodeId", XPT.InitData.NodeId);
            formData.append("location", me.FileLocation);
            formData.append("wfid", XPT.InitData.WfdId);
            for (var i = files.length - 1; i >= 0; i--) {
                if (files[i].size < me.OneMaxSize) {
                    if (me.HasFormData) formData.append('file', files[i]);
                    me.PreviewFile(files[i]);
                } else {
                    XPT.ShowError("上传文件过大", "单个文件不能超过" + XPT.BytesToSize(me.OneMaxSize) + "，'" + files[i].name + "'的体积为" + XPT.BytesToSize(files[i].size) + "。");
                    try { me.element.querySelector('[type="file"]').value = ""; } catch (e) { }
                    return;
                }
            }
        }
        me.SelectBtn.setAttribute("disabled", "disabled");
        // now post a new XHR request
        //if (me.HasFormData) {
        var xhr;  //定义XMLHttpRequest对象

        if (window.XMLHttpRequest) { //如果当前浏览器支持XMLHttp Request，则创建XMLHttpRequest对象  
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) { //如果当前浏览器支持Active Xobject，则创建ActiveXObject对象
            //xmlobj = new ActiveXObject("Microsoft.XMLHTTP");  
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    xhr = false;
                }
            }
        }
        xhr.open('POST', XPT.Url.FilesUpload);

        if (me.CanProgress) {
            me.ProgressTxt = me.Progress.querySelector(".progress-bar-value");
            me.ProgressBar = me.Progress.querySelector(".progress-bar");
            me.Progress.removeClass("progress-hide");
            me.ProgressTxt.innerHTML = "";
            if (xhr.upload) xhr.upload.onprogress = function (event) {
                if (event.lengthComputable) {
                    var complete = (event.loaded / event.total * 100 | 0);
                    me.ProgressTxt.innerHTML = complete + "%";
                    me.ProgressBar.style.width = complete + "%";
                }
            }
        }
        //xhr.onload = function (e) {};
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                me.Progress.addClass("progress-hide");
                me.SelectBtn.removeAttribute("disabled");
                me.FilesElement.querySelectorAll(".imginfo-uploading").removeClass("imginfo-uploading");

                var _data = JSON.parse(xhr.responseText);
                if (_data.isSuccess) {
                    var _arrs = [];
                    for (var i = 0; i < _data.result.length; i++) {
                        for (var o = 0; o < me.Files.length; o++) {
                            if (_data.result[i].name == me.Files[o].name) {
                                if (!me.Files[o].IsInit) {
                                    me.Files[o].IsInit = true;
                                    var _con = me.FilesElement.querySelector("[guid='" + me.Files[o].GUID + "']");
                                    _con.setAttribute("guid", _data.result[i].id);
                                    me.Files[o].GUID = _data.result[i].id;
                                    me.Files[o].id = _data.result[i].id;
                                    if (!me.IsPreview) {
                                        _con.querySelector(".filelink").setAttribute("href", '/File/Download?fileid=' + _data.result[i].id);
                                    }
                                    me.Files[o].name = _data.result[i].name;
                                    me.Files[o].fileId = _data.result[i].fileId;
                                    me.Files[o].taskId = _data.result[i].taskId;
                                    me.Files[o].path = _data.result[i].path;
                                    me.Files[o].creatorUserId = _data.result[i].creatorUserId;
                                    me.Files[o].creatorUserName = _data.result[i].creatorUserName;
                                    me.Files[o].creationTime = new Date(_data.result[i].creationTime);
                                    me.Files[o].isDeleted = _data.result[i].isDeleted;
                                    me.Files[o].fileLinkId = _data.result[i].fileLinkId;
                                    _arrs.push(me.Files[o]);
                                }
                            }
                        }
                    }
                    me.Event.Upload(_arrs, me);
                    me.Event.Change(_arrs, me);
                    try { me.element.querySelector('[type="file"]').value = ""; } catch (e) { }
                }
            }
        };
        xhr.send(formData);
        //}
    };

    /**
     * @method _init 初始化函数
     * @private
     */
    var _init = function () {
        var _files = JSON.parse(me.HistoryFiles.getAttribute("value"));
        for (var i = 0; i < _files.length; i++) {
            _files[i].GUID = _files[i].id;
            _files[i].IsInit = true;
            me.Files.push(_files[i]);
            if (!_files[i].remark) _files[i].remark = '';
            if (me.IsPreview) {
                me.FilesElement.append('<div fileinfo ' + (_files[i].isDeleted ? 'del' : '') + ' title="' + _files[i].name + '" guid="' + _files[i].id + '"><img style="max-width:' + me.ImgSize[0] + ';max-height:' + me.ImgSize[1] + ';" src="/' + _files[i].path + '" /><span class="imgtitle" style="width:' + me.ImgSize[1] + ';">' + _files[i].name + '</span>' + (me.IsDisabled ? '' : '<i class="fa fa-fw fa-remove" title="删除/Delete"></i>') + (me.HasRemark ? (me.IsDisabled ? ('<span title="' + _files[i].remark + '" name="remark">' + _files[i].remark + '</span>') : '<input name="remark" type="text" placeholder="备注/Remark" value="' + _files[i].remark + '" />') : '') + '</div>');
            } else {
                me.FilesElement.append('<div fileinfo ' + (_files[i].isDeleted ? 'del' : '') + ' title="' + _files[i].name + '" guid="' + _files[i].id + '"><a class="filelink" target="_blank" href="/File/Download?fileId=' + _files[i].fileId + '">' + _files[i].name + '</a>' + (me.IsDisabled ? '' : '<i class="fa fa-fw fa-remove" title="删除/Delete"></i>') + (me.HasRemark ? (me.IsDisabled ? ('<span title="' + _files[i].remark + '" name="remark">' + _files[i].remark + '</span>') : '<input name="remark" type="text" placeholder="备注/Remark" value="' + _files[i].remark + '" />') : '') + '</div>');
            }
        }
        if (me.HasRemark) me.FilesElement.querySelectorAll('[name="remark"]').on("blur", me.ChangeRemark);

        if (me.CanDraggable) {
            document.body.on("dragover", function () { if (!me.element.hasClass('drag')) me.element.addClass('drag'); return false; });
            document.body.on("dragleave", function (e) {
                if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= document.body.clientWidth || e.clientY >= document.body.clientHeight) {
                    if (me.element.hasClass('drag')) me.element.removeClass('drag');
                }
            });
            document.body.on("drop", function (e) { console.log("drop"); setTimeout(function () { if (me.element.hasClass('drag')) me.element.removeClass('drag'); }, 200); });
            me.element.ondrop = function (e) {
                me.ReadFiles(e.dataTransfer.files);
            }
        }
        var _isDel = false;
        me.FilesElement.live(".fa-remove", "click", function (e, control) {
            me.RemoveFile(control.parents("[fileinfo]")[0].getAttribute("guid"), control.getAttribute("isfalsedelete") != null);
            _isDel = true;
        });
        me.FilesElement.live("[name='remark']", "click", function (e, control) {
            _isDel = true;
        });
        //开启预览效果则能通过弹出框预览
        if (me.IsPreview) {
            me.FilesElement.live("[fileinfo]", "click", function (e, control) {
                if (!_isDel) {
                    var dialog = new Dialog({
                        isshadecancel: true,
                        classCss: 'size-auto',
                        title: control.getAttribute("title"),
                        element: "<img src='" + control.querySelector("img").getAttribute("src") + "' />",
                        buttontype: XPT.AlertButtonType.OK,
                        buttonEvent: function (result, con) { dialog.Close(); }
                    });
                }
                _isDel = false;
            }, true);
        }
    };

    /**
     * @property {Boolean} [IsRequired=false] 是否必填
     */
    me.IsRequired = null;
    Object.defineProperty(me, "IsRequired", {
        Configurable: false,
        get: function () {
            if (me.element.parents("[un-required]").length == 0) {
                return HakuJs.GetAttrBoolean(me.element.getAttribute("required"));
            }
        },
        set: function (value) {
            if (value) me.element.setAttribute("required", "");
            else me.element.removeAttribute("required");
        }
    });

    /**
     * @method Check 基础格式错误验证（仅包含空文件校验）
     * @param {String} [val] 代替this.value进行验证的参数
     * @return {Boolean} 是否验证通过
     */
    me.Check = function (val) {
        if (!me.CheckRequired()) {
            me.ShowError("请至少上传一个文件。", 30000);
            return false;
        }
        me.CancelError();
        return true;
    };

    /**
     * @method CheckRequired 检测控件必填校验是否通过
     * @return {Boolean} 必填校验是否通过
     */
    me.CheckRequired = function () {
        if (me.IsRequired && !me.IsDisabled && !me.IsHidden) {
            if (me.Files.length == 0 && !HakuJs.IsIE9) {
                return false;
            }
        }
        return true;
    };

    /**
     * @method ShowError 在控件上显示气泡错误
     * @param {String} msg 错误信息
     * @param {Number} [time] 错误信息，没有则始终显示
     */
    me.ShowError = function (msg, time) {
        var prev = me.element.prev();
        me.CheckMessage = (msg || 'System Error');
        if (!prev || prev.className.indexOf("tooltip") == -1) {
            var tooltip = me.element.before('<div class="xpt-tooltip error">' + me.CheckMessage + '</div>');
            if (tooltip.GetLeft() + tooltip.offsetWidth > document.documentElement.clientWidth - 30) {
                var _rightval = tooltip.GetLeft() + tooltip.offsetWidth - document.documentElement.clientWidth + 30;
                tooltip.setAttribute("style", 'right:calc(' + _rightval + 'px - 80px);');
            }
            tooltip.one("click", function (event) {
                tooltip.addClass("hide");
                setTimeout(function () { tooltip.remove(); }, 150);
                if (event.stopPropagation) event.stopPropagation();
            });
            setTimeout(function () { tooltip.addClass("show"); }, 0);
            //放置的自动隐藏代码
            if (time) {
                var isHover = false;
                tooltip.onmouseover = function () {
                    isHover = true;
                }
                tooltip.onmouseleave = function () {
                    isHover = false;
                }
                setTimeout(function () {
                    var timer = setInterval(function () {
                        if (!isHover) {
                            tooltip.addClass("hide");
                            setTimeout(function () { tooltip.remove(); }, 150);
                            clearInterval(timer);
                        }
                    }, 500);
                }, time);
            }
        }
    };

    /**
     * @method 隐藏气泡错误
     */
    me.CancelError = function () {
        me.CheckMessage = "";
        var _tooltip = me.element.parentNode.querySelector(".xpt-tooltip.error");
        if (_tooltip) {
            _tooltip.addClass("hide");
            setTimeout(function () { _tooltip.remove(); }, 150);
        }
    };

    _init();
}