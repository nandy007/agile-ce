
(function(){
	var $ = require('./env').JQLite;
	var Compiler = require('./Compiler');
	
	
	/**
	 * MVVM 构造函数入口
	 * @param  {JQLite}      element  [视图的挂载节点]
	 * @param  {Object}      model    [数据模型对象]
	 */
	function MVVM (element, model) {

		// 初始数据备份
		this.backup = $.util.copy(model);

		// ViewModel 实例
		this.vm = new Compiler(element, model);

		// 数据模型
		this.$data = this.vm.$data;
	}

	var mp = MVVM.prototype;


	/**
	 * 销毁mvvm对象
	 */
	mp.destroy = function(){
		if(!this.vm) return;
		this.vm.destroy();
		this.backup = this.vm = this.$data = null;
	}


	/**
	 * 重置数据模型至初始状态
	 * @param   {Array|String}  key  [数据模型字段，或字段数组，空则重置所有]
	 */
	mp.reset = function (key) {
		var vm = this.$data;

		if ($.util.isString(key)) {
			vm[key] = backup[key];
		}else if ($.isArray(key)) {
			$.util.each(key, function (i, v) {
				vm[v] = backup[v];
			});
		}else {
			$.util.each(vm, function (k, v) {
				vm[k] = backup[k];
			});
		}
	};

	mp.extend = function(target, source){
		for(var k in source){
			var tObj = target[k], sObj = source[k];
			var tf = typeof tObj;
			if( ['undefined', 'function'].indexOf(tf)>-1 ) continue;
			if(tObj instanceof Array){
				target[k] = sObj instanceof Array ? $.extend(true, [], sObj) : [];
			}else if(tf==='object'){
				this.extend(tObj, sObj);
			}else{
				target[k] = sObj;
			}
		}
	};

	/**
	 * 设置绑定数据
	 */
	mp.setData = function(obj){
		var viewData = this.$data;
		for(var k in obj){
			var func = new Function('d', 'v', `try{d.${k}=v;}catch(e){console.error(e);}`);
			var v = obj[k];
			if(typeof v==='object') v = JSON.parse(JSON.stringify(v));
			func(viewData, v);
		}
	};

	/**
	 * 设置数据变化回调
	 */
	mp.dataChange = function(cb){
		var _this = this;
		this.vm.$element.on('__mvvmDataChange', function(e, options){
			cb.call(_this, JSON.parse(JSON.stringify(options)));
		});
	}

	/**
	 * 获取 mvvm 绑定的数据
	 */
	mp.getData = function(){
		return this.$data;
	};

	/**
	 * 获取vm前缀
	 */
	mp.getVMPre = function(type){
		return this.vm.parser.getVmPre(type);
	};

	module.exports = MVVM;
})();