#pciMVC功能说明
目录

[设计思路](#anchor1)  
[数据描述规则](#anchor2)  
[API参考](#anchor3)
### 修改记录
修改日期|修改内容|修改人
------|-------|------
2014/3/6|0.0.1a发布|古晶

##[设计思路](id:anchor1)
通过对数据项的描述代替之前创建组件所需的html代码和JS代码。并提供对于数据通用性操作的统一处理

##[数据描述规则](id:anchor2)
数据描述分为四类 form,container,widget,data。示例：

	{category: 'form', el: 'form_trans', children: [
                {
            category: 'container', type: 'ul', el: 'ul_part1', children: [
            {category: 'widget', attr: {desc: '文本框1', required: true, type: 'textfield', name: 'test'}},
            {category: 'widget', attr: {desc: '文本框11', required: true, type: 'textfield', name: 'test1'}}
        ]
        },
        {
            category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp1', children: [
            {category: 'widget', attr: {desc: '文本框2', required: true, type: 'textfield', name: 'group1'}},
            {category: 'widget', attr: {desc: '文本框2', required: true, type: 'textfield', name: 'group2'}},
            {
                category: 'container', type: 'ul', el: 'ul_part1', groupName: 'grp3', children: [
                {category: 'widget', attr: {desc: '下拉框', required: true, type: 'selector', name: 'group1', categoryId: '116426'}},
                {category: 'widget', attr: {desc: 'auto', required: true, type: 'auto', name: 'group2', categoryId: '116341'}}
            ]
            }
        ]
        }
    ]};
    
###[form](id:anchor21)
form用于描述提交到后台的数据集合

属性名|说明
----|--
category|类别定义，此处为form
el|对应html中form的id属性
children|数组格式，描述form中所具有的数据项，只能包含container

### container
container用于描述组件在界面上放置的位置和数据项所属的层级

属性名|说明
----|--
category|类别定义，此处为container
el|对应html中包含组件dom的容器的id属性(如列式布局则为ul的id)
groupName|组名（可选）,表示数据项所属的层级,不影响界面展示
children|数组格式，描述container中所具有的数据项，可以包含widget,data以及container

### widget
widget用于描述需要在界面上展示的组件

属性名|子属性|说明
----|---|--
category|-|类别定义，此处为widget
attr|-|初始化所需属性
-|type|实例化组件类型，现支持`'textfield': PJF.ui.textfield,'dateinput': PJF.ui.dateinput,'selector': PJF.ui.select,'auto': PJF.ui.autoComplete`
-|desc|组件描述，代替之前代码中label组件
-|pjfAttr|用于实例化pjf组件所需传入参数（dom属性无需传入）
-|initialize|(可选)pjf组件实例化完成调用完成额外初始化工作
-|getValue|(可选)重写取值操作，参数为pjf组件getValue方法返回值

### data
data用于描述不在界面上展示的数据项

属性名|子属性|说明
----|---|--
category|-|类别定义，此处为data
attr|-|初始化所需属性
-|name|数据项对应key值
-|defaultValue|(可选)默认值
-|getValue|(可选)重写取值操作，参数为当前值

## [API参考](id:anchor3)
### pciMVC.Model.FormInstantiator
用于初始化form创建

方法名|参数|说明
----|---|--
getForm|-|获取创建的form
add|data|动态增加数据项，data为需要动态增加的数据项，格式与初始化时相同

### pciMVC.Model.Form
数据集合封装对象

方法名|参数|说明
----|---|--
getItems|-|获取所有Item对象
getFormData|-|根据初始化结构返回所有数据项的值
setFormData|data|根据与初始化结构相符的JSON对象对存储的Item对象进行赋值
getItemByName|key|根据name属性查找对应的Item并返回，对于深层对象，各个层级用`.`分隔
executeInGroup|groupName, funcname|对一个group内的数据项进行全量操作。`groupName`为需要操作的组名，`funcname`为要执行操作的方法名，方法所需的参数按次序加入实参中。

### pciMVC.Model.Item
数据项封装，对widget和data提供统一的取值设值接口

方法名|参数|说明
----|---|--
setValue|data|设值
getValue|-|取值
getType|-|返回封装的数据项类型`widget`或`data`
execute|funcname|widget类型特有方法，用于执行组件方法，`funcname`为要执行操作的方法名，方法所需的参数按次序加入实参中。