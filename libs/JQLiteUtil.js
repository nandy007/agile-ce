
var util = module.exports = {
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
    disabledAttrForJquery: function(name, val){
        if(arguments.length===1){
            var el = this.length>0 && this[0];
            return el && el.getAttribute('disabled');
        }else if(arguments.length===2){
            val = (val==='false'||val===false) ? false : true;
            this.each(function(){
                val ? this.setAttribute('disabled', val) : this.removeAttribute('disabled');
            });
        }
        return this;
    }
};