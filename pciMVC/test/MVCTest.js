var root = pciMVC.Util.createNamespace(window, 'pci.test.MVCTest');
PJF.html.bodyReady(function () {
    /*var view = {category: 'form', el: 'form_trans', children: [
     {
     category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp', children: [
     {category: 'widget', attr: {desc: '文本框1', required: true, type: 'textfield', name: 'input'}},
     {category: 'widget', attr: {desc: '文本框11', required: true, type: 'textfield', name: 'input'}}
     ]
     },
     {
     category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp1', children: [
     {category: 'widget', attr: {desc: '文本框2', required: true, type: 'textfield', name: 'input'}},
     {category: 'widget', attr: {desc: '文本框2', required: true, type: 'textfield', name: 'input'}},
     {category: 'widget', attr: {desc: '文本框3', required: true, type: 'textfield', name: 'input2'}},
     {category: 'data', attr: {name: 'tms', defaultValue: '2121212'}}
     ]
     }
     ]};*/


    root.view = {category: 'form', el: 'form_trans', children: [
        {
            category: 'container', type: 'ul', el: 'ul_part1', children: [
            {category: 'widget', attr: {desc: '文本框1', type: 'textfield', getValuePost: function (data) {
                return data + 'post'
            }, pjfAttr: {name: 'test'}}},
            {category: 'widget', attr: {desc: '文本框2', type: 'textfield', getValuePost: function (data) {
                return data + 'post'
            }, pjfAttr: {name: 'test'}}},
            {category: 'widget', attr: {desc: '结束日期', type: 'dateinput', pjfAttr: {name: 'endTime'}}}
        ]
        },
        {
            category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp1', groupType: 'Group', children: [
            {category: 'widget', attr: {desc: '文本框2', type: 'dateinput', pjfAttr: {name: 'group1'}}},
            {
                category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp3', groupType: 'Array', children: [
//                {category: 'widget', attr: {desc: '下拉框',  type: 'selector', pjfAttr:{name: 'group1', categoryId: '116426'}}},
//                {category: 'widget', attr: {desc: 'auto',  type: 'auto', pjfAttr:{name: 'group2', categoryId: '116341'}}}
            ]
            }
        ]
        }
    ]};

    var form = pciMVC.Model.FormInstantiator(root.view).getForm();
    console.log(root);
    /*var txf = form.getForm().getItems()['grp']['input'][0];
     txf.execute('setRequired', false);
     txf.execute('disabled', false);*/

    /*form.add({var x = $.xml2json(xml);
     category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp2', children: [
     {category: 'widget', attr: {desc: '文本框21', required: true, type: 'textfield', name: 'input'}},
     {category: 'widget', attr: {desc: '文本框21', required: true, type: 'textfield', name: 'input'}},
     {category: 'widget', attr: {desc: '文本框31', required: true, type: 'textfield', name: 'input2'}}
     ]
     });*/

//    form.executeInGroup('grp2', 'setRequired', false);

    var testData = {test: ['123', '1111'], endTime: '20121212', grp1: [
        {group1: '2223', group2: '5632'}
    ]};
    console.log(form.getItems());
    form.setFormData(testData);
    console.log(form.getFormData());

    /*new PJF.ui.areaSelector({
     dom:'ssx',
     cityName:'city',
     provinceName:'province',
     countyName:'county'
     });*/

    /**
     * 挡板测试
     *
     var xml = "<root>"+
     "<node name='test'>Test Value</node>"+
     "<node name='test2'><![CDATA[Test Value 2]]></node>"+
     "<group name='test3'>"+
     "<item name='Item 1' value='1'/>"+
     "<item name='Item 2' value='2'/>"+
     "<item name='Item 3' value='3'/>"+
     "</group>"+
     "</root>";*/

    $.get("../data/simple.xml", function (xml) {
        var x = $.xml2json(xml);
        console.log(x);
        alert(PJF.util.json2str(x))
    });

    pciMVC.Util.UnitTest({
        fwTranId: 'A00000test',
        jsonData: testData,
        callback: function (data) {
            alert(data)
        }
    });
});