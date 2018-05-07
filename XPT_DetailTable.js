/// <reference path="Haku.js" />
/// <reference path="XPT.js" />
'use strict';
/**
 * 明细表控件{@img detailtable.png 明细表控件}
 * @p 明细表控件对象会生成到XPT.Controls._TempControl内。
 * @p 隐藏行功能：明细表对象并不提供隐藏行功能，而是通过css实现，通过往table元素上增加hidecol属性隐藏行，例：hidecol=",1,2,"
 * @class XptDetailTable
 * @requires HakuJs
 * @requires XPT
 * @constructor 构造函数
 * @param {HTMLElement} e 控件所属元素
 */
function XptDetailTable(e) {
    if (!e) throw ("明细表控件加载错误");
    var me = this;
    var _stepCount = 1;

    /** @property {HTMLElement} Element 表格本身的HTML元素 */
    me.Element = e;
    /** @property {String} TableName 关联的子表名称 */
    me.TableName = e.getAttribute("xpt-detailtable");
    /** @property {Number} [StepCount=1] 行号增加步长 */
    Object.defineProperty(me, "StepCount", {
        Configurable: false,
        get: function () {
            return _stepCount;
        },
        set: function (value) {
            if (typeof (+value) == "number" && !isNaN(+value)) {
                if (_stepCount != (+value)) {
                    _stepCount = (+value);
                    me.RefreshRowIndex();
                }
            } else {
                XPT.ShowError("错误", "StepCount赋值类型错误，必须为数字类型，当前为[" + value + "]。")
            }
        }
    });

    /**
     * @method 刷新行号（一般情况下不需要手动调用，会覆盖原始行号）
     */
    me.RefreshRowIndex = function () {
        if (XPT.TaskData[me.TableName]) {
            for (var i = XPT.TaskData[me.TableName].length - 1; i >= 0; i--) {
                XPT.TaskData[me.TableName][i].rowid = (i + 1) * me.StepCount;
                for (var item in XPT.Controls[me.TableName][i]) {
                    if (XPT.Controls[me.TableName][i][item] != null && XPT.Controls[me.TableName][i][item].RowIndex != null) {
                        XPT.Controls[me.TableName][i][item].RowIndex = i;
                    }
                }
            }
        }
    }

    if (e.hasAttribute("stepcount")) {
        me.StepCount = HakuJs.toNumber(e.getAttribute("stepcount"));
    }

    if (!me.TableName) {
        return;
    } else if ((XPT.InitData.DetailTable || "").split(",").indexOf(me.TableName) < 0) {
        XPT.ShowError("明细表不存在", "当前明细表的xpt-detailtable属性值在明细表列表中不存在，请确认UserInfo控件中是否存在此明细表。");
        e.style.backgroundColor = "red";
        document.body.className += "init";
    }
    /**
     * @property {String} _columnRowCount 自动计算标题行数（总的标题行数-1）
     * @private
     */
    var _columnRowCount = e.querySelectorAll("thead > tr").length - 1;
    /** @property {String} [Title] 标题（暂无作用） */
    me.Title = "";
    /** @property {Object[]} Columns 明细表的所有列 */
    me.Columns = [];
    var _columnTr = e.querySelectorAll("thead > tr").last();
    _columnTr.setAttribute("column", "");
    var _columnThs = _columnTr.querySelectorAll("th");
    for (var i = 0; i < _columnThs.length; i++) {
        me.Columns.push({ Name: _columnThs[i].getAttribute("name"), Title: _columnThs[i].innerHTML.trim(), Index: i + 1, Checked: true });
    }

    me.Events = {
        /**
         * @event BeforeAddRow 新增行前触发事件（在Events属性内）
         * @param {Number} index 新增行索引
         * @param {Object} data 新增行数据
         * @preventable
         */
        BeforeAddRow: me.Element.hasAttribute("beforeaddrow") ? Flow.Event[me.Element.getAttribute("beforeaddrow")] : function (index, data) { },
        /**
         * @event BeforeRemoveRow 删除行前触发事件（在Events属性内）
         * @param {Number} index 删除行索引
         * @preventable
         */
        BeforeRemoveRow: me.Element.hasAttribute("beforeremoverow") ? Flow.Event[me.Element.getAttribute("beforeremoverow")] : function (index) { },
        /**
         * @event AfterAddRow 新增行后触发事件（在Events属性内）
         * @param {Number} index 新增行索引
         * @param {Object} data 新增行数据
         */
        AfterAddRow: me.Element.hasAttribute("afteraddrow") ? Flow.Event[me.Element.getAttribute("afteraddrow")] : function (index, data) { },
        /**
         * @event AfterRemoveRow 删除行后触发事件（在Events属性内）
         * @param {Number} index 删除行索引
         */
        AfterRemoveRow: me.Element.hasAttribute("afterremoverow") ? Flow.Event[me.Element.getAttribute("afterremoverow")] : function (index) { }
    };

    /**
     * @property {Boolean} IsDisabled 是否禁用
     * @deprecated
     */
    me.IsDisabled = null;
    Object.defineProperty(me, "IsDisabled", {
        Configurable: false,
        get: function () {
            return HakuJs.GetAttrBoolean(me.Element.getAttribute("disabled"));
        },
        set: function (value) {
            if (value) {
                me.Element.setAttribute("disabled", "");
            } else {
                me.Element.removeAttribute("disabled");
            }
        }
    });

    /**
     * @property {Boolean} IsReadonly 是否只读
     */
    me.IsReadonly = null;
    Object.defineProperty(me, "IsReadonly", {
        Configurable: false,
        get: function () {
            return HakuJs.GetAttrBoolean(me.Element.getAttribute("readonly"));
        },
        set: function (value) {
            if (value) {
                me.Element.setAttribute("readonly", "");
            } else {
                me.Element.removeAttribute("readonly");
            }
        }
    });

    /**
     * @property {Boolean} HasFilter 根据明细表格是否包含hc属性，判断是否开启手动筛选功能
     */
    me.HasFilter = me.Element.hasAttribute("hc");
    //获取批量删除按钮
    var btn_muldel = me.Element.querySelector("[xpt-detailtable-command='muldelrow']");
    if (btn_muldel != null) {
        if (me.Element.querySelector("[xpt-repeat][checked]") == null) btn_muldel.setAttribute("disabled", "");
        else btn_muldel.removeAttribute("disabled");
    }
    /**
     * @property {Boolean} 是否开启快速选择行（鼠标是否按下）
     * @private
     */
    var _quickSelect = false;
    document.body.on("mouseup", function () {
        _quickSelect = false;
    });
    me.Element.live(".check", "mousedown", function (e, data) {
        if (!me.IsReadonly) {
            _quickSelect = true;

            var target = e.srcElement || e.target;
            var _tr = target.parents("[xpt-repeat]");
            if (_tr.length > 0) {
                if (_tr[0].hasAttribute("checked")) {
                    _tr[0].removeAttribute("checked");
                } else {
                    _tr[0].setAttribute("checked", "");
                }
            }

            if (btn_muldel != null) {
                if (me.Element.querySelector("[xpt-repeat][checked]") == null) btn_muldel.setAttribute("disabled", "");
                else btn_muldel.removeAttribute("disabled");
            }
        }
    });
    me.Element.live(".check", "mouseover", function (e, data) {
        if (_quickSelect) {
            var target = e.srcElement || e.target;
            var _tr = target.parents("[xpt-repeat]");
            if (_tr.length > 0) {
                if (_tr[0].hasAttribute("checked")) {
                    _tr[0].removeAttribute("checked");
                } else {
                    _tr[0].setAttribute("checked", "");
                }
            }
        }

        if (btn_muldel != null) {
            if (me.Element.querySelector("[xpt-repeat][checked]") == null) btn_muldel.setAttribute("disabled", "");
            else btn_muldel.removeAttribute("disabled");
        }
    });

    //搜索命令并绑定事件
    me.Element.live("[xpt-detailtable-command]", "click", function (e) {
        if (me.IsReadonly) return;
        var target = e.srcElement || e.target;
        var command = target.getAttribute("xpt-detailtable-command");
        if (!!command) {
            switch (command) {
                case "addrow":
                    me.AddRow();
                    break;
                case "insertrow":
                    me.AddRow(target.parents("[xpt-repeat]")[0].index() - 1);
                    break;
                case "delrow":
                    me.RemoveRow(target);
                    break;
                case "copyrow":
                    me.CopyRow(target.parents("[xpt-repeat]")[0].index() - 1, target.parents("[xpt-repeat]")[0].index() - 1);
                    break;
                case "moveup":
                    break;
                case "movedown":
                    break;
                case "muldelrow":
                    var guid = XPT.Alert({
                        title: "信息/Info",
                        content: "确认吗？/Are you sure?",
                        isshadecancel: true,
                        buttontype: XPT.AlertButtonType.YesNo,
                        buttonevent: function (result) {
                            if (result == XPT.AlertReturnType.Yes) {
                                var _arr = me.Element.querySelectorAll("[xpt-repeat]");
                                for (var i = _arr.length - 1; i >= 0; i--) {
                                    if (_arr[i].hasAttribute("checked")) {
                                        me.RemoveRowAt(i, false);
                                    }
                                }
                                me.RefreshRowIndex();
                            }
                            XPT.CloseAlert(guid);
                        }
                    });
                    break;
                case "selectall":
                    var _arr = me.Element.querySelectorAll("[xpt-repeat]");
                    for (var i = _arr.length - 1; i >= 0; i--) {
                        if (!_arr[i].hasAttribute("checked")) _arr[i].setAttribute("checked", "");
                    }
                    if (me.Element.querySelector("[xpt-repeat][checked]") == null) btn_muldel.setAttribute("disabled", "");
                    else btn_muldel.removeAttribute("disabled");
                    break;
                case "invertselect":
                    var _arr = me.Element.querySelectorAll("[xpt-repeat]");
                    for (var i = _arr.length - 1; i >= 0; i--) {
                        if (_arr[i].hasAttribute("checked")) _arr[i].removeAttribute("checked");
                        else _arr[i].setAttribute("checked", "");
                    }
                    if (me.Element.querySelector("[xpt-repeat][checked]") == null) btn_muldel.setAttribute("disabled", "");
                    else btn_muldel.removeAttribute("disabled");
                    break;
                default:
            }
        }
    });

    /**
     * @method 初始化表格
     * @private
     */
    var _init = function () {
        //稍微晚点再做隐藏显示列。
        //分解表格（通过表格形成配置），比如列信息
        if (me.HasFilter) {
            //给列头上增加序号列和操作列，操作列头上遍历列并加上去
            var _tdFilterHtml = '';
            for (var i = 0; i < me.Columns.length; i++) {
                _tdFilterHtml += '<li ' + (me.Columns[i].Checked ? 'checked' : '') + ' class="columnfilter-item" col-index="' + me.Columns[i].Index + '" col-name=' + me.Columns[i].Name + '>' + me.Columns[i].Title + '</li>';
            }
            me.Element.querySelectorAll("thead > tr")[0].append('<th rowspan="' + _columnRowCount + '" style="width: 100px;" class="columnfilter">' + L('Operate') + '<ul class="columnfilter-list">' + _tdFilterHtml + '</ul></th>').prepend('<th rowspan="' + me.ColumnRowCount + '" style="width: 60px;">' + L('OrderNumber') + '</th>');//
            //给筛选列添加点击切换显示状态事件
            me.Element.querySelector(".columnfilter").live(".columnfilter-item", "click", function (e) {
                var target = e.srcElement || e.target;
                var showCols = me.Element.getAttribute("hc").substr(1, me.Element.getAttribute("hc").length - 2);
                if (showCols != "") showCols = showCols.split(",");
                else showCols = [];
                if (target.hasAttribute("checked")) {
                    showCols.push(target.getAttribute("col-index"));
                    target.removeAttribute("checked");
                } else {
                    for (var i = showCols.length - 1; i >= 0; i--) {
                        if (showCols[i] == target.getAttribute("col-index")) {
                            showCols.splice(i, 1);
                        }
                    }
                    target.setAttribute("checked", "");
                }
                me.Element.setAttribute("hc", "," + showCols.join(",") + ",");
            });
        } else {
            me.Element.querySelectorAll("thead > tr")[0].append('<th rowspan="' + _columnRowCount + '" style="width: 100px;" class="columnfilter">' + L('Operate') + '</th>').prepend('<th rowspan="' + me.ColumnRowCount + '" style="width: 60px;">' + L('OrderNumber') + '</th>');//
        }
        //给数据行左边增加序号列（包括复选框），给数据行右边增加操作列（删除按钮之类的）
        var _btns = "";

        _btns += '<a class="tool copy" title="复制/Copy" xpt-detailtable-command="copyrow"></a>';
        _btns += '<a class="tool insert" title="插入/Insert" xpt-detailtable-command="insertrow"></a>';

        //_btns += '<a class="tool moveup" title="行上移" xpt-detailtable-command="moveup"></a>';
        //_btns += '<a class="tool movedown" title="行下移" xpt-detailtable-command="movedown"></a>';

        _btns += '<a class="tool delete" title="删除/Delete" xpt-detailtable-command="delrow"></a>';
        me.Element.querySelectorAll("tbody > tr").prepend('<td class="check" ondragstart="return false;">' + (HakuJs.IsMobile ? ('<span>' + L("OrderNumber") + '</span>') : '') + '<span xpt-label="" data-type="number" colname="rowid" class=""></span></td>').append('<td class="tools">' + _btns + '</td>');

        //没有数据就新增一行空数据的代码注释掉了
        //if (me.Element.querySelector("tbody > tr[xpt-repeat]") == null) me.AddRow(null, null, false);
        me.RefreshRowIndex();

        if (me.IsReadonly) {
            if (HakuJs.IsMobile) {
                me.Element.addClass(["detail-extend", "isextend"]);
                if (me.Element.querySelector(".detail-extend") == null) {
                    var _tfoot = me.Element.querySelectorAll("tfoot"), _expand = null;
                    if (_tfoot.length == 0) {
                        _tfoot = me.Element.append('<tfoot><tr class="detail-extend"><td colspan="99"><a>' + L('ExpandDetail') + '</a></td></tr></tfoot>');
                    } else {
                        _tfoot.prepend('<tr class="detail-extend"><td colspan="99"><a>' + L('ExpandDetail') + '</a></td></tr>');
                    }
                    me.Element.querySelector("tfoot > tr.detail-extend > td > a").on("click", function () {
                        if (me.Element.hasClass("isextend")) {
                            me.Element.removeClass("isextend");
                            this.innerHTML = L('CollapseDetail');
                        } else {
                            me.Element.addClass("isextend");
                            this.innerHTML = L('ExpandDetail');
                        }
                    });
                }
            }
        }
    };

    /**
     * @method 新增行
     * @param {Number} [index] 要插入行的下标，否则添加到最后
     * @param {Object} [defaultData] 默认数据
     * @param {Boolean} [hasAnime=true] 是否显示动画
     * @param {Boolean} [hasEvent=true] 是否触发事件
     * @return {Number} 返回新增行的下标
     */
    me.AddRow = function (index, defaultData, hasAnime, hasEvent) {
        var tindex = index;
        if (tindex == null) tindex = XPT.TaskData[me.TableName].length;
        if (me.Events.BeforeAddRow.call(me, tindex, defaultData) !== false) {
            var _data = null;
            var hasIndex = index != null;
            //找到对应的那一行
            var row = me.Element.querySelector("[template]");
            var newRow = null;
            if (index == null) {
                index = XPT.TaskData[me.TableName].length;
                XPT.TaskData[me.TableName].push({});
                XPT.Controls[me.TableName].push({ IsControlList: true });
                newRow = row.parentNode.append(row.cloneNode(true).outerHTML).lastChild;
                newRow.removeAttribute("template");
                newRow.setAttribute("xpt-repeat", "");
            } else {
                XPT.TaskData[me.TableName].splice(index, 0, {});
                XPT.Controls[me.TableName].splice(index, 0, { IsControlList: true });
                newRow = row.parentNode.childrens("[xpt-repeat]")[index].before(row.cloneNode(true).removeClass("hidden").outerHTML);
                newRow.removeAttribute("template");
                newRow.setAttribute("xpt-repeat", "");
            }
            [].forEach.call(newRow.querySelectorAll("[xpt-input],[xpt-label],[xpt-select],[xpt-radiolist],[xpt-checkbox],[xpt-fileupload]"), function (e) {
                var rColumnName = e.getAttribute("colname");
                if (e.getAttribute("xpt-input") != null) {
                    XPT.Controls[me.TableName][index][rColumnName] = new XptTextControl(e, index);
                } else if (e.getAttribute("xpt-label") != null) {
                    XPT.Controls[me.TableName][index][rColumnName] = new XptLabelControl(e, index);
                } else if (e.getAttribute("xpt-select") != null) {
                    XPT.Controls[me.TableName][index][rColumnName] = new XptSelectControl(e, index);
                } else if (e.getAttribute("xpt-radiolist") != null) {
                    XPT.Controls[me.TableName][index][rColumnName] = new XptRadioListControl(e, index);
                } else if (e.getAttribute("xpt-checkbox") != null) {
                    XPT.Controls[me.TableName][index][rColumnName] = new XptCheckBoxControl(e, index);
                } else if (e.getAttribute("xpt-fileupload") != null) {
                    var _tempFileUpload = new XPTFileUpload(e, index);
                    _tempFileUpload.Element.setAttribute("guid", _tempFileUpload.GUID);
                    XPT.Controls["_TempControl"][_tempFileUpload.GUID] = _tempFileUpload;
                }
            });
            //绑定默认数据
            for (var item in defaultData) {
                if (item[0] == "_") {
                    XPT.TaskData[me.TableName][index][item.substr(1)] = defaultData[item];
                } else {
                    XPT.TaskData[me.TableName][index][item] = defaultData[item];
                }
            }
            if (!XPT.IsIE && hasAnime !== false && XPT.TaskData[me.TableName].length < 50) {
                newRow.addClass("startanimal");
                newRow.after('<tr class="blanktr"><td style="height:0px;" colspan="99"></td></tr>');
                setTimeout(function () {
                    newRow.addClass(["startanimal-stop", "temp"]);
                    me.Element.querySelector(".blanktr").addClass("add");
                }, 10);
                setTimeout(function () {
                    me.Element.querySelector(".blanktr").remove();
                    newRow.removeClass(["startanimal", "startanimal-stop"]);
                }, 120);
            } else {
                setTimeout(function () {
                    newRow.addClass("temp");
                }, 10);
            }
            setTimeout(function () {
                newRow.removeClass("temp");
            }, 3000);
            if (hasIndex) me.RefreshRowIndex();
            else XPT.TaskData[me.TableName][index].rowid = (index + 1) * me.StepCount;
            if (hasEvent !== false) me.Events.AfterAddRow.call(me, index, defaultData);
            return index;
        }
    };

    /**
     * @method 根据行索引复制行
     * @param {Function} [fun] 回调函数
     * @param {Number} [formIndex] 要复制的行的下标
     * @param {Number} [toIndex] 要插入行的下标，否则添加到最后
     * @param {Boolean} [hasAnime] 是否显示动画
     * @param {Boolean} [hasEvent=true] 是否触发事件
     */
    me.CopyRow = function (formIndex, toIndex, hasAnime, hasEvent) {
        var obj = XPT.GetActualData()[me.TableName][formIndex];
        var newobj = {};
        for (var item in obj) {
            if (obj[item] !== null && obj[item] !== "" && obj[item] !== undefined) newobj[item] = obj[item];
        }
        //最后一行 toIndex = null
        if (XPT.TaskData[me.TableName].length - 1 == toIndex) {
            toIndex = null;
        }
        else {
            toIndex = toIndex + 1;
        }
        me.AddRow(toIndex, newobj, hasAnime, hasEvent);
    };

    /**
     * @method 根据行索引删除行
     * @param {Number} index 要删除行的下标
     * @param {Boolean} [hasAnime=true] 是否显示动画，<strong>需要连续删除多行时hasAnime必须为false</strong>
     */
    me.RemoveRowAt = function (index, hasAnime) {
        if (me.Events.BeforeRemoveRow.call(me, index) !== false) {
            [].forEach.call(me.Element.querySelectorAll("[xpt-repeat]"), function (item, i) {
                if (i == index) {
                    var _data = null;
                    if (!XPT.IsIE && hasAnime !== false) {
                        item.addClass("endanimal");
                        item.after('<tr class="blanktr"><td style="height:40px;" colspan="99"></td></tr>');
                        setTimeout(function () {
                            me.Element.querySelector(".blanktr").addClass("del");
                            item.addClass(["endanimal-stop", "temp"]);
                        }, 10);
                        setTimeout(function () {
                            me.Element.querySelector(".blanktr").remove();
                            item.remove();
                        }, 120);
                    } else {
                        item.remove();
                    }
                    _data = XPT.TaskData[me.TableName][index];
                    XPT.TaskData[me.TableName].splice(index, 1);
                    XPT.Controls[me.TableName].splice(index, 1);
                    me.RefreshRowIndex();
                    me.Events.AfterRemoveRow.call(me, _data);
                    return;
                }
            });
        }
    };

    /**
     * @method 根据控件删除当前明细行
     * @param {HTMLElement} control 当前控件
     */
    me.RemoveRow = function (control) {
        if (control) {
            var repeat = control.parents("[xpt-repeat]");
            var index = repeat[0].index("[xpt-repeat]");
            if (me.Events.BeforeRemoveRow.call(me, index) !== false) {
                var _data = null;
                if (repeat.length > 0) {
                    var tr = control.parents("[xpt-repeat]")[0];
                    if (!XPT.IsIE) {
                        tr.addClass("endanimal");
                        tr.after('<tr class="blanktr"><td style="height:40px;" colspan="99"></td></tr>');
                        setTimeout(function () {
                            me.Element.querySelector(".blanktr").addClass("del");
                            tr.addClass(["endanimal-stop", "temp"]);
                        }, 10);
                        setTimeout(function () {
                            me.Element.querySelector(".blanktr").remove();
                            tr.remove();
                        }, 120);
                    } else {
                        tr.remove();

                    }
                }
                _data = XPT.TaskData[me.TableName][index];
                XPT.TaskData[me.TableName].splice(index, 1);
                XPT.Controls[me.TableName].splice(index, 1);
                me.RefreshRowIndex();
                me.Events.AfterRemoveRow.call(me, _data);
            }
        }
    };

    /**
     * @method Clear 清除全部数据（不触发任何事件，需要触发事件操作时请用单行删除）
     */
    me.Clear = function () {
        me.Element.querySelectorAll("[xpt-repeat]").remove();
        XPT.TaskData[me.TableName] = [];
        XPT.Controls[me.TableName] = [];
    };

    /**
     * @method Fill 绑定集合
     * @param {Array} data 绑定的数组数据
     * @param {Boolean} [isAdd=false] 是否为新增
     * @param {Boolean} [hasEvent=false] 是否触发新增事件
     */
    me.Fill = function (data, isAdd, hasEvent) {
        if (data == undefined || HakuJs.GetType(data) != "Array") return;
        if (isAdd === true) {
            throw Error("detailtable增加绑定集合功能尚未实现");
        } else {
            me.Clear();
            for (var i = 0; i < data.length; i++) {
                //找到对应的那一行
                var row = me.Element.querySelector("[template]");
                var newRow = null;
                XPT.TaskData[me.TableName][i] = {};
                XPT.Controls[me.TableName][i] = { IsControlList: true };
                newRow = row.parentNode.append(row.cloneNode(true).outerHTML).lastChild;
                newRow.removeAttribute("template");
                newRow.setAttribute("xpt-repeat", "");
                XPT.InitControl(newRow);
                //绑定默认数据
                for (var item in data[i]) {
                    if (item[0] == "_") {
                        XPT.TaskData[me.TableName][i][item.substr(1)] = data[i][item];
                    } else {
                        XPT.TaskData[me.TableName][i][item] = data[i][item];
                    }
                }
                if (hasEvent !== false) me.Events.AfterAddRow.call(me, i, data[i]);
            }
        }
        me.RefreshRowIndex();
    }

    me.Element.querySelectorAll("[template] [colname]").forEach(function (item) {
        switch (('' + item.nodeName).toLowerCase()) {
            case "select":
                var _con = item.querySelector("[selected]");
                if (_con) _con.removeAttribute("selected")
            case "input":
                item.value = "";
                item.setAttribute("value", "");
                break;
            case "textarea":
            case "span":
            case "label":
                item.innerHTML = "";
                break;
            default:
        }
    });

    _init();
};
XptControl.prototype.constructor = XptControl;