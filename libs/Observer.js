
(function () {

	var $ = require('./env').JQLite;


	var util = {
		def: function(obj, prop, val){
			Object.defineProperty(obj, prop, {
				//设置是否可以枚举
				enumerable: false,
				//是否可以删除目标属性
				// configurable: false,
				// writable 控制是否可以修改(赋值)
				writable: true,
				//获取属性值  
				value: val
			});
		}
	};


	var __arrProto = Array.prototype;
	//v8引擎sort算法与浏览器不同，重写sort函数，以xSort代替
	util.def(__arrProto, 'xSort', function (fn) {
		var fn = fn || function (a, b) { return a > b; };
		for (var i = 0; i < this.length; i++) {
			for (var j = i; j < this.length; j++) {
				if (fn(this[i], this[j])) {
					var t = this[i];
					this[i] = this[j];
					this[j] = t;
				}
			}
		}
		return this;
	});
	// 重写push算法，使用索引值添加，提高效率
	util.def(__arrProto, 'xPush', function () {
		var l = this.length;
		for (var i = 0, len = arguments.length; i < len; i++) {
			this[l + i] = arguments[i];
		}
		return this;
	});

	// 增加$set方法修改元素值
	util.def(__arrProto, '$set', function (pos, item) {
		var len = this.length;
		if(pos > len){
			return this.push(item);
		}else if(pos < 0){
			return this.unshift(item);
		}
		return this.splice(pos, 1, item);
	});

	// 增加$reset方法重置数组，如果没有参数则重置为空数组
	util.def(__arrProto, '$reset', function (arr) {
		return this.splice.apply(this, [0, this.length||1].concat(arr||[]));
	});

	// 重写的数组操作方法
	var rewriteArrayMethods = [
		'pop',
		'push',
		'sort',
		'shift',
		'splice',
		'unshift',
		'reverse',
		'xSort',
		'xPush'
	];

	var observeUtil = $.observeUtil = {
		isNeed: function (val) {
			return $.isArray(val) ? 2 : (!observeUtil.ignoreObject(val) && $.util.isObject(val) ? 1 : 0);
		},
		ignoreObject(v) {
			try{
				if(v instanceof HTMLElement) {
					return true;
				} else if(v[observeUtil.IGNOREFLAG] === true) {
					return true;
				}
			} catch(e) {}

			return false;
		},
		IGNOREFLAG: Symbol.for('__ace__')
	};

	/**
	 * observer 数据变化监测模块
	 * @param  {Object}     object    [VM 数据模型]
	 * @param  {Watcher}    watcher   [Watcher实例对象]
	 */
	function Observer(object, watcher) {

		this.watcher = watcher;

		// 子对象路径缓存
		this.$subs = {};

		this.observe(object, []);
	}

	var op = Observer.prototype;

	/**
	 * 监测数据变化触发回调
	 * @param   {Object}  options  [操作选项]
	 */
	op.trigger = function (options) {
		this.watcher.change(options);
		this.watcher.changeDirect();
		try{
			this.watcher.parser.vm.$element.triggerHandler('__mvvmDataChange', [options]);
		}catch(e){
			console.error(e);
		}
	};

	/**
	 * 监测数据模型
	 * @param   {Object}  object  [监测的对象]
	 * @param   {Array}   paths   [访问路径数组]
	 */
	op.observe = function (object, paths, parent) {
		var isArr = $.isArray(object);
		if (isArr) {
			this.observeArray(object, paths);
		}

		$.util.each(object, function (property, value) {
			var ps = paths.slice(0);
			// ps.push({p:property});
			ps.push(this.getPObj(value, object, property));

			if(!isArr) this.observeObject(object, ps, value, parent);

			if (observeUtil.isNeed(value)) {
				this.observe(value, ps, object);
			}

		}, this);

		return this;
	};

	op.updateTruePaths = function(paths, obj, parent){
		var len = paths.length;
		if(len>2){
			var lastIndex = len-2, last = paths[lastIndex], p = last.p;
			if($.util.isNumber(p)){
				var trueIndex = $.inArray(obj, parent);
				if(trueIndex>-1) last.p = trueIndex;
			}
		}
	};

	op.formatPaths = function(paths){
		var ps = [];
		$.util.each(paths, function(index, path){
			ps.push(path.p);
		});
		return ps;
	};

	op.getAllPathFromArr = function(obj, arr, property){
		var paths = arr.oPaths;
		var pObj = this.getPObj(obj, arr, property);
		return paths.concat([pObj]);
	};

	op.getPObj = function(obj, arr, property){
		if(!$.isArray(arr)) return {p: property};
		var pObj = {};
		$.util.defObj(pObj, 'p', function(){
			return $.inArray(obj, arr);
		});
		return pObj;
	};

	op.isEqual = function(a, b){
		var ta = typeof a, tb = typeof b;
		if(ta !== tb) return false;
		if(ta==='object'){
			return JSON.stringify(a) === JSON.stringify(b);
		}
		return a===b;
	};


	op.getPropHooker = function(object, paths, val, parent){
		var prop = paths[paths.length - 1].p;
		var descriptor = Object.getOwnPropertyDescriptor(object, prop);
		var getter = descriptor.get, setter = descriptor.set, ob = this;
		var originSet, originGet, hookSet, hookGet;
		if(getter&&getter.__hook){
			hookSet = setter;
			hookGet = getter;
			originSet = setter.originSet;
			originGet = getter.originGet;
		}else{
			hookSet = function SetHooker(newValue){
				var setter = hookSet.originSet;
				var oldValue = hookGet();
				if (ob.isEqual(newValue, oldValue)) {
					return;
				}

				// 新值为对象或数组重新监测
				var isNeed = observeUtil.isNeed(newValue);

				var oldNeed = observeUtil.isNeed(oldValue);

				if(isNeed===1 && !oldNeed) {
					try{
						if(oldValue[observeUtil.IGNOREFLAG]) {
							newValue[observeUtil.IGNOREFLAG] = true;
						}
					}catch(e){}
				} else if (isNeed) {
					if(isNeed===1){
						// var oldNeed = observeUtil.isNeed(oldValue);
						
						var _oldValue = oldNeed ? $.util.extend(true, oldNeed===1?{}:[], oldValue) : oldValue;
	
						$.util.extend(true, oldValue||{},newValue);
						
						ob.triggerByPaths({
							deep: true,
							hookSet: hookSet,
							oldVal: _oldValue,
							newVal: newValue
						});
	
						ob.observe(oldValue, paths, parent);
					}
					if(isNeed===2) {
						try{
							oldValue.$reset(newValue);
						}catch(e){
							// 如果赋值的为数组，但是初始值不是数组，则需要执行setter
							if (setter) {
								setter.call(object, newValue);
							} else {
								val = newValue;
							}
							
							ob.triggerByPaths({
								deep: true,
								hookSet: hookSet,
								oldVal: oldValue,
								newVal: newValue
							});
						}
	
						ob.observe(newValue, paths, parent);
					}
					
					// ob.observe(newValue, paths, parent);
					return;
				}
	
				if (setter) {
					setter.call(object, newValue);
				} else {
					val = newValue;
				}
	
				// 触发变更回调
				ob.triggerByPaths({
					hookSet: hookSet,
					oldVal: oldValue,
					newVal: newValue
				});
				
			};
			hookGet = function GetHooker(){
				var getter = hookGet.originGet;
				return getter ? getter.call(object) : val;
			};
			hookGet.__hook = true;
			originSet = hookSet.originSet = setter;
			originGet = hookGet.originGet = getter;
			// 定义 object[prop] 的 getter 和 setter
			Object.defineProperty(object, prop, {
				get: hookGet,
				set: hookSet
			});
		}
		return {
			originSet: originSet, originGet: originGet, hookSet: hookSet, hookGet: hookGet
		};
	};

	op.triggerByPaths = function(opts){
		var hookSet = opts.hookSet, hooks = hookSet.__o__ || {};
		for(var k in hooks){
			var func = hooks[k];
			func({
				deep: opts.deep,
				oldVal: opts.oldVal,
				newVal: opts.newVal
			});
		}
	};


	op.getPathId = function(paths){
		var arr = [];
		for(var i=0, len=paths.length;i<len;i++){
			var p = paths[i].p;
			if(typeof(p)=='string'){
				arr.push(p);
			}else{
				arr.push('$i');
			}
		}
		return arr.join('.');
	};


	op.observeObject = function (object, paths, val, parent) {
		var ob = this, hooker = ob.getPropHooker(object, paths, val, parent);
		var hookSet = hooker.hookSet;

		if(!hookSet.__o__) hookSet.__o__ = {};

		var hooks = hookSet.__o__, pathId = ob.getPathId(paths);

		if(hooks[pathId]) return;
		
		hooks[pathId] = function(opts){
			var myPath = ob.formatPaths(paths).join('.');
			opts.path = myPath;
			ob.trigger(opts);
		};
		
	};


	/**
	 * 拦截对象属性存取描述符（绑定监测）
	 * @param   {Object|Array}  object  [对象或数组]
	 * @param   {Array}         paths   [访问路径数组]
	 * @param   {Any}           val     [默认值]
	 */
	// op._observeObject = function (object, paths, val, parent) {
	// 	var prop = paths[paths.length - 1].p;
	// 	var descriptor = Object.getOwnPropertyDescriptor(object, prop);
	// 	var getter = descriptor.get, setter = descriptor.set, ob = this;

	// 	// 已经监测过则无需检测， 至更新关键变量
	// 	// if(getter&&getter.__o__) {
	// 	// 	return;
	// 	// };

	// 	var Getter = function Getter() {
	// 		return getter ? getter.call(object) : val;
	// 	};
	// 	// Getter.__o__ = true;


	// 	var Setter = function Setter(newValue) {
	// 		var oldValue = getter ? getter.call(object) : val;

	// 		// ob.updateTruePaths(paths, object, parent);

	// 		var myPath = ob.formatPaths(paths).join('.');

	// 		if (ob.isEqual(newValue, oldValue)) {
	// 			return;
	// 		}

	// 		// 新值为对象或数组重新监测
	// 		var isNeed = observeUtil.isNeed(newValue);
	// 		if (isNeed) {
				
	// 			if(isNeed===1){
	// 				var oldNeed = observeUtil.isNeed(oldValue);
	// 				var _oldValue = oldNeed ? $.extend(true, oldNeed===1?{}:[], oldValue) : oldValue;

	// 				$.extend(true, oldValue||{},newValue);
					
	// 				ob.trigger({
	// 					deep: true,
	// 					path: myPath,
	// 					oldVal: _oldValue,
	// 					newVal: newValue
	// 				});

	// 				ob.observe(oldValue, paths, parent);
	// 			}
	// 			if(isNeed===2) {
	// 				try{
	// 					oldValue.$reset(newValue);
	// 				}catch(e){
	// 					// 如果赋值的为数组，但是初始值不是数组，则需要执行setter
	// 					if (setter) {
	// 						setter.call(object, newValue);
	// 					} else {
	// 						val = newValue;
	// 					}
						
	// 					ob.trigger({
	// 						deep: true,
	// 						path: myPath,
	// 						oldVal: oldValue,
	// 						newVal: newValue
	// 					});
	// 				}

	// 				ob.observe(newValue, paths, parent);
	// 			}
				
	// 			// ob.observe(newValue, paths, parent);
	// 			return;
	// 		}

	// 		if (setter) {
	// 			setter.call(object, newValue);
	// 		} else {
	// 			val = newValue;
	// 		}

	// 		// 触发变更回调
	// 		ob.trigger({
	// 			path: myPath,
	// 			oldVal: oldValue,
	// 			newVal: newValue
	// 		});

	// 	};

	// 	// 定义 object[prop] 的 getter 和 setter
	// 	Object.defineProperty(object, prop, {
	// 		get: Getter,
	// 		set: Setter
	// 	});

	// };

	/**
	 * 重写数组方法的回调处理
	 * 由于有的数组可能被同时render到不同的视图中，这时候需要区分当前触发的是哪个视图
	 * @param   {Array}     array  [目标数组]
	 * @param   {Number}    index  [observ对象的索引]
	 * @param   {Funciton}  cb     [当前数组的回调函数]
	 */
	var rewriteArrayMethodsCallback = (function () {

		var AP = Array.prototype;

		return function (array, index, cb) {

			var arrayMethods = Object.create(AP);

			var arrProto = array.__proto__;

			var arrCbs = arrProto.cbs || {};

			arrCbs[index] = cb;
			// 遍历指定的数组函数名
			$.util.each(rewriteArrayMethods, function (i, method) {
				var nativeMethod = AP[method];
				// 对数组函数进行重写
				$.util.defRec(arrayMethods, method, function _redefineArrayMethod() {

					var args = $.util.copyArray(arguments),
						oldLen = this.length,
						result = nativeMethod.apply(this, args),
						newLen = this.length,
						newArray = this;
					$.util.each(array.__proto__.cbs, function (index, cb) {
						cb({
							method: method,
							args: args,
							oldLen: oldLen,
							newLen: newLen,
							newArray: newArray,
							result: result
						});
					});
					return result;
				});
			});

			// arrayMethods.cbs = arrCbs;
			util.def(arrayMethods, 'cbs', arrCbs);

			array.__proto__ = arrayMethods;
		};
	})();

	// 给当前observe设置索引
	var OBSERVE_INDEX = 1;


	/**
	 * 重写指定的 Array 方法
	 * @param   {Array}  array  [目标数组]
	 * @param   {Array}  paths  [访问路径数组]
	 */
	op.observeArray = function (array, paths) {

		var _this = this;

		if (!this.observeIndex) {
			this.observeIndex = OBSERVE_INDEX++;
		}

		var arrProto = array.__proto__;
		var arrCbs = arrProto.cbs || {};

		util.def(arrProto, 'oPaths', paths);

		// 已经监听过的数组不再重复监听
		if(arrCbs[this.observeIndex]) return;

		rewriteArrayMethodsCallback(array, this.observeIndex,
			function (item) {
				// 重新检测，仅对变化部分重新监听，以提高性能，但仍需优化
				_this.reObserveArray(item, paths);

				item.path = _this.formatPaths(paths).join('.');

				// 触发回调
				_this.trigger(item);
			});
	};

	op.reObserveArray = function(item, paths){
		var inserted, method = item.method, arr = item.newArray, args = item.args, _this = this, start;

		switch (method) {
			case 'push':
				start = arr.length - args.length;
			case 'unshift':
				start = 0;
				inserted = args;
				break;
			case 'splice':
				start = args[0];
				inserted = args.slice(2);
				break;
		}
		if (inserted) { 
			$.util.each(inserted, function(index, obj){
				// var ps = paths.slice(0).concat([{p:start+index}]);
				var ps = paths.slice(0).concat([_this.getPObj(obj, arr)]);
				// _this.observeObject(inserted, ps, obj);
				_this.observe(obj, ps, arr);
			});
		}
	};

	// 销毁
	op.destroy = function(){
		this.$subs = {};
	};

	module.exports = Observer;
})();