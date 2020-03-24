
(function(){

	var $ = require('./env').JQLite;
	var Observer = require('./Observer');

	var watcherUtil = {
		iterator : function(deps, subs){//深度遍历订阅
			if(!deps||deps.length===0) return subs;
			var dep = deps.shift();
			var sub = subs[dep] = subs[dep]||{};
			return this.iterator(deps, sub);
		},
		fomateSubPath : function(path){//格式化订阅路径
			return path.replace(/\.([^\.]+)/g, '["$1"]');
		},
		deleteSub : function(subs, $access){//删除订阅
			var func  = new Function('subs', 'delete subs.'+this.fomateSubPath($access)+';');
			func(subs);
		},
		swapSub : function(subs, tSub, oSub){//交换订阅绑定
			var func = new Function('subs', 'subs.'+this.fomateSubPath(tSub)+' = subs.'+this.fomateSubPath(oSub)+';');
			func(subs);
		},
		typeExts: {
			string: ['length', 'endsWith', 'indexOf', 'substr', 'substring', 'toLowerCase', 'toUpperCase', 'replace', 'charAt'],
			array: ['length', 'indexOf']
		},
		getTypeExts: function(val){
			var type = (val instanceof Array ? 'array' : typeof val).toLowerCase();
			return $.util.copyArray(watcherUtil.typeExts[type] || []);
		}
	};

	/**
	 * watcher 数据订阅模块
	 * @param   {Parser}  parser       [Parser示例对象]
	 * @param   {Object}  model        [数据模型]
	 */
	function Watcher (parser, model) {
		
		this.parser = parser;

		this.$model = model;

		//依赖订阅缓存
		this.$depSub = {};
		this.$directDepSub = {};

		this.swapFuncCache = {};
		this.delFuncCache = {};

		this.observer = new Observer(model, this);
	}

	Watcher.addTypeExt = function(type, exts){
		watcherUtil[type] = (watcherUtil[type] || []).concat(exts);
	};

	var wp = Watcher.prototype;


	/**
	 * watch深度订阅数据改变回调
	 * @param   {Object}    options
	 */
	wp.deepChange = function(subs, path){
		if(!subs) return;
		$.util.each(subs, function(k, sub){
			var ext = path + '.' + k;
			$.util.each(sub['$'] || [], function (i, cb) {
				var options = {
					path: ext
				};
				cb(Object.assign({}, options, { path: ext }), i);
			});
			// 继续深度遍历后面的节点
			this.deepChange(sub, ext);
		}, this);
	};

	/**
	 * watch订阅数据改变回调
	 * @param   {Object}    options
	 */
	wp.change = function(options){
		var exts = watcherUtil.getTypeExts(options.newArray || options.newVal);
		$.util.each(exts, function(i, ext){
			exts[i] = options.path + '.' + ext;
		});
		exts.unshift(options.path);
		var subs = this.$depSub, deep = options.deep;

		$.util.each(exts, function(index, ext){
			var sub = watcherUtil.iterator(ext.split('.'), subs);
			$.util.each(sub['$']||[], function(i, cb){		
				cb(Object.assign({}, options, {path: ext}), i);
			});
			if(deep){
				this.deepChange(sub, ext);
			}
		}, this);
	};

	wp.changeDirect = function(){
		$.util.each(this.$directDepSub, function(k, arr){		
			$.util.each(arr, function(i, cb){
				cb({path: k}, i);
			});
		});
	};

	wp.makeSwapFunc = function($access){
		if(this.swapFuncCache[$access]) return this.swapFuncCache[$access];
		var prePath = watcherUtil.fomateSubPath($access);
		var func = new Function('subs', 'tIndex', 'oIndex', 'subs.'+prePath+'[tIndex] = subs.'+prePath+'[oIndex];');
		return this.swapFuncCache[$access] = func;
	}

	wp.makeDelFunc = function($access){
		if(this.delFuncCache[$access]) return this.delFuncCache[$access];
		var prePath = watcherUtil.fomateSubPath($access);
		var func  = new Function('subs', 'index', 'delete subs.'+prePath+'[index];');
		return this.delFuncCache[$access] = func;
	}

	/**
	 * 订阅依赖集合的变化回调
	 * @param   {Object}    depends
	 * @param   {Function}  callback
	 * @param   {Object}    fors
	 */
	wp.watch = function (depends, callback, fors) {
		var parser = this.parser, _this = this;
		var subs = this.$depSub;
		$.util.each(depends, function(i, dep){
			// list[0].username   list[0].attrs[1].username
			var _dep = dep.replace(/\[/, '.').replace(/\]/, '');
			var isDirect = _dep===dep?false:true;
			dep = _dep;
			if(isDirect){
				_this.$directDepSub[dep] = _this.$directDepSub[dep] || [];
				_this.$directDepSub[dep].push(function(){
					parser.watchBack(fors, callback, arguments);
				});
			}else{
				var sub = watcherUtil.iterator(dep.split('.'), subs);
				sub['$'] = sub['$']||[];
				
				sub['$'].push(function(){
					parser.watchBack(fors, callback, arguments);
				});
			}
			
		});
	};

	/**
	 * vfor数据变更刷新索引
	 * @param   {String}    $access         [指令真实路径]
	 * @param   {Object}    options         [操作选项]
	 * @param   {Function}  cb              [回调函数]
	 * @param   {Function}  handlerFlag     [订阅处理标识]
	 */
	wp.updateIndex = function($access, options, cb, handlerFlag){
		var method = options.method;
		switch(method){
			case 'pop' : 
				this.updateIndexForPop.apply(this, arguments);
				break;
			case 'xPush' : 
			case 'push' : 
				this.updateIndexForPush.apply(this, arguments);
				break;
			case 'shift' : 
				this.updateIndexForShift.apply(this, arguments);
				break;
			case 'unshift' : 
				this.updateIndexForUnshift.apply(this, arguments);
				break;
			case 'splice' : 
				this.updateIndexForSplice.apply(this, arguments);
				break;
			/*case 'revers' :
			case 'sort' :
			case 'xSort' :*/
			default : 
				break;
		}
	};

	wp.updateIndexForPop = function($access, options, cb, handlerFlag){
		var subs = this.$depSub;
		var len = options.oldLen;
		var delFunc = this.makeDelFunc($access);
		if(handlerFlag) delFunc(subs, len-1); // watcherUtil.deleteSub(subs, $access+'.'+(len-1));
	};

	wp.updateIndexForPush = function($access, options, cb, handlerFlag){
		
	};

	wp.updateIndexForShift = function($access, options, cb, handlerFlag){
		var len = options.oldLen;
		var subs = this.$depSub;
		var swapFunc = this.makeSwapFunc($access);
		var delFunc = this.makeDelFunc($access);
		for(var i=1;i<len;i++){
			var ni = i-1,
				oPath = $access+'.'+i,
				nPath = $access+'.'+ni,
				oIndexPath = oPath+'.*',
				nIndexPath = nPath+'.*';

			if(handlerFlag) swapFunc(subs, ni, i); // watcherUtil.swapSub(subs, nPath, oPath);

			cb({
				path : nIndexPath,
				oldVal : i,
				newVal : ni
			});
		}

		if(handlerFlag) delFunc(subs, len-1); //watcherUtil.deleteSub(subs, $access+'.'+(len-1));
	};

	wp.updateIndexForUnshift = function($access, options, cb, handlerFlag){
		var len = options.oldLen;
		var gap = options.newLen-options.oldLen;
		var subs = this.$depSub;
		var swapFunc = this.makeSwapFunc($access);
		var delFunc = this.makeDelFunc($access);
		for(var i=len-1;i>-1;i--){
			var ni = i+gap,
				oPath = $access+'.'+i,
				nPath = $access+'.'+ni,
				oIndexPath = oPath+'.*',
				nIndexPath = nPath+'.*';

			if(handlerFlag) swapFunc(subs, ni, i); //watcherUtil.swapSub(subs, nPath, oPath);

			cb({
				path : nIndexPath,
				oldVal : i,
				newVal : ni
			});
		}

		if(!handlerFlag) return;
		for(var i=0;i<gap;i++){
			// watcherUtil.deleteSub(subs, $access+'.'+i);
			delFunc(subs, i);
		}

	};

	wp.updateIndexForSplice = function($access, options, cb, handlerFlag){

		var args = $.util.copyArray(options.args),
			start = args.shift(),
			rank = args.shift(),
			len = options.oldLen,
			gap = 0;

		var subs = this.$depSub;

		var swapFunc = this.makeSwapFunc($access);
		var delFunc = this.makeDelFunc($access);

		if(options.args.length===1){
			if(!handlerFlag) return;
			for(var i=start;i<len;i++){
				// watcherUtil.deleteSub(subs, $access+'.'+i);
				delFunc(subs, i);
			}
		}else if(rank===0){
			var len = options.oldLen;
			var gap = options.newLen-options.oldLen;
			var subs = this.$depSub;

			for(var i=len-1;i>start-1;i--){
				var ni = i+gap,
					oPath = $access+'.'+i,
					nPath = $access+'.'+ni,
					oIndexPath = oPath+'.*',
					nIndexPath = nPath+'.*';

				if(handlerFlag) swapFunc(subs, ni, i); //watcherUtil.swapSub(subs, nPath, oPath);

				cb({
					path : nIndexPath,
					oldVal : i,
					newVal : ni
				});
			}

			if(!handlerFlag) return;
			for(var i=start;i<start+gap;i++){
				// watcherUtil.deleteSub(subs, $access+'.'+i);
				delFunc(subs, i);
			}
		}else{
			var pos = start + rank;
			gap = args.length - rank;

			for(var i=pos;i<len;i++){
				
				var ni = i+gap,
					oPath = $access+'.'+i,
					nPath = $access+'.'+ni,
					oIndexPath = oPath+'.*',
					nIndexPath = nPath+'.*';

				if(handlerFlag) swapFunc(subs, ni, i); // watcherUtil.swapSub(subs, nPath, oPath);

				cb({
					path : nIndexPath,
					oldVal : i,
					newVal : ni
				});
			}
			if(!handlerFlag) return;
			if(gap<0){
				for(var i=len+gap;i<len;i++){
					// watcherUtil.deleteSub(subs, $access+'.'+i);
					delFunc(subs, i);
				}
			}else if(gap>0){
				for(var i=start;i<pos+1;i++){
					// watcherUtil.deleteSub(subs, $access+'.'+i);
					delFunc(subs, i);
				}
			}

			//$.util.warn(JSON.stringify(subs));
		}

	};

	/**
	 * 销毁
	 */
	wp.destroy = function(){
		this.observer.destroy();
		this.$depSub = {};
		this.$directDepSub = {};
		this.swapFuncCache = {};
		this.delFuncCache = {};
		this.parser = this.observer = null;
	}

	
	module.exports = Watcher;
})();