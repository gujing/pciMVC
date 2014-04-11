/**
 * Created with IntelliJ IDEA.
 * User: Gin
 * Date: 13-12-28
 * Time: 下午10:22
 */
(function (root, factory) {
    /*if (!('forEach' in Array.prototype)) {
     Array.prototype.forEach = function (action, that */
    /*opt*/
    /*) {
     for (var i = 0, n = this.length; i < n; i++)
     if (i in this)
     action.call(that, this[i], i, this);
     };
     }*/
    // add forEach method for the browser not support that
    root.pciMVC = factory();
}(this, function () {

        var widgetStorage = {};

        var widgetEnum = {
            'textfield': PJF.ui.textfield,
            'dateinput': PJF.ui.dateinput,
            'selector': PJF.ui.select,
            'auto': PJF.ui.autoComplete,
            'radio': PJF.ui.radio,
            'dateSpan': PJF.ui.dateSpan,
            'areaSelector': PJF.ui.areaSelector
        };

        var deviceButtonCreater = (function () {
            var defaultFailure = function (msg) {
                new PJF.ui.messageBox({
                    style: "warning",
                    title: "调用失败",
                    content: msg
                });
            };

            var enumButtons = {
                'card': {desc: '划卡', deviceFunc: function (additionAttr) {
                    return PJF.communication.client.getCardInfo();
                }},
                'IcCard': {desc: '划IC卡', deviceFunc: function (additionAttr) {
                    return PJF.communication.client.getIcCardInfo('');
                }},
                'IdCard': {desc: '读身份证', deviceFunc: function (additionAttr) {
                    return PJF.communication.client.getIdentityCardInfo();
                }},
                'test': {desc: '测试外设', deviceFunc: function (additionAttr) {
                    return [0, '测试成功'];
                }}
            };

            return {
                createButton: function (type, successful, failure, additionAttr) {
                    var button = enumButtons[type];
                    if (!button) {
                        throw new Error(type + '不在支持的外设种类列表中');
                    }
                    if (!successful) {
                        throw new Error('成功的回调函数必填');
                    }
                    return {
                        desc: button.desc, onclick: function (that) {
                            //this.disabled();
                            try {
                                var res = button.deviceFunc(additionAttr);
                                if (res[0] == 0) {
                                    successful(that, res);
                                } else {
                                    //failure 不存在或返回不为false时执行默认方法
                                    if (failure && (failure() === false)) {
                                    } else {
                                        defaultFailure('调用失败');
                                    }
                                }
                            } catch (e) {
                                //this.enabled();
                                throw e;
                            }

                        }
                    }
                }
            }
        }());

        var defaultPreFunc = function (type) {
            switch (type) {
                case 'selector':
                    return function () {
                        var that = this;

                        if (that['pjfAttr'].categoryId) {
                            new PJF.communication.getStandardCode({
                                categoryId: that['pjfAttr'].categoryId,
                                appId: that['pjfAttr'].appId,
                                clcd: that['pjfAttr'].clcd,
                                async: false,
                                success: function (data) {
                                    that['pjfAttr']['data'] = reformatStandCode(data, 'selector');
                                }
                            });
                        }
                    };
                case 'auto':
                    return function () {
                        var that = this;

                        if (that['pjfAttr'].categoryId) {
                            new PJF.communication.getStandardCode({
                                categoryId: that['pjfAttr'].categoryId,
                                appId: that['pjfAttr'].appId,
                                clcd: that['pjfAttr'].clcd,
                                async: false,
                                success: function (data) {
                                    that['pjfAttr']['data'] = reformatStandCode(data, 'auto');
                                }
                            });
                        }
                    };
                default :
                    return function () {
                    }
            }

        };

        var template = (function () {
            var templateMap = {};

            var textFieldTemplate = '<label id="label_{{:id}}">{{:desc}}:</label><input id="dom_{{:id}}" type="text"/>';
            var dateInputTemplate = '<label id="label_{{:id}}">{{:desc}}:</label><input id="dom_{{:id}}" type="text"/>';
            var dateSpanTemplate = '<label id="label_{{:id}}">{{:desc}}:</label><span id="dom_{{:id}}"/>';
            var selectorTemplate = '<label id="label_{{:id}}">{{:desc}}:</label><span id="dom_{{:id}}" />';
            var areaSelectorTemplate = '<label id="label_{{:id}}">{{:desc}}:</label><span id="dom_{{:id}}" />';
            var radioTemplate = '<label id="label_{{:id}}">{{:desc}}:</label><span id="dom_{{:id}}" />';
            var autoTemplate = '<label id="label_{{:id}}">{{:desc}}:</label><input id="dom_{{:id}}" type="text"/>';
            var buttonTemplate = '<span id="button_{{:id}}" />';


            var liTemplate = '<li id="{{:id}}_container" class="{{:li_class}}" style="{{:li_style}}">{{:content}}</li>';

            templateMap['textfield'] = textFieldTemplate;
            templateMap['dateinput'] = dateInputTemplate;
            templateMap['dateSpan'] = dateSpanTemplate;
            templateMap['selector'] = selectorTemplate;
            templateMap['areaSelector'] = areaSelectorTemplate;
            templateMap['auto'] = autoTemplate;
            templateMap['radio'] = radioTemplate;
            templateMap['li'] = liTemplate;
            templateMap['button'] = buttonTemplate;

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

        var mergeJsonObject = function (obj, toMergeObj) {
            if (isPureObject(obj) && isPureObject(toMergeObj)) {
                for (var el in toMergeObj) {
                    if (obj[el] === undefined) {
                        obj[el] = toMergeObj[el];
                    } else if (isPureObject(obj[el]) && isPureObject(toMergeObj[el])) {
                        mergeJsonObject(obj[el], toMergeObj[el]);
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

        var safeInsertData = function (root, keylist, value, type) {
            initialDataStructure(root, keylist);
            var targetDataItem = getDeepData(root, keylist);
            if (targetDataItem === undefined) {
                if (type === 'Array') {
                    var temArray = [];
                    temArray.push(value);
                    value = temArray;
                }
                setDeepData(root, keylist, value);
            } else if (isPureObject(targetDataItem) && type === 'Group') {
                mergeObject(targetDataItem, value);

            } else if (targetDataItem instanceof Array && type === 'Array') {
                targetDataItem.push(value);
            } else {
                throw new Error(keylist.join('.') + '声明的类型与实际不符');
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
                        getGroupType: function () {
                            return groupType;
                        },
                        addWidget: function (widget) {
                            widget_list.push(widget);
                            return widget;
                        },

                        insertHtmlDom: function () {
                            var widgetContent = "";
                            for (var i = 0; i < widget_list.length; i++) {
                                var widget = widget_list[i];
                                var liDic = widget.getContainerStyle();
                                liDic['id'] = widget.getWidgetId();
                                liDic['content'] = widget.extractHtmlContent();
                                widgetContent += template.render('li', liDic);
                            }
                            PJF.html.append(el, widgetContent);
                            for (var j = 0; j < subContainer.length; j++) {
                                subContainer[j].insertHtmlDom();
                            }
                            /*subContainer.forEach(function (container) {
                             container.insertHtmlDom();
                             });*/
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
                        type: 'textfield',
                        desc: '',
                        preProcessor: function () {
                        },
                        initialize: function () {
                        },
                        setValuePre: function (data) {
                            return data;
                        },
                        getValuePost: function (data) {
                            return data;
                        },
                        containerStyle: {'li_class': '', 'li_style': ''},
                        assistButtons: {}
                    };
                    if (attr['pjfAttr']) {
                        var attrs = mergeAttr(defaultAttr, attr);
                        attrs['id'] = rootId;
                        attrs['pjfAttr']['dom'] = 'dom_' + attrs['id'];
                        attrs['preProcessor'] = defaultPreFunc(attrs['type']);
                    } else {
                        throw new Error('初始化PJF组件的属性需放置在pjfAttr节点下');
                    }
                    if (attrs['buttons'] instanceof Array && attrs['buttons'].length > 0) {
                        attrs['containerStyle'] = {'li_class': 'hidden_class', 'li_style': ''};
                        if (attrs['oneLine'] === true) {
                            attrs['containerStyle'] = {'li_class': 'width_auto', 'li_style': ''};
                        }

                        for (var j = 0; j < attr['buttons'].length; j++) {
                            var button = attr['buttons'][j];
                            if (button['type'] === 'defined') {
                                attrs['assistButtons'][id_generate()] = {desc: button['desc'], onclick: button['onclick']}
                            } else {
                                attrs['assistButtons'][id_generate()] = deviceButtonCreater.createButton(button['type'], button['successful'], button['failure'], button['additionAttr']);
                            }
                        }

                        /*attr['buttons'].forEach(function (button) {
                         if (button['type'] === 'defined') {
                         attrs['assistButtons'][id_generate()] = {desc: button['desc'], onclick: button['onclick']}
                         } else {
                         attrs['assistButtons'][id_generate()] = deviceButtonCreater.createButton(button['type'], button['successful'], button['failure'], button['additionAttr']);
                         }
                         })*/
                    }
                    return {
                        getWidgetId: function () {
                            return attrs['id'];
                        },
                        getContainerStyle: function () {
                            return attrs['containerStyle'];
                        },
                        extractHtmlContent: function () {
                            if (attrs['pjfAttr']['required']) {
                                attrs.desc = '<a class="red" id = "star_' + attrs.id + '">*</a>' + attrs.desc;
                            } else {
                                attrs.desc = '<a class="red" id = "star_' + attrs.id + '" style="display:none">*</a>' + attrs.desc;
                            }
                            var htmlContent = template.render(attrs.type, {'id': attrs.id, 'desc': attrs.desc});
                            for (var button_id in attrs['assistButtons']) {
                                htmlContent += template.render('button', {'id': button_id});
                            }
                            return htmlContent;
                        },
                        instantiate: function () {
                            var that = this;
                            console.log(attrs['id']);
                            attrs['label'] = new PJF.ui.label({dom: 'label_' + attrs.id});
                            attrs.preProcessor(attrs['pjfAttr']);
                            attrs['widget'] = new widgetEnum[attrs.type](attrs['pjfAttr']);
                            for (var button_id in attrs['assistButtons']) {
                                var button = attrs['assistButtons'][button_id];
                                var thisButton = new PJF.ui.linkButton({
                                    dom: 'button_' + button_id,
                                    name: button['desc'],
                                    style: 'assistant'
                                });
                                thisButton.bindClickHandler((function (onclickFunc, button) {
                                    return function () {
                                        button.disable();
                                        onclickFunc(that);
                                        button.enable();
                                    }
                                }(button['onclick'], thisButton)));
                            }
                            attrs.initialize();
                        },
                        setLabelDesc: function (value) {
                            attrs['label'].setLabel(value);
                        },
                        setRequired: function (flag) {
                            PJF.html.displayArea("star_" + attrs.id, flag);
                            if (attrs['widget'].setRequired) {
                                attrs['widget'].setRequired(flag);
                            }
                        },
                        setDisplay: function (flag) {
                            PJF.html.displayArea(attrs['id'] + '_container', flag);
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
                                        attrs['widget'].setProvinceValue(data);
                                    };
                                    var provinceGetFunc = function () {
                                        return attrs['widget'].getProvinceValue();
                                    };
                                    keyItems.push({key: provinceName, value: pciMVC.Model.Item({'widget': this, 'setValue': provinceSetFunc, 'getValue': provinceGetFunc})});
                                    var cityName = attrs['pjfAttr']['cityName'];
                                    var citySetFunc = function (data) {
                                        attrs['widget'].setCityValue(data);
                                    };
                                    var cityGetFunc = function () {
                                        return attrs['widget'].getCityValue();
                                    };
                                    keyItems.push({key: cityName, value: pciMVC.Model.Item({'widget': this, 'setValue': citySetFunc, 'getValue': cityGetFunc})});
                                    var countyName = attrs['pjfAttr']['countyName'];
                                    var countySetFunc = function (data) {
                                        attrs['widget'].setCountyValue(data);
                                    };
                                    var countyGetFunc = function () {
                                        return attrs['widget'].getCountyValue();
                                    };
                                    keyItems.push({key: countyName, value: pciMVC.Model.Item({'widget': this, 'setValue': countySetFunc, 'getValue': countyGetFunc})});
                                    break;
                                case 'dateSpan':
                                    var preName = attrs['pjfAttr']['inputNames'][0];
                                    var preSetFunc = function (data) {
                                        attrs['widget'].setPreValue(data);
                                    };
                                    var preGetFunc = function () {
                                        return attrs['widget'].getPreValue();
                                    };
                                    keyItems.push({key: preName, value: pciMVC.Model.Item({'widget': this, 'setValue': preSetFunc, 'getValue': preGetFunc})});
                                    var nextName = attrs['pjfAttr']['inputNames'][1];
                                    var nextSetFunc = function (data) {
                                        attrs['widget'].setNextValue(data);
                                    };
                                    var nextGetFunc = function () {
                                        return attrs['widget'].getNextValue();
                                    };
                                    keyItems.push({key: nextName, value: pciMVC.Model.Item({'widget': this, 'setValue': nextSetFunc, 'getValue': nextGetFunc})});
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
                                    return this[funcname].apply(this, args);
                                } else {
                                    if (attrs['widget'][funcname] instanceof Function) {
                                        return attrs['widget'][funcname].apply(attrs['widget'], args);
                                    } else {
                                        throw new Error(attrs['type'] + attrs['id'] + ' has no method ' + funcname);
                                    }
                                }
                            }
                        }
                    }

                }
            },
            Model: {
                FormInstantiator: function (data) {
                    var form = pciMVC.Model.Form();
                    var containers = [];

                    var parseContainer = function (data, upperGroupName) {
                        if (upperGroupName) {
                            if (data['groupName']) {
                            } else {
                                throw new Error('有groupName属性的container的下级container也必须具有groupName属性');
                            }
                        }
                        if (data['type'] === 'ul') {
                            var ul_content = pciMVC.View.UlContent(data);
                            for (var i = 0; i < data['children'].length; i++) {
                                var child = data['children'][i];
                                if (child['category'] === 'widget') {
                                    ul_content.addWidget(parseWidget(child));  //组件放入容器中
                                }
                                if (child['category'] === 'data') {
                                    ul_content.addData(child['attr']); //纯值对象的attr放入容器中
                                }
                                if (child['category'] === 'container') {
                                    ul_content.addContainer(parseContainer(child, ul_content.getGroupName()));

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
                                containers.push(parseContainer(metaData));
                            }
                        }
                    };

                    parseMetaData(data);

                    var instantiateContainer = function (container) {
                        var itemsInGroup = {};
                        if (typeof container.getGroupName() === 'string') {
                            container.instantiate(function (parsedWidget) {
                                var keyItems = parsedWidget.parseItemsWithKey();
                                for (var j = 0; j < keyItems.length; j++) {
                                    var keyItem = keyItems[j];
                                    safeInsertData(itemsInGroup, keyItem['key'].split('.'), keyItem['value']);
                                }

                                /*parsedWidget.parseItemsWithKey().forEach(function (keyItem) {
                                 safeInsertData(itemsInGroup, keyItem['key'].split('.'), keyItem['value']);
                                 });*/
                            });
                            var containerDatas_g = container.getDatas();
                            for (var k_g = 0; k_g < containerDatas_g.length; k_g++) {
                                safeInsertData(itemsInGroup, containerDatas_g[k_g].name.split('.'), pciMVC.Model.Item(containerDatas_g[k_g]));
                            }
                            /*container.getDatas().forEach(function (data) {
                             safeInsertData(itemsInGroup, data.name.split('.'), pciMVC.Model.Item(data));
                             });*/
                            var subContainers_g = container.getContainers();
                            for (var l_g = 0; i < subContainers_g.length; l_g++) {
                                var subContainerData_g = instantiateContainer(subContainers_g[l_g]);
                                safeInsertData(itemsInGroup, subContainers_g[l_g].getGroupName().split('.'), subContainerData_g, subContainers_g[l_g].getGroupType());
                            }
                            /*container.getContainers().forEach(function (data) {
                             var subContainerData = instantiateContainer(data);
                             safeInsertData(itemsInGroup, data.getGroupName().split('.'), subContainerData, data.getGroupType());
                             });*/
//                            form.addItemByGroup(container.getGroupName(), itemsInGroup);
                            return itemsInGroup;
                        } else {
                            container.instantiate(function (parsedWidget) {
                                var keyItems = parsedWidget.parseItemsWithKey();
                                for (var j = 0; j < keyItems.length; j++) {
                                    var keyItem = keyItems[j];
                                    form.addItem(keyItem['key'], keyItem['value']); //将widget放在Item存入Form
                                }

                                /*parsedWidget.parseItemsWithKey().forEach(function (keyItem) {
                                 form.addItem(keyItem['key'], keyItem['value']); //将widget放在Item存入Form
                                 });*/
                            });
                            var containerDatas = container.getDatas();
                            for (var k = 0; k < containerDatas.length; k++) {
                                form.addItem(containerDatas[k].name, pciMVC.Model.Item(containerDatas[k]));
                            }
                            /*container.getDatas().forEach(function (data) {
                             form.addItem(data.name, pciMVC.Model.Item(data));
                             });*/
                            var subContainers = container.getContainers();
                            for (var l = 0; i < subContainers.length; l++) {
                                var subContainerData = instantiateContainer(subContainers[l]);
                                safeInsertData(itemsInGroup, subContainers[l].getGroupName().split('.'), subContainerData, subContainers[l].getGroupType());
                            }
                            /*container.getContainers().forEach(function (data) {
                             var subContainerData = instantiateContainer(data);
                             safeInsertData(itemsInGroup, data.getGroupName().split('.'), subContainerData, data.getGroupType());
                             });*/
                            return itemsInGroup;
                        }
                    };

                    var addContainerToForm = function (container, form) {
                        if (container.getGroupName()) {
                            form.addItemByGroup(container.getGroupName(), instantiateContainer(container));
                        } else {
                            form.mergerForm(instantiateContainer(container));
                        }
                    };

                    for (var i = 0; i < containers.length; i++) {
                        var container = containers[i];
                        container.insertHtmlDom();
                        addContainerToForm(container, form);
                    }

                    return {
                        getForm: function () {
                            return form;
                        },
                        add: function (data) {
                            var container = parseContainer(data);
                            container.insertHtmlDom();
                            addContainerToForm(container, form);
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

                        mergerForm: function (mergeInItems) {
                            mergeObject(items, mergeInItems);
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
                        },
                        executeByNameList: function (names, funcname) {
                            if (arguments.length > 1) {
                                var args = Array.prototype.slice.call(arguments);
                                args.shift();
                                for (var i = 0; i < names.length; i++) {
                                    var name = names[i];
                                    var keylist = name.split('.');
                                    var itemsInGroup = getDeepData(items, keylist);
                                    iterateWidget(itemsInGroup, args);
                                }

                            }
                        }
                    }


                },
                Item: function (data) {
                    if (data['widget']) {
                        return (function (data) {
                            var originalValue;
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
                                    return widget.execute.apply(widget, args);
                                },
                                setValue: function (m_data) {
                                    var data = widget.setValuePre(m_data);
                                    if (originalValue === undefined) {
                                        originalValue = data;
                                    }
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
                            var originalValue;
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
                                    if (originalValue === undefined) {
                                        originalValue = value;
                                    }
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
                mergeJsonObject: mergeJsonObject,
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
                        {type: 'Object', name: 'grp2', children: [
                            {name: 'group1', type: 'String', maxLength: 20, required: true},
                            {name: 'group2', type: 'String', maxLength: 20, required: true}
                        ]},
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
                            errorMsg.push("字段不符，请求数据中缺少【" + _name + "】字段，或上送值为undefined");
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
                        _div.setAttribute("style", "width:100%;height:auto;");
                        document.body.appendChild(_div);
                        _div.innerHTML = "<span style='font-size:13px;line-height:30px;display:block;color:#FFFFFF;background:rgb(43, 129, 175);';><span style='padding-left:30px;'>挡板测试错误提示</span></span>";
                        for (var k in errorMsg) {
                            _div.innerHTML += "<div style='background:rgb(210, 224, 230);line-height:25px;color:#2b81af'><span style='color:red;margin-left:30px;'>*&nbsp;</span>" + errorMsg[k] + "</div>";
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