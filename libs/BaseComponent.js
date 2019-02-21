


class BaseComponent{

    constructor(el){
        this.jsDom = el;
    }

    __initInnerDom(){
        var jsDom = this.jsDom, $ = require('./env').JQLite;
        jsDom.component = this;
        this.$ = $;
        this.$jsDom = $(jsDom);
        var root = jsDom.getRootElement && jsDom.getRootElement();
        if(root){
            root.trueDom = jsDom;
            this.root = root;
            this.$root = $(root);
        }else{
            this.$root = this.$jsDom;
        }
        // this.__setThisData();
    }

    __setThisData(isCreat){
        if(this.data) return;
        if(!this.viewData && isCreat){
            this.viewData = {};
        }
        var viewData = this.viewData;
        if(!viewData) return;
        var pre = this.__getVmPre();
        if(pre){
            this.data = viewData[pre] = viewData[pre] || {};
        }else{
            this.data = viewData;
        }
    }

    __setViewData(k, v){
        var data = this.data;
        data[k] = v;
    }

    __addCommProps(){
        var props = this.props;
        if(!props) props = this.props = {};
        var $jsDom = this.$jsDom, comp = this;
        var commProps = {
            hidden: {
                type: Boolean,
                handler: function(val){
                    $jsDom[val?'show':'hide']();
                },
                init: function(){
                    if($jsDom.hasAttr('hidden')) this.handler(comp.getAttrValue('hidden'));
                }
            },
            slotClass: {
                type: String,
                lastVal: null,
                handler: function(val){
                    var $slot = $jsDom.find('#slot').first();
                    if(this.lastVal){
                        $jsDom.removeClass(this.lastVal);
                        $slot.removeClass(this.lastVal);
                    }
                    if(val){
                        $jsDom.addClass(val);
                        $slot.addClass(val);
                    }
                    this.lastVal = val;
                },
                init: function(){
                    if($jsDom.hasAttr('slotClass')) this.handler(comp.getAttrValue('slotClass'));
                }
            }
        };
        for(var k in commProps){
            if(!props[k]) props[k] = commProps[k];
        }
    }

    __initProto(){
        var _this = this;
        var __props = [];
        this.__props = __props;

        // 内部事件
        for(var k in this.events){
            var event = this.events[k];
            event.init ? event.init() : (event.handler && event.handler());
        }

        // 外部属性
        this.__setThisData(this.properties);
        for(var k in (this.properties||{})){
            __props.push(k);
            var prop = this.properties[k];
            (function(k){
                _this.__setViewData(k, _this.getAttrValue(k));
				prop.handler = function(val){
					_this.__setViewData(k, val);
				}
            })(k);
        }

        // 内部属性
        for(var k in (this.props||{})){
            __props.push(k);
            var prop = this.props[k];
            prop.init ? prop.init() : prop.handler && prop.handler(this.getAttrValue(k));
        }

        // 内部方法挂载
        this.__wrapperMethod(this.methods);

        // 外部方法挂载
        var viewData = this.viewData || {};
        this.__wrapperMethod(viewData.methods);

    }

    __wrapperMethod(methods){
        for(var k in (methods || {})){
            var method = methods[k];
            if(typeof method!=='function') continue;
            (function(ctx, k){
                var oldFunc = ctx[k];
                ctx[k] = function(){
                    oldFunc && oldFunc.apply(ctx, arguments);
                    return method.apply(ctx, arguments);
                };
            })(this, k);
        }
    }

    __mvvmRender(){
        if(!this.viewData) return;

        this.$root.attr('vmignoreroot', 'true')
                .on('__destroy__', ()=>{
                    this.$vm.destroy();
                });
        this.$vm = this.$root.render(this.viewData);
    }

    __getProp(name){
        return (this.props && this.props[name]) || (this.properties && this.properties[name]);
    }

    // 获取属性值，基础组件内可调用
    getAttrValue(name){
        var prop = this.__getProp(name), defaultValue = prop.value, type = prop.type||String; // String, Number, Boolean, Object, Array, null
        if(prop.getValue) return prop.getValue(); // hook
        var attrValue = this.$jsDom.attr(name);
        if(attrValue===null||attrValue===''||attrValue===undefined){
            attrValue = defaultValue;
        }
        var rs = attrValue;
        
        if(type===Boolean){
            rs = attrValue==='true'||attrValue===true?true:false;
        }else if(type===Number){
            try{
                var cur = Number(attrValue);
                rs = typeof cur==='number'?cur:null;
            }catch(e){
                rs = null;
            }
        }else if(type===Object||type===Array){
            try{
                // rs = typeof attrValue!=='object' ? JSON.parse(attrValue) : attrValue;
                rs = typeof attrValue!=='object' ? (new Function(`try{ return ${attrValue};}catch(e){return null;}`))() : attrValue;
            }catch(e){
                rs = null;
            }
        }
        
        return rs;
    }
    __getVmPre(){
        return this.viewData && this.viewData.data ? 'data' : this.$.vm.getVMPre().data;
    }
    // 设置data值，基础组件和扩展组件都可调用，对应小程序setData
    setData(obj){
        var pre = this.__getVmPre();
		var nObj = {};
		if(pre){
			nObj[pre] = obj;
		}else{
			nObj = obj;
		}
		if (!this.$vm){
			this.$.extend(true, this.viewData, nObj);
		}else{
			this.$vm.setViewData(nObj);
		}
    }

