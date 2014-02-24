PJF.html.bodyReady(function () {
    /*var canvas = new pciMVC.View.Canvas({el: 'main'});
     var ul = new pciMVC.View.UlContent({columnCount: '2'});
     var textField = pciMVC.View.Widget({desc: '文本框', required: true});
     ul.addWidget(textField);
     var form = new pciMVC.Model.Form({el: 'main'});

     canvas.addUlContent(ul);
     canvas.commit();
     form.attachForm();*/

    var view = {category: 'form', el: 'form_trans', children: [
        {
            category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp', children: [
            {
                category: 'widget', attr: {desc: '文本框1', required: true, type: 'textfield', name: 'input'}
            }
        ]
        },
        {
            category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp', children: [
            {
                category: 'widget', attr: {desc: '文本框2', required: true, type: 'textfield', name: 'input'}
            }
        ]
        }
    ]};

    var form = pciMVC.Model.instantForm(view);
    console.log(form.getForm().getItems());
});