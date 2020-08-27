
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
    },
    extend() {
        var jQuery = JQLite;
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
    
        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
    
            // Skip the boolean and the target
            target = arguments[ i ] || {};
            i++;
        }
    
        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
            target = {};
        }
    
        // Extend jQuery itself if only one argument is passed
        if ( i === length ) {
            target = this;
            i--;
        }
    
        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];
    
                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }
    
                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];
                            target[ name ] = copy;
    
                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                            target[ name ] = this.extend( deep, clone, copy );
                        }
    
                        // Never move original objects, clone them
                        // target[ name ] = jQuery.extend( deep, clone, copy );
    
                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
    
        // Return the modified object
        return target;
    }
};