    __initEvent(){
        this.__attrChangeHandler();
    }

    __attrChangeHandler(){
        if(!this.attrChanged) return;
        this.$jsDom.on('attrChanged', (e, ...args)=>{
            this.attrChanged(...args);
        });
    }
    // 组件创建回调函数，基础组件和扩展组件都可调用，对应小程序的loaded
    created(){
        this.__initInnerDom();
        this.initViewData && this.initViewData();
        this.initProto && this.initProto();
        this.__addCommProps();
        this.__initEvent();
        this.__initProto();
        this.__mvvmRender();
    }
    // 属性变化回调，基础组件内可调用
    attrChanged(attrName, attrValue){
        if(this.__props&&this.__props.indexOf(attrName)>-1){
            var prop = this.__getProp(attrName), val = this.getAttrValue(attrName);
            prop.handler && prop.handler(val);
            prop.observer && prop.observer.call(this, val);
        }
    }
    // 事件触发方法，基础组件和扩展组件都可调用，对应小程序triggerEvent
    triggerEvent(evtName, param){
        this.$jsDom.triggerHandler(evtName, [param]);
    }
    // 获取dom对象的component实例，基础组件和扩展组件都可调用，对应小程序selectComponent
    selectComponent(selector){
        var selectCom = this.$root.find(selector)[0];
        return selectCom && selectCom.component;
    }
    selectAllComponents(selector){
        var selectCom = this.$root.find(selector), rs = [];
        selectCom.each(function(){
            var curComp = selectCom && selectCom.component;
            if(curComp) rs.push(curComp);
        });
        return rs;
    }
}

BaseComponent.wrapperClass = function(MyClass){

    class Wrapper extends MyClass{
        constructor(el){
            super(el);
            this.jsDom = el;
        }
    }

    var bp = BaseComponent.prototype;
    var cp = Wrapper.prototype;
    var methods = Object.getOwnPropertyNames(bp);
    for(var i=0,len=methods.length;i<len;i++){
        var k = methods[i];
        if(k==='constructor') continue;
        if(cp[k]){
            (function(k){
                var bpFunc = bp[k], cpFunc = cp[k];
                cp[k] = function(){
                    var args = Array.prototype.slice.apply(arguments);
                    bpFunc.apply(this, args);
                    cpFunc.apply(this, args);
                };
            })(k);
            
        }else{
            cp[k] = bp[k];
        }
    }

    return Wrapper;
};


function _structure(options){
    var $ = require('./env').JQLite;
    var json = $.extend(true, {}, options);
    // var methods = json.methods; delete json.methods;
    var properties = json.properties; delete json.properties;
    var events = json.events; delete json.events;
    var props = json.props; delete json.props;
    var viewData = $.isEmptyObject(json) ? (properties ? {} : null ) : json;

    var json = {
        // methods: methods,
        properties: properties,
        events: events,
        props: props,
        viewData: viewData,
        lifecycle: {}
    };
    var lifecycleFuncs = BaseComponent.lifecycleFuncs.slice(0), funcName;
    while(funcName = lifecycleFuncs.shift()){
        _setLifecycleFunc(json, funcName);
    }

    return json;
}

function _setLifecycleFunc(json, funcName){
    var func = (json.viewData && json.viewData[funcName]) || (json.methods && json.methods[funcName]);
    json.lifecycle[funcName] = func;
}

BaseComponent.lifecycleFuncs = ['onLoad', 'onShow', 'onHide'];

BaseComponent.createClass = function(options, fullTag){
    // var json = _structure(options);
    
    function MyPage(jsDom){
        this.__json = _structure(options);
    }

    MyPage.prototype = {
        created: function(){
            var $jsDom = this.$jsDom, comp = this, json = this.__json;

            $jsDom.on('enter', function(){
                json.lifecycle.onShow && json.lifecycle.onShow.call(comp);
            });
            $jsDom.on('leave', function(){
                json.lifecycle.onHide && json.lifecycle.onHide.call(comp);
            });
            json.lifecycle.onLoad && json.lifecycle.onLoad.call(comp);
        },
        initViewData: function(){
            const json = this.__json;
            if(json.viewData) this.viewData = json.viewData;
        },
        initProto: function(){
            const json = this.__json;
            // if(json.methods) this.methods = json.methods;
            if(json.properties) this.properties = json.properties;
            if(json.props) this.props = json.props;
            if(json.events) this.events = json.events;
        }
    };

    if(fullTag) MyPage.fullTag = fullTag;

    return MyPage;
};

module.exports = BaseComponent;

