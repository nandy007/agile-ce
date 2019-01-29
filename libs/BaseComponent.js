


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
        var pre = this.$.vm.getVMPre().data;
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

    __initProto(){
        var _this = this;
        var __props = [];
        this.__props = __props;
        // 内部属性
        for(var k in (this.props||{})){
            __props.push(k);
            var prop = this.props[k];
            prop.init ? prop.init() : prop.handler && prop.handler(this.getAttrValue(k));
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
        // 内部事件
        for(var k in this.events){
            var event = this.events[k];
            event.handler && event.handler();
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
                rs = typeof attrValue!=='object' ? JSON.parse(attrValue) : attrValue;
            }catch(e){
                rs = null;
            }
        }
        
        return rs;
    }

    setData(obj){
        if(!this.$vm) return;
        var pre = this.$.vm.getVMPre().data;
        obj = pre ? {data: obj} : obj;
        this.$vm.setViewData(obj);
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

    created(){
        this.__initInnerDom();
        this.initViewData && this.initViewData();
        this.initProto && this.initProto();
        this.__initEvent();
        this.__initProto();
        this.__mvvmRender();
    }

    attrChanged(attrName, attrValue){
        if(this.__props&&this.__props.indexOf(attrName)>-1){
            var prop = this.__getProp(attrName);
            prop.handler && prop.handler(this.getAttrValue(attrName));
        }
    }

    triggerEvent(evtName, param){
        this.$jsDom.trigger(evtName, [param]);
    }

    selectComponent(selector){
        var selectCom = this.$root.find(selector)[0];
        return selectCom && selectCom.component;
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

module.exports = BaseComponent;

