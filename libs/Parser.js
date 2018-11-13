(function () {
	var $ = require('./env').JQLite;
	var Updater = require('./Updater');
	var Watcher = require('./Watcher');

	//指令解析规则，可以通过Parser.add方法添加自定义指令处理规则
	//所有解析规则默认接受四个参数
	/**
	 * @param   {JQLite}  $node       [指令节点]
	 * @param   {Object}  fors        [for别名映射]
	 * @param   {String}  expression  [指令表达式]
	 * @param   {String}  dir         [指令名]
	 */
	var directiveRules = {
		'vtext': function ($node, fors, expression, dir, updateFunc) {

			var parser = this, updater = this.updater;

			var scope = this.$scope;

			var depsalias = Parser.getDepsAlias(expression, fors);
			var deps = depsalias.deps;
			var exps = depsalias.exps;

			var func = this.getAliasFunc(exps.join(''), true);

			var text = func(scope);

			updateFunc = updateFunc || 'updateTextContent';

			updater[updateFunc]($node, text);

			this.watcher.watch(deps, function (options) {
				text = func(scope);
				updater[updateFunc]($node, text);
			}, fors);
		},
		'vhtml': function ($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			args.push('updateHTMLContent');
			this.vtext.apply(this, args);
		},
		'vfor': function ($node, fors, expression) {

			Parser.transAttr($node, 'v-template', 'useTemplate');

			var parser = this;

			var vforIndex = this.vforIndex++;

			var vm = this.vm, scope = this.$scope, $parent = $node.parent();

			var __filter = $node.data('__filter');

			expression = expression.replace(/[ ]+/g, ' ');

			var exps = expression.split(' in '),
				alias = exps[0],
				access = exps[1],
				$access = Parser.makeDep(access, fors);

			// var array = parser.getAliasValue($access);

			var forsCache = {};

			var $listFragment = parser.preCompileVFor($node, function () {
				return parser.getAliasValue($access);
			}, 0, fors, alias, access, forsCache, vforIndex, __filter);

			var isAdapter = $.ui.isJQAdapter($listFragment);

			if (isAdapter) {
				return;
			}

			var domList = [];
			$listFragment.children().each(function(){
				domList.push($(this));
			});

			
			if($node.attr('mode')==='single'){
				$listFragment.replaceTo($node);
			}else{
				var before$placeholder = $.ui.createJQPlaceholder(),
					after$placeholder = $.ui.createJQPlaceholder();
				before$placeholder.insertBefore($node);
				after$placeholder.insertAfter($node);
				$listFragment.replaceTo($node);
				
				$node.def('$placeholder', {
					before: before$placeholder,
					after: after$placeholder
				});
			}

			var deps = [$access], updater = this.updater;

			var __modelInit = $parent.def('__model_init__');

			__modelInit && __modelInit();

			this.watcher.watch(deps, function (options, i) {

				if (!options.method) {
					options = {
						path: options.path,
						method: 'xReset',
						args: options.newVal,
						newArray: options.newVal
					};
				}

				options.vforIndex = vforIndex;

				var handlerFlag = (i === 0);
				parser.watcher.updateIndex($access, options, function (opts) {
					var cFor = forsCache[opts.newVal] = forsCache[opts.oldVal];
					if(__filter) cFor.filter = __filter;
					cFor['$index'] = opts.newVal;
					parser.watcher.change(opts);
				}, handlerFlag);

				updater.updateList($parent, $node, options, function (arr, isRender) {
					var $listFragment;
					if(isRender){
						if (__filter) $node.data('__filter', __filter);
						var baseIndex = Parser.getBaseIndex(options);
						$listFragment = parser.preCompileVFor($node, function () {
							return arr;
						}, baseIndex, fors, alias, access, forsCache, vforIndex, __filter);
					}
					
					return {
						$fragment: $listFragment,
						domList: domList
					};
				});

				__modelInit && __modelInit();
			});
		},
		'von': function ($node, fors, expression, dir, isOnce) {
			var parser = this;
			var vm = this.vm, scope = this.$scope;
			var evts = Parser.parseDir(dir, expression);

			$.util.each(evts, function (evt, func) {
				var depsAlias = Parser.getDepsAlias(expression, fors);

				var funcStr = depsAlias.exps.join('.');

				var argsStr = '';
				funcStr = funcStr.replace(/\((.*)\)/, function (s, s1) {
					argsStr = s1;
					return '';
				});

				var _proxy = function () {
					var params = $.util.copyArray(arguments);
					parser.setDeepScope(fors);
					if (argsStr === '') {
						var func = (new Function('scope', 'node', 'params', 'return '
							+ funcStr + '.apply(node, params);'));
						return func(scope, this, params);
					} else {
						var func = (new Function('scope', 'node', '$event', 'params', 'params.unshift(' + argsStr + '); return '
							+ funcStr + '.apply(node, params);'));
						return func(scope, this, params.shift(), params);
					}
				};

				$node.each(function () {
					$.util.defRec(this, parser._getProxy(evt), _proxy);
				});

				if (isOnce) $node.off(evt, parser._proxy);

				$node.__on__(evt, parser._proxy);
			});
		},
		'vone': function ($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			args.push(true);
			this.von.apply(this, args);
		},
		'vbind': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			var attrs = Parser.parseDir(dir, expression);

			$.util.each(attrs, function (attr, exp) {
				exp = $.util.trim(exp);
				if (attr === 'class' || attr === 'style') {
					parser['v' + attr]($node, fors, exp);
					return;
				}

				var depsAlias = Parser.getDepsAlias(exp, fors);

				exp = depsAlias.exps.join('.');

				updater.updateAttribute($node, attr, parser.getValue(exp, fors));

				var deps = depsAlias.deps;

				parser.watcher.watch(deps, function (options) {
					updater.updateAttribute($node, attr, parser.getValue(exp, fors));
				}, fors);
			});
		},
		'vstyle': function ($node, fors, expression) {

			var parser = this, updater = this.updater;

			var $style = parser.getValue(Parser.formatExp(expression));

			//v-style="string"写法，如：v-style="imgStyle"
			if ($.util.isString($style)) {

				var styles = Parser.formatJData(parser.getValue($style, fors)),
					access = Parser.makePath($style, fors);

				updater.updateStyle($node, styles);

				parser.doWatch($node, access, styles, 'updateStyle', $style, fors);

				return;
			}

			//v-style="json"写法，如：v-style="{'color':tColor, 'font-size':fontSize+'dp'}"
			$.util.each($style, function (style, exp) {
				var depsAlias = Parser.getDepsAlias(exp, fors);
				updater.updateStyle($node, style, parser.getValue(exp, fors));

				var deps = depsAlias.deps;

				parser.watcher.watch(deps, function (options) {
					updater.updateStyle($node, style, parser.getValue(exp, fors));
				}, fors);
			});
		},
		'vclass': function ($node, fors, expression) {
			var parser = this, updater = this.updater;

			var $class = parser.getValue(Parser.formatExp(expression));

			//v-class="string"写法，如：v-class="testClass"
			if ($.util.isString($class)) {

				var oldClass = Parser.formatJData(parser.getValue($class, fors));

				var access = Parser.makePath($class, fors);

				updater.updateClass($node, oldClass);

				parser.doWatch($node, access, oldClass, 'updateClass', $class, fors);

				return;
			}

			//v-class="json"写法，如：v-class="{colorred:cls.colorRed, colorgreen:cls.colorGreen, font30:cls.font30, font60:cls.font60}"
			$.util.each($class, function (cName, exp) {

				updater.updateClass($node, cName, parser.getValue(exp, fors));

				var deps = Parser.getDepsAlias(exp, fors).deps;

				parser.watcher.watch(deps, function (options) {
					updater.updateClass($node, cName, parser.getValue(exp, fors));
				}, fors);

			});
		},
		'vshow': function ($node, fors, expression) {
			var parser = this, updater = this.updater;

			var defaultValue = $node.css('display');
			if(!defaultValue || defaultValue==='none') defaultValue = '';


			updater.updateShowHide($node, defaultValue, parser.getValue(expression, fors));

			var deps = Parser.getDepsAlias(expression, fors).deps;

			parser.watcher.watch(deps, function (options) {
				updater.updateShowHide($node, defaultValue, parser.getValue(expression, fors));
			}, fors);
		},
		'vif': function ($node, fors, expression, dir) {

			var parser = this, updater = this.updater;

			var preCompile = function ($fragment) {
				parser.vm.compileSteps($fragment, fors);
			};

			var mutexHandler = function(isFirst){
				var nodes = $placeholder.def('__nodes');
				if(isFirst){
					parser.$mutexGroup.children().each(function(){
						nodes.push($(this));
					});
				}
				var hasRender = false;
				$.util.each(nodes, function(i, $el){
					var curRender = $el.def('__isrender');
					if(hasRender) curRender = false;
					if(curRender) hasRender = true;
					updater.mutexRender($el, preCompile, curRender);
				});
			};

			var isRender = dir==='v-else'?true:parser.getValue(expression, fors);
			var mutexGroup = this.getMutexGroup(dir==='v-if'?$node:null);

			$node.def('__isrender', isRender);
			$node.def('__mutexgroup', mutexGroup);

			var $siblingNode = $node.next();
			var nodes, $placeholder = parser.$mutexGroupPlaceholder;

			$node.def('__$placeholder', $placeholder);

			if(!$siblingNode.hasAttr('v-else') && !$siblingNode.hasAttr('v-elseif')){	
				parser.$mutexGroup.append($node);
				mutexHandler(true);
			}else{
				parser.$mutexGroup.append($node);
			}

			

			var deps = Parser.getDepsAlias(expression, fors).deps;

			parser.watcher.watch(deps, function (options) {
				$node.def('__isrender', parser.getValue(expression, fors));
				mutexHandler();
			}, fors);

		},
		'velseif' : function ($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			this.vif.apply(this, args);
		},
		'velse': function ($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			this.vif.apply(this, args);
		},
		'vlike': function ($node, fors, expression) {
			$node.data('__like', expression);
		},
		'vmodel': function ($node, fors, expression) {
			var type = $node.data('__like') || $node.elementType();
			switch (type) {
				case 'text':
				case 'password':
				case 'textfield':
				case 'textinput':
				case 'textarea': this.vmtext.apply(this, arguments); return;
				case 'radio': this.vmradio.apply(this, arguments); return;
				case 'checkbox': this.vmcheckbox.apply(this, arguments); return;
				case 'select': this.vmselect.apply(this, arguments); return;
			}

			if (this['vm' + type]) {
				this['vm' + type].apply(this, arguments);
			} else {
				$.util.warn('v-model 不支持 [ ' + type + ' ] 组件');
			}

		},
		'vmtext': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			var access = Parser.makeDep(expression, fors);

			// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex, field = duplexField.field;;

			updater.updateValue($node, parser.getValue(expression, fors));

			var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateValue($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindTextEvent($node, function () {
				var access = Parser.makeDep(expression, fors);
				var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
				duplex[field] = $node.val();
			});
		},
		'vmradio': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			var access = Parser.makePath(expression, fors);

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;

			var value = parser.getValue(expression, fors);

			var isChecked = $node.is(':checked');

			// 如果已经定义了默认值
			if (isChecked) {
				duplex[field] = value = Parser.formatValue($node, $node.val());
			}

			updater.updateRadioChecked($node, value);

			var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateRadioChecked($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {
				if($node.is(':checked')) {
					var access = Parser.makeDep(expression, fors);
					var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
					duplex[field] = Parser.formatValue($node, $node.val());
				}
			});
		},
		'vmcheckbox': function ($node, fors, expression, dir) {

			var parser = this, updater = this.updater;

			var access = Parser.makePath(expression, fors);

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(this.$scope), field = duplexField.field;

			var value = parser.getValue(expression, fors);

			var isChecked = $node.is(':checked');

			if (isChecked) {
				if ($.util.isBoolean(value)) {
					duplex[field] = value = true;
				} else if ($.isArray(value)) {
					value.push(Parser.formatValue($node, $node.val()));
				}
			}

			updater.updateCheckboxChecked($node, value);

			var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateCheckboxChecked($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {

				var access = Parser.makeDep(expression, fors);
				var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;

				value = duplex[field];

				var $this = $(this);
				var checked = $this.is(':checked');

				if ($.util.isBoolean(value)) {
					duplex[field] = checked;
				} else if ($.isArray(value)) {
					var val = Parser.formatValue($this, $this.val());
					var index = value.indexOf(val);

					// hook
					if (checked) {
						if (index === -1) {
							value.push(val);
						}
					} else {
						if (index > -1) {
							value.splice(index, 1);
						}
					}
				}
			});
		},
		'vmselect': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			var access = Parser.makePath(expression, fors);

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;

			var multi = $node.hasAttr('multiple');

			var init = function(){
				var isDefined;

				var value = parser.getValue(expression, fors);

				if ($.util.isString(value) || $.util.isNumber(value)) {
					if (multi) {
						return $.util.warn('<select> 设置的model [' + field + '] 不是数组不能多选');
					}
					isDefined = Boolean(value);
				} else if ($.isArray(value)) {
					if (!multi) {
						return $.util.warn(' <select> 没有 multiple 属性，model [' + field + '] 不可以设置为数组');
					}
					isDefined = value.length > 0;
				} else {
					return $.util.warn('<select>对应的 model [' + field + '] 必须是一个字符串或者数组');
				}

				if (isDefined) {
					updater.updateSelectChecked($node, value, multi);
				} else {
					var selects = Parser.getSelecteds($node);
					duplex[field] = multi ? selects : selects[0];
				}
			};

			init();

			$node.def('__model_init__', init);

			var deps = [access];

			parser.watcher.watch(deps, function () {
				updater.updateSelectChecked($node, parser.getValue(expression, fors), multi);
			});

			Parser.bindChangeEvent($node, function () {
				var access = Parser.makeDep(expression, fors);
				var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
				var selects = Parser.getSelecteds($(this));
				duplex[field] = multi ? selects : selects[0];
			});
		},
		'vmnativeselect': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			var access = Parser.makePath(expression, fors);

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;

			updater.updateValue($node, duplex[field]);

			var deps = [access];
			parser.watcher.watch(deps, function () {
				$node.val(parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {
				var access = Parser.makePath(expression, fors);
				var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
				duplex[field] = $node.val();
			});
		},
		'vfilter': function ($node, fors, expression) {
			$node.data('__filter', expression);
		},
		'vcontext': function ($node, fors, expression) {
			var funcStr = Parser.makeAliasPath(expression, fors),
				func = Parser.makeFunc(funcStr.match(/\([^\)]*\)/) ? funcStr : funcStr + '()', true),
				scope = this.$scope;

			$node.def('__context', function () {
				return func(scope);
			});
		},
		'vtemplate': function($node, fors, expression){
			var scope = this.$scope;
			// Parser.transAttr($node, 'v-template', 'useTemplate');
			// var template = $node.attr('useTemplate') || $node.html();
			var template = expression || $node.html();
			var html = $.template(template, scope) || '';
			$node.html(html);
		}
	};

	var _parserIndex = 0;

	/**
	 * 指令解析器模块
	 * @param  {Compiler}      vm  [Compiler示例对象]
	 */
	var Parser = function (vm) {

		this.vm = vm;

		//初始化for循环索引
		this.vforIndex = 0;

		//if else组
		this.mutexGroup = 0;

		//获取原始scope
		this.$scope = this.getScope();

		//视图刷新模块
		this.updater = new Updater(this.vm);
		//数据订阅模块
		this.watcher = new Watcher(this, this.vm.$data);

		this.parserIndex = _parserIndex++;

		// 对象值映射
		this.aliasCache = {};

		this.initProxy();

		this.init();
	};

	var pp = Parser.prototype;

	pp.initProxy = function(){
		var parser = this;
		this._getProxy = function (type) {
			return '_proxy_' + type;
		};
	
		this._proxy = function (e) {
			var _proxy = this[parser._getProxy(e.type)];
			return _proxy.apply(this, arguments);
		};

	};

	pp.init = function () {
		var parser = this;
		//将指令规则添加到Parser对象中
		$.util.each(directiveRules, function (directive, rule) {
			parser[directive] = function ($node, fors, expression, dir) {
				$node.attr('acee', parser.parserIndex);
				if (dir) {
					var __directiveDef = $node.def('__directive');
					if(!__directiveDef){
						$node.def('__directive', __directiveDef = {});
					}
					__directiveDef[dir] = expression;
				}
				parser.setDeepScope(fors);
				rule.apply(parser, arguments);
			};
		});
	};

	/**
	 * 获取if else的分组序列
	 * @param   {JQLite}     $node          [if条件对应的$node]
	 * @return  {Number}                    [分组序列]
	 */
	pp.getMutexGroup = function($node){
		if($node) {
			this.mutexGroup = this.mutexGroup + 1;
			this.$mutexGroup = $.ui.createJQFragment();
			var $placeholder = this.$mutexGroupPlaceholder = $.ui.createJQPlaceholder();
			var $fragment = $.ui.createJQFragment();
			$placeholder.def('__$fragment', $fragment);
			$placeholder.def('__nodes', []);
			$placeholder.insertBefore($node);
		}
		return this.mutexGroup;
	}

	/**
	 * 通用watch方法
	 * @param   {JQLite}     $node         [指令节点]
	 * @param   {String}     access        [节点路径]
	 * @param   {Object}     oldValue      [指令值]
	 * @param   {String}     updateFunc    [更新函数]
	 * @param   {Object}     json          [指令真实路径]
	 * @param   {Object}     fors          [for别名映射]
	 */
	pp.doWatch = function ($node, access, oldValue, updateFunc, json, fors) {
		var parser = this, updater = this.updater;
		(function doWatch(deps, adds) {
			parser.watcher.watch(
				adds || deps,
				function (options) {
					var newValue = Parser.formatJData(parser.getValue(json, fors));

					var diff = Parser.getDiff(newValue, oldValue);
					updater[updateFunc]($node, diff);

					var diffDeps = Parser.diffJDeps(deps, access, oldValue = newValue);
					if (diffDeps.length > 0) doWatch(deps, diffDeps);

				}, fors);
		})([access].concat(Parser.getJDeps(access, oldValue)));
	};

	/**
	 * 根据路径获取最后一个键值对的取值域

	 * @param   {String}     access        [节点路径]
	 * @return  {Object}     {duplex: , field:}
	 */
	pp.getDuplexField = function (access) {
		var ac = ('scope.' + access).split('.');
		var field = ac.pop();
		var duplex = Parser.formateSubscript(ac.join('.'));
		var scope = this.$scope;

		var func = this.getAliasFunc(duplex, true);
		// duplex = func(scope);

		return {
			duplex: func,
			field: field
		}
	};

	/**
	 * 根据表达式获取真实值
	 * @param   {String}     exp        [表达式]
	 * @param   {Object}     fors       [for别名映射]
	 * @return  {Any}      取决于实际值
	 */
	pp.getValue = function (exp, fors) {
		var scope = this.$scope;
		if (arguments.length > 1) {
			var depsalias = Parser.getDepsAlias(exp, fors);
			exp = depsalias.exps.join('');
		}
		var func = this.getAliasFunc(exp, true);
		return func(scope);
		// return Parser.getValue.apply(this, args);
	};

	/**
	 * watch通用回调处理
	 * 
	 * @param   {Object}       fors        [for别名映射]
	 * @param   {Function}     callback    [回调函数]
	 * @param   {Array}        args        [回调参数]
	 */
	pp.watchBack = function (fors, callback, args) {
		this.setDeepScope(fors);
		callback.apply(this, args);
	};


	/**
	 * vfor预编译处理
	 * 
	 * @param   {JQLite}     $node         [指令节点]
	 * @param   {Function}   getter          [循环数组数据获取函数]
	 * @param   {Number}     baseIndex     [起始索引]
	 * @param   {Object}     fors          [for别名映射]
	 * @param   {String}     alias         [for指令别名]
	 * @param   {String}     access        [节点路径]
	 * @param   {Object}     forsCache     [fors数据缓存]
	 * @param   {Number}     vforIndex     [for索引]
	 * @param   {filter}     filter        [过滤器]
	 * 
	 */
	pp.preCompileVFor = function ($node, getter, baseIndex, fors, alias, access, forsCache, vforIndex, filter) {

		var parser = this, vm = this.vm;

		var $parent = $node.parent();

		//List适配器组件独立编译
		if ($.ui.useAdapter($node)) {
			var $adapter = $parent.attr('adapter');
			//编译每一个cell，直到编译结束初始化adapter事件监听
			if (!$adapter.setCell($node)) return $adapter;
			//初始化adpater事件监听
			$adapter.initEvent($parent, $node, getter, function ($plate, position, newArr) {
				parser.buildAdapterList($plate, newArr, position, fors, alias, access, forsCache, vforIndex, true, filter);
			});
			//刷新适配器
			$.ui.refreshDom($adapter);

			return $adapter;
		}

		return parser.buildList($node, getter(), baseIndex, fors, alias, access, forsCache, vforIndex, false, filter);
	};

	/**
	 * adpater数据处理
	 * 
	 * @param   {JQLite}     $node         [指令节点]
	 * @param   {Array}      array         [循环数组数据]
	 * @param   {Number}     position      [当前处理数据索引]
	 * @param   {Object}     fors          [for别名映射]
	 * @param   {String}     alias         [for指令别名]
	 * @param   {String}     access        [节点路径]
	 * @param   {Object}     forsCache     [fors数据缓存]
	 * @param   {Number}     vforIndex     [for索引]
	 * @param   {ignor}      ignor         [是否忽略]
	 * @param   {filter}     filter        [过滤器]
	 */
	pp.buildAdapterList = function ($node, array, position, fors, alias, access, forsCache, vforIndex, ignor, filter) {
		var cFors = forsCache[position] = Parser.createFors(fors, alias, access, position, filter, ignor);
		// $node.data('vforIndex', vforIndex);
		this.$scope['$alias'][alias] = array[position];
		this.vm.compileSteps($node, cFors, true);
	};

	/**
	 * 通用循环处理
	 * 
	 * @param   {JQLite}     $node         [指令节点]
	 * @param   {Array}      array         [循环数组数据]
	 * @param   {Number}     baseIndex     [起始索引]
	 * @param   {Object}     fors          [for别名映射]
	 * @param   {String}     alias         [for指令别名]
	 * @param   {String}     access        [节点路径]
	 * @param   {Object}     forsCache     [fors数据缓存]
	 * @param   {Number}     vforIndex     [for索引]
	 * @param   {ignor}      ignor         [是否忽略]
	 * @param   {filter}     filter        [过滤器]
	 */
	pp.buildList = function ($node, array, baseIndex, fors, alias, access, forsCache, vforIndex, ignor, filter) {
		var $listFragment = $.ui.createJQFragment();

		$.util.each(array, function (i, item) {
			var ni = baseIndex + i;
			var cFors = forsCache[ni] = Parser.createFors(fors, alias, access, ni, filter);
			var $plate = $node.clone(true);//.data('vforIndex', vforIndex);
			cFors.__$plate = $plate;
			this.setDeepScope(cFors);

			this.handleTemplate($plate);

			this.vm.compileSteps($plate, cFors);
			$listFragment.append($plate);
		}, this);

		return $listFragment;
	};

	pp.handleTemplate = function($plate){
		if(!$plate.hasAttr('useTemplate')) return;
		var tpl = $plate.attr('useTemplate'), $tpl;
		if(!tpl){
			if(!(($tpl = $plate.find('script, template')) && $tpl.length>0)){
				$tpl = $plate;
			}
			tpl = $tpl.html();
		}
		var html = $.template(tpl, $.extend({}, this.$scope, this.$scope.$alias));
		$plate.html(html);
	}

	/**
	 * 对需要使用new Function获取值的对象进行缓存处理，避免频繁new Function
	 */
	pp.getAliasFunc = function($access, isFull){
		var path = isFull?$access:('scope.'+Parser.formateSubscript($access));
		var aliasCache = this.aliasCache || {};
		if(aliasCache[path]) return aliasCache[path];
		var func = Parser.makeFunc(path);

		return aliasCache[path] = func;
	};

	pp.getAliasValue = function($access, isFull){
		// var path = isFull?$access:('scope.'+Parser.formateSubscript($access));
		// var aliasCache = this.aliasCache || {};
		// if(aliasCache[path]) return aliasCache[path];
		// var func = Parser.makeFunc(path), scope = this.$scope;
		var func = this.getAliasFunc($access, isFull), scope = this.$scope;
		return func(scope);
	};

	/**
	 * 深度设置$alias别名映射
	 * @param   {Object}     fors          [for别名映射]
	 * @param   {Object}     isParent      [是否为父节点]
	 */
	pp.setDeepScope = function (fors, isParent) {
		if (!fors) return;
		var scope = this.$scope, str$alias = '$alias', observer = this.watcher.observer;
		var alias = fors.alias,
			access = fors.access,
			$access = Parser.makeDep(access, fors),
			$index = fors.$index,
			ignor = fors.ignor;
		if (ignor) return this.setDeepScope(fors.fors);

		var arr = this.getAliasValue($access);
		scope[str$alias][alias] = arr[$index];
		if (!isParent) scope[str$alias]['$index'] = $index;
		if (fors.filter) {
			var filter$access = Parser.makePath(fors.filter, fors);

			$.util.defRec(scope[str$alias][alias], '$index', $index);

			var cur$item = scope[str$alias][alias];

			var filter$func = this.getAliasFunc(filter$access)(scope);
			if(typeof filter$func==='function'){
				filter$func.call({
					reObserve: function(){
						observer.observe(cur$item, [$access, $index]);
					}
				}, $index, cur$item, fors.__$plate);
			}
			

			delete fors.filter;
			delete fors.__$plate;
			
			/*var $filter = $.util.copy(scope[str$alias][alias]);
			$filter['$index'] = $index;
			$.util.defRec(scope[str$alias][alias], 'filter', $filter);
			filter$func(scope, $index, scope[str$alias][alias]['filter']);*/

		}
		if ($.util.isNumber($index)) isParent = true;
		this.setDeepScope(fors.fors, isParent);
	};

	//创建scope数据
	pp.getScope = function () {
		return Object.create(this.vm.$data);
	};

	/**
	 * 销毁
	 */
	pp.destroy = function(){
		this.vm.$element.__remove_on__(this.parserIndex);
		this.watcher.destroy();
		this.$scope = this.aliasCache = this.watcher = this.updater = null;
	}

	/**
	 * 添加指令规则
	 * @param   {Object|String}     directive       [当只有一个参数是代表是指令规则键值对，两个参数的时候代表指令名]
	 * @param   {Function}          func            [指令解析函数]
	 */
	Parser.add = function (directive, func) {
		var obj = {};
		$.util.isObject(directive) ? (obj = directive) : (obj[directive] = func);
		$.util.each(obj, function (d, f) {
			directiveRules[d] = f;
		});
	};
	

	//获取指令名v-on:click -> v-on
	Parser.getDirName = function (dir) {
		return Parser.splitName(dir)[0];
	};

	//是否是运算符
	Parser.isOperatorCharacter = function(str){
		var oc = {
			'+':1, '-':1, '*':1, '/':1, '%':1, // 加减乘除

			'++':1, '--':1, // 加加减减

			'<':1, '>':1, '<=':1, '>=':1, '==':1, '===':1, '!=':1 // 大小比较
		};
		return oc[str];
	};

	//字符串是否是常量表示
	Parser.isConst = function (str) {
		str = $.util.trim(str||'');
		if(Parser.isOperatorCharacter(str)) return true;
		var strs = str.split('');
		var start = strs.shift() || '', end = strs.pop() || '';
		str = (start === '(' ? '' : start) + strs.join('') + (end === ')' ? '' : end);
		if (this.isBool(str) || this.isNum(str)) return true;
		var CONST_RE = /('[^']*'|"[^"]*")/;
		return CONST_RE.test(str);
	};

	//字符串是否是boolean型表示
	Parser.isBool = function (str) {
		return str === 'true' || str === 'false';
	};

	//字符串是否是数字表示
	Parser.isNum = function (str) {
		return /^\d+$/.test(str);
	};

	//字符串是否是JSON对象表示
	Parser.isJSON = function (str) {
		var strs = (str||'').split('');
		var start = strs.shift(), end = strs.pop();
		return start === '{' && end === '}' ? strs.join('') : '';
	};

	//格式化指令表达式，将值添加引号 字符串->'字符串'，{key:value}->{key:'value'}
	Parser.formatExp = function (exp) {
		var content = this.isJSON(exp);
		if (content) {
			var group = content.split(',');
			$.util.each(group, function (i, s) {
				var ss = s.split(':');
				ss[1] = "'" + ss[1].replace(/'/g, '"') + "'";
				group[i] = ss.join(':');
			});
			return '{' + group.join(',') + '}';
		} else {
			return "'" + exp + "'";
		}
	};

	// 获取依赖
	Parser.getDepsAlias = function (expression, fors) {
		var deps = [];
		var exps = [];
		// 匹配单引号/双引号包含的常量和+<>==等运算符操作
		// expression = expression.replace(/('[^']*')|("[^"]*")|([\w\_\-\$\@\#\.]*(?!\?|\:|\+{1,2}|\-{1,2}|\*|\/|\%|(={1,3})|\>{1,3}|\<{1,3}|\>\=|\<\=|\&{1,2}|\|{1,2}|\!+)[\w\_\-\$\@\#\.]*)/g, function(exp){
		expression = expression.replace(/('[^']*')|("[^"]*")|([\w\_\-\$\@\#\.\[\]]*(?!\?|\:|\+{1,2}|\-{1,2}|\*|\/|\%|(={1,3})|\>{1,3}|\<{1,3}|\>\=|\<\=|\&{1,2}|\|{1,2}|\!+)[\w\_\-\$\@\#\.\[\]]*)/g, function(exp){
			
			if (exp!==''&&!Parser.isConst(exp)) {
				deps.push(Parser.makeDep(exp, fors));
				return Parser.makeAliasPath(exp, fors);
			}
				
			return exp;
		});

		exps.push(expression);

		return {deps:deps, exps:exps};
	};

	//获取指令表达式的真实路径
	Parser.makeDep = function (exp, fors) {
		var NOT_AVIR_RE = /[^\w\.\[\]\$]/g
		exp = exp.replace(NOT_AVIR_RE, '');

		exp = Parser.deepFindScope(exp, fors);

		return exp;
	};

	//深度查找指令表达式的别名对应的真实路径
	Parser.deepFindScope = function (_exp, fors) {
		if (!fors) return _exp;

		var alias = fors.alias;
		var access = fors.access;
		var $index = fors.$index;

		var exps = _exp.split('.');

		var $access =  Parser.deepFindScope(access, fors.fors);

		if(_exp===access) return $access;

		$.util.each(exps, function (i, exp) {
			if (exp === '$index') {
				exps[i] = $access + '.' + fors.$index + '.*';
			} else {
				if (alias === exp) {
					exps[i] = $access + '.' + $index;
				}
			}
		});

		return exps.join('.');
	};

	//获取指令表达式的别名路径
	Parser.makePath = function (exp, fors) {
		var NOT_AVIR_RE = /[^\w\.\[\]\$]/g
		exp = exp.replace(NOT_AVIR_RE, '');

		var exps = exp.split('.');

		$.util.each(exps, function (i, exp) {
			if (exp === '$index') {
				exps[i] = fors.access + '.' + fors.$index + '.*';
			} else {
				exps[i] = Parser.findScope(exp, fors);
			}
		});

		return exps.join('.');
	};

	//深度查找指令表达式的别名对应的真实路径
	Parser.findScope = function (exp, fors) {
		if (!fors) return exp;

		var alias = fors.alias;
		var access = fors.access;
		var $index = fors.$index;

		if (alias === exp) {
			return access + '.' + $index;
		}

		return Parser.findScope(exp, fors.fors);
	};

	//获取指令表达式的别名路径
	Parser.makeAliasPath = function (exp, fors) {
		//li.pid==item.pid
		//$index
		//obj.title
		//$index>0
		exp = exp.replace(/([^\w \.\$'"\/])[ ]*([\w]+)/g, function (s, s1, s2) {

			s = s1 + s2;

			if (s === '$event' || Parser.isConst(s2)) {
				return s;
			}

			if (s === '$index') {
				return 'scope.$alias.' + s;
			}

			if (Parser.hasAlias(s2, fors)) {
				return s1 + 'scope.$alias.' + s2;
			} else {
				return s1 + 'scope.' + s2;
			}
		});
		var exps = exp.split('.');
		exps[0] = /^['"\/].*$/.test(exps[0]) ? exps[0] : exps[0].replace(/[\w\$]+/,
			function (s) {
				if (Parser.isConst(s) || s === '$event' || s === 'scope') {
					return s;
				}

				if (s === '$index' || Parser.hasAlias(s, fors)) {
					s = '$alias.' + s;
				}
				return 'scope.' + s;
			});
		exp = exps.join('.');

		return exp;
	};

	// 转换属性
	Parser.transAttr = function($node, oldAttr, newAttr){
		if($node.hasAttr(oldAttr)){
			$node.attr(newAttr, $node.attr(oldAttr) || '');
			$node.removeAttr(oldAttr);
		}
	};

	//表达式中是否包含别名
	Parser.hasAlias = function (exp, fors) {
		if (!fors) return false;

		if (exp === fors.alias) return true;

		return this.hasAlias(exp, fors.fors);
	};

	//创建fors数据，内容为别名依赖
	Parser.createFors = function (fors, alias, access, index, filter, ignor) {
		return {
			alias: alias,
			access: access,
			fors: fors,
			$index: index,
			filter: filter,
			ignor: ignor
		}
	};

	//为数组操作获取要操作的基础索引号
	Parser.getBaseIndex = function (options) {
		var method = options.method;
		switch (method) {
			case 'xPush':
			case 'push':
				return options.oldLen;
			case 'splice':
				return options.args[0];
			default:
				return 0;
		}
	};

	//根据数组路径获取数组操作的索引号
	Parser.getIndex = function (options) {
		var $index = -1;
		var path = options.path;
		path.replace(/\.(\d+)\.\*/g, function (s, s1) {
			$index = options.newVal;
		});
		return $index;
	};

	Parser.splitName = function (dir) {
		var SPLITRE = /[\:\#\$\*\.]/;
		return dir.split(SPLITRE);
	};

	//解析指令的前后缀
	Parser.parseDir = function (dir, exp) {
		var dirs = Parser.splitName(dir);
		var kv = {};
		if (dirs.length === 1) {
			kv = JSON.stringify(exp);
		} else if (dirs.length === 2) {
			kv[dirs[1]] = exp;
		}
		return kv;
	};

	//取值函数创建
	Parser.makeFunc = function (str) {
		return new Function('scope', 'try{ return ' + str + '; }catch(e){return "";}');
	};

	//根据表达式取值
	// Parser.getValue = function (scope, str, fors) {
	// 	if (arguments.length > 2) {
	// 		var depsalias = Parser.getDepsAlias(str, fors);
	// 		str = depsalias.exps.join('');
	// 	}
	// 	var func = this.getAliasFunc(str, true);
	// 	return func(scope);
	// };

	//如果指令值为数字则强制转换格式为数字
	Parser.formatValue = function ($node, value) {
		return $node.hasAttr('number') ? +value : value;
	};

	//获取select组件的取值
	Parser.getSelecteds = function ($select) {
		var sels = [];
		var getNumber = $select.hasAttr('number');
		$select.find("option:selected").each(function () {
			var $option = $(this);
			var value = $option.val();
			sels.push(getNumber ? +value : Parser.formatValue($option, value));
		});

		return sels;
	};

	//文本输入框的事件监听处理
	Parser.bindTextEvent = function ($node, callbacl) {

		var composeLock;

		// 解决中文输入时 input 事件在未选择词组时的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		$node.__on__('compositionstart', function () {
			composeLock = true;
		});
		$node.__on__('compositionend', function () {
			composeLock = false;
		});

		// input 事件(实时触发)
		$node.__on__('input', function () {
			callbacl.apply(this, arguments);
		});

		// change 事件(失去焦点触发)
		$node.__on__('blur', function () {
			callbacl.apply(this, arguments);
		});
	};

	//通用change事件监听处理。比如：radio、checkbox、select等
	Parser.bindChangeEvent = function ($node, callback) {
		$node.__on__('change', function () {
			callback.apply(this, arguments);
		});
	};

	//获取指令值为json数据的依赖，仅针对指令取值后为json格式的指令解析	
	Parser.getJDeps = function (access, kvs) {
		var deps = [];
		$.util.each(kvs, function (name, val) {
			deps.push(access + '.' + name);
		});
		return deps;
	};

	//获取指令值是否有变化，并返回变化值，仅针对指令取值后为json格式的指令解析	
	Parser.diffJDeps = function (deps, access, kvs) {
		var diffs = {
			o: [],
			n: []
		};
		$.util.each(kvs, function (name, val) {
			var _access = access + '.' + name;
			if (deps.indexOf(_access) === -1) {
				diffs.n.push(_access);
				deps.push(_access);
			} else {
				diffs.o.push(_access);
			}
		});
		return diffs;
	};

	//获取指令值是否有变化，并返回变化值，仅针对指令取值后为json格式的指令解析	
	Parser.formatJData = function (str) {
		if ($.util.isString(str)) {
			var attrs = {};
			$.util.each(str.split(/[ ;]/), function (i, name) {
				name = $.util.trim(name);
				if (!name) return;
				var attr = Parser.splitName(name);
				if (attr.length > 1) {
					attrs[attr[0]] = attr[1];
				} else {
					attrs[name] = true;
				}
			});
			return attrs;
		} else {
			return $.util.copy(str);
		}
	};

	//获取两个对象的差异
	Parser.getDiff = function (newObj, oldObj) {
		var diff = {};
		$.util.each(newObj, function (k, v) {
			if (oldObj[k] !== v) {
				diff[k] = v;
			}
		});
		$.util.each(oldObj, function (k, v) {
			if (typeof newObj[k] === 'undefined') diff[k] = null;
		});
		return diff;
	};

	//转换.num为下标[num]
	Parser.formateSubscript = function(str){
		return str.replace(/\.(\d+)/g, function(s, s1){
			return '['+s1+']';
		});
	};


	module.exports = Parser;

	if (typeof __EXPORTS_DEFINED__ === 'function') __EXPORTS_DEFINED__(Parser, 'Parser');

})();