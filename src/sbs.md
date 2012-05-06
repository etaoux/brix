实体:
pagelet
brick
tmpl
data

标签属性:
bx-pagelet
bx-brick
bx-parent
bx-subtmpl

chunk:一个可以html区块,由一份数据(dataset)+一个模板(tmpl)经过简单数据加工后经由mustache生成,这个过程要在前台后台皆可运行(因此要不涉及前台交互相关代码).

dataunit:一个业务数据单元,从业务意义上看,不可以再细分.
dataset:一个key/value对,value是一个dataunit,key为这个dataunit的名字.
datahelper:协助获取解析数据的helper?

tmpl:模板(渲染时对应于dataset)
subtmpl:子模板(渲染时对应于dataset的一个特定子集)
tmplhelper:协助获取解析目标的helper?

datatype:数据类型?
dataschema:复杂数据的结构描述信息?提取某种数据类型的方法描述?
metadata:元数据?

brick:extend chunk. 组件对象,内容输出已经完成,或交由内置的chunk部分完成,chunk以外的部分,负责子目标解析,处理交互等添加组件前台行为相关任务.
pagelet:extend chunk. 页面区域对象,内容输出交由内置的chunk部分完成,负责获取区域内brick,并按约定为brick增加组件行为.对应Magix的View.
page:一个逻辑或真实页面对象(一个时间点,页面内所有内容),启动页面内pagelet相关任务.书写brick间交互.


10:00-12:00 详细设计