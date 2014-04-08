var root = pciMVC.Util.createNamespace(window, 'pci.test.MVCTest');
PJF.html.bodyReady(function () {

    root.view = {category: 'form', el: 'form_trans', children: [
        {
            category: 'container', type: 'ul', el: 'ul_part1', children: [
            {category: 'widget', attr: {id: 't_id', desc: '文本框', type: 'textfield', getValuePost: function (data) {
                return data + 'post'
            }, pjfAttr: {name: 'test'}}},
            {category: 'widget', attr: {desc: '结束日期', type: 'dateinput', pjfAttr: {name: 'endTime'}}},
            {category: 'widget', attr: {desc: '开始日期', type: 'dateinput', buttons: [
                {type: 'defined', desc: '取值', onclick: function (field) {
                    alert(field.getValue())
                }},
                {type: 'defined', desc: '设值', onclick: function (field) {
                    field.setValue('4576568976')
                }}
            ], pjfAttr: {name: 'startTime'}}},
            {category: 'widget', attr: {desc: '单选按钮', type: 'radio', pjfAttr: {name: 'radio', labels: ['选项1', '选项2', '选项3'], values: ['1', '2', '3']}}},
            {category: 'widget', attr: {desc: '按钮文本框', type: 'textfield', buttons: [
                {type: 'defined', desc: '取值', onclick: function (field) {
                    alert(field.getValue())
                }},
                {type: 'defined', desc: '设值', onclick: function (field) {
                    field.setValue('4576568976')
                }}
            ], pjfAttr: {name: 'buttonfield', readonly: true}}}
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

    var form = null;

    function initForm(){
        form = pciMVC.Model.FormInstantiator(root.view).getForm();
    }

    QUnit.testStart(initForm);
    //根据定义的数据渲染界面
    test("根据定义的数据渲染界面", function () {
        propEqual(form,pciMVC.Model.Form());

    });

    test("对一个组内的所有要素执行方法",function(){
        form.executeInGroup('grp1', 'setRequired', true);
        equal(true,true);
    });
/*//对一个组内的所有要素执行方法


    //对多个组件进行统一操作的方法
    form.executeByNameList(['test', 'endTime'], 'setDisplay', false);

    //根据name取出form中的item然后执行方法
    form.getItemByName('grp1.group1').execute('setReadOnly', true);

    //对整个form进行设值操作
    var testData = {test: '1111', endTime: '20121212', grp1: [
        {group1: '2223', group2: '5632'}
    ]};
    form.setFormData(testData);

    //取出form中的数据
    console.log(form.getFormData());

    //使用id属性获取widget对象
    console.log(pciMVC.Util.getWidgetById('t_id').getValue());

    //从widget对象获取原生pjf组件
    console.log(pciMVC.Util.getWidgetById('t_id').getPJFWidget());

//根据接口定义进行数据校验
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
    });*/
});