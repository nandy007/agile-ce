
# 指令用法

注：下面内容出现的<code>expression</code>是指js表达式。

比如：

```javascript
// 变量表达式
userinfo.username

// 计算表达式
'今天是'+today.day+'!'

// 函数表达式
computedSrc(item.id)

// 逻辑表达式
!!isShow
item.status||'无状态'
item.age>18?'成年人':'未成年'

```

## v-text

文本注入指令，有两种写法：

写法一：使用双花括号包裹变量

```html

<span>{{expression}}</span>

```

写法二：使用<code>v-text</code>指令

```html

<span v-text="expression"></span>

```

## v-html

html富文本注入指令，有两种写法

写法一：表达式计算结果仅作为代码片段插入到dom中

```html

<div v-html="expression"></div>

```

写法二：表达式计算结果作为代码片段插入到dom中，代码片段如果有指令会继续编译和注入数据

```html

<div v-html:deep="expression"></div>

```

## v-xhtml

html富文本注入扩展指令，用于自定义组件中。

写法：<code>v-xhtml:slot-name="expression"</code>

其中<code>slot-name</code>为组件内元素的属性slot-name对应的值。表达式的计算结果将作为代码片段添加到该元素内，如果代码片段中包含指令会继续编译和注入数据。


## v-for

循环体指令。

其形式可以有两种：

<code>v-for="item in variable"</code> 和 <code>v-for="item,index in variable"</code>

用于循环显示一组数据。其中：

<code>variable</code>必须是一个数组；

<code>item</code>是循环体中数组元素的别名变量，在循环体内使用数组元素都可以通过item来调用。所有的vfor的别名变量不可相同。

<code>index</code>是循环体中索引值别名变量，如果没有则默认为$index。所有的vfor的索引别名变量不可相同，一旦相同，后面的覆盖前面，即内层的索引生效。

还可以对循环体元素设置for-index指定别名，规则跟index相同。

v-for指令所在的元素（包含）会不断被复制并顺序绑定变量对应的数组元素。

特别的，循环的索引可以通过<code>$index</code>来获取，当有循环嵌套的时候$index特指当前所在循环体的索引值。

比如：

```html
<div vfor="info in list">
    <span>{{$index}}：{{info.title}}</span>
</div>
```
假设list变量的内容为：
```javascript
var obj = {
    list : [
        {title:'标题1'},
        {title:'标题2'}
    ]
};
```

则渲染的结果为：
```html
<div>
    <span>标题1</span>
</div>
<div>
    <span>标题2</span>
</div>
```

**注意事项**

1. 使用vfor组件时，vfor绑定的必须是数组元素；
2. 对于数组元素的操作必须使用数组函数，包括：pop/push/sort/shift/splice/unshift/reverse;
3. 除此之外，数组对象扩展了如下函数：xSort(用法同sort)/xPush(用法同push)/$set(重置某个位置的元素)/$reset(重置整个数组对象)；
4. Array.$set(index, obj);// index为要重置的数组元素的位置，obj为重置后的值
5. Array.$reset(newArr);// newArr为新的数组


## v-filter

支持对vfor数据进行预处理。循环到的每个对象每次有变化都会进到v-filter回调中。

写法：<code>v-filter="expression"</code>。expression的执行结果应该是一个函数。该函数固定接受两个参数：<code>index</code>（当前循环索引）和<code>item</code>（当前循环到的对象）。

函数的this指针包含一个函数<code>reObserve()</code>，一旦调用则item数据重新监测，一般用于给item添加数据后对新数据进行监测。

比如：

```javascript

{
    data: {
        text: 'click',
        list: [
            {
                name: 'title1',
            },
            {
                name: 'title2',
            }
        ]
    },
    methods: {
        click: function(item){
            item.disabled = !item.disabled;
        },
        doFilter: function(index, item){
            // 同样的数据会可能会重复调用filter，需要判断如果已经处理过则不再处理（判断条件视具体业务定）
            if(typeof item.disabled==='undefined'){
                // 给循环对象添加disabled属性
                item.disabled = true;
                // 并对当前对象重新监测，如果不重新监测，则当disabled值变化时不会体现到dom的变化中
                this.reObserve();
            }
        }
    }
}

```

```html

<div id="app">
    <div v-for="item in list" v-filter="doFilter" v-on:click="click(item)" v-xclass="{{item.disabled?'red':'blue'}}">{{item.name}}</div>
</div>

```


## v-on

绑定事件指令。

有两种使用方式：

方式一：单个事件绑定

写法：<code>v-on:eventName="FuncName||funcName([,params])"</code>

方式二：一个或多个事件绑定

写法：<code>v-on="{eventName1:FuncName||funcName([,params])[, eventName2: FuncName||funcName([,params])]}"</code>

需要注意的是指令作为html的属性存在的，而html属性不区分大小写，所以，方式一的事件名只支持函数名为小写的事件。如果事件名包含大小写，则需要使用方式二。

比如：

```html

<button v-on:click="doClick">点击我</button>

<div class="animate" v-on="{transitionend:animEnd,webkitAnimationEnd:animEnd}">动画</div>

```

