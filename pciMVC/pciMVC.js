/**
 * Created with IntelliJ IDEA.
 * User: Gin
 * Date: 13-12-28
 * Time: 下午10:22
 */
(function (root, factory) {
    root.pciMVC = factory();
}(this, function () {

    var widgetEnum = {
        'textfield': PJF.ui.textfield,
        'dateinput': PJF.ui.dateinput
    };

    var template = (function () {
        var templateMap = {};
        var textFieldTemplate = '<label id="label_{{:id}}">{{:desc}}</label><input id="dom_{{:id}}" type="text"/>';
        var dateInputTemplate = '<label id="label_{{:id}}">{{:desc}}</label><input id="dom_{{:id}}" type="text"/>';
        templateMap['textfield'] = textFieldTemplate;
        templateMap['dateinput'] = dateInputTemplate;

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
        } else if (targetDataItem instanceof Object && !(targetDataItem instanceof Array)) {
            var tempArray = [];
            tempArray.push(targetDataItem);
            tempArray.push(value);
            setDeepData(root, keylist, tempArray);
        } else if (targetDataItem instanceof Array && !(targetDataItem instanceof Object)) {
            targetDataItem.push(value);
        }
    };

    return {
        View: {
            UlContent: function (attr) {
                var el = attr['el'];
                var groupName = attr['groupName'];
                var widget_list = [];
                var id = id_generate();
                var data_list = [];

                return {
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

                    instant: function (fn) {
                        for (var i = 0; i < widget_list.length; i++) {
                            var widget = widget_list[i];
                            widget.instant();
                            if (fn) {
                                fn(widget);
                            }
                        }
                    },

                    dynamicAddWidget: function (widget) {
                        widget_list.push(widget);
                        PJF.html.append(el, '<li>' + widget.extractHtmlContent() + '</li>');
                        widget.instant();
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
                    dom: "dom_" + rootId,
                    type: 'textfield',
                    desc: '',
                    initialize: function () {
                    }
                };
                if (attr) {
                    var attrs = mergeAttr(defaultAttr, attr);
                    if(attr['getValue'] instanceof Function){
                        var getValueFunc = attr['getValue'];
                    }
                }
                return {
                    extractHtmlContent: function () {
                        if (attrs.required) {
                            attrs.desc = '<a class="red" id = "star_' + attrs.id + '">*</a>' + attrs.desc;
                        }
                        return template.render(attrs.type, {'id': attrs.id, 'desc': attrs.desc});
                    },
                    instant: function () {
                        console.log(attrs);
                        attrs['label'] = new PJF.ui.label({dom: 'label_' + attrs.id});
                        attrs['widget'] = new widgetEnum[attrs.type](attrs);
                        attrs.initialize();
                    },
                    setRequired: function (flag) {
                        console.log(attrs.id);
                        console.log(flag);
                        PJF.html.displayArea("star_" + attrs.id, flag);
                        if (attrs['widget'].setRequired) {
                            attrs['widget'].setRequired(flag);
                        }
                    },
                    getValue:function(){
                        var value = attrs['widget'];
                        if(getValueFunc){
                            return getValueFunc(value);
                        }else{
                            return value;
                        }
                    },
                    getKey: function () {
                        return attrs['name'];
                    },
                    getWidget: function () {
                        return attrs['widget'];
                    },
                    getType: function () {
                        return 'widget';
                    },
                    excute: function (funcname) {
                        if (typeof funcname === 'string') {
                            var args = Array.prototype.slice.call(arguments);
                            args.shift();
                            if (this.hasOwnProperty(funcname)) {
                                this[funcname].apply(this, args);
                            }else{
                                attrs['widget'][funcname].apply(attrs['widget'],args);
                            }
                        }
                    }
                }

            }
        },
        Model: {
            instantForm: function (data) {
                var form = pciMVC.Model.Form();
                var containers = {};

                var parseContainer = function (data) {
                    if (data['type'] === 'ul') {

                        var ul_content = pciMVC.View.UlContent(data);
                        for (var i = 0; i < data['children'].length; i++) {
                            var child = data['children'][i];
                            if (child['category'] === 'widget') {
                                ul_content.addWidget(parseWidget(child));
                                //组件放入容器中
                            }
                            if (child['category'] === 'data') {
                                ul_content.addData(child);
                                //纯值生成Item对象存入Form中
                            }

                        }
                        containers[ul_content.getId()] = ul_content;
                    }
                };

                var parseWidget = function (data) {
                    return pciMVC.View.Widget(data['attr']);
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

                for (var container_id in containers) {
                    var container = containers[container_id];
                    container.insertHtmlDom();
                    if (typeof container.getGroupName() === 'string') {
                        var itemsInGroup = {};
                        container.instant(function (parsedWidget) {
                            safeInsertData(itemsInGroup, parsedWidget.getKey().split('.'), pciMVC.Model.Item(parsedWidget));
                        });
                        container.getDatas().forEach(function (data) {
                            safeInsertData(itemsInGroup, data.name.split('.'), pciMVC.Model.Item(data.value));
                        });
                        form.addItemByGroup(container.getGroupName(), itemsInGroup);
                    } else {
                        container.instant(function (parsedWidget) {
                            form.addItem(parsedWidget.getKey(), parsedWidget); //将widget放在Item存入Form
                        });
                        container.getDatas().forEach(function (data) {
                            form.addItem(data.name, data.value);
                        });
                    }
                }

                return {
                    getForm: function () {
                        return form;
                    },
                    dynamicAdd: function (containerName, item) {
                        //todo
                        var container = containers[containerName];
                        if (item['category'] === 'widget') {

                        }
                        if (item['category'] === 'data') {
                            if (typeof container['groupName'] === 'string') {
                                form.addItemByGroup(container['groupName'], item['value']);
                            } else {
                                form.addItem(item['name'], item['value']);
                            }
                        }
                    }
                }
            },


            Form: function () {

                var items = {};

                var getItemsValue = function (items, store, groupName) {
                    for (var key in items) {
                        if (items[key]['getValue']) {
                            if (groupName) {
                                store[groupName] || (store[groupName] = {});
                                store[groupName][key] = items[key]['getValue']();
                            }
                        } else {
                            getItemsValue(items[key], store, key);
                        }
                    }
                };


                return {
                    addItem: function (key, value) {
                        var keylist = key.split('.');
                        safeInsertData(items, keylist, pciMVC.Model.Item(value));
                    },

                    addItemByGroup: function (groupName, groupValue) {
                        if (items[groupName] === undefined) {
                            items[groupName] = groupValue;
                        } else if (items[groupName] instanceof Object && !(items[groupName] instanceof Array)) {
                            var tempArray = [];
                            tempArray.push(items[groupName]);
                            tempArray.push(groupValue);
                            items[groupName] = tempArray;
                        } else if (items[groupName] instanceof Array && !(items[groupName] instanceof Object)) {
                            items[groupName].push(groupValue);
                        }
                    },

                    getItems: function () {
                        return items;
                    }
                }


            },
            Item: function (data) {
                if (data.getType && data.getType() === 'widget') {
                    return (function (data) {
                        return data;
                    }(data))
                } else {
                    return (function (data) {
                        return {
                            setValue: function (m_data) {
                                data = m_data;
                            },
                            getValue: function () {
                                if (data instanceof Function){
                                    return data();
                                }else{
                                    return data;
                                }
                            }
                        }
                    })(data)
                }

            }
        }
    }
}));