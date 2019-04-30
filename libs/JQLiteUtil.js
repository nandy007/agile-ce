
var util = module.exports = {
    __booleanAttr: ['disabled', 'checked', 'selected', 'autoplay', 'hidden'],
    booleanAttr: function(){
        if(arguments.length===0) return util.__booleanAttr;
        for(var i=0, len=arguments.length;i<len;i++){
            if(util.__booleanAttr.indexOf(arguments[i])===-1){
                util.__booleanAttr.push(arguments[i]);
            }
        }
    },
    isBooleanAttr: function(name){
        var __booleanAttr = util.booleanAttr();
        return __booleanAttr.indexOf(name)>-1;
    },
    cleanJSON: function cleanJSON(obj){
		try{
			obj = JSON.parse(JSON.stringify(obj));
		}catch(e){
		}
		return obj;
    },
    stringify: function(json){
        try{
            return typeof json==='object' ? JSON.stringify(json) : json;
        }catch(e){
            console.error('json数据转换字符串失败：'+String(json));
        }
        return json;
    },
    parse: function(val){
        try{
            return JSON.parse(val);
        }catch(e){
            console.error('json字符串转换对象失败：'+String(val));
        }
        return val;
    },
    booleanAttrForJquery: function(name, val){
        if(arguments.length===1){
            var el = this.length>0 && this[0];
            if(!el) return '';
            var rs = this.prop(name);
            if(typeof rs==='undefined'){
                rs = el.getAttribute(name);
            }
            if(rs===''||rs===undefined||rs===null||rs==='false'){
                rs = false;
            }
            return !!rs;
        }else if(arguments.length===2){
            this.each(function(){
                this.setAttribute(name, val);
            });
            return this.prop(name, val);
        }
        return this;
    }
};