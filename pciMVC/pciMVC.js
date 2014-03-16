/**
 * Created with IntelliJ IDEA.
 * User: Gin
 * Date: 13-12-28
 * Time: 下午10:22
 */
(function (root, factory) {
    if (!('forEach' in Array.prototype)) {
        Array.prototype.forEach = function (action, that /*opt*/) {
            for (var i = 0, n = this.length; i < n; i++)
                if (i in this)
                    action.call(that, this[i], i, this);
        };
    }
    // add forEach method for the browser not support that
    root.pciMVC = factory();
}(this, function () {

        var widgetStorage = {};

        var widgetEnum = {
            'textfield': PJF.ui.textfield,
            'dateinput': PJF.ui.dateinput,
            'selector': PJF.ui.select,
            'auto': PJF.ui.autoComplete
        };

        var defaultPostFunc = {
            'textfield': function () {
            },
            'dateinput': function () {
            },
            'selector': function () {
                var that = this;
                if (that['pjfAttr'].categoryId) {
                    new PJF.communication.getStandardCode({
                        categoryId: that['pjfAttr'].categoryId,
                        appId: that['pjfAttr'].appId,
                        clcd: that['pjfAttr'].clcd,
                        success: function (data) {
                            that['widget'].addOptions(reformatStandCode(data, 'selector'));
                        }
                    })
                }

            },
            'auto': function () {
                var that = this;
                if (that['pjfAttr'].categoryId) {
                    new PJF.communication.getStandardCode({
                        categoryId: that['pjfAttr'].categoryId,
                        appId: that['pjfAttr'].appId,
                        clcd: that['pjfAttr'].clcd,
                        success: function (data) {
                            that['widget'].addOptions(reformatStandCode(data, 'auto'));
                        }
                    })
                }
            }
        };

        var template = (function () {
            var templateMap = {};
            var textFieldTemplate = '<label id="label_{{:id}}">{{:desc}}</label><input id="dom_{{:id}}" type="text"/>';
            var dateInputTemplate = '<label id="label_{{:id}}">{{:desc}}</label><input id="dom_{{:id}}" type="text"/>';
            var selectorTemplate = '<label id="label_{{:id}}">{{:desc}}</label><span id="dom_{{:id}}" />';
            var autoTemplate = '<label id="label_{{:id}}">{{:desc}}</label><input id="dom_{{:id}}" type="text"/>';
            templateMap['textfield'] = textFieldTemplate;
            templateMap['dateinput'] = dateInputTemplate;
            templateMap['selector'] = selectorTemplate;
            templateMap['auto'] = autoTemplate;

            return {
                render: function (name, dict) {
                    var template = templateMap[name];
                    return PJF.html.template(template, dict);
                }
            }
        }());

        var id_generate = function () {
            return (new Date().getTime()) + '_' + Math.random().toString().substr(2, 5);
        };

        var reformatStandCode = function (standCodes, type) {
            var formatedData = [];
            for (var i = 0; i < standCodes.length; i++) {
                var code = standCodes[i];
                if (type === 'selector') {
                    formatedData.push({name: code['itemValue'], desc: code['itemName']});
                }
                if (type === 'auto') {
                    formatedData.push({key: code['itemValue'], value: code['itemName']});
                }
            }
            return formatedData;
        };

        var mergeAttr = function (source, extend) {
            for (var key in extend) {
                source[key] = extend[key];
            }
            return source;
        };

        //初始化对象层级结构
        var initialDataStructure = function (item, keylist, cursor) {
            cursor || (cursor = 0);
            if (keylist.length > cursor + 1) {
                var key = keylist[cursor];
                item[key] || (item[key] = {});
                cursor += 1;
                initialDataStructure(item[key], keylist, cursor);
            }
        };


        var mergeObject = function (obj, toMergeObj) {
            if (obj['getType'] || toMergeObj['getType']) {
                throw 'can not merge item';
            }
            if (isPureObject(obj) && isPureObject(toMergeObj)) {
                for (var el in toMergeObj) {
                    if (obj[el] === undefined) {
                        obj[el] = toMergeObj[el];
                    } else {
                        throw '属性' + el + '冲突';
                    }
                }
            } else {
                throw 'only obj can be merge';
            }

        };

        var objectPropertyLength = function (obj)//获得对象上的属性个数，不包含对象原形上的属性
        {
            var count = 0;
            if (obj && typeof obj === "object") {
                for (var ooo in obj) {
                    if (obj.hasOwnProperty(ooo)) {
                        count++;
                    }
                }
                return count;
            } else {
                throw new Error("argunment can not be null;");
            }

        };

        var judgeArrayStructureEqual = function (array, compareArray) {
            if (array instanceof Array && compareArray instanceof Array && array.length == compareArray.length) {
                for (var i = 0; i < array.length; i++) {
                    var result = judgeObjectSturctureEqual(array[i], compareArray[i]);
                    if (!result) {
                        return false;
                    }
                }
                return true;
            } else {
                return false
            }
        };

        var judgeObjectSturctureEqual = function (obj, compareObj) {
            if (obj['getType'] && compareObj['getType']) {
                return true;
            }
            var objLength = objectPropertyLength(obj), compareObjLength = objectPropertyLength(compareObj);
            if (objLength != compareObjLength) {
                return false;
            } else {
                for (var el in obj) {
                    if (obj[el] instanceof Array && compareObj[el] instanceof Array) {
                        if (!judgeArrayStructureEqual(obj[el], compareObj[el])) {
                            return false;
                        }
                    } else if (isPureObject(obj[el]) && isPureObject(compareObj[el])) {
                        if (!judgeObjectSturctureEqual(obj[el], compareObj[el])) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
            return true;
        };
        //获取深层对象
        var getDeepData = function (data, keylist, cursor) {
            cursor || (cursor = 0);
            if (keylist.length > cursor + 1) {
                var currentData = data[keylist[cursor]];
                cursor += 1;
                return getDeepData(currentData, keylist, cursor);
            } else {
                return data[keylist[cursor]];
            }
        };

        var setDeepData = function (data, keylist, value, cursor) {
            cursor || (cursor = 0);
            if (keylist.length == cursor + 1) {
                data[keylist[cursor]] = value;
            } else {
                var upperData = data[keylist[cursor]];
                cursor += 1;
                setDeepData(upperData, keylist, value, cursor);
            }
        };

        var safeInsertData = function (root, keylist, value) {
            initialDataStructure(root, keylist);
            var targetDataItem = getDeepData(root, keylist);
            if (targetDataItem === undefined) {
                setDeepData(root, keylist, value);
            } else if (isPureObject(targetDataItem)) {
                if (judgeObjectSturctureEqual(targetDataItem, value)) {
                    var tempArray = [];
                    tempArray.push(targetDataItem);
                    tempArray.push(value);
                    setDeepData(root, keylist, tempArray);
                } else {
                    mergeObject(targetDataItem, value);
                }

            } else if (targetDataItem instanceof Array) {
                targetDataItem.push(value);
            }
        };

        //遍历对象中的widget对象，并执行方法
        var iterateWidget = function (data, args) {
            if (data instanceof Array) {
                for (var i = 0; i < data.length; i++) {
                    iterateWidget(data[i], args);
                }
            } else if (data.getType && data.getType() === 'widget') { //检查对象是widget对象，如果是包含widget对象的对象，则继续遍历
                data.execute.apply(data, args);
            } else {
                for (var key in data) {
                    iterateWidget(data[key], args);
                }
            }
        };

        var isPureObject = function (object) {
            return object instanceof Object && !(object instanceof Array) && !(object instanceof Function);
        };

        return {
            View: {
                UlContent: function (attr) {
                    var el = attr['el'];
                    if (attr['groupName']) {
                        var groupName = attr['groupName'];
                        if (attr['groupType']) {
                            var groupType = attr['groupType'];
                        } else {
                            throw new Error(' 具有groupName属性时groupType属性必填');
                        }
                    }

                    var widget_list = [];
                    var id = id_generate();
                    var data_list = [];
                    var subContainer = [];

                    return {
                        addContainer: function (container) {
                            subContainer.push(container);
                        },
                        getContainers: function () {
                            return subContainer;
                        },
                        addData: function (data) {
                            data_list.push(data);
                            return data;
                        },

                        getDatas: function () {
                            return data_list;
                        },

                        addWidget: function (widget) {
                            widget_list.push(widget);
                            return widget;
                        },

                        insertHtmlDom: function () {
                            var widgetContent = "";
                            for (var i = 0; i < widget_list.length; i++) {
                                var widget = widget_list[i];
                                widgetContent += '<li>' + widget.extractHtmlContent() + '</li>';
                            }
                            PJF.html.append(el, widgetContent);
                        },

                        instantiate: function (fn) {
                            for (var i = 0; i < widget_list.length; i++) {
                                var widget = widget_list[i];
                                widget.instantiate();
                                if (fn) {
                                    fn(widget);
                                }
                            }
                        },

                        dynamicAddWidget: function (widget) {
                            widget_list.push(widget);
                            PJF.html.append(el, '<li>' + widget.extractHtmlContent() + '</li>');
                            widget.instantiate();
                        },

                        getGroupName: function () {
                            return groupName;
                        },

                        getId: function () {
                            return id;
                        }
                    }


                },
                Widget: function (attr) {
                    var rootId = id_generate();
                    var defaultAttr = {
                        id: rootId,
                        type: 'textfield',
                        desc: '',
                        postProcessor: function () {
                        },
                        initialize: function () {
                        },
                        setValuePre: function (data) {
                            return data;
                        },
                        getValuePost: function (data) {
                            return data;
                        }
                    };
                    if (attr['pjfAttr']) {
                        var attrs = mergeAttr(defaultAttr, attr);
                        attrs['pjfAttr']['dom'] = 'dom_' + attrs['id'];
                        attrs['postProcessor'] = defaultPostFunc[attrs['type']];
                        if (attr['getValue'] instanceof Function) {
                            var getValueFunc = attr['getValue'];
                        }
                    } else {
                        throw new Error('初始化PJF组件的属性需放置在pjfAttr节点下');
                    }
                    return {
                        extractHtmlContent: function () {
                            if (attrs['pjfAttr']['required']) {
                                attrs.desc = '<a class="red" id = "star_' + attrs.id + '">*</a>' + attrs.desc;
                            }
                            return template.render(attrs.type, {'id': attrs.id, 'desc': attrs.desc});
                        },
                        instantiate: function () {
                            console.log(attrs);
                            attrs['label'] = new PJF.ui.label({dom: 'label_' + attrs.id});
                            attrs['widget'] = new widgetEnum[attrs.type](attrs['pjfAttr']);
                            attrs.postProcessor();
                            attrs.initialize();
                        },
                        setRequired: function (flag) {
                            PJF.html.displayArea("star_" + attrs.id, flag);
                            if (attrs['widget'].setRequired) {
                                attrs['widget'].setRequired(flag);
                            }
                        },
                        getValuePost: attrs['getValuePost'],
                        setValuePre: attrs['setValuePre'],
                        getValue: function () {
                            try {
                                return attrs['widget'].getValue();
                            } catch (e) {
                                throw new Error(attrs['type'] + attrs['id'] + ' has no method getValue');
                            }

                        },
                        setValue: function (data) {
                            try {
                                attrs['widget']['setValue'](data);
                            } catch (e) {
                                throw new Error(attrs['type'] + attrs['id'] + ' has no method setValue');
                            }
                        },
                        parseItemsWithKey: function () {
                            var keyItems = [];
                            switch (attrs['type']) {
                                case 'areaSelector':
                                    var provinceName = attrs['pjfAttr']['provinceName'];
                                    var provinceSetFunc = function (data) {
                                        this.getWidget().execute('setProvinceValue', data);
                                    };
                                    var provinceGetFunc = function () {
                                        return this.getWidget().execute('getProvinceValue');
                                    };
                                    keyItems.push({key: provinceName, value: {'widget': this, 'setValue': provinceSetFunc(), 'getValue': provinceGetFunc()}});
                                    var cityName = attrs['pjfAttr']['cityName'];
                                    var citySetFunc = function (data) {
                                        this.getWidget().execute('setCityValue', data);
                                    };
                                    var cityGetFunc = function () {
                                        return this.getWidget().execute('getCityValue');
                                    };
                                    keyItems.push({key: cityName, value: {'widget': this, 'setValue': citySetFunc(), 'getValue': cityGetFunc()}});
                                    var countyName = attrs['pjfAttr']['countyName'];
                                    var countySetFunc = function (data) {
                                        this.getWidget().execute('setCountyValue', data);
                                    };
                                    var countyGetFunc = function () {
                                        return this.getWidget().execute('getCountyValue');
                                    };
                                    keyItems.push({key: countyName, value: {'widget': this, 'setValue': countySetFunc(), 'getValue': countyGetFunc()}});
                                    break;
                                default :
                                    keyItems.push({key: attrs['pjfAttr']['name'], value: pciMVC.Model.Item({'widget': this})});
                            }
                            return keyItems;

                        },
                        getKey: function () {
                            return attrs['pjfAttr']['name'];
                        },
                        getPJFWidget: function () {
                            return attrs['widget'];
                        },
                        getType: function () {
                            return 'widget';
                        },
                        execute: function (funcname) {
                            if (typeof funcname === 'string') {
                                var args = Array.prototype.slice.call(arguments);
                                args.shift();
                                if (this.hasOwnProperty(funcname)) {
                                    this[funcname].apply(this, args);
                                } else {
                                    attrs['widget'][funcname].apply(attrs['widget'], args);
                                }
                            }
                        }
                    }

                }
            },
            Model: {
                FormInstantiator: function (data) {
                    var form = pciMVC.Model.Form();
                    var containers = {};

                    var parseContainer = function (data, upperGroupName) {
                        if (upperGroupName) {
                            if (data['groupName']) {
                                data['groupName'] = upperGroupName + '.' + data['groupName'];
                            } else {
                                throw new Error('有groupName属性的container的下级container也必须具有groupName属性');
                            }
                        }
                        if (data['type'] === 'ul') {
                            var ul_content = pciMVC.View.UlContent(data);
//                            containers[ul_content.getId()] = ul_content;
                            for (var i = 0; i < data['children'].length; i++) {
                                var child = data['children'][i];
                                if (child['category'] === 'widget') {
                                    ul_content.addWidget(parseWidget(child));  //组件放入容器中
                                }
                                if (child['category'] === 'data') {
                                    ul_content.addData(child['attr']); //纯值对象的attr放入容器中
                                }
                                if (child['category'] === 'container') {
//                                    if (typeof ul_content.getGroupName() === 'string') {
                                        ul_content.addContainer(parseContainer(child, ul_content.getGroupName()));
//                                    } else {
//                                        throw '上级container的groupName属性不能为空';
//                                    }

                                }

                            }

                        }
                        return ul_content;
                    };

                    var parseWidget = function (data) {
                        var widget = pciMVC.View.Widget(data['attr']);
                        var id = data['attr']['id'];
                        if (id) {
                            widgetStorage[id] = widget;
                        }
                        return widget;
                    };

                    var parseMetaData = function (data) {
                        if (data['category'] === 'form') {

                            for (var i = 0; i < data['children'].length; i++) {
                                var metaData = data['children'][i];
                                parseContainer(metaData);
                            }
                        }
                    };

                    parseMetaData(data);

                    var instantiateContainer = function (container) {
                        if (typeof container.getGroupName() === 'string') {
                            var itemsInGroup = {};
                            container.instantiate(function (parsedWidget) {
                                parsedWidget.parseItemsWithKey().forEach(function (keyItem) {
                                    safeInsertData(itemsInGroup, keyItem['key'].split('.'), keyItem['value']);
                                });
                            });
                            container.getDatas().forEach(function (data) {
                                safeInsertData(itemsInGroup, data.name.split('.'), pciMVC.Model.Item(data));
                            });
                            form.addItemByGroup(container.getGroupName(), itemsInGroup);
                        } else {
                            container.instantiate(function (parsedWidget) {
                                parsedWidget.parseItemsWithKey().forEach(function (keyItem) {
                                    form.addItem(keyItem['key'], keyItem['value']); //将widget放在Item存入Form
                                });
                            });
                            container.getDatas().forEach(function (data) {
                                form.addItem(data.name, pciMVC.Model.Item(data));
                            });
                        }
                    };

                    for (var container_id in containers) {
                        var container = containers[container_id];
                        container.insertHtmlDom();
                        instantiateContainer(container);
                    }

                    return {
                        getForm: function () {
                            return form;
                        },
                        add: function (data) {
                            var container = parseContainer(data);
                            container.insertHtmlDom();
                            instantiateContainer(container);
                        }

                    }
                },


                Form: function () {

                    var items = {};

                    var extractItemValue = function (object) {
                        if (object['getValue']) {
                            return object['getValue']();
                        } else if (isPureObject(object)) {
                            var objectStore = {};
                            for (var key in object) {
                                objectStore[key] = extractItemValue(object[key]);
                            }
                            return objectStore;
                        } else if (object instanceof Array) {
                            var arrayStore = [];
                            for (var i = 0; i < object.length; i++) {
                                var obj = object[i];
                                arrayStore.push(extractItemValue(obj));
                            }
                            return arrayStore;
                        } else {
                            return {};
                        }
                    };

                    var safeSetValue = function (item, value) {
                        if (item && item['setValue'] instanceof Function) {
                            item['setValue'](value);
                        }
                    };

                    var setItemValue = function (items, object) {
                        for (var key in object) {
                            if (isPureObject(object[key])) {
                                setItemValue(items[key], object[key]);
                            } else if (object[key] instanceof Array && items[key] instanceof Array) {
                                for (var i = 0; i < object[key].length; i++) {
                                    var obj = object[key][i];
                                    if (obj instanceof Object) {
                                        setItemValue(items[key][i], obj);
                                    } else {
                                        safeSetValue(items[key][i], obj);
                                    }

                                }
                            } else {
                                safeSetValue(items[key], object[key]);
                            }
                        }
                    };


                    return {
                        addItem: function (key, value) {
                            var keylist = key.split('.');
                            safeInsertData(items, keylist, value);
                        },

                        addItemByGroup: function (groupName, groupValue) {
                            var keylist = groupName.split('.');
                            safeInsertData(items, keylist, groupValue);
                        },

                        getItems: function () {
                            return items;
                        },

                        getItemByName: function (groupName) {
                            var keylist = groupName.split('.');
                            return getDeepData(items, keylist);
                        },

                        getFormData: function () {
                            return extractItemValue(items);
                        },

                        setFormData: function (data) {
                            setItemValue(items, data);
                        },
                        executeInGroup: function (groupName, funcname) {
                            if (arguments.length > 1) {
                                var args = Array.prototype.slice.call(arguments);
                                args.shift();
                                var keylist = groupName.split('.');
                                var itemsInGroup = getDeepData(items, keylist);
                                iterateWidget(itemsInGroup, args);
                            }
                        }
                    }


                },
                Item: function (data) {
                    if (data['widget']) {
                        return (function (data) {
                            var type = 'widget';
                            var widget = data['widget'];
                            var getValueFunc = data['getValue'];
                            var setValueFunc = data['setValue'];
                            return {
                                getType: function () {
                                    return type;
                                },
                                getWidget: function () {
                                    return widget;
                                },
                                execute: function () {
                                    var args = Array.prototype.slice.call(arguments);
                                    widget.execute.apply(widget, args);
                                },
                                setValue: function (m_data) {
                                    var data = widget.setValuePre(m_data);
                                    (setValueFunc || (function (data) {
                                        widget.setValue(data);
                                    }))(data);
                                },
                                getValue: function () {
                                    var data = (getValueFunc || (function () {
                                        return widget.getValue();
                                    }))();
                                    return widget.getValuePost(data);
                                }
                            };
                        }(data))
                    } else {
                        return (function (data) {
                            var value = data.defaultValue;
                            var getValuePost = data.getValuePost || function (data) {
                                return data
                            };
                            var setValuePre = data.setValuePre || function (data) {
                                return data
                            };
                            return {
                                getType: function () {
                                    return 'data';
                                },
                                setValue: function (m_data) {
                                    value = setValuePre(m_data);
                                },
                                getValue: function () {
                                    return getValuePost(value);
                                }
                            }
                        }(data))
                    }

                }
            },
            Util: {
                createNamespace: function (context, namespace) {
                    var keylist = namespace.split('.');
                    (function createStructure(data, keylist) {
                        if (keylist.length > 0) {
                            var key = keylist.shift();
                            data[key] || (data[key] = {});
                            createStructure(data[key], keylist);
                        }
                    }(context, keylist));
                    return getDeepData(context, namespace.split('.'));
                },
                getWidgetById: function (id) {
                    return widgetStorage[id];
                },
                UnitTest: function (config) {
                    //保存错误信息
                    var errorMsg = new Array();

                    //检测交易码是否填写
                    if (config.fwTranId == "" || config.fwTranId == null || config.fwTranId == undefined) {
                        alert("交易码未填写");
                        return false;
                    }

                    //前端请求数据
                    var reqData = config.jsonData;

                    //测试接口数据
                    var testData = [
                        {name: "test", type: 'String', maxLength: 10, required: true},
                        {name: 'test1', type: 'String', maxLength: 10, required: true},
                        {type: 'Array', name: 'grp1', children: [
                            {name: 'group5', type: 'String', maxLength: 20, required: true},
                            {name: 'group4', type: 'String', maxLength: 20, required: true}
                        ]}
                    ];

                    var interData = testData;

                    //比较数据结构
                    var compareStr = function (interData) {
                        for (var i in interData) {
                            vaildField(interData[i], reqData);
                        }
                    };

                    var vaildField = function (inter, req) {
                        var _name = inter.name;
                        var _type = inter.type;

                        try {
                            var _temp = req[_name];
                        }
                        catch (e) {

                        }
                        if (undefined == _temp) {
                            errorMsg.push("字段不符，请求数据中缺少【" + _name + "】字段,或上送值为undefined");
                        }
                        else {
                            if (typeof _temp == "string") {

                                if (!_temp instanceof String) {
                                    errorMsg.push("【" + _name + "】字段类型类型不匹配，接口类型为:" + inter.type);
                                }

                                if (inter.required == true || inter.required == 'true') {
                                    if (_temp == "") {
                                        errorMsg.push("【" + _name + "】字段为必填项，值不能为空");
                                    }
                                }

                                if (_temp.length > inter.maxLength) {
                                    errorMsg.push("【" + _name + "】字段长度超长，接口允许最大长度为：" + inter.maxLength);
                                }
                            }
                            else if (_type == "Object") {
                                if (!_temp instanceof Object) {
                                    errorMsg.push("【" + _name + "】字段类型类型不匹配，接口类型为:" + inter.type);
                                }

                                if (typeof _temp == "object") {
                                    for (var y in inter.children) {
                                        vaildField(inter.children[y], _temp);
                                    }
                                }
                            }
                            else if (_type == 'Array') {
                                if (!_temp instanceof Array) {
                                    errorMsg.push("【" + _name + "】字段类型类型不匹配，接口类型为:" + inter.type);
                                }

                                for (var i = 0; i < _temp.length; i++) {
                                    for (var t in inter.children) {
                                        vaildField(inter.children[t], _temp[i]);
                                    }
                                }
                            }
                        }
                    };

                    compareStr(interData);
                    if (errorMsg.length > 0) {
                        var _div = document.createElement("div");
                        _div.setAttribute("style", "width:70%;height:auto;border:1px solid red;margin-left:auto;margin-right:auto;border-radius:4px 4px 4px 4px;box-shadow:0 1px 1px #34a5cf inset;border:1px solid rgba(0, 0, 0, 0.05);");
                        document.body.appendChild(_div);
                        _div.innerHTML = "<span style='font-size:18px;color:red;padding:10px;'>挡板测试错误提示</span></br>";
                        for (var k in errorMsg) {
                            _div.innerHTML += "<span style='color:red;margin-left:100px;'>*&nbsp;</span>" + errorMsg[k];
                            _div.innerHTML += "</br>";
                        }
                    } else {
                        config.callback("回调函数数据");
                    }
                }
            }
        }
    }
))
;