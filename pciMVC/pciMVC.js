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
        'textfield': PJF.ui.textfield
    };

    var widgetAttrsEnum = {
        'textfield': ['dom', 'id', 'name', 'required', 'onclick']
    };

    var template = (function () {
        var templateMap = {};
        var textFieldTemplate = '<label id="label_{{:id}}">{{:desc}}</label><input id="dom_{{:id}}" type="text"/>'
        templateMap['textfield'] = textFieldTemplate;

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

    var filter = function (source, includeList) {
        var res = {};
        for (var i = 0; i < includeList.length; i++) {
            var includeKey = includeList[i];
            for (var key in source) {
                if (key === includeKey) {
                    res[key] = source[key];
                }
            }
        }
        return res;
    };

    var mergeAttr = function (source, extend) {
        for (var key in extend) {
            source[key] = extend[key];
        }
        return source;
    };


    return {
        View: {
            UlContent: function (attr) {
                var el = attr['el'];
                var groupName = attr['groupName'];
                var widget_list = [];

                return {
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

                    dynamicAddWidget:function(widget){
                        widget_list.push(widget);
                        PJF.html.append(el,'<li>' + widget.extractHtmlContent() + '</li>');
                        widget.instant();
                    },

                    getGroupName:function(){
                        return groupName;
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
                }
                return {
                    extractHtmlContent: function () {
                        if (attrs.required) {
                            attrs.desc = '<a class="red" id = "star_' + attrs.id + '">*</a>' + attrs.desc;
                        }
                        return template.render(attrs.type, {'id': attrs.id, 'desc': attrs.desc});
                    },
                    instant: function () {
                        var attr = filter(attrs, widgetAttrsEnum[attrs.type]);
                        console.log(attr);
                        attrs['label'] = new PJF.ui.label({dom: 'label_' + attrs.id});
                        attrs['widget'] = new widgetEnum[attrs.type](attr);
                        attrs.initialize();
                    },
                    setRequired: function (flag) {
                        PJF.html.displayArea("star_" + attrs.id, flag);
                        if (attrs['widget'].setRequired) {
                            attrs['widget'].setRequired(flag);
                        }
                    },
                    setDisabled: function (flag) {
                        if (attrs['widget'].disabled) {
                            attrs['widget'].disabled(flag);
                        }
                    },
                    setReadOnly: function (flag) {
                        if (attrs['widget'].setReadOnly) {
                            attrs['widget'].setReadOnly(flag);
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
                                if (typeof data['groupName'] === 'string') {
                                    form.addItemInGroup(child['name'], child['value'], data['groupName']);
                                } else {
                                    form.addItem(child['name'], child['value']);
                                }
                                //纯值生成Item对象存入Form中
                            }

                        }
                        containers[data['el']] = ul_content;
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

                for (var el in containers) {
                    var container = containers[el];
                    container.insertHtmlDom();
                    container.instant(function(parsedWidget){
                        if (typeof container.getGroupName() === 'string') {
                            form.addItemInGroup(parsedWidget.getKey(), parsedWidget, container.getGroupName());
                        } else {
                            form.addItem(parsedWidget.getKey(), parsedWidget);
                        }
                        //将widget放在Item存入Form
                    });
                }

                return {
                    getForm: function () {
                        return form;
                    },
                    dynamicAdd:function (containerName, item){
                        var container = containers[containerName];
                        if(item['category'] === 'widget'){

                        }
                        if(item['category'] === 'data'){
                            if (typeof container['groupName'] === 'string') {
                                form.addItemInGroup(item['name'], item['value'], container['groupName']);
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
                        items[key] = pciMVC.Model.Item(value);
                    },

                    addItemInGroup: function (key, value, groupName) {
                        items[groupName] || (items[groupName] = {});
                        items[groupName][key] = pciMVC.Model.Item(value);
                    },

                    getItems: function () {
                        return items;
                    }
                }


            },
            Item: function (data) {
                if (data.getType() === 'widget') {
                    return (function (data) {
                        return data.getWidget();
                    }(data))
                } else {
                    return (function (data) {
                        return {
                            setValue: function (m_data) {
                                data = m_data;
                            },
                            getValue: function () {
                                return data;
                            }
                        }
                    })(data)
                }

            }
        }
    }
}));
