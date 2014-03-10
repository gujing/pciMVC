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
            {category: 'widget', attr: {desc: '文本框1',  type: 'textfield', getValuePost:function(data){return data+'post'},pjfAttr:{name: 'test'}}}
        ]
        },
        {
            category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp1', children: [
            {category: 'widget', attr: {desc: '文本框2',  type: 'dateinput', pjfAttr:{name: 'group1'}}},
            {
                category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp3', children: [
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

    /*form.add({
     category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp2', children: [
     {category: 'widget', attr: {desc: '文本框21', required: true, type: 'textfield', name: 'input'}},
     {category: 'widget', attr: {desc: '文本框21', required: true, type: 'textfield', name: 'input'}},
     {category: 'widget', attr: {desc: '文本框31', required: true, type: 'textfield', name: 'input2'}}
     ]
     });*/

//    form.executeInGroup('grp2', 'setRequired', false);

    var testData = {test: '123', test1: '1111', grp1: {group1: '2223', group2: '5632'}};
    console.log(form.getItems());
    form.setFormData(testData);
    console.log(form.getFormData());

    /*new PJF.ui.areaSelector({
        dom:'ssx',
        cityName:'city',
        provinceName:'province',
        countyName:'county'
    });*/
});