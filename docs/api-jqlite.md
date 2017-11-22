# JQLite API

<h2 id="cid_0">使用</h2>

在commonhs规范中可以通过如下代码引入JQLite：
```javascript
var $ = require('JQLite');
```

在html中可以直接通过<code>$</code>或者<code>JQLite</code>来使用JQLite。

### 基本用法

JQLite语法与jQuery基本一致，而且浏览器版是直接内置使用了jQuery。

```javascript
var $el = $(selector);//通过selector选择器获取一个JQlite对象
```

### 选择器类型

浏览器版与jQuery完全一致，这里主要是说明精简版本（jqlite版）。

目前支持的选择器为：

> 类型选择器：如button

> ID选择器： 如 #submit

> 类选择器： 如 .login

> 属性选择器[att="val"）：如 [type="text"]


支持的关系符为：

> 空格：所有子孙节点

> &gt;：子节点

<h2 id="cid_1">基础</h2>

> [isElement(): boolean;](#cid_1_0)

> [elementType(): string;](#cid_1_1)

> [is(status:string): boolean;](#cid_1_2)

<span id="cid_1_0">**isElement(): boolean;**</span>

判断JQlite操作的对象是否为元素节点，当有多个节点时返回第一个节点的类型。

比如：

```javascript
var $el = $('<box></box>');
$.util.log($el.isElement()); // box是一个元素节点，打印结果为true
```

<span id="cid_1_1">**elementType(): string;**</span>

返回当前节点的类型，如果为元素节点返回值为元素的标签名；如果为文本节点返回值为#text。

<span id="cid_1_2">**is(status:string): boolean;**</span>

status的值必须以<code>:</code>开头，为<code>:checked</code>或<code>:selected</code>，即判断元素是否被选中，一般用于checkbox、radio或select等表单组件

<h2 id="cid_2">元素集</h2>

本节内容与jQuery用法基本一致，不做赘述。

> [(selector: string, context?: any): IJQLite;](#)

> [add(el:IJQLite): IJQLite;](#)

> [get(index:number): IJQLite;](#)

> [childs(index?:number): IJQLite;](#)

> [parent(): IJQLite;](#)

> [find(selector:string): IJQLite;](#)

> [first(): IJQLite;](#)

> [last(): IJQLite;](#)

> [before($el:IJQLite): IJQLite;](#)

> [after($el:IJQLite): IJQLite;](#)

> [next(selector:string): IJQLite;](#)

> [prev(selector:string): IJQLite;](#)

> [siblings(selector:string): IJQLite;](#)

> [empty(): IJQLite;](#)

> [remove(): IJQLite;](#)

> [append(el: any): IJQLite;](#)

> [replaceWith(el: any): IJQLite;](#)

> [appendTo(el: any): IJQLite;](#)

> [insertAfter(el: any): IJQLite;](#)

> [insertBefore(el: any): IJQLite;](#)

> [replaceTo(el: any): IJQLite;](#)

> [clone(isDeep?:boolean): IJQLite;](#)


<h2 id="cid_3">操作</h2>

本节内容与jQuery用法基本一致，不做赘述。这里仅列出<code>render</code>的用法。

> [render(data: Object): any;](#cid_3_0)

> [textContent(text?:string): any;](#)

> [attrs(prop?:string, val?:any): any;](#)

> [html(content?:string): any;](#)

> [text(text?:string): any;](#)

> [html(content?:string): any;](#)

> [val(val?:any): any;](#)

> [css(prop:any, val?:any): any;](#)

> [attr(attrName?:string, attrVal?:any): any;](#)

> [prop(attrName?:string, attrVal?:any): any;](#)

> [removeAttr(prop:string): any;](#)

> [hasAttr(prop:string): boolean;](#)

> [hasClass(className:string): boolean;](#)

> [addClass(className:string): IJQLite;](#)

> [removeClass(className:string): IJQLite;](#)

> [data(key:string, val?:any): any;](#)

> [show(): any;](#)

> [hide(): any;](#)


<span id="cid_3_0">**render(data: Object): any;**</span>

<code>render</code>方法是绑定mvvm的入口，JQLite内的元素为视图层，render的入参data为数据层，render返回的是一个mvvm类的示例对象。

```javascript
var obj = {title:'hello world'};
var vm = $('#view').render(obj); // vm变量类型是一个mvvm类的示例对象

obj.title = 'new title'; // 绑定数据的变化会联动到界面上view元素中
```

**mvvm类的方法**

> getData(): Object; // 返回绑定的data数据

> reset(): void; //将data的数据还原


<h2 id="cid_4">工具</h2>

> [each(cb:Function): IJQLite;](#)

> [on(evt:string, selector?:string, callback?:Function): IJQLite;](#)

> [trigger(evt:string, params?:any): IJQLite;](#)

> [off(evt:string, callback?:Function): IJQLite;](#)

> [exe(funcName:any, params?:any): any;](#)

> [ready(cb:Function):any;](#)

> [animate(props:any, duration?:number, easing?:string, complete?:Function): any;](#)


<h2 id="cid_5">静态</h2>

> [each(obj:Object, callback:Function, context?:Object): void;](#)

> [	type(obj:any): string;](#)

> [	isArray(obj:any): boolean;](#)

> [	isFunction(obj:any): boolean;](#)

> [	isEmptyObject(obj:any): boolean;](#)

> [	isPlainObject(obj:any): boolean;](#)

> [	extend(target:Object, source:Object, isDeep?:boolean): Object;](#)

> [	ajax(settings: any): void;](#)

> [	util:IJQLiteUtil;](#)



<h2 id="cid_6">扩展</h2>

与jQuery的扩展一致，可以通过<code>.fn.extend</code>来实现