
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
    }
};