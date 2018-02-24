
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

		this.observer = new Observer(model, this);
	}

	var wp = Watcher.prototype;

	/**
	 * watch订阅数据改变回调
	 * @param   {Object}    depends
	 * @param   {Function}  callback
	 */
	wp.change = function(options){
		var watcher = this;
		var subs = this.$depSub;
		var sub = watcherUtil.iterator(options.path.split('.'), subs);

		$.util.each(sub['$']||[], function(i, cb){
			cb(options, i);
		});
	};

	/**
	 * 订阅依赖集合的变化回调
	 * @param   {Object}    depends
	 * @param   {Function}  callback
	 * @param   {Object}    fors
	 */
	wp.watch = function (depends, callback, fors) {
		var parser = this.parser;
		var subs = this.$depSub;
		$.util.each(depends, function(i, dep){
			var sub = watcherUtil.iterator(dep.split('.'), subs);
			sub['$'] = sub['$']||[];
			sub['$'].push(function(){
				parser.watchBack(fors, callback, arguments);
			});
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
		if(handlerFlag) watcherUtil.deleteSub(subs, $access+'.'+(len-1));
	};

	wp.updateIndexForPush = function($access, options, cb, handlerFlag){
		
	};

	wp.updateIndexForShift = function($access, options, cb, handlerFlag){
		var len = options.oldLen;
		var subs = this.$depSub;
		for(var i=1;i<len;i++){
			var ni = i-1;
				oPath = $access+'.'+i,
				nPath = $access+'.'+ni,
				oIndexPath = oPath+'.*',
				nIndexPath = nPath+'.*';

			if(handlerFlag) watcherUtil.swapSub(subs, nPath, oPath);

			cb({
				path : nIndexPath,
				oldVal : i,
				newVal : ni
			});
		}

		if(handlerFlag) watcherUtil.deleteSub(subs, $access+'.'+(len-1));
	};

	wp.updateIndexForUnshift = function($access, options, cb, handlerFlag){
		var len = options.oldLen;
		var gap = options.newLen-options.oldLen;
		var subs = this.$depSub;

		for(var i=len-1;i>-1;i--){
			var ni = i+gap;
				oPath = $access+'.'+i,
				nPath = $access+'.'+ni,
				oIndexPath = oPath+'.*',
				nIndexPath = nPath+'.*';

			if(handlerFlag) watcherUtil.swapSub(subs, nPath, oPath);

			cb({
				path : nIndexPath,
				oldVal : i,
				newVal : ni
			});
		}

		if(!handlerFlag) return;
		for(var i=0;i<gap;i++){
			watcherUtil.deleteSub(subs, $access+'.'+i);
		}

	};

	wp.updateIndexForSplice = function($access, options, cb, handlerFlag){

		var args = $.util.copyArray(options.args),
			start = args.shift(),
			rank = args.shift(),
			len = options.oldLen,
			gap = 0;

		var subs = this.$depSub;

		if(options.args.length===1){
			if(!handlerFlag) return;
			for(var i=start;i<len;i++){
				watcherUtil.deleteSub(subs, $access+'.'+i);
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

				if(handlerFlag) watcherUtil.swapSub(subs, nPath, oPath);

				cb({
					path : nIndexPath,
					oldVal : i,
					newVal : ni
				});
			}
			if(!handlerFlag) return;
			if(gap<0){
				for(var i=len+gap;i<len;i++){
					watcherUtil.deleteSub(subs, $access+'.'+i);
				}
			}else if(gap>0){
				for(var i=start;i<pos+1;i++){
					watcherUtil.deleteSub(subs, $access+'.'+i);
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
		this.parser = this.observer = null;
	}

	
	module.exports = Watcher;
})();