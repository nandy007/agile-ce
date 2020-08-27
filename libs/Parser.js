(function () {
	var $ = require('./env').JQLite;
	var Updater = require('./Updater');
	var Watcher = require('./Watcher');

	var directiveUtil = {
		commonHandler: function(opts){ // call by parser
			var $node = opts.$node, fors = opts.fors, expression = opts.expression, cb = opts.cb;
			var parser = this;
			var scope = this.$scope;
			var expressions = [];
			expression.replace(/\{\{([^\}]+)\}\}/g, function(s, s1){
				expressions.push($.util.trim(s1));
			});
			
			$.util.each(expressions, function(i, exp){
				var depsalias = Parser.getDepsAlias(exp, fors, parser.getVmPre());

				var deps = depsalias.deps;
				var exps = depsalias.exps;

				var func = this.getAliasFunc(exps.join(''), true);
				cb(func(scope));

				this.watcher.watch(deps, function (options) {

					cb(func(scope));

				}, fors);
			}, this);
		},
		formatStyle: function formatStyle(exp) {
			if(typeof exp==='object') return exp;
			var exps = exp.split(';'),
			    styles = {};
			$.util.each(exps, function (i, style) {
				var ss = style.split(':'),
				    k = $.util.trim(ss.shift()),
				    v = $.util.trim(ss.join(':'));
				if (k && v) styles[k] = v;
			});
			
			return styles;
		},
		formatDirJson: function(expression){
			var ps = expression.split('');
			if (ps.shift() === '{' && ps.pop() === '}') {
				expression = ps.join('');
				
				ps = expression.split(',');
				var json = {};
				$.util.each(ps, function (i, kv) {
					var kvs = kv.split(':'),
					    k = $.util.trim(kvs.shift()||'').replace(/['"]/g, ''),
						v = $.util.trim(kvs.join(':') || '');
					if (k && v) json[k] = v;
				});
				return json;
			}

			return expression;
		},
		jsonDirHandler: function jsonDirHandler(opts) {
			// call by parser
			var $node = opts.$node,
			    fors = opts.fors,
			    expression = opts.expression,
			    cb = opts.cb;
			var parser = this;

			var obj = directiveUtil.formatDirJson(expression);

			//v-style="string"写法，如：v-style="imgStyle"
			if ($.util.isString(obj)) {

				directiveUtil.commonHandler.call(this, {
					$node: $node,
					fors: fors,
					expression: directiveUtil.wrapperDir(obj),
					cb: function (rs) {
						cb(rs);
					}
				});

				return;
			}

			//v-style="json"写法，如：v-style="{'color':tColor, 'font-size':fontSize+'dp'}"
			$.util.each(obj, function (k, exp) {
				directiveUtil.commonHandler.call(this, {
					$node: $node,
					fors: fors,
					expression: directiveUtil.wrapperDir(exp),
					cb: function (rs) {
						cb(rs, k);
					}
				});
			}, this);
		},
		wrapperDir: function(exp){
			return '{{' + exp + '}}';
		},
		isSelectMultiple: function($node){
			if(!$node.hasAttr('multiple')) return false;
			var v = $node.attr('multiple');
			if(v===false || v==='false'){
				return false;
			}
			return true;
		}
	};

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

			var updater = this.updater;
			updateFunc = updateFunc || 'updateTextContent';
			var parser = this;

			directiveUtil.commonHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: directiveUtil.wrapperDir(expression),
				cb: function cb(rs) {
					updater[updateFunc]($node, rs);
					if(dir==='v-html:deep') parser.vm.compileSteps($node.childs(), fors);
					$node.triggerHandler('contentUpdated');
				}
			});

		},
		'vhtml': function ($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			args.push('updateHTMLContent');
			this.vtext.apply(this, args);
		},
		'vxhtml': function ($node, fors, expression, dir) {
			// var args = $.util.copyArray(arguments);
			// args.push('updateHTMLContent');
			var parser = this;
			var sn = Parser.splitName(dir), slotName = sn[1];
			dir = 'v-html:deep';
			// 后续可考虑监听组件的init或者created事件
			setTimeout(function(){
				if(slotName){
					var $slot = $node.find('[slot-name='+slotName+']');
					if($slot.length===0) return;
					$node = $($slot[0]); 
				}
				var args = [$node, fors, expression, dir, 'updateHTMLContent'];
				parser.vtext.apply(parser, args);
			},10);
		},
		'vfor': function ($node, fors, expression) {

			var parser = this;

			Parser.transAttr($node, 'v-template', 'useTemplate');
			const forTpl = parser.getOuterHTML($node);
			$node.def('__forTpl', forTpl);

			var vforIndex = this.vforIndex++;

			var vm = this.vm, scope = this.$scope, $parent = $node.parent();

			var __filter = $node.data('__filter');

			var parseSer = this.parseForExp(expression);

			var alias = parseSer.alias,
				indexAlias = parseSer.indexAlias || $node.attr('for-index') || '$index',
				access = parseSer.access,
				$access = Parser.makeDep(access, fors, parser.getVmPre()),
				aliasGroup = {alias:alias, indexAlias:indexAlias};

			var forsCache = {};

			var {$listFragment, curDomList} = parser.preCompileVFor($node, function () {
				return parser.getAliasValue($access);
			}, 0, fors, aliasGroup, access, forsCache, vforIndex, __filter);

			var isAdapter = $.ui.isJQAdapter($listFragment);

			if (isAdapter) {
				return;
			}

			// var domList = [];
			// $listFragment.children().each(function(){
			// 	domList.push($(this));
			// });

			var domList = [].concat(curDomList);

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
					if(!options.newVal){
						options.newVal = parser.getAliasValue($access);
					}
					options = {
						path: options.path,
						method: 'xReset',
						args: options.newVal,
						newArray: options.newVal
					};
				}

				options.vforIndex = vforIndex;

				var handlerFlag = (i === 0);
				parser.watcher.updateIndex(options.path || $access, options, function (opts) {
					var cFor = forsCache[opts.newVal] = forsCache[opts.oldVal];
					if(__filter) cFor.filter = __filter;
					cFor['$index'] = opts.newVal;
					parser.watcher.change(opts);
				}, handlerFlag);

				updater.updateList($parent, $node, options, function (arr, isRender) {
					var $listFragment, curDomList;
					if(isRender){
						if (__filter) $node.data('__filter', __filter);
						var baseIndex = Parser.getBaseIndex(options);
						var buildResult = parser.preCompileVFor($node, function () {
							return arr;
						}, baseIndex, fors, aliasGroup, access, forsCache, vforIndex, __filter);
						$listFragment = buildResult.$listFragment;
						curDomList = buildResult.curDomList;
					}
					
					return {
						$fragment: $listFragment,
						domList: domList,
						curDomList: curDomList
					};
				});

				__modelInit && __modelInit();
			}, fors);
		},
		'von': function ($node, fors, expression, dir, opts) {
			var parser = this;
			var vm = this.vm, scope = this.$scope;
			var evts = Parser.parseDir(dir, expression);
			opts = opts || {};
			var isOnce = opts.isOnce, isCatch = opts.isCatch;

			$.util.each(evts, function (evt, func) {
				var depsAlias = Parser.getDepsAlias(func, fors, parser.getVmPre('method'));

				var funcStr = depsAlias.exps.join('.');

				var argsStr = '';
				funcStr = funcStr.replace(/\((.*)\)/, function (s, s1) {
					argsStr = s1;
					return '';
				});

				var _proxy = function () {
					var params = $.util.copyArray(arguments);
					parser.setDeepScope(fors);
					// var func = (new Function('scope', 'return ' + funcStr + ';'))(scope);
					var beforeHandler = Parser.getEventFilter(this, evt);
					var me = (beforeHandler && beforeHandler.apply(parser.vm.$element, [this, ...params])) || this;
					var rs;
					if (argsStr === '') {
						var func = (new Function('scope', 'node', 'params', 'return '
							+ funcStr + '.apply(node, params);'));
						rs = func(scope, me, params);
					} else {
						var func = (new Function('scope', 'node', '$event', 'params', 'params.unshift(' + argsStr + '); return '
							+ funcStr + '.apply(node, params);'));
						rs = func(scope, me, params.shift(), params);
					}
					var afterHandler = Parser.getEventFilter(this, evt, 'after');
					return afterHandler ? afterHandler.apply(parser.vm.$element, [rs, isCatch, this, ...params]) : rs;
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
			args.push({
				isOnce: true
			});
			this.von.apply(this, args);
		},
		'vcatch': function($node, fors, expression, dir){
			var args = $.util.copyArray(arguments);
			args.push({
				isCatch: true
			});
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

				var depsAlias = Parser.getDepsAlias(exp, fors, parser.getVmPre());

				exp = depsAlias.exps.join('.');

				updater.updateAttribute($node, attr, parser.getValue(exp, fors));

				var deps = depsAlias.deps;

				parser.watcher.watch(deps, function (options) {
					updater.updateAttribute($node, attr, parser.getValue(exp, fors));
				}, fors);
			});
		},
		'vstyle': function ($node, fors, expression) {
			var oldStyle, updater = this.updater;
			directiveUtil.jsonDirHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: expression,
				cb: function(rs, k){
					if(k){
						updater.updateStyle($node, k, rs);
						return;
					}
					rs = directiveUtil.formatStyle(rs);
					if(oldStyle){
						$.util.each(oldStyle, function(k ,v){
							if(!rs[k]) rs[k] = '';
						});
					}
					updater.updateStyle($node, rs);
					oldStyle = rs;
				}
			});

		},
		'vclass': function ($node, fors, expression) {
			var oldClass, updater = this.updater;
			directiveUtil.jsonDirHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: expression,
				cb: function(rs, k){
					if(k){
						updater.updateClass($node, k, rs);
						return;
					}
		
					if(typeof oldClass==='string'){
						updater.updateClass($node, oldClass, false);
					}else if(typeof oldClass==='object'){
						$.util.each(oldClass, function(k, v){
							updater.updateClass($node, k, false);
						});
					}
					if(typeof rs==='string'){
						updater.updateClass($node, rs, true);
					}else if(typeof rs==='object'){
						$.util.each(rs, function(k, v){
							updater.updateClass($node, k, v);
						});
					}
					oldClass = rs;
				}
			});
		},
		'vxclass': function($node, fors, expression){

			var oldClass, updater = this.updater;
			// btn-{{type}} {{'name-'+size+' '+mode}}
			// -> 'btn-'+type+' '+'name-'+size+' '+mode
			var exp = "{{'" + expression.replace(/\{\{([^\}]+)\}\}/g, function(s, s1){
				return "'+(" + s1 + ")+'";
			}) + "'}}";

			directiveUtil.commonHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: exp,
				cb: function(rs){
					if(oldClass) updater.updateClass($node, oldClass, false);
					if(rs) updater.updateClass($node, rs, true);
					oldClass = rs;
				}
			});
		},
		'vxstyle': function($node, fors, expression){

			var styles = directiveUtil.formatStyle(expression), updater = this.updater;

			$.util.each(styles, function(styleName, exp){
				directiveUtil.commonHandler.call(this, {
					$node: $node,
					fors: fors,
					expression: exp,
					cb: function(rs){
						updater.updateStyle($node, styleName, rs);
					}
				});
			}, this);

			
		},
		'vshow': function ($node, fors, expression) {
			var parser = this, updater = this.updater;

			var defaultValue = $node.css('display');
			if(!defaultValue || defaultValue==='none') defaultValue = '';


			updater.updateShowHide($node, defaultValue, parser.getValue(expression, fors));

			var deps = Parser.getDepsAlias(expression, fors, parser.getVmPre()).deps;

			parser.watcher.watch(deps, function (options) {
				updater.updateShowHide($node, defaultValue, parser.getValue(expression, fors));
			}, fors);
		},
		'vhide': function($node, fors, expression){
			var parser = this;
			parser.vshow.call(parser, $node, fors, `!(${expression})`);
		},
		'vcif': function($node, fors, expression, dir){
			var parser = this,
			    updater = this.updater;

			var preCompile = function preCompile($fragment) {
				parser.vm.compileSteps($fragment, fors);
			};

			var mutexHandler = function mutexHandler(isFirst) {
				var nodes = $placeholder.def('__nodes');
				if (isFirst) {
					parser.$mutexGroup.children().each(function () {
						nodes.push($(this));
					});
				}
				var hasRender = false;
				$.util.each(nodes, function (i, $el) {
					var curRender = $el.def('__isrender');
					if (hasRender) curRender = false;
					if (curRender) hasRender = true;
					updater.mutexRender($el, preCompile, curRender);
				});
			};

			var isRender = dir === 'v-else' ? true : parser.getValue(expression, fors);
			var mutexGroup = this.getMutexGroup(dir === 'v-if' ? $node : null);

			$node.def('__isrender', isRender);
			$node.def('__mutexgroup', mutexGroup);

			var $siblingNode = $node.next();
			var nodes,
			    $placeholder = parser.$mutexGroupPlaceholder;

			$node.def('__$placeholder', $placeholder);

			if (!$siblingNode.hasAttr('v-else') && !$siblingNode.hasAttr('v-elseif')) {
				parser.$mutexGroup.append($node);
				mutexHandler(true);
			} else {
				parser.$mutexGroup.append($node);
			}

			var deps = Parser.getDepsAlias(expression, fors, parser.getVmPre()).deps;

			parser.watcher.watch(deps, function (options) {
				$node.def('__isrender', parser.getValue(expression, fors));
				mutexHandler();
			}, fors);
		},
		'vif': function ($node, fors, expression, dir) {

			if($node.hasAttr('mutexGroupCache') || Parser.config.mutexGroupCache){
				return this.vcif($node, fors, expression, dir);
			}

			var parser = this, updater = this.updater;

			var branchGroup = this.getBranchGroup(dir==='v-if'?$node:null);
			var $placeholder = branchGroup.$placeholder, nodes = $placeholder.def('nodes');

			var preCompile = function ($fragment) {
				parser.vm.compileSteps($fragment, fors);
			};

			var mutexHandler = function(){
				var theDef, lastIndex = -1;
				$.util.each(nodes, function(i, nodeDef){
					var curRender = nodeDef.dir==='v-else'?true:parser.getValue(nodeDef.expression, fors);
					if(curRender) {
						lastIndex = i;
						theDef = nodeDef;
						return false;
					}
				});
				if($placeholder.def('lastIndex')===lastIndex) return;
				$placeholder.def('lastIndex', lastIndex);
				if(theDef){
					updater.branchRender($placeholder, $(theDef.html), preCompile);
				}else{
					updater.branchRender($placeholder, null, preCompile);
				}
			};

			var $siblingNode = $node.next();
			nodes.push({
				html: parser.getOuterHTML($node),
				expression: expression,
				dir: dir
			});
			$node.remove();
			if(!$siblingNode.hasAttr('v-else') && !$siblingNode.hasAttr('v-elseif')){
				mutexHandler();
			}

			var deps = Parser.getDepsAlias(expression, fors, parser.getVmPre()).deps;

			parser.watcher.watch(deps, function (options) {
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
		'vmodel': function ($node, fors, expression, dir) {
			var type = dir.indexOf(':')>-1 ? (dir.split(':')[1]) : $node.data('__like') || $node.elementType();
			switch (type) {
				case 'text':
				case 'password':
				case 'textfield':
				case 'textinput':
				case 'textarea': this.vmtext.apply(this, arguments); return;
				case 'radio': this.vmradio.apply(this, arguments); return;
				case 'checkbox': this.vmcheckbox.apply(this, arguments); return;
				case 'select': this.vmselect.apply(this, arguments); return;
				case 'switch': this.vmswitch.apply(this, arguments); return;
			}

			if (this['vm' + type]) {
				this['vm' + type].apply(this, arguments);
			} else {
				$.util.warn('v-model 不支持 [ ' + type + ' ] 组件');
			}

		},
		'vmtext': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			// var access = Parser.makeDep(expression, fors, parser.getVmPre());
			var depsalias = Parser.getDepsAlias(expression, fors, parser.getVmPre());
			// var access = depsalias.exps.join('');
			var deps = depsalias.deps;

			// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex, field = duplexField.field;;

			updater.updateValue($node, parser.getValue(expression, fors));

			// var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateValue($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindTextEvent($node, function () {
				parser.setDeepScope(fors);
				// var access = Parser.makeDep(expression, fors, parser.getVmPre());
				var depsalias = Parser.getDepsAlias(expression, fors, parser.getVmPre());
				var access = depsalias.exps.join('');
				// var deps = depsalias.deps;
				var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
				duplex[field] = Parser.formatValue($node, $node.val());
			});
		},
		'vmradio': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			// var access = Parser.makeDep(expression, fors, parser.getVmPre());
			var depsalias = Parser.getDepsAlias(expression, fors, parser.getVmPre());
			var access = depsalias.exps.join('');
			var deps = depsalias.deps;

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;

			var value = parser.getValue(expression, fors);

			var isChecked = $node.isChecked();

			// 如果已经定义了默认值
			if (isChecked) {
				duplex[field] = value = Parser.formatValue($node, $node.val());
			}

			updater.updateRadioChecked($node, value);

			// var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateRadioChecked($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {
				if($node.isChecked()) {
					parser.setDeepScope(fors);
					// var access = Parser.makeDep(expression, fors, parser.getVmPre());
					// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
					duplex[field] = Parser.formatValue($node, $node.val());
				}
			});
		},
		'vmcheckbox': function ($node, fors, expression, dir) {

			var parser = this, updater = this.updater;

			// var access = Parser.makeDep(expression, fors, parser.getVmPre());
			var depsalias = Parser.getDepsAlias(expression, fors, parser.getVmPre());
			var access = depsalias.exps.join('');
			var deps = depsalias.deps;

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(this.$scope), field = duplexField.field;

			var value = parser.getValue(expression, fors);

			var isChecked = $node.isChecked();

			if (isChecked) {
				if ($.util.isBoolean(value)) {
					duplex[field] = value = true;
				} else if ($.isArray(value)) {
					value.push(Parser.formatValue($node, $node.val()));
				}
			}

			updater.updateCheckboxChecked($node, value);

			// var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateCheckboxChecked($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {

				parser.setDeepScope(fors);

				// var access = Parser.makeDep(expression, fors, parser.getVmPre());
				// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;

				value = duplex[field];

				var $this = $(this);
				var checked = $this.isChecked();

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

			// var access = Parser.makeDep(expression, fors, parser.getVmPre());
			var depsalias = Parser.getDepsAlias(expression, fors, parser.getVmPre());
			var access = depsalias.exps.join('');
			var deps = depsalias.deps;

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;

			var multi = directiveUtil.isSelectMultiple($node);

			var init = function(){
				var isDefined;

				var value = parser.getValue(expression, fors);

				if ($.util.isString(value)) {
					if (multi) {
						return $.util.warn('<select> 设置的model [' + field + '] 不是数组不能多选');
					}
					isDefined = Boolean(value);
				}else if($.util.isNumber(value)){
					if (multi) {
						return $.util.warn('<select> 设置的model [' + field + '] 不是数组不能多选');
					}
					isDefined = true;
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

			// var deps = [access];

			parser.watcher.watch(deps, function () {
				updater.updateSelectChecked($node, parser.getValue(expression, fors), multi);
			}, fors);

			Parser.bindChangeEvent($node, function () {
				parser.setDeepScope(fors);
				// var access = Parser.makeDep(expression, fors, parser.getVmPre());
				// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
				var selects = Parser.getSelecteds($(this));
				duplex[field] = multi ? selects : selects[0];
			});
		},
		'vmnativeselect': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			// var access = Parser.makeDep(expression, fors, parser.getVmPre());
			var depsalias = Parser.getDepsAlias(expression, fors, parser.getVmPre());
			var access = depsalias.exps.join('');
			var deps = depsalias.deps;

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;

			updater.updateValue($node, duplex[field]);

			// var deps = [access];
			parser.watcher.watch(deps, function () {
				$node.val(parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {
				parser.setDeepScope(fors);
				// var access = Parser.makeDep(expression, fors, parser.getVmPre());
				// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
				duplex[field] = $node.val();
			});
		},
		'vmswitch': function ($node, fors, expression, dir) {
			var parser = this, updater = this.updater;

			// var access = Parser.makeDep(expression, fors, parser.getVmPre());
			var depsalias = Parser.getDepsAlias(expression, fors, parser.getVmPre());
			var access = depsalias.exps.join('');
			var deps = depsalias.deps;

			var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
			
			if($node.hasAttr('checked')){
				duplex[field] = Parser.getSwitch($node, $node.xprop('checked'));
			}else{
				updater.updateSwitchChecked($node, duplex[field]===Parser.getSwitch($node, true) ? true : false);
			}
			

			// var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateSwitchChecked($node, duplex[field]===Parser.getSwitch($node, true) ? true : false);
			}, fors);

			Parser.bindChangeEvent($node, function () {
				parser.setDeepScope(fors);
				duplex[field] = Parser.getSwitch($node, $node.xprop('checked'));
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
			// var scope = this.$scope;
			// Parser.transAttr($node, 'v-template', 'useTemplate');
			// var template = $node.attr('useTemplate') || $node.html();
			var template = (expression ? this.getValue(expression, fors) : '') || expression || $node.html();
			var html = $.template(template, this.getTemplateScope()) || '';
			$node.html(html);
		},
		// 隐式监听
		'vwatch': function($node, fors, expression, dir){
			var depsalias = Parser.getDepsAlias(expression, fors, this.getVmPre());
			var deps = depsalias.deps;
			var evtName = dir.split(Parser.dirSplit)[1];
			this.watcher.watch(deps, function (options) {
				if(evtName) $node.trigger(evtName);
			}, fors);
		},
		'vdata': function($node, fors, expression, dir){
			var parser = this, updater = this.updater;

			var attrs = Parser.parseDir(dir, expression);

			$.util.each(attrs, function (attr, exp) {
				exp = $.util.trim(exp);

				var depsAlias = Parser.getDepsAlias(exp, fors, parser.getVmPre());

				exp = depsAlias.exps.join('.');

				updater.updateDataSet($node, attr, parser.getValue(exp, fors));

				var deps = depsAlias.deps;

				parser.watcher.watch(deps, function (options) {
					updater.updateDataSet($node, attr, parser.getValue(exp, fors));
				}, fors);
			});
		},
		'vreplace': function($node, fors, expression, dir){
			var updater = this.updater;
			var parser = this;

			var before$placeholder = $.ui.createJQPlaceholder(),
					after$placeholder = $.ui.createJQPlaceholder();
			before$placeholder.insertBefore($node);
			after$placeholder.insertAfter($node);

			$node.remove();

			directiveUtil.commonHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: directiveUtil.wrapperDir(expression),
				cb: function cb(rs) {
					var $next;
					while(($next = before$placeholder.next()) && $next.length===1 && !$next.def('isPlaceholder')){
						$next.remove();
					}

					const $cur = $(rs);
					$cur.insertAfter(before$placeholder);

					if(dir==='v-replace:deep') parser.vm.compileSteps($cur, fors);

					$cur.triggerHandler('contentUpdated');
				}
			});
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

		//视图刷新模块
		this.updater = new Updater(this.vm);
		//数据订阅模块
		this.watcher = new Watcher(this, this.vm.$data);

		this.parserIndex = _parserIndex++;

		// 对象值映射
		this.aliasCache = {};

		this.initProxy();

		this.initVmPre();

		//获取原始scope
		this.$scope = this.getScope();

		this.init();
	};

	var pp = Parser.prototype;

	pp.isTemplate = function($node){
		return $node.is('template');
	};

	pp.getOuterHTML = function($node){
		if(this.isTemplate($node)){
			return $node.html();
		}
		return $node.outerHTML();
	};

	pp.getTemplateScope = function(){

		var scope = this.$scope;
		var vmPre = this.vmPre;
		// Parser.transAttr($node, 'v-template', 'useTemplate');
		// var template = $node.attr('useTemplate') || $node.html();
		const obj = (vmPre.data || vmPre.method) ? (function(){
			var o = {};
			if(vmPre.data) {
				$.extend(o, scope[vmPre.data]);
			}else{
				for(var k in scope){
					if(k!=='$alias' && (typeof scope[k]!=='function')){
						o[k] = scope[k];
					}
				}
			}
			if(vmPre.method) {
				$.extend(o, scope[vmPre.method]);
			}else{
				for(var k in scope){
					if(typeof scope[k]==='function'){
						o[k] = scope[k];
					}
				}
			}
			return o;
		})() : scope;

		var templateScope = $.extend({}, obj, scope.$alias);

		return templateScope;

	};

	pp.initVmPre = function(){
		if(!Parser.hasVMPre()) return;
		var model = this.vm.$data;
		this.vmPre = {
			data: model.data ? 'data' : '',
			method: model.methods ? 'methods' : ''
		};
	};

	pp.getVmPre = function(type){
		if(!Parser.hasVMPre()) return '';
		type = type || 'data';
		var vmPre = Parser.getVMPre();
		var rs = this.vmPre[type] || vmPre[type] || '';
		return rs;
	};

	pp.parseForExp = function(expression){
		expression = expression.replace(/[ ]+/g, ' ');

		var exps = expression.split(' in '),
			aliasGroup = (exps[0]||'').replace(/[ ]+/g, ''),
			access = (exps[1]||'').replace(/[ ]+/g, '');
			// $access = Parser.makeDep(access, fors);
		if(aliasGroup.indexOf('(')===0){
			aliasGroup = aliasGroup.substring(1, aliasGroup.length-1);
		}
		aliasGroup = aliasGroup.split(',');
		var alias = aliasGroup[0], indexAlias = aliasGroup[1];
		return {
			alias: alias,
			indexAlias: indexAlias,
			access: access
		};
	};

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
				expression = $.util.trim(expression || '');
				$node.attr('acee', parser.parserIndex);
				if (dir) {
					var __directiveDef = $node.def('__directive');
					if(!__directiveDef){
						$node.def('__directive', __directiveDef = {});
					}
					__directiveDef[dir] = expression;
				}
				parser.setDeepScope(fors);
				return rule.apply(parser, arguments);
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
	};
	pp.getBranchGroup = function($node){
		if($node){
			var $placeholder = $.ui.createJQPlaceholder();
			$placeholder.def('nodes', []);
			this.branchGroup = {
				$placeholder: $placeholder
			};
			$placeholder.insertBefore($node);
		}
		return this.branchGroup;
	};

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
		var ac = access.split('.');
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
			var depsalias = Parser.getDepsAlias(exp, fors, this.getVmPre());
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
	 * @param   {Object}     aliasGroup    [for指令别名组]
	 * @param   {String}     access        [节点路径]
	 * @param   {Object}     forsCache     [fors数据缓存]
	 * @param   {Number}     vforIndex     [for索引]
	 * @param   {filter}     filter        [过滤器]
	 * 
	 */
	pp.preCompileVFor = function ($node, getter, baseIndex, fors, aliasGroup, access, forsCache, vforIndex, filter) {

		var parser = this, vm = this.vm;

		var $parent = $node.parent();

		//List适配器组件独立编译
		if ($.ui.useAdapter($node)) {
			var $adapter = $parent.attr('adapter');
			//编译每一个cell，直到编译结束初始化adapter事件监听
			if (!$adapter.setCell($node)) return $adapter;
			//初始化adpater事件监听
			$adapter.initEvent($parent, $node, getter, function ($plate, position, newArr) {
				parser.buildAdapterList($plate, newArr, position, fors, aliasGroup, access, forsCache, vforIndex, true, filter);
			});
			//刷新适配器
			$.ui.refreshDom($adapter);

			return $adapter; // to do 需返回 {$listFragment, curDomList}
		}

		return parser.buildList($node, getter(), baseIndex, fors, aliasGroup, access, forsCache, vforIndex, false, filter);
	};

	/**
	 * adpater数据处理
	 * 
	 * @param   {JQLite}     $node         [指令节点]
	 * @param   {Array}      array         [循环数组数据]
	 * @param   {Number}     position      [当前处理数据索引]
	 * @param   {Object}     fors          [for别名映射]
	 * @param   {Object}     aliasGroup    [for指令别名组]
	 * @param   {String}     access        [节点路径]
	 * @param   {Object}     forsCache     [fors数据缓存]
	 * @param   {Number}     vforIndex     [for索引]
	 * @param   {ignor}      ignor         [是否忽略]
	 * @param   {filter}     filter        [过滤器]
	 */
	pp.buildAdapterList = function ($node, array, position, fors, aliasGroup, access, forsCache, vforIndex, ignor, filter) {
		var cFors = forsCache[position] = Parser.createFors(fors, aliasGroup, access, position, filter, ignor);
		// $node.data('vforIndex', vforIndex);
		this.$scope['$alias'][aliasGroup.alias] = array[position];
		this.vm.compileSteps($node, cFors, true);
	};

	/**
	 * 通用循环处理
	 * 
	 * @param   {JQLite}     $node         [指令节点]
	 * @param   {Array}      array         [循环数组数据]
	 * @param   {Number}     baseIndex     [起始索引]
	 * @param   {Object}     fors          [for别名映射]
	 * @param   {Object}     aliasGroup    [for指令别名组]
	 * @param   {String}     access        [节点路径]
	 * @param   {Object}     forsCache     [fors数据缓存]
	 * @param   {Number}     vforIndex     [for索引]
	 * @param   {ignor}      ignor         [是否忽略]
	 * @param   {filter}     filter        [过滤器]
	 */
	pp.buildList = function ($node, array, baseIndex, fors, aliasGroup, access, forsCache, vforIndex, ignor, filter) {
		var $listFragment = $.ui.createJQFragment(), curDomList = [];

		const isTpl = this.isTemplate($node);

		$.util.each(array, function (i, item) {
			var ni = baseIndex + i;
			var cFors = forsCache[ni] = Parser.createFors(fors, aliasGroup, access, ni, filter);
			// var $plate = $node.clone();//.data('vforIndex', vforIndex);
			var $plate = $('<!-- -->'+$node.def('__forTpl')+'<!-- -->'); // clone会导致组件内部有子组件，导致dom结构变化的问题
			if(isTpl){
				$plate = $(document.createDocumentFragment()).append($plate);
			}
			cFors.__$plate = $plate;
			this.setDeepScope(cFors);

			this.handleTemplate($plate, isTpl);

			this.vm.compileSteps($plate, cFors);

			curDomList.push(isTpl ? $plate.contents() : $plate);

			$listFragment.append($plate);
		}, this);

		return {
			$listFragment: $listFragment,
			curDomList: curDomList
		};
	};

	pp.handleTemplate = function($plate, isTpl){
		var $target, $children = isTpl ? $plate.contents() : $plate;
		for(var i=1, len=$children.length-1;i<len;i++){
			var $cur = $($plate.get(i));
			if($cur.hasAttr('useTemplate')){
				$target = $cur;
				break;
			}
		}

		if(!$target) return;

		var tpl = $target.attr('useTemplate'), $tpl;
		if(!tpl){
			if(!(($tpl = $target.find('script, template')) && $tpl.length>0)){
				$tpl = $target;
			}
			tpl = $tpl.html();
		}
		var html = $.template(tpl, this.getTemplateScope());
		$target.html(html);
	}

	/**
	 * 对需要使用new Function获取值的对象进行缓存处理，避免频繁new Function
	 */
	pp.getAliasFunc = function($access, isFull){
		var path = isFull?$access:('scope.'+Parser.formateSubscript($access));
		var aliasCache = this.aliasCache || {};
		if(aliasCache[path]) return aliasCache[path];

		// path = path.replace(/\[([^\d\]]+)\]/g, function(s, s1){
		// 	return '[scope.$alias.' + $.util.trim(s1) + ']';
		// });

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
		var alias = Parser.getAlias(fors),
			indexAlias = Parser.getIndexAlias(fors),
			access = fors.access,
			$access = Parser.makeDep(access, fors, this.getVmPre()),
			$index = fors.$index,
			ignor = fors.ignor;
		if (ignor) return this.setDeepScope(fors.fors);

		var arr = this.getAliasValue($access);
		scope[str$alias][alias] = arr[$index];
		// if (!isParent) scope[str$alias]['$index'] = $index;
		if (!isParent || indexAlias!=='$index') scope[str$alias][indexAlias] = $index;
		if (fors.filter) {
			var filter$access = Parser.makeAliasPath(fors.filter, fors, this.getVmPre('method'));

			$.util.defRec(scope[str$alias][alias], '$index', $index);

			var cur$item = scope[str$alias][alias];

			var filter$func = this.getAliasFunc(filter$access, true)(scope);
			if(typeof filter$func==='function'){
				filter$func.call({
					reObserve: function(){
						var cur$item = arr[$index];
						var paths = observer.getAllPathFromArr(cur$item, arr, $index);
						observer.observe(cur$item, paths);
					}
				}, $index, cur$item, arr, fors.__$plate);
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
		var scope = Object.create(this.vm.$data);
		var data = scope[this.getVmPre()];
		if(data && !data.__$extend){
			data.__$extend = {
				toString: function(s){
					try{
						return String(s);
					}catch(e){
						console.error(e);
					}
					return '';
				}
			}
		}

		return scope;
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
				var ss = s.split(Parser.dirSplit);
				ss[1] = "'" + ss[1].replace(/'/g, '"') + "'";
				group[i] = ss.join(Parser.dirSplit);
			});
			return '{' + group.join(',') + '}';
		} else {
			return "'" + exp + "'";
		}
	};

	// 获取依赖
	Parser.getDepsAlias = function (expression, fors, type) {
		var deps = [];
		var exps = [];
		// 匹配单引号/双引号包含的常量和+<>==等运算符操作
		// expression = expression.replace(/('[^']*')|("[^"]*")|([\w\_\-\$\@\#\.]*(?!\?|\:|\+{1,2}|\-{1,2}|\*|\/|\%|(={1,3})|\>{1,3}|\<{1,3}|\>\=|\<\=|\&{1,2}|\|{1,2}|\!+)[\w\_\-\$\@\#\.]*)/g, function(exp){
		expression = expression.replace(/('[^']*')|("[^"]*")|([\w\_\-\$\@\#\.\[\]]*(?!\?|\:|\+{1,2}|\-{1,2}|\*|\/|\%|(={1,3})|\>{1,3}|\<{1,3}|\>\=|\<\=|\&{1,2}|\|{1,2}|\!+)[\w\_\-\$\@\#\.\[\]]*)/g, function(exp){
			
			if (exp!==''&&!Parser.isConst(exp)) {
				deps.push(Parser.makeDep(exp, fors, type));
				exp = Parser.makeAliasPath(exp, fors, type, function(es){
					deps = deps.concat(es);
				});
			}
				
			return exp;
		});

		exps.push(expression);

		return {deps:deps, exps:exps};
	};

	//获取指令表达式的真实路径
	Parser.makeDep = function (exp, fors, type) {
		var NOT_AVIR_RE = /[^\w\.\[\]\$]/g
		exp = exp.replace(NOT_AVIR_RE, '');

		exp = Parser.deepFindScope(exp, fors);

		exp = Parser.__addPre(exp, type);

		return exp;
	};

	Parser.findMyFors = function(name, fors){
		if(!fors) return fors;
		if(name===Parser.getAlias(fors)) return fors;
		return Parser.findMyFors(name, fors.fors);
	};

	//深度查找指令表达式的别名对应的真实路径
	Parser.deepFindScope = function (_exp, fors) {
		if (!fors) return _exp;

		var exps = _exp.split('.');

		var myFors = Parser.findMyFors(exps[0], fors);

		if(!myFors) myFors = fors;

		var alias = Parser.getAlias(myFors);
		var indexAlias = Parser.getIndexAlias(myFors);
		var access = myFors.access;
		var $index = myFors.$index;

		var $access = Parser.deepFindScope(access, myFors.fors);

		if(_exp===access) return $access;

		$.util.each(exps, function (i, exp) {
			if (exp === indexAlias) {
				exps[i] = $access + '.' + myFors.$index + '.*';
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

		var indexAlias = Parser.getIndexAlias(fors);

		$.util.each(exps, function (i, exp) {
			if (exp === indexAlias) {
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

		var alias = Parser.getAlias(fors);
		var access = fors.access;
		var $index = fors.$index;

		if (alias === exp) {
			return access + '.' + $index;
		}

		return Parser.findScope(exp, fors.fors);
	};

	//获取指令表达式的别名路径
	Parser.makeAliasPath = function (exp, fors, type, cb) {
		//li.pid==item.pid
		//$index
		//obj.title
		//$index>0
		var indexes = Parser.getIndexAliasArr(fors);
		exp = exp.replace(/([^\w \.\$'"\/])[ ]*([\w]+)/g, function (s, s1, s2) {

			s = s1 + s2;

			if (s === '$event' || Parser.isConst(s2)) {
				return s;
			}

			if ( indexes.indexOf(s) > -1 ) {
				return 'scope.$alias.' + s;
			}

			if (Parser.hasAlias(s2, fors)) {
				return s1 + 'scope.$alias.' + s2;
			} else {
				return s1 + 'scope.' + Parser.__addPre(s2, type);
			}
		});
		var exps = exp.split('.');
		exps[0] = /^['"\/].*$/.test(exps[0]) ? exps[0] : exps[0].replace(/[\w\$]+/,
			function (s) {
				if (Parser.isConst(s) || s === '$event' || s === 'scope') {
					return s;
				}

				if ( indexes.indexOf(s) > -1 || Parser.hasAlias(s, fors)) {
					s = '$alias.' + s;
				}else{
					s = Parser.__addPre(s, type);
				}
				return 'scope.' + s;
			});
		exp = exps.join('.');

		exp = exp.replace(/\[([^\d\]]+)\]/g, function(s, s1){
			var des = Parser.getDepsAlias(s1, fors, type);
			cb && cb(des.deps);
			return '[' + des.exps.join('') + ']';
		});

		return exp;
	};

	// 转换属性
	Parser.transAttr = function($node, oldAttr, newAttr){
		if($node.hasAttr(oldAttr)){
			$node.attr(newAttr, $node.attr(oldAttr) || '');
			$node.removeAttr(oldAttr);
		}
	};

	Parser.getAlias = function(fors){
		var aliasGroup = fors && fors.aliasGroup;
		if(!aliasGroup) return '';
		return aliasGroup.alias;
	};
	Parser.getIndexAlias = function(fors){
		var aliasGroup = fors && fors.aliasGroup;
		if(!aliasGroup) return '';
		return aliasGroup.indexAlias;
	};
	Parser.getIndexAliasArr = function (fors, arr) {
		arr = arr || [];
		var aliasGroup = fors && fors.aliasGroup;
		if (!aliasGroup) return arr;
		arr.push(aliasGroup.indexAlias);
		return Parser.getIndexAliasArr(fors.fors, arr);
	};

	//表达式中是否包含别名
	Parser.hasAlias = function (exp, fors) {
		if (!fors) return false;

		if (exp === Parser.getAlias(fors)) return true;

		return this.hasAlias(exp, fors.fors);
	};

	//创建fors数据，内容为别名依赖
	Parser.createFors = function (fors, aliasGroup, access, index, filter, ignor) {
		return {
			aliasGroup: aliasGroup,
			access: access,
			fors: fors,
			$index: index,
			filter: filter,
			ignor: ignor
		};
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
			try{
				kv = new Function(`return ${exp};`)();
			}catch(e){
				console.error(e);
			}
			// kv = JSON.stringify(exp);
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
		// return $node.hasAttr('number') ? +value : value;
		return $node.getFormatValue(value);
	};

	//获取select组件的取值
	Parser.getSelecteds = function ($select) {
		var sels = [], getNumber = $select.hasAttr('number');
		if($select.is('select')){

			$select.find("option:selected").each(function () {
				var $option = $(this);
				var value = $option.val();
				sels.push(getNumber ? +value : Parser.formatValue($option, value));
			});
		}else{
			var multi = directiveUtil.isSelectMultiple($select);
			var v = $select.attr('value')||'';
			if(multi){
				try{
					sels = v ? JSON.parse(v) : [];
				}catch(e){
					sels = [];
				}
			}else{
				sels = [v];
			}
			
			if(getNumber){
				for(var i=0, len=sels.length;i<len;i++){
					sels[i] = (+sels[i]);
				}
			}
			
		}

		return sels;
	};

	Parser.getSwitch = function ($node, checked) {
		var trueValue = $node.hasAttr('true-value') ? $node.attr('true-value') : true, 
				falseValue = $node.hasAttr('false-value') ? $node.attr('false-value') : false, 
				isNumber = $node.hasAttr('number');
			
		if(isNumber){
			trueValue = (+trueValue);
			falseValue = (+falseValue);
		}
		return checked ? trueValue : falseValue;
	};

	//文本输入框的事件监听处理
	Parser.bindTextEvent = function ($node, callbacl) {

		var eventRefer = $node[0].__eventRefer || {}; // hook 

		var composeLock;

		// 解决中文输入时 input 事件在未选择词组时的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		$node.__on__(eventRefer.compositionstart || 'compositionstart', function () {
			composeLock = true;
		});
		$node.__on__(eventRefer.compositionend || 'compositionend', function () {
			composeLock = false;
			$(this).trigger(eventRefer.input || 'input');
		});

		// input 事件(实时触发)
		$node.__on__(eventRefer.input || 'input', function () {
			if(!composeLock) callbacl.apply(this, arguments);
		});

		// change 事件(失去焦点触发)
		$node.__on__(eventRefer.blur || 'blur', function () {
			callbacl.apply(this, arguments);
		});
	};

	//通用change事件监听处理。比如：radio、checkbox、select等
	Parser.bindChangeEvent = function ($node, callback) {
		var eventRefer = $node[0].__eventRefer || {}; // hook 

		$node.__on__(eventRefer.change || 'change', function () {
			callback.apply(this, arguments);
		});
		$node.__on__('customchange', function () {
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

	Parser.dirSplit = ':';

	var __eventFilter = {
		before: {
			default: null
		},
		after: {
			default: null
		}
	};
	Parser.addEventFilter = function(filters, type){
		type = type || 'before';
		for(var k in filters){
			__eventFilter[type][k] = filters[k];
		}
	};
	Parser.getEventFilter = function(el, evtName, type){
		if(!el) return null;
		evtName = evtName.toLowerCase();
		type = type || 'before';
		if(el['__'+type+evtName]) return el['__'+type+evtName];
		if(__eventFilter[type][evtName]) return __eventFilter[type][evtName];
		if(__eventFilter[type]['default']) return __eventFilter[type]['default'];
		return null;
	};

	// var __vmPre = {
	// 	data: '',
	// 	method: ''
	// };
	var __vmPre;
	Parser.__addPre = function(exp, pre){
		// var pre = (__vmPre&&__vmPre[type||'data']) || '';
		return (pre? pre+'.' : '') + exp;
	};
	Parser.setVMPre = function(setting){
		__vmPre = setting;
	};
	Parser.getVMPre = function(){
		return __vmPre || {};
	};
	Parser.hasVMPre = function(){
		return !!__vmPre;
	};
	Parser.config = {
		mutexGroupCache: false
	};


	module.exports = Parser;

	if (typeof __EXPORTS_DEFINED__ === 'function') __EXPORTS_DEFINED__(Parser, 'Parser');

})();