


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
        }
    }

    __initProto(){
        if(!this.props) return;
        var __props = [];
        this.__props = __props;
        for(var k in this.props){
            __props.push(k);
            var prop = this.props[k];
            prop.init ? prop.init() : prop.handler && prop.handler(this.getAttrValue(k));
        }
        for(var k in this.events){
            var event = this.events[k];
            event.handler && event.handler();
        }
    }

    __mvvmRender(){
        if(!this.viewData) return;
        var $render = this.$root || this.$jsDom;
        $render.attr('vmignoreroot', 'true')
                .on('__destroy__', ()=>{
                    this.$vm.destroy();
                });
        this.$vm = $render.render(this.viewData);
    }

    getAttrValue(name){
        var prop = this.props[name], defaultValue = prop.defaultValue, type = (prop.type||'string').toLowerCase();
        if(prop.getValue) return prop.getValue(); // hook
        var attrValue = this.$jsDom.attr(name);
        if(attrValue===null||attrValue===''||attrValue===undefined){
            attrValue = defaultValue;
        }
        var rs = attrValue;
        
        if(type==='boolean'){
            rs = attrValue==='true'||attrValue===true?true:false;
        }else if(type==='number'){
            try{
                var cur = Number(attrValue);
                rs = typeof cur==='number'?cur:null;
            }catch(e){
                rs = null;
            }
        }else if(type==='object'){
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
        this.$vm.setData(obj);
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
            var prop = this.props[attrName];
            prop.handler && prop.handler(this.getAttrValue(attrName));
        }
    };
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

