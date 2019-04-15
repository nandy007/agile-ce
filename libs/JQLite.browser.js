(function(){
	var _$ = window.jQuery||window.$||require('./jQuery'), JQLite = _$, jqlite = JQLite;

	var jqliteUtil = require('./JQLiteUtil');

	// 重写attr方法，当属性属性改变触发事件
	var origin_attr = jqlite.prototype.attr;
	jqlite.prototype.attr = function(){
		var args = jqlite.util.copyArray(arguments);
		var rs;
		if(jqliteUtil.isBooleanAttr(args[0])){
			rs = jqliteUtil.booleanAttrForJquery.apply(this, args)
		}else{
			if(typeof args[1]!=='undefined'){
				args[1] = jqliteUtil.stringify(args[1]);
				if(this.attr(args[0])===args[1]) return this;
			}
			rs = origin_attr.apply(this, args);
		}
		
		if(args.length===2){
			this.triggerHandler('attrChanged', args[0], this.attr(args[0]));
		}
		return rs;
	};

	// 重写val方法
	var origin_val = jqlite.prototype.val;
	jqlite.prototype.val = function(){
		var args = jqlite.util.copyArray(arguments);
		var el = this[0];
		if(!el) return args.length===0 ? '' : this;
		var funcName = origin_val;
		if(typeof el.value==='undefined'){
			funcName = this.attr;
			args.unshift('value');
		}
		return funcName.apply(this, args);
	};

	// 扩展xprop方法
	var origin_prop = jqlite.prototype.prop;
	jqlite.prototype.xprop = function(name, val){
		var args = jqlite.util.copyArray(arguments);
		var el = this[0];
		if(!el) return args.length===0 ? '' : this;
		if(arguments.length===1){
            var el = this.length>0 && this[0];
            if(!el) return '';
            var rs = origin_prop.call(this, name);
            if(typeof rs==='undefined'){
                rs = el.getAttribute(name);
            }
            if(rs===''||rs===undefined||rs===null||rs==='false'){
                rs = false;
            }
            return !!rs;
        }else if(arguments.length===2){
			var rs = origin_prop.call(this, name);
			if(typeof rs==='undefined'){
				this.each(function(){
					this.setAttribute(name, val);
				});
			}else{
				origin_prop.call(this, name, val);
			}
			this.triggerHandler('attrChanged', name, val);
        }
		return this;
	};

	jqlite.fn.extend({
		isChecked: function(){
			return this.is(':checked') || this.attr('checked');
		},
		getPage: function(){
			var dom = document.querySelector('aui-page > .active') || document;
			return jqlite(dom);
		},
		outerHTML: function(){
			return this.prop('outerHTML');
		},
		childs : function(index){
			if(jqlite.util.isNumber(index)){
				return this.contents().eq(index);
			}else{
				return this.contents.apply(this, arguments)
			}
		},
		textContent : function(){
			var content = arguments[0], el = this[0]||{};
			if(arguments.length===0){
				return el.textContent;
			}else{
				this.each(function(){
					this.textContent = content;
				});
				return this;
			}
		},
		attrs : function(){
			var el = this[0]||{};
			var arr = [];
			jqlite.util.each(el.attributes, function(i, attr){
				arr.push(attr);
			});
			return arr;
		},
		hasAttr : function (name) {
			var el = this.length>0&&this[0];
			return el&&el.hasAttribute&&el.hasAttribute(name);
		},
		isElement : function(){
			return this.length>0&&this[0].nodeType===1;
		},
		elementType : function(){
			var type, el = this[0]||{}, nodeType = el.nodeType;
			if(nodeType===1){
				var tagName = el.tagName.toLowerCase();
				if(tagName==='input'){
					type = el.type;
				}else{
					type = tagName;
				}
			}else if(nodeType===3){
				type = '#text';
			}else{
				type = nodeType;
			}
			return type;
		},
		replaceTo : function(el){
			var $el = jqlite(el);
			var $this = this;
			if($this.childs().length===0){
                $el.remove();
            }else{
                $el.replaceWith(this);
            }
			
			return this;
		},
		render: function (data) {
			if(this.length!==1) return null;
			var el = this[0], vm = el.vm;
			if(!data)  return vm;
			return el.vm = jqlite.vm(this, data);
		},
		def : function(name, val){
			if(arguments.length===1){
				return this.length > 0 && this[0][name];
			}else if(arguments.length===2){
				this.each(function(){
					jqlite.util.defRec(this, name, val)
				});
			}
			return this;
		},
		__on__: function (evt, selector, callback) {
			this.each(function () {
				var $node = jqlite(this), aceEvents = this['__ace-events__'] || [];
				if (aceEvents.indexOf(evt) > -1) return;
				aceEvents.push(evt);
				jqlite.util.defRec(this, '__ace-events__', aceEvents);
			});
			this.on.apply(this, arguments);
		},
		__remove_on__: function(parserIndex){
			jqlite(this).find('[acee="'+parserIndex+'"]').each(function(){
				var $node = jqlite(this), aceEvents = this['__ace-events__'] || [];
				jqlite.util.defRec(this, '__ace-events__', null);
				jqlite.util.each(aceEvents, function(i, evt){
					$node.off(evt);
				});
			});
		},
		tag: function(){
			var el = this.length>0&&this[0];
			return el && el.tagName.toLowerCase();
		},
		getComponent: function(){
			var el = this.length>0&&this[0];
			return el && (el.trueDom ? el.trueDom.component : el.component);
		}
	});


	var toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,
		cons = window.console,
		consoleLevel = ['error', 'warn', 'log'],
		_cons = function(type, args){
			if(consoleLevel.indexOf(jqlite.util.consoleLevel)<consoleLevel.indexOf(type)) return;
			if (cons) cons[type].apply(cons, args);
		};


	jqlite.util = {
		consoleLevel : 'error',
		each : function(obj, callback, context){
			if(!obj) return;
			var ret;
			if(jqlite.isArray(obj)||(!jqlite.util.isString(obj)&&jqlite.util.isNotNaNNumber(obj.length))){			
				for(var i=0;i<obj.length;i++){
					ret = callback.call(context, i, obj[i]);
					if(ret === false) {
						break;
					}else if(ret === null) {
						obj.splice(i, 1);
						i--;
					}
				}
			}else if(jqlite.util.isObject(obj)){
				for(var k in obj){
					ret = callback.call(context, k, obj[k]);
					if(ret === false) {
						break;
					}else if(ret === null) {
						delete obj[k];
					}
				}
			}/*else{
				callback.call(context, 0, obj);
			}*/
		},
		isString : function (str) {
			return jqlite.type(str)==='string';
		},
		isBoolean : function (bool) {
			return jqlite.type(bool)==='boolean';
		},
		isNumber : function (num) {
			return jqlite.type(num)==='number';
		},
		isNotNaNNumber : function (num) {
			return !isNaN(num)&&this.isNumber(num);
		},
		isObject : function(obj) {
			return jqlite.type(obj)==='object';
		},
		isEvent : function(e){
			return e instanceof Event;
		},
		clearObject : function (object) {
			jqlite.util.each(object, function () {
				return null;
			});
		},
		trim : function(str){ //删除左右两端的空格
　　    	return str.replace(/(^\s*)|(\s*$)/g, "");
　　 	  },
		removeSpace : function (string) {
			return (string||'').replace(/\s/g, '');
		},
		hasOwn : function (obj, key) {
			return obj && hasOwn.call(obj, key);
		},
		copy : function (target) {
			var ret;

			if (jqlite.isArray(target)) {
				ret = target.slice(0);
			} else if (this.isObject(target)) {
				ret = jqlite.extend(true, {}, target);
			}

			return ret || target;
		},
		defObj : function(o, a, getter, setter){
			var options = {};
			if(getter){
				options.get = function(){
					return getter.apply(this);
				};
			}
			if(setter){
				options.set = function(){
					setter.apply(this, arguments);
				};
			}

			Object.defineProperty(o, String(a), options);
		},
		defRec : function (object, property, value) {
			try{
				return Object.defineProperty(object, property, {
					'value'       : value,
					'writable'    : true,
					'enumerable'  : false,
					'configurable': true
				});
			}catch(e){
				// console.warn((typeof object)+'类型不能被设置属性');
			}
		},
		copyArray : function(arr){
			return Array.prototype.slice.call(arr||[], 0);
		},
		log : function(){
			_cons('log', arguments);
		},
		warn : function () {
			_cons('warn', arguments);
		},
		error : function () {
			_cons('error', arguments);
		},
		paramTransForm : function(param){
			if(this.isObject(param)){//如果param是Object则转为键值对参数
				var rs = [];
				this.each(param, function(k, v){
					rs.push(k+'='+v);
				});
				return rs.join('&');
			}else{//如果参数是键值对则转为Object
				var reg = /([^&=]+)=([\w\W]*?)(&|$|#)/g, rs = {}, result;
				while ((result = reg.exec(param)) != null) {
					rs[result[1]] = result[2];
				}
				return rs;
			}
		},
		sync: function () {
			var args = jqlite.util.copyArray(arguments);
			var cb = args.pop();
			var len = args.length;
			var arr = [];
			jqlite.util.each(args, function (i, func) {
				(function (i, func) {
					func(function (data) {
						arr[i] = data;
						len--;
						if (len === 0) {
							cb.apply(cb, arr);
						}
					});
				})(i, func);
			});
		},
		sequence: function(){
			var args = jqlite.util.copyArray(arguments), _this = [];
			var func = args.shift();
			if(!func) return;
			if(this instanceof Array){
				_this = this;
			}
			_this.unshift(function(){
				jqlite.util.sequence.apply(jqlite.util.copyArray(arguments), args);
			});
			func.apply(null, _this);
		}
	};

	
	//继承JQLite的特殊类，用于文档碎片的存储
	var JQFragment = function(){
		return jqlite(arguments.length==0?document.createDocumentFragment():arguments[0]);
	};
	

	jqlite.ui = {
		isJQLite : function(o){
			return o instanceof JQLite;
		},
		useAdapter : function(){
			return false;
		},
		isJQAdapter : function(){
			return false;
		},
		createJQPlaceholder: function(){
			var dom = document.createComment(' ');
			dom.isPlaceholder = true;
			return jqlite(dom);
		},
		createJQFragment : function(){
			return new JQFragment();
		},
		toJQFragment : function($el){
			var $fragment = this.createJQFragment();

			if($el instanceof JQLite){
				$el.childs().each(function(){
					$fragment.append(this);
					return null;
				});
			}else if(typeof $el==='object'){
				jqlite.util.each(jqlite.util.copyArray($el.childNodes), function(i, child){
					$fragment.append(child);
					return null;
				});
			}else if (/<[^>]+>/g.test($el)) {
				var div = document.createElement('div');
				div.innerHTML = $el;
				jqlite.util.each(jqlite.util.copyArray(div.childNodes), function(i, child){
					$fragment.append(child);
					return null;
				});
			}else {
				$fragment.append(document.createTextNode($el));
			}

			return $fragment;
		}
	};

	jqlite.document = document;

	require('./JQLiteExt')(jqlite);

	module.exports = jqlite;

	window.JQLite = jqlite;

	if(!window.$){
		window.$ = jqlite;
	}
	if(!window.jQuery){
		window.jQuery = jqlite;
	}

	if (typeof __EXPORTS_DEFINED__ === 'function') __EXPORTS_DEFINED__(jqlite, 'JQLite');

	var _template = require('./template');
	jqlite.template = _template;
	
})();