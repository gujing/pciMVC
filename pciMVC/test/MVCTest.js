var root = pciMVC.Util.createNamespace(window, 'pci.test.MVCTest');
PJF.html.bodyReady(function () {

    root.view = {category: 'form', el: 'form_trans', children: [
        {
            category: 'container', type: 'ul', el: 'ul_part1', children: [
            {category: 'widget', attr: {id: 't_id', desc: '文本框1', type: 'textfield', getValuePost: function (data) {
                return data + 'post'
            }, pjfAttr: {name: 'test'}}},
            {category: 'widget', attr: {desc: '文本框2', type: 'textfield', getValuePost: function (data) {
                return data + 'post'
            }, pjfAttr: {name: 'test1'}}},
            {category: 'widget', attr: {desc: '结束日期', type: 'dateinput', pjfAttr: {name: 'endTime'}}}
        ]
        },
        {
            category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp1', groupType: 'Group', children: [
            {category: 'widget', attr: {desc: '文本框2', type: 'dateinput', pjfAttr: {name: 'group1'}}},
            {
                category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp3', groupType: 'Array', children: [
                {category: 'widget', attr: {desc: '结束日期', type: 'dateinput', pjfAttr: {name: 'endTime'}}},
                {category: 'widget', attr: {desc: '结束日期', type: 'dateinput', pjfAttr: {name: 'endTime2'}}}
//                {category: 'widget', attr: {desc: '下拉框',  type: 'selector', pjfAttr:{name: 'group1', categoryId: '116426'}}},
//                {category: 'widget', attr: {desc: 'auto',  type: 'auto', pjfAttr:{name: 'group2', categoryId: '116341'}}}
            ]
            }
        ]
        }
    ]};

    var form = pciMVC.Model.FormInstantiator(root.view).getForm();
    root.handler = form;
    console.log(root);


    form.executeInGroup('grp1', 'setRequired', true);
    form.executeByNameList(['test', 'test1'], 'setDisplay', false);

    var testData = {test: '1111', endTime: '20121212', grp1: [
        {group1: '2223', group2: '5632'}
    ]};
    form.setFormData(testData);
    console.log(form.getFormData());
    //使用
    console.log(pciMVC.Util.getWidgetById('t_id').getValue());


    $.get("../data/simple.xml", function (xml) {
        var jsonObj = $.xml2json(xml);
        if (jsonObj) {
            var newJson = new Array();
            jsonObj = jsonObj.node;
            for (var i = 0; i < jsonObj.length; i++) {
                if (jsonObj[i].children) {
                    jsonObj[i].children = jsonObj[i].children.node;
                }
                newJson.push(jsonObj[i]);
            }
            console.log(PJF.util.json2str(newJson));
        }

    });

    pciMVC.Util.UnitTest({
        fwTranId: 'A00000test',
        jsonData: testData,
        callback: function (data) {
            alert(data)
        }
    });
});