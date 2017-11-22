/*
*	Template JS模板引擎
*	Version	:	1.0.1 beta
*	Author	:	nandy007
*   License MIT @ https://github.com/nandy007/agile-template
*/
(function(){

	var _templateCache = {},_compileCache = {},
		_config = {
			openTag: '<%',    // 逻辑语法开始标签
			closeTag: '%>',   // 逻辑语法结束标签
			originalTag: '#', //逻辑语法原样输出标签
			annotation: '/\\*((?!\\*/).)*\\*/', //代码注释块正则，此处为 /*注释内容*/
			escape: true     // 是否编码输出变量的 HTML 字符
		},
		_hooks = {};
	
	//工具类
	var _helper = {
		getDom : function(id){
			return document.getElementById(id);
		},
		cache : {//内置函数和自定义函数调用全部存放于_helper.cache里
			include : function(str, _data){
				_data = _data||this||{};
				return {include:_engine.render(str, _data)};
			},
			escape : function(s1, s2){
				return typeof s2==='object'?s2.include||'':(typeof s2==='string'?(_config.escape&&!(s1===_config.originalTag)?s2.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&apos;"):s2):s2);
			},
			error : function(msg){
				_errorHandler('template.error', msg);
			}
		},
		setCache : function(k, func){
			this.cache[k] = func;
		},
		getCacheKey : function(){
			var _cache = this.cache,arr = [];
			for(var k in _cache){
				arr.push(k);
			}
			return arr;
		}
	};
		
	var _engine = {
		/**
		 * 设置模板并进行语法解析和缓存
		 * @method setter
		 * @param {String} id 模板的唯一标识
		 * @param {String} content 模板内容
		 * @return {String} 模板内容经过语法解析后的内容
		 */
		setter : function(id, content){
			return _templateCache[id] = this.syntax(content);
		},
		/**
		 * 获取模板内容语法解析后的内容
		 * @method getter
		 * @param {String} str 模板的唯一标识||模板id||模板内容
		 * @return {String} 模板内容经过语法解析后的内容
		 */
		getter : function(str){
			var _html;
			if(_templateCache[str]){
				return _templateCache[str];
			}else if(_html = _helper.getDom(str)){
				_html = /^(textarea|input)$/i.test(_html.nodeName)?_html.value:_html.innerHTML;
				return this.setter(str, _html);
			}else if(_html = _hooks.get?_hooks.get(str):''){//此处有hook
				return this.setter(str, _html);
			}else{
				_errorHandler('template.error', {'msg':'模板找不到输入内容为：'+str});
				return this.syntax(str||'');
			}
		},
		/**
		 * 模板编译器，将模板内容转成编译器，为渲染前做准备
		 * @method compile
		 * @param {String} str 模板的唯一标识||模板id||模板内容
		 * @return {Function(data)} 将模板编译后的函数，此函数在被调用的时候接收一个参数data，data为一个JSON对象，data会渲染编译后的模板内容结束整个模板渲染过程
		 */
		compile : function(str){
			var _cache = _helper.cache, syntaxBody = this.getter(str);
			return function(data){
				var dataArr = [];
				for(var k in _cache){
					if(typeof _cache[k]==='function'){
						(function(data, k){
							data[k] = function(){
								return _cache[k].apply(data, arguments);
							};
						})(data, k);
					}else{
						data[k] = _cache[k];
					}
					
				}
				var key = str;
				for(var k in data){
					dataArr.push('var '+k+'=$data["'+k+'"];');
					key += k;
				}

				try{
					var fn = _compileCache[key]||(new Function('$data', dataArr.join('')+syntaxBody));
					if(_templateCache[str]){
						_compileCache[key] = fn;
					}
					return fn(data);
				}catch(e){
					_helper.cache.error(e);
					return '';
				}
			};
		},
		/**
		 * 语法解析器，将模板内容中的自定义语法解析成JS能识别的语法
		 * @method syntax
		 * @param {String} str 模板内容
		 * @param {Object} data 要注入的JSON数据（目前暂不使用）
		 * @return {String} 将模板内容进行语法解析后的内容
		 */
		syntax : function(str, data){
			var _openTag = _config.openTag, _closeTag = _config.closeTag, _originalTag = _config.originalTag;
			var syntaxBody = "tplArr.push(__s('"+str+"').__f()";
			//此处有hooks
			syntaxBody = (_hooks.syntax?_hooks.syntax:(function(s){ return s;}))(syntaxBody
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/[\r\t\n]/g, '')
				.replace(new RegExp(_config.annotation, 'g'), '')
				.replace(new RegExp(_openTag+'[ ]*(\$data\.)?('+_helper.getCacheKey().join('|')+')', 'g'),_openTag+'=$1$2')
				/*[data?'replace':'toString'](new RegExp(_openTag+'(((?!'+_closeTag+').)*)'+_closeTag, 'g'), function(s, s1){
					return _openTag
						+s1.replace(/([^\'\"\w])([\w]+)([ ]*)([\:]?)/g, function(sa, sa1, sa2, sa3, sa4){
							return sa1+(!sa4&&data[sa2]?'$data.':'')+sa2+sa3+sa4;
						})
						+_closeTag;
				})*/
				.replace(new RegExp(_openTag+'=('+_originalTag+'?)(.*?)'+_closeTag, 'g'), "').__f(),$data.escape('$1',$2),__s('")
				.replace(new RegExp(_openTag, 'g'), "').__f());")
				.replace(new RegExp(_closeTag, 'g'), "tplArr.push(__s('")
				.replace(/__s\('(((?!__f).)*)'\).__f\(\)/g, function(s, s1){
					return "'"+s1.replace(/'/g, "\\'")+"'";
				}), data);
			return syntaxBody = "try{var tplArr=[];"+syntaxBody+");return tplArr.join('');}catch(e){$data.error(e); return '';}";
		},
		/**
		 * 模板渲染器，简化和扩展模板渲染调用
		 * @method render
		 * @param {String} str 模板的唯一标识||模板id||模板内容
		 * @param {Object} data 要注入的JSON数据
		 * @return {String} JSON数据渲染模板后的标签代码片段
		 */
		render : function(str, data){
			if(data instanceof Array){
				var html = '',
				i = 0,
				len = data.length;
				for(;i<len;i++){
					html += this.compile(str)(data[i]);
				}
				return html;
			}else{
				return this.compile(str)(data);
			}
		},
		/**
		 * 帮助类，需要在模板中要调用的自定义函数设置
		 * @method helper
		 * @param {String} funcName 函数名，在模板中调用方式为funcName()
		 * @param {Function} func 实际的处理函数
		 */
		helper : function(funcName, func){
			_helper.setCache(funcName, func);
		},
		hookHelper: function(funcName, func){
			_helper[funcName] = func;
		},
		/**
		 * 对template类进行配置设置，可进行设置的配置请参考_config内部对象
		 * @method config
		 * @param {String} k 配置名
		 * @param {String|Boolean} v 配置内容，取值视具体配置的要求
		 */
		config : function(k, v){
			_config[k] = v;
		},
		/**
		 * 此类中包含若干可以进行hook的函数，如果开发者希望自己定义可以在此设置，所有可设置hook的函数为_engine的函数
		 * @method config
		 * @param {String} k 函数名
		 * @param {Function} v 具体处理的函数
		 */
		hooks : function(k, v){
			_hooks[k] = typeof v==='function'?v:new Function(String(v));
		}
	};
	
	/**
	 * 错误处理类，当模板渲染过程出现错误会向document触发template.error事件
	 * @method _errorHandler
	 * @param {String} eName 事件名，此处为template.error
	 * @param {Obejct} params 错误信息，开发者可以通过在监听document的template.error事件的回调函数中获取此错误信息
	 */
	var _errorHandler = function(eName, params){
		if(!(document&&document.createEvent)) return;
		var event = document.createEvent('HTMLEvents');
		event.initEvent(eName, true, true);
		event.params = params;
		document.dispatchEvent(event);
	};

	var _template = function(str, data){
		return _engine.render(str, data).replace(/>\s+([^\s<\w]*)\s+</g, '><');
	};

	for(var k in _engine){
		(function(k){ _template[k] = function(){ return _engine[k].apply(_engine, arguments); }; })(k);
	}
	

	if(typeof define==='function'&&define.amd){
		define('template', function(){
			return _template;
		});
	}else if((typeof module==='function'||typeof module==='object')&&typeof module.exports==='object'){
		module.exports = _template;
	}else if(typeof this.template==='undefined'){
		this.template = _template;
	}

})();