**参数注意事项：**

1. 如果表达式函数不包含参数，则视事件触发传参为准，一般第一个参数为event；

2. 如果表达式函数包含参数，则传递什么参数就是什么参数。

3. 如果表达式包含参数，又想包含事件参数event，可使用<code>$event</code>代替，比如：

```html

<button v-on:click="doClick(username, $event)">点击我</button>

```

## v-bind

属性绑定指令，该指令不是双向绑定指令。只能通过表达式改变属性值，不能通过改变属性值改变表达式的值

用法：<code>v-bind:attr="expression"</code>

<code>attr</code>为属性名，表达式运算结果可赋值给属性attr。


## v-data

数据绑定指令（非dataset，而是存储在dom上的数据），该指令也不是双向绑定指令。

用法：<code>v-data:attr="expression"</code>

<code>data</code>为数据名，表达式运算结果可赋值key为attr的数据。

**注：**

v-data与v-bind的区别是，v-bind绑定的数据会被清理，而v-data则不会。

所谓清理是相对于污染数据而言，经过mvvm绑定的数据都是被污染的（增加了数据变化监控），清理后的数据则是指没有数据变化监听的数据。

所以，如果需要给dom绑定一个函数，则需要使用v-data。

另外，html的属性是忽略大小写的，所以冒号:后的attr必须是全小写的，如果有多个单词可以使用-连接。


## v-style

绑定样式指令。

写法：<code>v-style="{styleAttr:expression[, styleAttr:expression]}"</code>

其中<code>styleAttr</code>为样式属性名，<code>expression</code>为表达式。expression的运算结果将作为styleAttr的属性值。

比如：

## v-xstyle

绑定样式指令扩展写法。

写法：<code>v-xstyle="styleAttr:{{expression}}[;styleAttr:{{expression}}]"</code>

其中<code>styleAttr</code>为样式属性名。expression的运算结果将作为styleAttr的属性值。


## v-class

绑定类名指令。

写法：<code>v-class="{className:expression[,className:expression]}"</code>

其中<code>className</code>为类名，expression的运算结果为true则dom添加className，否则dom移除className。

## v-xclass

绑定类名扩展指令。

写法：<code>v-xclass="icon iconfont {{expression1}} {{expression2}}"</code>

其中花括号之外的内容会作为类加到dom中，而花括号内的表达式的计算结果也会作为类加到dom中。当表达式的计算结果有变化时，之前计算出的结果会作为类移除出dom，变化后的结果添加到dom中。

## v-if/v-elseif/v-else

用于控制dom是否渲染。

写法：<code>v-if/v-elseif/v-else="expression"</code>

当表达式运算结果为true的时候v-if/v-elseif所在组件的内容渲染，否则内容不渲染；v-else相反。

## v-show

用于控制dom是否显示。无论dom显示与否，dom都存在在文档中。

用法：<code>v-show="expression"</code>

当表达式的结果为true时，dom显示，否则隐藏。

为了保证组件显示时的样式正确，请勿设置dom的显示样式为<code>display:none;</code>，否则显示时将设置样式<code>display:block;</code>，（比如某个dom显示的时候希望<code>display:flex</code>则可能得不到想要的结果）。

## v-model

双向绑定指令。

有一下几种写法：

写法一：<code>v-model:text="expression"</code>

此种写法适用于绑定输入框类的组件。

写法二：<code>v-model:checkbox="expression"</code>

此种写法适用于绑定多选框类组件。

**要求expression变量的值必须是一个数组，当某个的checkbox的value在expression中时，此checkbox组件选中，否则相反。当某个checkbox被选中时，expression的数组中会添加此checkbox的值，反之移除此checkbox的值。**

写法三：<code>v-model:radio="expression"</code>

此种写法适用于绑定单选框类组件。

当expression的值与radio的value值相等时radio选中，否则相反。当radio选中时，expression的值等于选中的radio的值。

写法四：<code>v-model:select="expression"</code>

此写法适用于绑定单选select类组件。

与radio类似，expression的值与select下的options的值相对应。

写法五：<code>v-model:switch="expression"</code>

此写法使用与绑定开关按钮类组件

expression的值为boolean时，当为true则switch为开状态，反之为关状态。

还可以给dom设置<code>true-value</code>和<code>false-value</code>。当expression值与true-value相等时，switch为开状态，与false-value相等时为关状态。


**需要注意：**

标准表单dom的value都是字符串形式，如果expression为数字形态，需要在dom添加<code>number</code>属性；为布尔型，需要在dom添加<code>boolean</code>属性。

比如：

```javascript

$('#app').render({
    data: {
        cks: [2]
    }
});


```

对应的html：

```html

<input type="checkbox" value="1" number v-model:checkbox="cks"/>
<input type="checkbox" value="2" number v-model:checkbox="cks"/>
<input type="checkbox" value="3" number v-model:checkbox="cks"/>

```

初始化结果为value值为2的checkbox选中，如果不加number属性则没有checkbox选中。其他双向绑定指令同理。






