PJF.html.bodyReady(function () {
    var view = {category: 'form', el: 'form_trans', children: [
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
    ]};

    var form = pciMVC.Model.instantForm(view);
    var txf = form.getForm().getItems()['grp']['input'][0];
    txf.execute('setRequired', false);
    txf.execute('disabled', false);

    form.add({
        category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp2', children: [
            {category: 'widget', attr: {desc: '文本框21', required: true, type: 'textfield', name: 'input'}},
            {category: 'widget', attr: {desc: '文本框21', required: true, type: 'textfield', name: 'input'}},
            {category: 'widget', attr: {desc: '文本框31', required: true, type: 'textfield', name: 'input2'}}
        ]
    });

    form.executeInGroup('grp2', 'setRequired', false);

    console.log(form.getForm().getItems());
});