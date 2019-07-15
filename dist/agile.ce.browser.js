/*
 *	Agile CE 移动前端MVVM框架
 *	Version	:	0.5.8.1563186354316 beta
 *	Author	:	nandy007
 *	License MIT @ https://github.com/nandy007/agile-ce
 *//******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var env = {};
if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
    env = window;
}
module.exports = env;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
	var $ = __webpack_require__(0).JQLite;
	var Updater = __webpack_require__(11);
	var Watcher = __webpack_require__(12);

	var directiveUtil = {
		commonHandler: function commonHandler(opts) {
			// call by parser
			var $node = opts.$node,
			    fors = opts.fors,
			    expression = opts.expression,
			    cb = opts.cb;
			var parser = this;
			var scope = this.$scope;
			var expressions = [];
			expression.replace(/\{\{([^\}]+)\}\}/g, function (s, s1) {
				expressions.push($.util.trim(s1));
			});

			$.util.each(expressions, function (i, exp) {
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
			if ((typeof exp === 'undefined' ? 'undefined' : _typeof(exp)) === 'object') return exp;
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
		formatDirJson: function formatDirJson(expression) {
			var ps = expression.split('');
			if (ps.shift() === '{' && ps.pop() === '}') {
				expression = ps.join('');

				ps = expression.split(',');
				var json = {};
				$.util.each(ps, function (i, kv) {
					var kvs = kv.split(':'),
					    k = $.util.trim(kvs.shift() || '').replace(/['"]/g, ''),
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
			    _cb = opts.cb;
			var parser = this;

			var obj = directiveUtil.formatDirJson(expression);

			//v-style="string"写法，如：v-style="imgStyle"
			if ($.util.isString(obj)) {

				directiveUtil.commonHandler.call(this, {
					$node: $node,
					fors: fors,
					expression: directiveUtil.wrapperDir(obj),
					cb: function cb(rs) {
						_cb(rs);
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
					cb: function cb(rs) {
						_cb(rs, k);
					}
				});
			}, this);
		},
		wrapperDir: function wrapperDir(exp) {
			return '{{' + exp + '}}';
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
		'vtext': function vtext($node, fors, expression, dir, updateFunc) {

			var updater = this.updater;
			updateFunc = updateFunc || 'updateTextContent';

			directiveUtil.commonHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: directiveUtil.wrapperDir(expression),
				cb: function cb(rs) {
					updater[updateFunc]($node, rs);
				}
			});
		},
		'vhtml': function vhtml($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			args.push('updateHTMLContent');
			this.vtext.apply(this, args);
		},
		'vfor': function vfor($node, fors, expression) {

			Parser.transAttr($node, 'v-template', 'useTemplate');

			var parser = this;

			var vforIndex = this.vforIndex++;

			var vm = this.vm,
			    scope = this.$scope,
			    $parent = $node.parent();

			var __filter = $node.data('__filter');

			var parseSer = this.parseForExp(expression);

			var alias = parseSer.alias,
			    indexAlias = parseSer.indexAlias || $node.attr('for-index') || '$index',
			    access = parseSer.access,
			    $access = Parser.makeDep(access, fors, parser.getVmPre()),
			    aliasGroup = { alias: alias, indexAlias: indexAlias };

			var forsCache = {};

			var $listFragment = parser.preCompileVFor($node, function () {
				return parser.getAliasValue($access);
			}, 0, fors, aliasGroup, access, forsCache, vforIndex, __filter);

			var isAdapter = $.ui.isJQAdapter($listFragment);

			if (isAdapter) {
				return;
			}

			var domList = [];
			$listFragment.children().each(function () {
				domList.push($(this));
			});

			if ($node.attr('mode') === 'single') {
				$listFragment.replaceTo($node);
			} else {
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

			var deps = [$access],
			    updater = this.updater;

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

				var handlerFlag = i === 0;
				parser.watcher.updateIndex($access, options, function (opts) {
					var cFor = forsCache[opts.newVal] = forsCache[opts.oldVal];
					if (__filter) cFor.filter = __filter;
					cFor['$index'] = opts.newVal;
					parser.watcher.change(opts);
				}, handlerFlag);

				updater.updateList($parent, $node, options, function (arr, isRender) {
					var $listFragment;
					if (isRender) {
						if (__filter) $node.data('__filter', __filter);
						var baseIndex = Parser.getBaseIndex(options);
						$listFragment = parser.preCompileVFor($node, function () {
							return arr;
						}, baseIndex, fors, aliasGroup, access, forsCache, vforIndex, __filter);
					}

					return {
						$fragment: $listFragment,
						domList: domList
					};
				});

				__modelInit && __modelInit();
			});
		},
		'von': function von($node, fors, expression, dir, opts) {
			var parser = this;
			var vm = this.vm,
			    scope = this.$scope;
			var evts = Parser.parseDir(dir, expression);
			opts = opts || {};
			var isOnce = opts.isOnce,
			    isCatch = opts.isCatch;

			$.util.each(evts, function (evt, func) {
				var depsAlias = Parser.getDepsAlias(func, fors, parser.getVmPre('method'));

				var funcStr = depsAlias.exps.join('.');

				var argsStr = '';
				funcStr = funcStr.replace(/\((.*)\)/, function (s, s1) {
					argsStr = s1;
					return '';
				});

				var _proxy = function _proxy() {
					var params = $.util.copyArray(arguments);
					parser.setDeepScope(fors);
					// var func = (new Function('scope', 'return ' + funcStr + ';'))(scope);
					var beforeHandler = Parser.getEventFilter(this, evt);
					var me = beforeHandler && beforeHandler.apply(parser.vm.$element, [this].concat(_toConsumableArray(params))) || this;
					var rs;
					if (argsStr === '') {
						var func = new Function('scope', 'node', 'params', 'return ' + funcStr + '.apply(node, params);');
						rs = func(scope, me, params);
					} else {
						var func = new Function('scope', 'node', '$event', 'params', 'params.unshift(' + argsStr + '); return ' + funcStr + '.apply(node, params);');
						rs = func(scope, me, params.shift(), params);
					}
					var afterHandler = Parser.getEventFilter(this, evt, 'after');
					return afterHandler ? afterHandler.apply(parser.vm.$element, [rs, isCatch, this].concat(_toConsumableArray(params))) : rs;
				};

				$node.each(function () {
					$.util.defRec(this, parser._getProxy(evt), _proxy);
				});

				if (isOnce) $node.off(evt, parser._proxy);

				$node.__on__(evt, parser._proxy);
			});
		},
		'vone': function vone($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			args.push({
				isOnce: true
			});
			this.von.apply(this, args);
		},
		'vcatch': function vcatch($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			args.push({
				isCatch: true
			});
			this.von.apply(this, args);
		},
		'vbind': function vbind($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

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
		'vstyle': function vstyle($node, fors, expression) {
			var oldStyle,
			    updater = this.updater;
			directiveUtil.jsonDirHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: expression,
				cb: function cb(rs, k) {
					if (k) {
						updater.updateStyle($node, k, rs);
						return;
					}
					rs = directiveUtil.formatStyle(rs);
					if (oldStyle) {
						$.util.each(oldStyle, function (k, v) {
							if (!rs[k]) rs[k] = '';
						});
					}
					updater.updateStyle($node, rs);
					oldStyle = rs;
				}
			});
		},
		'vclass': function vclass($node, fors, expression) {
			var oldClass,
			    updater = this.updater;
			directiveUtil.jsonDirHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: expression,
				cb: function cb(rs, k) {
					if (k) {
						updater.updateClass($node, k, rs);
						return;
					}

					if (typeof oldClass === 'string') {
						updater.updateClass($node, oldClass, false);
					} else if ((typeof oldClass === 'undefined' ? 'undefined' : _typeof(oldClass)) === 'object') {
						$.util.each(oldClass, function (k, v) {
							updater.updateClass($node, k, false);
						});
					}
					if (typeof rs === 'string') {
						updater.updateClass($node, rs, true);
					} else if ((typeof rs === 'undefined' ? 'undefined' : _typeof(rs)) === 'object') {
						$.util.each(rs, function (k, v) {
							updater.updateClass($node, k, v);
						});
					}
					oldClass = rs;
				}
			});
		},
		'vxclass': function vxclass($node, fors, expression) {

			var oldClass,
			    updater = this.updater;
			// btn-{{type}} {{'name-'+size+' '+mode}}
			// -> 'btn-'+type+' '+'name-'+size+' '+mode
			var exp = "{{'" + expression.replace(/\{\{([^\}]+)\}\}/g, function (s, s1) {
				return "'+(" + s1 + ")+'";
			}) + "'}}";

			directiveUtil.commonHandler.call(this, {
				$node: $node,
				fors: fors,
				expression: exp,
				cb: function cb(rs) {
					if (oldClass) updater.updateClass($node, oldClass, false);
					if (rs) updater.updateClass($node, rs, true);
					oldClass = rs;
				}
			});
		},
		'vxstyle': function vxstyle($node, fors, expression) {

			var styles = directiveUtil.formatStyle(expression),
			    updater = this.updater;

			$.util.each(styles, function (styleName, exp) {
				directiveUtil.commonHandler.call(this, {
					$node: $node,
					fors: fors,
					expression: exp,
					cb: function cb(rs) {
						updater.updateStyle($node, styleName, rs);
					}
				});
			}, this);
		},
		'vshow': function vshow($node, fors, expression) {
			var parser = this,
			    updater = this.updater;

			var defaultValue = $node.css('display');
			if (!defaultValue || defaultValue === 'none') defaultValue = '';

			updater.updateShowHide($node, defaultValue, parser.getValue(expression, fors));

			var deps = Parser.getDepsAlias(expression, fors, parser.getVmPre()).deps;

			parser.watcher.watch(deps, function (options) {
				updater.updateShowHide($node, defaultValue, parser.getValue(expression, fors));
			}, fors);
		},
		'vhide': function vhide($node, fors, expression) {
			var parser = this;
			parser.vshow.call(parser, $node, fors, '!(' + expression + ')');
		},
		'vcif': function vcif($node, fors, expression, dir) {
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
		'vif': function vif($node, fors, expression, dir) {

			if ($node.hasAttr('mutexGroupCache') || Parser.config.mutexGroupCache) {
				return this.vcif($node, fors, expression, dir);
			}

			var parser = this,
			    updater = this.updater;

			var branchGroup = this.getBranchGroup(dir === 'v-if' ? $node : null);
			var $placeholder = branchGroup.$placeholder,
			    nodes = $placeholder.def('nodes');

			var preCompile = function preCompile($fragment) {
				parser.vm.compileSteps($fragment, fors);
			};

			var mutexHandler = function mutexHandler() {
				var theDef,
				    lastIndex = -1;
				$.util.each(nodes, function (i, nodeDef) {
					var curRender = nodeDef.dir === 'v-else' ? true : parser.getValue(nodeDef.expression, fors);
					if (curRender) {
						lastIndex = i;
						theDef = nodeDef;
						return false;
					}
				});
				if ($placeholder.def('lastIndex') === lastIndex) return;
				$placeholder.def('lastIndex', lastIndex);
				if (theDef) {
					updater.branchRender($placeholder, $(theDef.html), preCompile);
				} else {
					updater.branchRender($placeholder, null, preCompile);
				}
			};

			var $siblingNode = $node.next();
			nodes.push({
				html: $node.outerHTML(),
				expression: expression,
				dir: dir
			});
			$node.remove();
			if (!$siblingNode.hasAttr('v-else') && !$siblingNode.hasAttr('v-elseif')) {
				mutexHandler();
			}

			var deps = Parser.getDepsAlias(expression, fors, parser.getVmPre()).deps;

			parser.watcher.watch(deps, function (options) {
				mutexHandler();
			}, fors);
		},
		'velseif': function velseif($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			this.vif.apply(this, args);
		},
		'velse': function velse($node, fors, expression, dir) {
			var args = $.util.copyArray(arguments);
			this.vif.apply(this, args);
		},
		'vlike': function vlike($node, fors, expression) {
			$node.data('__like', expression);
		},
		'vmodel': function vmodel($node, fors, expression, dir) {
			var type = dir.indexOf(':') > -1 ? dir.split(':')[1] : $node.data('__like') || $node.elementType();
			switch (type) {
				case 'text':
				case 'password':
				case 'textfield':
				case 'textinput':
				case 'textarea':
					this.vmtext.apply(this, arguments);return;
				case 'radio':
					this.vmradio.apply(this, arguments);return;
				case 'checkbox':
					this.vmcheckbox.apply(this, arguments);return;
				case 'select':
					this.vmselect.apply(this, arguments);return;
				case 'switch':
					this.vmswitch.apply(this, arguments);return;
			}

			if (this['vm' + type]) {
				this['vm' + type].apply(this, arguments);
			} else {
				$.util.warn('v-model 不支持 [ ' + type + ' ] 组件');
			}
		},
		'vmtext': function vmtext($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

			var access = Parser.makeDep(expression, fors, parser.getVmPre());

			// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex, field = duplexField.field;;

			updater.updateValue($node, parser.getValue(expression, fors));

			var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateValue($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindTextEvent($node, function () {
				var access = Parser.makeDep(expression, fors, parser.getVmPre());
				var duplexField = parser.getDuplexField(access),
				    duplex = duplexField.duplex(parser.$scope),
				    field = duplexField.field;
				duplex[field] = Parser.formatValue($node, $node.val());
			});
		},
		'vmradio': function vmradio($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

			var access = Parser.makeDep(expression, fors, parser.getVmPre());

			var duplexField = parser.getDuplexField(access),
			    duplex = duplexField.duplex(parser.$scope),
			    field = duplexField.field;

			var value = parser.getValue(expression, fors);

			var isChecked = $node.isChecked();

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
				if ($node.isChecked()) {
					// var access = Parser.makeDep(expression, fors, parser.getVmPre());
					// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
					duplex[field] = Parser.formatValue($node, $node.val());
				}
			});
		},
		'vmcheckbox': function vmcheckbox($node, fors, expression, dir) {

			var parser = this,
			    updater = this.updater;

			var access = Parser.makeDep(expression, fors, parser.getVmPre());

			var duplexField = parser.getDuplexField(access),
			    duplex = duplexField.duplex(this.$scope),
			    field = duplexField.field;

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

			var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateCheckboxChecked($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {

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
		'vmselect': function vmselect($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

			var access = Parser.makeDep(expression, fors, parser.getVmPre());

			var duplexField = parser.getDuplexField(access),
			    duplex = duplexField.duplex(parser.$scope),
			    field = duplexField.field;

			var multi = $node.hasAttr('multiple');

			var init = function init() {
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
				// var access = Parser.makeDep(expression, fors, parser.getVmPre());
				// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
				var selects = Parser.getSelecteds($(this));
				duplex[field] = multi ? selects : selects[0];
			});
		},
		'vmnativeselect': function vmnativeselect($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

			var access = Parser.makeDep(expression, fors, parser.getVmPre());

			var duplexField = parser.getDuplexField(access),
			    duplex = duplexField.duplex(parser.$scope),
			    field = duplexField.field;

			updater.updateValue($node, duplex[field]);

			var deps = [access];
			parser.watcher.watch(deps, function () {
				$node.val(parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {
				// var access = Parser.makeDep(expression, fors, parser.getVmPre());
				// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex(parser.$scope), field = duplexField.field;
				duplex[field] = $node.val();
			});
		},
		'vmswitch': function vmswitch($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

			var access = Parser.makeDep(expression, fors, parser.getVmPre());

			var duplexField = parser.getDuplexField(access),
			    duplex = duplexField.duplex(parser.$scope),
			    field = duplexField.field;

			if ($node.hasAttr('checked')) {
				duplex[field] = Parser.getSwitch($node, $node.xprop('checked'));
			} else {
				updater.updateSwitchChecked($node, duplex[field] === Parser.getSwitch($node, true) ? true : false);
			}

			var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateSwitchChecked($node, duplex[field] === Parser.getSwitch($node, true) ? true : false);
			}, fors);

			Parser.bindChangeEvent($node, function () {
				duplex[field] = Parser.getSwitch($node, $node.xprop('checked'));
			});
		},
		'vfilter': function vfilter($node, fors, expression) {
			$node.data('__filter', expression);
		},
		'vcontext': function vcontext($node, fors, expression) {
			var funcStr = Parser.makeAliasPath(expression, fors),
			    func = Parser.makeFunc(funcStr.match(/\([^\)]*\)/) ? funcStr : funcStr + '()', true),
			    scope = this.$scope;

			$node.def('__context', function () {
				return func(scope);
			});
		},
		'vtemplate': function vtemplate($node, fors, expression) {
			var scope = this.$scope;
			// Parser.transAttr($node, 'v-template', 'useTemplate');
			// var template = $node.attr('useTemplate') || $node.html();
			var template = expression || $node.html();
			var html = $.template(template, $.extend({}, scope, scope.$alias)) || '';
			$node.html(html);
		},
		// 隐式监听
		'vwatch': function vwatch($node, fors, expression, dir) {
			var depsalias = Parser.getDepsAlias(expression, fors, this.getVmPre());
			var deps = depsalias.deps;
			var evtName = dir.split(Parser.dirSplit)[1];
			this.watcher.watch(deps, function (options) {
				if (evtName) $node.trigger(evtName);
			}, fors);
		}
	};

	var _parserIndex = 0;

	/**
  * 指令解析器模块
  * @param  {Compiler}      vm  [Compiler示例对象]
  */
	var Parser = function Parser(vm) {

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

	pp.initVmPre = function () {
		if (!Parser.hasVMPre()) return;
		var model = this.vm.$data;
		this.vmPre = {
			data: model.data ? 'data' : '',
			method: model.methods ? 'methods' : ''
		};
	};

	pp.getVmPre = function (type) {
		if (!Parser.hasVMPre()) return '';
		type = type || 'data';
		var vmPre = Parser.getVMPre();
		var rs = this.vmPre[type] || vmPre[type] || '';
		return rs;
	};

	pp.parseForExp = function (expression) {
		expression = expression.replace(/[ ]+/g, ' ');

		var exps = expression.split(' in '),
		    aliasGroup = (exps[0] || '').replace(/[ ]+/g, ''),
		    access = (exps[1] || '').replace(/[ ]+/g, '');
		// $access = Parser.makeDep(access, fors);
		if (aliasGroup.indexOf('(') === 0) {
			aliasGroup = aliasGroup.substring(1, aliasGroup.length - 1);
		}
		aliasGroup = aliasGroup.split(',');
		var alias = aliasGroup[0],
		    indexAlias = aliasGroup[1];
		return {
			alias: alias,
			indexAlias: indexAlias,
			access: access
		};
	};

	pp.initProxy = function () {
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
					if (!__directiveDef) {
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
	pp.getMutexGroup = function ($node) {
		if ($node) {
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
	pp.getBranchGroup = function ($node) {
		if ($node) {
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
		var parser = this,
		    updater = this.updater;
		(function doWatch(deps, adds) {
			parser.watcher.watch(adds || deps, function (options) {
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
		};
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

		var parser = this,
		    vm = this.vm;

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

			return $adapter;
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
		var $listFragment = $.ui.createJQFragment();

		$.util.each(array, function (i, item) {
			var ni = baseIndex + i;
			var cFors = forsCache[ni] = Parser.createFors(fors, aliasGroup, access, ni, filter);
			var $plate = $node.clone(); //.data('vforIndex', vforIndex);
			cFors.__$plate = $plate;
			this.setDeepScope(cFors);

			this.handleTemplate($plate);

			this.vm.compileSteps($plate, cFors);
			$listFragment.append($plate);
		}, this);

		return $listFragment;
	};

	pp.handleTemplate = function ($plate) {
		if (!$plate.hasAttr('useTemplate')) return;
		var tpl = $plate.attr('useTemplate'),
		    $tpl;
		if (!tpl) {
			if (!(($tpl = $plate.find('script, template')) && $tpl.length > 0)) {
				$tpl = $plate;
			}
			tpl = $tpl.html();
		}
		var scope = this.$scope,
		    html = $.template(tpl, $.extend({}, scope, scope.$alias));
		$plate.html(html);
	};

	/**
  * 对需要使用new Function获取值的对象进行缓存处理，避免频繁new Function
  */
	pp.getAliasFunc = function ($access, isFull) {
		var path = isFull ? $access : 'scope.' + Parser.formateSubscript($access);
		var aliasCache = this.aliasCache || {};
		if (aliasCache[path]) return aliasCache[path];
		var func = Parser.makeFunc(path);

		return aliasCache[path] = func;
	};

	pp.getAliasValue = function ($access, isFull) {
		// var path = isFull?$access:('scope.'+Parser.formateSubscript($access));
		// var aliasCache = this.aliasCache || {};
		// if(aliasCache[path]) return aliasCache[path];
		// var func = Parser.makeFunc(path), scope = this.$scope;
		var func = this.getAliasFunc($access, isFull),
		    scope = this.$scope;
		return func(scope);
	};

	/**
  * 深度设置$alias别名映射
  * @param   {Object}     fors          [for别名映射]
  * @param   {Object}     isParent      [是否为父节点]
  */
	pp.setDeepScope = function (fors, isParent) {
		if (!fors) return;
		var scope = this.$scope,
		    str$alias = '$alias',
		    observer = this.watcher.observer;
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
		if (!isParent) scope[str$alias][indexAlias] = $index;
		if (fors.filter) {
			var filter$access = Parser.makePath(fors.filter, fors);

			$.util.defRec(scope[str$alias][alias], '$index', $index);

			var cur$item = scope[str$alias][alias];

			var filter$func = this.getAliasFunc(filter$access)(scope);
			if (typeof filter$func === 'function') {
				filter$func.call({
					reObserve: function reObserve() {
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
		if (data && !data.__$extend) {
			data.__$extend = {
				toString: function toString(s) {
					try {
						return String(s);
					} catch (e) {
						console.error(e);
					}
					return '';
				}
			};
		}

		return scope;
	};

	/**
  * 销毁
  */
	pp.destroy = function () {
		this.vm.$element.__remove_on__(this.parserIndex);
		this.watcher.destroy();
		this.$scope = this.aliasCache = this.watcher = this.updater = null;
	};

	/**
  * 添加指令规则
  * @param   {Object|String}     directive       [当只有一个参数是代表是指令规则键值对，两个参数的时候代表指令名]
  * @param   {Function}          func            [指令解析函数]
  */
	Parser.add = function (directive, func) {
		var obj = {};
		$.util.isObject(directive) ? obj = directive : obj[directive] = func;
		$.util.each(obj, function (d, f) {
			directiveRules[d] = f;
		});
	};

	//获取指令名v-on:click -> v-on
	Parser.getDirName = function (dir) {
		return Parser.splitName(dir)[0];
	};

	//是否是运算符
	Parser.isOperatorCharacter = function (str) {
		var oc = {
			'+': 1, '-': 1, '*': 1, '/': 1, '%': 1, // 加减乘除

			'++': 1, '--': 1, // 加加减减

			'<': 1, '>': 1, '<=': 1, '>=': 1, '==': 1, '===': 1, '!=': 1 // 大小比较
		};
		return oc[str];
	};

	//字符串是否是常量表示
	Parser.isConst = function (str) {
		str = $.util.trim(str || '');
		if (Parser.isOperatorCharacter(str)) return true;
		var strs = str.split('');
		var start = strs.shift() || '',
		    end = strs.pop() || '';
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
		return (/^\d+$/.test(str)
		);
	};

	//字符串是否是JSON对象表示
	Parser.isJSON = function (str) {
		var strs = (str || '').split('');
		var start = strs.shift(),
		    end = strs.pop();
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
		expression = expression.replace(/('[^']*')|("[^"]*")|([\w\_\-\$\@\#\.\[\]]*(?!\?|\:|\+{1,2}|\-{1,2}|\*|\/|\%|(={1,3})|\>{1,3}|\<{1,3}|\>\=|\<\=|\&{1,2}|\|{1,2}|\!+)[\w\_\-\$\@\#\.\[\]]*)/g, function (exp) {

			if (exp !== '' && !Parser.isConst(exp)) {
				deps.push(Parser.makeDep(exp, fors, type));
				return Parser.makeAliasPath(exp, fors, type);
			}

			return exp;
		});

		exps.push(expression);

		return { deps: deps, exps: exps };
	};

	//获取指令表达式的真实路径
	Parser.makeDep = function (exp, fors, type) {
		var NOT_AVIR_RE = /[^\w\.\[\]\$]/g;
		exp = exp.replace(NOT_AVIR_RE, '');

		exp = Parser.deepFindScope(exp, fors);

		exp = Parser.__addPre(exp, type);

		return exp;
	};

	Parser.findMyFors = function (name, fors) {
		if (!fors) return fors;
		if (name === Parser.getAlias(fors)) return fors;
		return Parser.findMyFors(name, fors.fors);
	};

	//深度查找指令表达式的别名对应的真实路径
	Parser.deepFindScope = function (_exp, fors) {
		if (!fors) return _exp;

		var exps = _exp.split('.');

		var myFors = Parser.findMyFors(exps[0], fors);

		if (!myFors) myFors = fors;

		var alias = Parser.getAlias(myFors);
		var indexAlias = Parser.getIndexAlias(myFors);
		var access = myFors.access;
		var $index = myFors.$index;

		var $access = Parser.deepFindScope(access, myFors.fors);

		if (_exp === access) return $access;

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
		var NOT_AVIR_RE = /[^\w\.\[\]\$]/g;
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
	Parser.makeAliasPath = function (exp, fors, type) {
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

			if (indexes.indexOf(s) > -1) {
				return 'scope.$alias.' + s;
			}

			if (Parser.hasAlias(s2, fors)) {
				return s1 + 'scope.$alias.' + s2;
			} else {
				return s1 + 'scope.' + Parser.__addPre(s2, type);
			}
		});
		var exps = exp.split('.');
		exps[0] = /^['"\/].*$/.test(exps[0]) ? exps[0] : exps[0].replace(/[\w\$]+/, function (s) {
			if (Parser.isConst(s) || s === '$event' || s === 'scope') {
				return s;
			}

			if (indexes.indexOf(s) > -1 || Parser.hasAlias(s, fors)) {
				s = '$alias.' + s;
			} else {
				s = Parser.__addPre(s, type);
			}
			return 'scope.' + s;
		});
		exp = exps.join('.');

		return exp;
	};

	// 转换属性
	Parser.transAttr = function ($node, oldAttr, newAttr) {
		if ($node.hasAttr(oldAttr)) {
			$node.attr(newAttr, $node.attr(oldAttr) || '');
			$node.removeAttr(oldAttr);
		}
	};

	Parser.getAlias = function (fors) {
		var aliasGroup = fors && fors.aliasGroup;
		if (!aliasGroup) return '';
		return aliasGroup.alias;
	};
	Parser.getIndexAlias = function (fors) {
		var aliasGroup = fors && fors.aliasGroup;
		if (!aliasGroup) return '';
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
			try {
				kv = new Function('return ' + exp + ';')();
			} catch (e) {
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
		return $node.hasAttr('number') ? +value : value;
	};

	//获取select组件的取值
	Parser.getSelecteds = function ($select) {
		var sels = [],
		    getNumber = $select.hasAttr('number');
		if ($select.is('select')) {

			$select.find("option:selected").each(function () {
				var $option = $(this);
				var value = $option.val();
				sels.push(getNumber ? +value : Parser.formatValue($option, value));
			});
		} else {
			sels = ($select.attr('value') || '').split(',');
			if (getNumber) {
				for (var i = 0, len = sels.length; i < len; i++) {
					sels[i] = +sels[i];
				}
			}
		}

		return sels;
	};

	Parser.getSwitch = function ($node, checked) {
		var trueValue = $node.hasAttr('true-value') ? $node.attr('true-value') : true,
		    falseValue = $node.hasAttr('false-value') ? $node.attr('false-value') : false,
		    isNumber = $node.hasAttr('number');

		if (isNumber) {
			trueValue = +trueValue;
			falseValue = +falseValue;
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
			if (!composeLock) callbacl.apply(this, arguments);
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
	Parser.formateSubscript = function (str) {
		return str.replace(/\.(\d+)/g, function (s, s1) {
			return '[' + s1 + ']';
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
	Parser.addEventFilter = function (filters, type) {
		type = type || 'before';
		for (var k in filters) {
			__eventFilter[type][k] = filters[k];
		}
	};
	Parser.getEventFilter = function (el, evtName, type) {
		if (!el) return null;
		evtName = evtName.toLowerCase();
		type = type || 'before';
		if (el['__' + type + evtName]) return el['__' + type + evtName];
		if (__eventFilter[type][evtName]) return __eventFilter[type][evtName];
		if (__eventFilter[type]['default']) return __eventFilter[type]['default'];
		return null;
	};

	// var __vmPre = {
	// 	data: '',
	// 	method: ''
	// };
	var __vmPre;
	Parser.__addPre = function (exp, pre) {
		// var pre = (__vmPre&&__vmPre[type||'data']) || '';
		return (pre ? pre + '.' : '') + exp;
	};
	Parser.setVMPre = function (setting) {
		__vmPre = setting;
	};
	Parser.getVMPre = function () {
		return __vmPre || {};
	};
	Parser.hasVMPre = function () {
		return !!__vmPre;
	};
	Parser.config = {
		mutexGroupCache: false
	};

	module.exports = Parser;

	if (typeof __EXPORTS_DEFINED__ === 'function') __EXPORTS_DEFINED__(Parser, 'Parser');
})();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var util = module.exports = {
    __booleanAttr: ['disabled', 'checked', 'selected', 'autoplay', 'hidden'],
    booleanAttr: function booleanAttr() {
        if (arguments.length === 0) return util.__booleanAttr;
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (util.__booleanAttr.indexOf(arguments[i]) === -1) {
                util.__booleanAttr.push(arguments[i]);
            }
        }
    },
    isBooleanAttr: function isBooleanAttr(name) {
        var __booleanAttr = util.booleanAttr();
        return __booleanAttr.indexOf(name) > -1;
    },
    cleanJSON: function cleanJSON(obj) {
        try {
            obj = JSON.parse(JSON.stringify(obj));
        } catch (e) {}
        return obj;
    },
    stringify: function stringify(json) {
        try {
            return (typeof json === 'undefined' ? 'undefined' : _typeof(json)) === 'object' ? JSON.stringify(json) : json;
        } catch (e) {
            console.error('json数据转换字符串失败：' + String(json));
        }
        return json;
    },
    parse: function parse(val) {
        try {
            return JSON.parse(val);
        } catch (e) {
            console.error('json字符串转换对象失败：' + String(val));
        }
        return val;
    },
    booleanAttrForJquery: function booleanAttrForJquery(name, val) {
        if (arguments.length === 1) {
            var el = this.length > 0 && this[0];
            if (!el) return '';
            var rs = this.prop(name);
            if (typeof rs === 'undefined') {
                rs = el.getAttribute(name);
            }
            if (rs === '' || rs === undefined || rs === null || rs === 'false') {
                rs = false;
            }
            return !!rs;
        } else if (arguments.length === 2) {
            this.each(function () {
                this.setAttribute(name, val);
            });
            return this.prop(name, val);
        }
        return this;
    }
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var env = __webpack_require__(0);
env.JQLite = __webpack_require__(5);
if (!env.$) env.$ = env.JQLite;

module.exports = env.JQLite;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
	var _$ = window.jQuery || window.$ || __webpack_require__(6),
	    JQLite = _$,
	    jqlite = JQLite;

	var jqliteUtil = __webpack_require__(2);

	// 重写attr方法，当属性属性改变触发事件
	var origin_attr = jqlite.prototype.attr;
	jqlite.prototype.attr = function () {
		var args = jqlite.util.copyArray(arguments);
		var rs;
		if (jqliteUtil.isBooleanAttr(args[0])) {
			rs = jqliteUtil.booleanAttrForJquery.apply(this, args);
		} else {
			if (typeof args[1] !== 'undefined') {
				args[1] = jqliteUtil.stringify(args[1]);
				if (this.attr(args[0]) === args[1]) return this;
			}
			rs = origin_attr.apply(this, args);
		}

		if (args.length === 2) {
			this.triggerHandler('attrChanged', args[0], this.attr(args[0]));
		}
		return rs;
	};

	// 重写val方法
	var origin_val = jqlite.prototype.val;
	jqlite.prototype.val = function () {
		var args = jqlite.util.copyArray(arguments);
		var el = this[0];
		if (!el) return args.length === 0 ? '' : this;
		var funcName = origin_val;
		if (typeof el.value === 'undefined') {
			funcName = this.attr;
			args.unshift('value');
		}
		return funcName.apply(this, args);
	};

	// 扩展xprop方法
	var origin_prop = jqlite.prototype.prop;
	jqlite.prototype.xprop = function (name, val) {
		var args = jqlite.util.copyArray(arguments);
		var el = this[0];
		if (!el) return args.length === 0 ? '' : this;
		if (arguments.length === 1) {
			var el = this.length > 0 && this[0];
			if (!el) return '';
			var rs = origin_prop.call(this, name);
			if (typeof rs === 'undefined') {
				rs = el.getAttribute(name);
			}
			if (rs === '' || rs === undefined || rs === null || rs === 'false') {
				rs = false;
			}
			return !!rs;
		} else if (arguments.length === 2) {
			var rs = origin_prop.call(this, name);
			if (typeof rs === 'undefined') {
				this.each(function () {
					this.setAttribute(name, val);
				});
			} else {
				origin_prop.call(this, name, val);
			}
			this.triggerHandler('attrChanged', name, val);
		}
		return this;
	};

	jqlite.fn.extend({
		isChecked: function isChecked() {
			return this.is(':checked') || this.attr('checked');
		},
		getPage: function getPage() {
			var dom = document.querySelector('aui-page > .active') || document;
			return jqlite(dom);
		},
		outerHTML: function outerHTML() {
			return this.prop('outerHTML');
		},
		childs: function childs(index) {
			if (jqlite.util.isNumber(index)) {
				return this.contents().eq(index);
			} else {
				return this.contents.apply(this, arguments);
			}
		},
		textContent: function textContent() {
			var content = arguments[0],
			    el = this[0] || {};
			if (arguments.length === 0) {
				return el.textContent;
			} else {
				this.each(function () {
					this.textContent = content;
				});
				return this;
			}
		},
		attrs: function attrs() {
			var el = this[0] || {};
			var arr = [];
			jqlite.util.each(el.attributes, function (i, attr) {
				arr.push(attr);
			});
			return arr;
		},
		hasAttr: function hasAttr(name) {
			var el = this.length > 0 && this[0];
			return el && el.hasAttribute && el.hasAttribute(name);
		},
		isElement: function isElement() {
			return this.length > 0 && this[0].nodeType === 1;
		},
		elementType: function elementType() {
			var type,
			    el = this[0] || {},
			    nodeType = el.nodeType;
			if (nodeType === 1) {
				var tagName = el.tagName.toLowerCase();
				if (tagName === 'input') {
					type = el.type;
				} else {
					type = tagName;
				}
			} else if (nodeType === 3) {
				type = '#text';
			} else {
				type = nodeType;
			}
			return type;
		},
		replaceTo: function replaceTo(el) {
			var $el = jqlite(el);
			var $this = this;
			if ($this.childs().length === 0) {
				$el.remove();
			} else {
				$el.replaceWith(this);
			}

			return this;
		},
		render: function render(data) {
			if (this.length !== 1) return null;
			var el = this[0],
			    vm = el.vm;
			if (!data) return vm;
			return el.vm = jqlite.vm(this, data);
		},
		def: function def(name, val) {
			if (arguments.length === 1) {
				return this.length > 0 && this[0][name];
			} else if (arguments.length === 2) {
				this.each(function () {
					jqlite.util.defRec(this, name, val);
				});
			}
			return this;
		},
		__on__: function __on__(evt, selector, callback) {
			this.each(function () {
				var $node = jqlite(this),
				    aceEvents = this['__ace-events__'] || [];
				if (aceEvents.indexOf(evt) > -1) return;
				aceEvents.push(evt);
				jqlite.util.defRec(this, '__ace-events__', aceEvents);
			});
			this.on.apply(this, arguments);
		},
		__remove_on__: function __remove_on__(parserIndex) {
			jqlite(this).find('[acee="' + parserIndex + '"]').each(function () {
				var $node = jqlite(this),
				    aceEvents = this['__ace-events__'] || [];
				jqlite.util.defRec(this, '__ace-events__', null);
				jqlite.util.each(aceEvents, function (i, evt) {
					$node.off(evt);
				});
			});
		},
		tag: function tag() {
			var el = this.length > 0 && this[0];
			return el && el.tagName.toLowerCase();
		},
		getComponent: function getComponent() {
			var el = this.length > 0 && this[0];
			return el && (el.trueDom ? el.trueDom.component : el.component);
		}
	});

	var toString = Object.prototype.toString,
	    _hasOwn = Object.prototype.hasOwnProperty,
	    cons = window.console,
	    consoleLevel = ['error', 'warn', 'log'],
	    _cons = function _cons(type, args) {
		if (consoleLevel.indexOf(jqlite.util.consoleLevel) < consoleLevel.indexOf(type)) return;
		if (cons) cons[type].apply(cons, args);
	};

	jqlite.util = {
		consoleLevel: 'error',
		each: function each(obj, callback, context) {
			if (!obj) return;
			var ret;
			if (jqlite.isArray(obj) || !jqlite.util.isString(obj) && jqlite.util.isNotNaNNumber(obj.length)) {
				for (var i = 0; i < obj.length; i++) {
					ret = callback.call(context, i, obj[i]);
					if (ret === false) {
						break;
					} else if (ret === null) {
						obj.splice(i, 1);
						i--;
					}
				}
			} else if (jqlite.util.isObject(obj)) {
				for (var k in obj) {
					ret = callback.call(context, k, obj[k]);
					if (ret === false) {
						break;
					} else if (ret === null) {
						delete obj[k];
					}
				}
			} /*else{
     callback.call(context, 0, obj);
     }*/
		},
		isString: function isString(str) {
			return jqlite.type(str) === 'string';
		},
		isBoolean: function isBoolean(bool) {
			return jqlite.type(bool) === 'boolean';
		},
		isNumber: function isNumber(num) {
			return jqlite.type(num) === 'number';
		},
		isNotNaNNumber: function isNotNaNNumber(num) {
			return !isNaN(num) && this.isNumber(num);
		},
		isObject: function isObject(obj) {
			return jqlite.type(obj) === 'object';
		},
		isEvent: function isEvent(e) {
			return e instanceof Event;
		},
		clearObject: function clearObject(object) {
			jqlite.util.each(object, function () {
				return null;
			});
		},
		trim: function trim(str) {
			//删除左右两端的空格
			return str.replace(/(^\s*)|(\s*$)/g, "");
		},
		removeSpace: function removeSpace(string) {
			return (string || '').replace(/\s/g, '');
		},
		hasOwn: function hasOwn(obj, key) {
			return obj && _hasOwn.call(obj, key);
		},
		copy: function copy(target) {
			var ret;

			if (jqlite.isArray(target)) {
				ret = target.slice(0);
			} else if (this.isObject(target)) {
				ret = jqlite.extend(true, {}, target);
			}

			return ret || target;
		},
		defObj: function defObj(o, a, getter, setter) {
			var options = {};
			if (getter) {
				options.get = function () {
					return getter.apply(this);
				};
			}
			if (setter) {
				options.set = function () {
					setter.apply(this, arguments);
				};
			}

			Object.defineProperty(o, String(a), options);
		},
		defRec: function defRec(object, property, value) {
			try {
				return Object.defineProperty(object, property, {
					'value': value,
					'writable': true,
					'enumerable': false,
					'configurable': true
				});
			} catch (e) {
				// console.warn((typeof object)+'类型不能被设置属性');
			}
		},
		copyArray: function copyArray(arr) {
			return Array.prototype.slice.call(arr || [], 0);
		},
		log: function log() {
			_cons('log', arguments);
		},
		warn: function warn() {
			_cons('warn', arguments);
		},
		error: function error() {
			_cons('error', arguments);
		},
		paramTransForm: function paramTransForm(param) {
			if (this.isObject(param)) {
				//如果param是Object则转为键值对参数
				var rs = [];
				this.each(param, function (k, v) {
					rs.push(k + '=' + v);
				});
				return rs.join('&');
			} else {
				//如果参数是键值对则转为Object
				var reg = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
				    rs = {},
				    result;
				while ((result = reg.exec(param)) != null) {
					rs[result[1]] = result[2];
				}
				return rs;
			}
		},
		sync: function sync() {
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
		sequence: function sequence() {
			var args = jqlite.util.copyArray(arguments),
			    _this = [];
			var func = args.shift();
			if (!func) return;
			if (this instanceof Array) {
				_this = this;
			}
			_this.unshift(function () {
				jqlite.util.sequence.apply(jqlite.util.copyArray(arguments), args);
			});
			func.apply(null, _this);
		}
	};

	//继承JQLite的特殊类，用于文档碎片的存储
	var JQFragment = function JQFragment() {
		return jqlite(arguments.length == 0 ? document.createDocumentFragment() : arguments[0]);
	};

	jqlite.ui = {
		isJQLite: function isJQLite(o) {
			return o instanceof JQLite;
		},
		useAdapter: function useAdapter() {
			return false;
		},
		isJQAdapter: function isJQAdapter() {
			return false;
		},
		createJQPlaceholder: function createJQPlaceholder() {
			var dom = document.createComment(' ');
			dom.isPlaceholder = true;
			return jqlite(dom);
		},
		createJQFragment: function createJQFragment() {
			return new JQFragment();
		},
		toJQFragment: function toJQFragment($el) {
			var $fragment = this.createJQFragment();

			if ($el instanceof JQLite) {
				$el.childs().each(function () {
					$fragment.append(this);
					return null;
				});
			} else if ((typeof $el === 'undefined' ? 'undefined' : _typeof($el)) === 'object') {
				jqlite.util.each(jqlite.util.copyArray($el.childNodes), function (i, child) {
					$fragment.append(child);
					return null;
				});
			} else if (/<[^>]+>/g.test($el)) {
				var div = document.createElement('div');
				div.innerHTML = $el;
				jqlite.util.each(jqlite.util.copyArray(div.childNodes), function (i, child) {
					$fragment.append(child);
					return null;
				});
			} else {
				$fragment.append(document.createTextNode($el));
			}

			return $fragment;
		}
	};

	jqlite.document = document;

	__webpack_require__(8)(jqlite);

	module.exports = jqlite;

	window.JQLite = jqlite;

	if (!window.$) {
		window.$ = jqlite;
	}
	if (!window.jQuery) {
		window.jQuery = jqlite;
	}

	if (typeof __EXPORTS_DEFINED__ === 'function') __EXPORTS_DEFINED__(jqlite, 'JQLite');

	var _template = __webpack_require__(15);
	jqlite.template = _template;
})();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * jQuery JavaScript Library v2.1.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-18T15:11Z
 */

(function (global, factory) {

	if (( false ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ? factory(global, true) : function (w) {
			if (!w.document) {
				throw new Error("jQuery requires a window with a document");
			}
			return factory(w);
		};
	} else {
		factory(global);
	}

	// Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : undefined, function (window, noGlobal) {

	// Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//

	var arr = [];

	var _slice = arr.slice;

	var concat = arr.concat;

	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var support = {};

	var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	    version = "2.1.3",


	// Define a local copy of jQuery
	jQuery = function jQuery(selector, context) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init(selector, context);
	},


	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,


	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	    rdashAlpha = /-([\da-z])/gi,


	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function fcamelCase(all, letter) {
		return letter.toUpperCase();
	};

	jQuery.fn = jQuery.prototype = {
		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// Start with an empty selector
		selector: "",

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function toArray() {
			return _slice.call(this);
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function get(num) {
			return num != null ?

			// Return just the one element from the set
			num < 0 ? this[num + this.length] : this[num] :

			// Return all the elements in a clean array
			_slice.call(this);
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function pushStack(elems) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge(this.constructor(), elems);

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		// (You can seed the arguments with an array of args, but this is
		// only used internally.)
		each: function each(callback, args) {
			return jQuery.each(this, callback, args);
		},

		map: function map(callback) {
			return this.pushStack(jQuery.map(this, function (elem, i) {
				return callback.call(elem, i, elem);
			}));
		},

		slice: function slice() {
			return this.pushStack(_slice.apply(this, arguments));
		},

		first: function first() {
			return this.eq(0);
		},

		last: function last() {
			return this.eq(-1);
		},

		eq: function eq(i) {
			var len = this.length,
			    j = +i + (i < 0 ? len : 0);
			return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
		},

		end: function end() {
			return this.prevObject || this.constructor(null);
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function () {
		var options,
		    name,
		    src,
		    copy,
		    copyIsArray,
		    clone,
		    target = arguments[0] || {},
		    i = 1,
		    length = arguments.length,
		    deep = false;

		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;

			// Skip the boolean and the target
			target = arguments[i] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ((typeof target === "undefined" ? "undefined" : _typeof(target)) !== "object" && !jQuery.isFunction(target)) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if (i === length) {
			target = this;
			i--;
		}

		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && jQuery.isArray(src) ? src : [];
						} else {
							clone = src && jQuery.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = jQuery.extend(deep, clone, copy);

						// Don't bring in undefined values
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend({
		// Unique for each copy of jQuery on the page
		expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function error(msg) {
			throw new Error(msg);
		},

		noop: function noop() {},

		isFunction: function isFunction(obj) {
			return jQuery.type(obj) === "function";
		},

		isArray: Array.isArray,

		isWindow: function isWindow(obj) {
			return obj != null && obj === obj.window;
		},

		isNumeric: function isNumeric(obj) {
			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			// adding 1 corrects loss of precision from parseFloat (#15100)
			return !jQuery.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
		},

		isPlainObject: function isPlainObject(obj) {
			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if (jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
				return false;
			}

			if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
				return false;
			}

			// If the function hasn't returned already, we're confident that
			// |obj| is a plain object, created by {} or constructed with new Object
			return true;
		},

		isEmptyObject: function isEmptyObject(obj) {
			var name;
			for (name in obj) {
				return false;
			}
			return true;
		},

		type: function type(obj) {
			if (obj == null) {
				return obj + "";
			}
			// Support: Android<4.0, iOS<6 (functionish RegExp)
			return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
		},

		// Evaluates a script in a global context
		globalEval: function globalEval(code) {
			var script,
			    indirect = eval;

			code = jQuery.trim(code);

			if (code) {
				// If the code includes a valid, prologue position
				// strict mode pragma, execute code by injecting a
				// script tag into the document.
				if (code.indexOf("use strict") === 1) {
					script = document.createElement("script");
					script.text = code;
					document.head.appendChild(script).parentNode.removeChild(script);
				} else {
					// Otherwise, avoid the DOM node creation, insertion
					// and removal by using an indirect global eval
					indirect(code);
				}
			}
		},

		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE9-11+
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function camelCase(string) {
			return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
		},

		nodeName: function nodeName(elem, name) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},

		// args is for internal usage only
		each: function each(obj, callback, args) {
			var value,
			    i = 0,
			    length = obj.length,
			    isArray = isArraylike(obj);

			if (args) {
				if (isArray) {
					for (; i < length; i++) {
						value = callback.apply(obj[i], args);

						if (value === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						value = callback.apply(obj[i], args);

						if (value === false) {
							break;
						}
					}
				}

				// A special, fast, case for the most common use of each
			} else {
				if (isArray) {
					for (; i < length; i++) {
						value = callback.call(obj[i], i, obj[i]);

						if (value === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						value = callback.call(obj[i], i, obj[i]);

						if (value === false) {
							break;
						}
					}
				}
			}

			return obj;
		},

		// Support: Android<4.1
		trim: function trim(text) {
			return text == null ? "" : (text + "").replace(rtrim, "");
		},

		// results is for internal usage only
		makeArray: function makeArray(arr, results) {
			var ret = results || [];

			if (arr != null) {
				if (isArraylike(Object(arr))) {
					jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
				} else {
					push.call(ret, arr);
				}
			}

			return ret;
		},

		inArray: function inArray(elem, arr, i) {
			return arr == null ? -1 : indexOf.call(arr, elem, i);
		},

		merge: function merge(first, second) {
			var len = +second.length,
			    j = 0,
			    i = first.length;

			for (; j < len; j++) {
				first[i++] = second[j];
			}

			first.length = i;

			return first;
		},

		grep: function grep(elems, callback, invert) {
			var callbackInverse,
			    matches = [],
			    i = 0,
			    length = elems.length,
			    callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for (; i < length; i++) {
				callbackInverse = !callback(elems[i], i);
				if (callbackInverse !== callbackExpect) {
					matches.push(elems[i]);
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function map(elems, callback, arg) {
			var value,
			    i = 0,
			    length = elems.length,
			    isArray = isArraylike(elems),
			    ret = [];

			// Go through the array, translating each of the items to their new values
			if (isArray) {
				for (; i < length; i++) {
					value = callback(elems[i], i, arg);

					if (value != null) {
						ret.push(value);
					}
				}

				// Go through every key on the object,
			} else {
				for (i in elems) {
					value = callback(elems[i], i, arg);

					if (value != null) {
						ret.push(value);
					}
				}
			}

			// Flatten any nested arrays
			return concat.apply([], ret);
		},

		// A global GUID counter for objects
		guid: 1,

		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function proxy(fn, context) {
			var tmp, args, proxy;

			if (typeof context === "string") {
				tmp = fn[context];
				context = fn;
				fn = tmp;
			}

			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if (!jQuery.isFunction(fn)) {
				return undefined;
			}

			// Simulated bind
			args = _slice.call(arguments, 2);
			proxy = function proxy() {
				return fn.apply(context || this, args.concat(_slice.call(arguments)));
			};

			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;

			return proxy;
		},

		now: Date.now,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	});

	// Populate the class2type map
	jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
		class2type["[object " + name + "]"] = name.toLowerCase();
	});

	function isArraylike(obj) {
		var length = obj.length,
		    type = jQuery.type(obj);

		if (type === "function" || jQuery.isWindow(obj)) {
			return false;
		}

		if (obj.nodeType === 1 && length) {
			return true;
		}

		return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
	}
	var Sizzle =
	/*!
  * Sizzle CSS Selector Engine v2.2.0-pre
  * http://sizzlejs.com/
  *
  * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
  * Released under the MIT license
  * http://jquery.org/license
  *
  * Date: 2014-12-16
  */
	function (window) {

		var i,
		    support,
		    Expr,
		    getText,
		    isXML,
		    tokenize,
		    compile,
		    select,
		    outermostContext,
		    sortInput,
		    hasDuplicate,


		// Local document vars
		setDocument,
		    document,
		    docElem,
		    documentIsHTML,
		    rbuggyQSA,
		    rbuggyMatches,
		    matches,
		    contains,


		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		    preferredDoc = window.document,
		    dirruns = 0,
		    done = 0,
		    classCache = createCache(),
		    tokenCache = createCache(),
		    compilerCache = createCache(),
		    sortOrder = function sortOrder(a, b) {
			if (a === b) {
				hasDuplicate = true;
			}
			return 0;
		},


		// General-purpose constants
		MAX_NEGATIVE = 1 << 31,


		// Instance methods
		hasOwn = {}.hasOwnProperty,
		    arr = [],
		    pop = arr.pop,
		    push_native = arr.push,
		    push = arr.push,
		    slice = arr.slice,

		// Use a stripped-down indexOf as it's faster than native
		// http://jsperf.com/thor-indexof-vs-for/5
		indexOf = function indexOf(list, elem) {
			var i = 0,
			    len = list.length;
			for (; i < len; i++) {
				if (list[i] === elem) {
					return i;
				}
			}
			return -1;
		},
		    booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",


		// Regular expressions

		// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// http://www.w3.org/TR/css3-syntax/#characters
		characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",


		// Loosely modeled on CSS identifier characters
		// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
		// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = characterEncoding.replace("w", "w#"),


		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
		    pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" + ")\\)|)",


		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp(whitespace + "+", "g"),
		    rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
		    rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
		    rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
		    rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
		    rpseudo = new RegExp(pseudos),
		    ridentifier = new RegExp("^" + identifier + "$"),
		    matchExpr = {
			"ID": new RegExp("^#(" + characterEncoding + ")"),
			"CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
			"TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
			"ATTR": new RegExp("^" + attributes),
			"PSEUDO": new RegExp("^" + pseudos),
			"CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
			"bool": new RegExp("^(?:" + booleans + ")$", "i"),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
		},
		    rinputs = /^(?:input|select|textarea|button)$/i,
		    rheader = /^h\d$/i,
		    rnative = /^[^{]+\{\s*\[native \w/,


		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
		    rsibling = /[+~]/,
		    rescape = /'|\\/g,


		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
		    funescape = function funescape(_, escaped, escapedWhitespace) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ? escaped : high < 0 ?
			// BMP codepoint
			String.fromCharCode(high + 0x10000) :
			// Supplemental Plane codepoint (surrogate pair)
			String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
		},


		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function unloadHandler() {
			setDocument();
		};

		// Optimize for push.apply( _, NodeList )
		try {
			push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes);
			// Support: Android<4.0
			// Detect silently failing push.apply
			arr[preferredDoc.childNodes.length].nodeType;
		} catch (e) {
			push = { apply: arr.length ?

				// Leverage slice if possible
				function (target, els) {
					push_native.apply(target, slice.call(els));
				} :

				// Support: IE<9
				// Otherwise append directly
				function (target, els) {
					var j = target.length,
					    i = 0;
					// Can't trust NodeList.length
					while (target[j++] = els[i++]) {}
					target.length = j - 1;
				}
			};
		}

		function Sizzle(selector, context, results, seed) {
			var match, elem, m, nodeType,
			// QSA vars
			i, groups, old, nid, newContext, newSelector;

			if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
				setDocument(context);
			}

			context = context || document;
			results = results || [];
			nodeType = context.nodeType;

			if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {

				return results;
			}

			if (!seed && documentIsHTML) {

				// Try to shortcut find operations when possible (e.g., not under DocumentFragment)
				if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
					// Speed-up: Sizzle("#ID")
					if (m = match[1]) {
						if (nodeType === 9) {
							elem = context.getElementById(m);
							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document (jQuery #6963)
							if (elem && elem.parentNode) {
								// Handle the case where IE, Opera, and Webkit return items
								// by name instead of ID
								if (elem.id === m) {
									results.push(elem);
									return results;
								}
							} else {
								return results;
							}
						} else {
							// Context is not a document
							if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
								results.push(elem);
								return results;
							}
						}

						// Speed-up: Sizzle("TAG")
					} else if (match[2]) {
						push.apply(results, context.getElementsByTagName(selector));
						return results;

						// Speed-up: Sizzle(".CLASS")
					} else if ((m = match[3]) && support.getElementsByClassName) {
						push.apply(results, context.getElementsByClassName(m));
						return results;
					}
				}

				// QSA path
				if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
					nid = old = expando;
					newContext = context;
					newSelector = nodeType !== 1 && selector;

					// qSA works strangely on Element-rooted queries
					// We can work around this by specifying an extra ID on the root
					// and working up from there (Thanks to Andrew Dupont for the technique)
					// IE 8 doesn't work on object elements
					if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
						groups = tokenize(selector);

						if (old = context.getAttribute("id")) {
							nid = old.replace(rescape, "\\$&");
						} else {
							context.setAttribute("id", nid);
						}
						nid = "[id='" + nid + "'] ";

						i = groups.length;
						while (i--) {
							groups[i] = nid + toSelector(groups[i]);
						}
						newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
						newSelector = groups.join(",");
					}

					if (newSelector) {
						try {
							push.apply(results, newContext.querySelectorAll(newSelector));
							return results;
						} catch (qsaError) {} finally {
							if (!old) {
								context.removeAttribute("id");
							}
						}
					}
				}
			}

			// All others
			return select(selector.replace(rtrim, "$1"), context, results, seed);
		}

		/**
   * Create key-value caches of limited size
   * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
   *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
   *	deleting the oldest entry
   */
		function createCache() {
			var keys = [];

			function cache(key, value) {
				// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
				if (keys.push(key + " ") > Expr.cacheLength) {
					// Only keep the most recent entries
					delete cache[keys.shift()];
				}
				return cache[key + " "] = value;
			}
			return cache;
		}

		/**
   * Mark a function for special use by Sizzle
   * @param {Function} fn The function to mark
   */
		function markFunction(fn) {
			fn[expando] = true;
			return fn;
		}

		/**
   * Support testing using an element
   * @param {Function} fn Passed the created div and expects a boolean result
   */
		function assert(fn) {
			var div = document.createElement("div");

			try {
				return !!fn(div);
			} catch (e) {
				return false;
			} finally {
				// Remove from its parent by default
				if (div.parentNode) {
					div.parentNode.removeChild(div);
				}
				// release memory in IE
				div = null;
			}
		}

		/**
   * Adds the same handler for all of the specified attrs
   * @param {String} attrs Pipe-separated list of attributes
   * @param {Function} handler The method that will be applied
   */
		function addHandle(attrs, handler) {
			var arr = attrs.split("|"),
			    i = attrs.length;

			while (i--) {
				Expr.attrHandle[arr[i]] = handler;
			}
		}

		/**
   * Checks document order of two siblings
   * @param {Element} a
   * @param {Element} b
   * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
   */
		function siblingCheck(a, b) {
			var cur = b && a,
			    diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);

			// Use IE sourceIndex if available on both nodes
			if (diff) {
				return diff;
			}

			// Check if b follows a
			if (cur) {
				while (cur = cur.nextSibling) {
					if (cur === b) {
						return -1;
					}
				}
			}

			return a ? 1 : -1;
		}

		/**
   * Returns a function to use in pseudos for input types
   * @param {String} type
   */
		function createInputPseudo(type) {
			return function (elem) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === type;
			};
		}

		/**
   * Returns a function to use in pseudos for buttons
   * @param {String} type
   */
		function createButtonPseudo(type) {
			return function (elem) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && elem.type === type;
			};
		}

		/**
   * Returns a function to use in pseudos for positionals
   * @param {Function} fn
   */
		function createPositionalPseudo(fn) {
			return markFunction(function (argument) {
				argument = +argument;
				return markFunction(function (seed, matches) {
					var j,
					    matchIndexes = fn([], seed.length, argument),
					    i = matchIndexes.length;

					// Match elements found at the specified indexes
					while (i--) {
						if (seed[j = matchIndexes[i]]) {
							seed[j] = !(matches[j] = seed[j]);
						}
					}
				});
			});
		}

		/**
   * Checks a node for validity as a Sizzle context
   * @param {Element|Object=} context
   * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
   */
		function testContext(context) {
			return context && typeof context.getElementsByTagName !== "undefined" && context;
		}

		// Expose support vars for convenience
		support = Sizzle.support = {};

		/**
   * Detects XML nodes
   * @param {Element|Object} elem An element or a document
   * @returns {Boolean} True iff elem is a non-HTML XML node
   */
		isXML = Sizzle.isXML = function (elem) {
			// documentElement is verified for cases where it doesn't yet exist
			// (such as loading iframes in IE - #4833)
			var documentElement = elem && (elem.ownerDocument || elem).documentElement;
			return documentElement ? documentElement.nodeName !== "HTML" : false;
		};

		/**
   * Sets document-related variables once based on the current document
   * @param {Element|Object} [doc] An element or document object to use to set the document
   * @returns {Object} Returns the current document
   */
		setDocument = Sizzle.setDocument = function (node) {
			var hasCompare,
			    parent,
			    doc = node ? node.ownerDocument || node : preferredDoc;

			// If no document and documentElement is available, return
			if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
				return document;
			}

			// Set our document
			document = doc;
			docElem = doc.documentElement;
			parent = doc.defaultView;

			// Support: IE>8
			// If iframe document is assigned to "document" variable and if iframe has been reloaded,
			// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
			// IE6-8 do not support the defaultView property so parent will be undefined
			if (parent && parent !== parent.top) {
				// IE11 does not have attachEvent, so all must suffer
				if (parent.addEventListener) {
					parent.addEventListener("unload", unloadHandler, false);
				} else if (parent.attachEvent) {
					parent.attachEvent("onunload", unloadHandler);
				}
			}

			/* Support tests
   ---------------------------------------------------------------------- */
			documentIsHTML = !isXML(doc);

			/* Attributes
   ---------------------------------------------------------------------- */

			// Support: IE<8
			// Verify that getAttribute really returns attributes and not properties
			// (excepting IE8 booleans)
			support.attributes = assert(function (div) {
				div.className = "i";
				return !div.getAttribute("className");
			});

			/* getElement(s)By*
   ---------------------------------------------------------------------- */

			// Check if getElementsByTagName("*") returns only elements
			support.getElementsByTagName = assert(function (div) {
				div.appendChild(doc.createComment(""));
				return !div.getElementsByTagName("*").length;
			});

			// Support: IE<9
			support.getElementsByClassName = rnative.test(doc.getElementsByClassName);

			// Support: IE<10
			// Check if getElementById returns elements by name
			// The broken getElementById methods don't pick up programatically-set names,
			// so use a roundabout getElementsByName test
			support.getById = assert(function (div) {
				docElem.appendChild(div).id = expando;
				return !doc.getElementsByName || !doc.getElementsByName(expando).length;
			});

			// ID find and filter
			if (support.getById) {
				Expr.find["ID"] = function (id, context) {
					if (typeof context.getElementById !== "undefined" && documentIsHTML) {
						var m = context.getElementById(id);
						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						return m && m.parentNode ? [m] : [];
					}
				};
				Expr.filter["ID"] = function (id) {
					var attrId = id.replace(runescape, funescape);
					return function (elem) {
						return elem.getAttribute("id") === attrId;
					};
				};
			} else {
				// Support: IE6/7
				// getElementById is not reliable as a find shortcut
				delete Expr.find["ID"];

				Expr.filter["ID"] = function (id) {
					var attrId = id.replace(runescape, funescape);
					return function (elem) {
						var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
						return node && node.value === attrId;
					};
				};
			}

			// Tag
			Expr.find["TAG"] = support.getElementsByTagName ? function (tag, context) {
				if (typeof context.getElementsByTagName !== "undefined") {
					return context.getElementsByTagName(tag);

					// DocumentFragment nodes don't have gEBTN
				} else if (support.qsa) {
					return context.querySelectorAll(tag);
				}
			} : function (tag, context) {
				var elem,
				    tmp = [],
				    i = 0,

				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName(tag);

				// Filter out possible comments
				if (tag === "*") {
					while (elem = results[i++]) {
						if (elem.nodeType === 1) {
							tmp.push(elem);
						}
					}

					return tmp;
				}
				return results;
			};

			// Class
			Expr.find["CLASS"] = support.getElementsByClassName && function (className, context) {
				if (documentIsHTML) {
					return context.getElementsByClassName(className);
				}
			};

			/* QSA/matchesSelector
   ---------------------------------------------------------------------- */

			// QSA and matchesSelector support

			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			rbuggyMatches = [];

			// qSa(:focus) reports false when true (Chrome 21)
			// We allow this because of a bug in IE8/9 that throws an error
			// whenever `document.activeElement` is accessed on an iframe
			// So, we allow :focus to pass through QSA all the time to avoid the IE error
			// See http://bugs.jquery.com/ticket/13378
			rbuggyQSA = [];

			if (support.qsa = rnative.test(doc.querySelectorAll)) {
				// Build QSA regex
				// Regex strategy adopted from Diego Perini
				assert(function (div) {
					// Select is set to empty string on purpose
					// This is to test IE's treatment of not explicitly
					// setting a boolean content attribute,
					// since its presence should be enough
					// http://bugs.jquery.com/ticket/12359
					docElem.appendChild(div).innerHTML = "<a id='" + expando + "'></a>" + "<select id='" + expando + "-\f]' msallowcapture=''>" + "<option selected=''></option></select>";

					// Support: IE8, Opera 11-12.16
					// Nothing should be selected when empty strings follow ^= or $= or *=
					// The test attribute must be unknown in Opera but "safe" for WinRT
					// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
					if (div.querySelectorAll("[msallowcapture^='']").length) {
						rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
					}

					// Support: IE8
					// Boolean attributes and "value" are not treated correctly
					if (!div.querySelectorAll("[selected]").length) {
						rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
					}

					// Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
					if (!div.querySelectorAll("[id~=" + expando + "-]").length) {
						rbuggyQSA.push("~=");
					}

					// Webkit/Opera - :checked should return selected option elements
					// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
					// IE8 throws error here and will not see later tests
					if (!div.querySelectorAll(":checked").length) {
						rbuggyQSA.push(":checked");
					}

					// Support: Safari 8+, iOS 8+
					// https://bugs.webkit.org/show_bug.cgi?id=136851
					// In-page `selector#id sibing-combinator selector` fails
					if (!div.querySelectorAll("a#" + expando + "+*").length) {
						rbuggyQSA.push(".#.+[+~]");
					}
				});

				assert(function (div) {
					// Support: Windows 8 Native Apps
					// The type and name attributes are restricted during .innerHTML assignment
					var input = doc.createElement("input");
					input.setAttribute("type", "hidden");
					div.appendChild(input).setAttribute("name", "D");

					// Support: IE8
					// Enforce case-sensitivity of name attribute
					if (div.querySelectorAll("[name=d]").length) {
						rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
					}

					// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
					// IE8 throws error here and will not see later tests
					if (!div.querySelectorAll(":enabled").length) {
						rbuggyQSA.push(":enabled", ":disabled");
					}

					// Opera 10-11 does not throw on post-comma invalid pseudos
					div.querySelectorAll("*,:x");
					rbuggyQSA.push(",.*:");
				});
			}

			if (support.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {

				assert(function (div) {
					// Check to see if it's possible to do matchesSelector
					// on a disconnected node (IE 9)
					support.disconnectedMatch = matches.call(div, "div");

					// This should fail with an exception
					// Gecko does not error, returns false instead
					matches.call(div, "[s!='']:x");
					rbuggyMatches.push("!=", pseudos);
				});
			}

			rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
			rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

			/* Contains
   ---------------------------------------------------------------------- */
			hasCompare = rnative.test(docElem.compareDocumentPosition);

			// Element contains another
			// Purposefully does not implement inclusive descendent
			// As in, an element does not contain itself
			contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
				    bup = b && b.parentNode;
				return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
			} : function (a, b) {
				if (b) {
					while (b = b.parentNode) {
						if (b === a) {
							return true;
						}
					}
				}
				return false;
			};

			/* Sorting
   ---------------------------------------------------------------------- */

			// Document order sorting
			sortOrder = hasCompare ? function (a, b) {

				// Flag for duplicate removal
				if (a === b) {
					hasDuplicate = true;
					return 0;
				}

				// Sort on method existence if only one input has compareDocumentPosition
				var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
				if (compare) {
					return compare;
				}

				// Calculate position if both inputs belong to the same document
				compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) :

				// Otherwise we know they are disconnected
				1;

				// Disconnected nodes
				if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {

					// Choose the first element that is related to our preferred document
					if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
						return -1;
					}
					if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
						return 1;
					}

					// Maintain original order
					return sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;
				}

				return compare & 4 ? -1 : 1;
			} : function (a, b) {
				// Exit early if the nodes are identical
				if (a === b) {
					hasDuplicate = true;
					return 0;
				}

				var cur,
				    i = 0,
				    aup = a.parentNode,
				    bup = b.parentNode,
				    ap = [a],
				    bp = [b];

				// Parentless nodes are either documents or disconnected
				if (!aup || !bup) {
					return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;

					// If the nodes are siblings, we can do a quick check
				} else if (aup === bup) {
					return siblingCheck(a, b);
				}

				// Otherwise we need full lists of their ancestors for comparison
				cur = a;
				while (cur = cur.parentNode) {
					ap.unshift(cur);
				}
				cur = b;
				while (cur = cur.parentNode) {
					bp.unshift(cur);
				}

				// Walk down the tree looking for a discrepancy
				while (ap[i] === bp[i]) {
					i++;
				}

				return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck(ap[i], bp[i]) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
			};

			return doc;
		};

		Sizzle.matches = function (expr, elements) {
			return Sizzle(expr, null, null, elements);
		};

		Sizzle.matchesSelector = function (elem, expr) {
			// Set document vars if needed
			if ((elem.ownerDocument || elem) !== document) {
				setDocument(elem);
			}

			// Make sure that attribute selectors are quoted
			expr = expr.replace(rattributeQuotes, "='$1']");

			if (support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {

				try {
					var ret = matches.call(elem, expr);

					// IE 9's matchesSelector returns false on disconnected nodes
					if (ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11) {
						return ret;
					}
				} catch (e) {}
			}

			return Sizzle(expr, document, null, [elem]).length > 0;
		};

		Sizzle.contains = function (context, elem) {
			// Set document vars if needed
			if ((context.ownerDocument || context) !== document) {
				setDocument(context);
			}
			return contains(context, elem);
		};

		Sizzle.attr = function (elem, name) {
			// Set document vars if needed
			if ((elem.ownerDocument || elem) !== document) {
				setDocument(elem);
			}

			var fn = Expr.attrHandle[name.toLowerCase()],

			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;

			return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
		};

		Sizzle.error = function (msg) {
			throw new Error("Syntax error, unrecognized expression: " + msg);
		};

		/**
   * Document sorting and removing duplicates
   * @param {ArrayLike} results
   */
		Sizzle.uniqueSort = function (results) {
			var elem,
			    duplicates = [],
			    j = 0,
			    i = 0;

			// Unless we *know* we can detect duplicates, assume their presence
			hasDuplicate = !support.detectDuplicates;
			sortInput = !support.sortStable && results.slice(0);
			results.sort(sortOrder);

			if (hasDuplicate) {
				while (elem = results[i++]) {
					if (elem === results[i]) {
						j = duplicates.push(i);
					}
				}
				while (j--) {
					results.splice(duplicates[j], 1);
				}
			}

			// Clear input after sorting to release objects
			// See https://github.com/jquery/sizzle/pull/225
			sortInput = null;

			return results;
		};

		/**
   * Utility function for retrieving the text value of an array of DOM nodes
   * @param {Array|Element} elem
   */
		getText = Sizzle.getText = function (elem) {
			var node,
			    ret = "",
			    i = 0,
			    nodeType = elem.nodeType;

			if (!nodeType) {
				// If no nodeType, this is expected to be an array
				while (node = elem[i++]) {
					// Do not traverse comment nodes
					ret += getText(node);
				}
			} else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
				// Use textContent for elements
				// innerText usage removed for consistency of new lines (jQuery #11153)
				if (typeof elem.textContent === "string") {
					return elem.textContent;
				} else {
					// Traverse its children
					for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
						ret += getText(elem);
					}
				}
			} else if (nodeType === 3 || nodeType === 4) {
				return elem.nodeValue;
			}
			// Do not include comment or processing instruction nodes

			return ret;
		};

		Expr = Sizzle.selectors = {

			// Can be adjusted by the user
			cacheLength: 50,

			createPseudo: markFunction,

			match: matchExpr,

			attrHandle: {},

			find: {},

			relative: {
				">": { dir: "parentNode", first: true },
				" ": { dir: "parentNode" },
				"+": { dir: "previousSibling", first: true },
				"~": { dir: "previousSibling" }
			},

			preFilter: {
				"ATTR": function ATTR(match) {
					match[1] = match[1].replace(runescape, funescape);

					// Move the given value to match[3] whether quoted or unquoted
					match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);

					if (match[2] === "~=") {
						match[3] = " " + match[3] + " ";
					}

					return match.slice(0, 4);
				},

				"CHILD": function CHILD(match) {
					/* matches from matchExpr["CHILD"]
     	1 type (only|nth|...)
     	2 what (child|of-type)
     	3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
     	4 xn-component of xn+y argument ([+-]?\d*n|)
     	5 sign of xn-component
     	6 x of xn-component
     	7 sign of y-component
     	8 y of y-component
     */
					match[1] = match[1].toLowerCase();

					if (match[1].slice(0, 3) === "nth") {
						// nth-* requires argument
						if (!match[3]) {
							Sizzle.error(match[0]);
						}

						// numeric x and y parameters for Expr.filter.CHILD
						// remember that false/true cast respectively to 0/1
						match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
						match[5] = +(match[7] + match[8] || match[3] === "odd");

						// other types prohibit arguments
					} else if (match[3]) {
						Sizzle.error(match[0]);
					}

					return match;
				},

				"PSEUDO": function PSEUDO(match) {
					var excess,
					    unquoted = !match[6] && match[2];

					if (matchExpr["CHILD"].test(match[0])) {
						return null;
					}

					// Accept quoted arguments as-is
					if (match[3]) {
						match[2] = match[4] || match[5] || "";

						// Strip excess characters from unquoted arguments
					} else if (unquoted && rpseudo.test(unquoted) && (
					// Get excess from tokenize (recursively)
					excess = tokenize(unquoted, true)) && (
					// advance to the next closing parenthesis
					excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

						// excess is a negative index
						match[0] = match[0].slice(0, excess);
						match[2] = unquoted.slice(0, excess);
					}

					// Return only captures needed by the pseudo filter method (type and argument)
					return match.slice(0, 3);
				}
			},

			filter: {

				"TAG": function TAG(nodeNameSelector) {
					var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
					return nodeNameSelector === "*" ? function () {
						return true;
					} : function (elem) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
				},

				"CLASS": function CLASS(className) {
					var pattern = classCache[className + " "];

					return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function (elem) {
						return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
					});
				},

				"ATTR": function ATTR(name, operator, check) {
					return function (elem) {
						var result = Sizzle.attr(elem, name);

						if (result == null) {
							return operator === "!=";
						}
						if (!operator) {
							return true;
						}

						result += "";

						return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
					};
				},

				"CHILD": function CHILD(type, what, argument, first, last) {
					var simple = type.slice(0, 3) !== "nth",
					    forward = type.slice(-4) !== "last",
					    ofType = what === "of-type";

					return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function (elem) {
						return !!elem.parentNode;
					} : function (elem, context, xml) {
						var cache,
						    outerCache,
						    node,
						    diff,
						    nodeIndex,
						    start,
						    dir = simple !== forward ? "nextSibling" : "previousSibling",
						    parent = elem.parentNode,
						    name = ofType && elem.nodeName.toLowerCase(),
						    useCache = !xml && !ofType;

						if (parent) {

							// :(first|last|only)-(child|of-type)
							if (simple) {
								while (dir) {
									node = elem;
									while (node = node[dir]) {
										if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [forward ? parent.firstChild : parent.lastChild];

							// non-xml :nth-child(...) stores cache data on `parent`
							if (forward && useCache) {
								// Seek `elem` from a previously-cached index
								outerCache = parent[expando] || (parent[expando] = {});
								cache = outerCache[type] || [];
								nodeIndex = cache[0] === dirruns && cache[1];
								diff = cache[0] === dirruns && cache[2];
								node = nodeIndex && parent.childNodes[nodeIndex];

								while (node = ++nodeIndex && node && node[dir] || (

								// Fallback to seeking `elem` from the start
								diff = nodeIndex = 0) || start.pop()) {

									// When found, cache indexes on `parent` and break
									if (node.nodeType === 1 && ++diff && node === elem) {
										outerCache[type] = [dirruns, nodeIndex, diff];
										break;
									}
								}

								// Use previously-cached element index if available
							} else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
								diff = cache[1];

								// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
							} else {
								// Use the same loop as above to seek `elem` from the start
								while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {

									if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
										// Cache the index of each encountered element
										if (useCache) {
											(node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
										}

										if (node === elem) {
											break;
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || diff % first === 0 && diff / first >= 0;
						}
					};
				},

				"PSEUDO": function PSEUDO(pseudo, argument) {
					// pseudo-class names are case-insensitive
					// http://www.w3.org/TR/selectors/#pseudo-classes
					// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
					// Remember that setFilters inherits from pseudos
					var args,
					    fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);

					// The user may use createPseudo to indicate that
					// arguments are needed to create the filter function
					// just as Sizzle does
					if (fn[expando]) {
						return fn(argument);
					}

					// But maintain support for old signatures
					if (fn.length > 1) {
						args = [pseudo, pseudo, "", argument];
						return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
							var idx,
							    matched = fn(seed, argument),
							    i = matched.length;
							while (i--) {
								idx = indexOf(seed, matched[i]);
								seed[idx] = !(matches[idx] = matched[i]);
							}
						}) : function (elem) {
							return fn(elem, 0, args);
						};
					}

					return fn;
				}
			},

			pseudos: {
				// Potentially complex pseudos
				"not": markFunction(function (selector) {
					// Trim the selector passed to compile
					// to avoid treating leading and trailing
					// spaces as combinators
					var input = [],
					    results = [],
					    matcher = compile(selector.replace(rtrim, "$1"));

					return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
						var elem,
						    unmatched = matcher(seed, null, xml, []),
						    i = seed.length;

						// Match elements unmatched by `matcher`
						while (i--) {
							if (elem = unmatched[i]) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) : function (elem, context, xml) {
						input[0] = elem;
						matcher(input, null, xml, results);
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
				}),

				"has": markFunction(function (selector) {
					return function (elem) {
						return Sizzle(selector, elem).length > 0;
					};
				}),

				"contains": markFunction(function (text) {
					text = text.replace(runescape, funescape);
					return function (elem) {
						return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
					};
				}),

				// "Whether an element is represented by a :lang() selector
				// is based solely on the element's language value
				// being equal to the identifier C,
				// or beginning with the identifier C immediately followed by "-".
				// The matching of C against the element's language value is performed case-insensitively.
				// The identifier C does not have to be a valid language name."
				// http://www.w3.org/TR/selectors/#lang-pseudo
				"lang": markFunction(function (lang) {
					// lang value must be a valid identifier
					if (!ridentifier.test(lang || "")) {
						Sizzle.error("unsupported lang: " + lang);
					}
					lang = lang.replace(runescape, funescape).toLowerCase();
					return function (elem) {
						var elemLang;
						do {
							if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {

								elemLang = elemLang.toLowerCase();
								return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
							}
						} while ((elem = elem.parentNode) && elem.nodeType === 1);
						return false;
					};
				}),

				// Miscellaneous
				"target": function target(elem) {
					var hash = window.location && window.location.hash;
					return hash && hash.slice(1) === elem.id;
				},

				"root": function root(elem) {
					return elem === docElem;
				},

				"focus": function focus(elem) {
					return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
				},

				// Boolean properties
				"enabled": function enabled(elem) {
					return elem.disabled === false;
				},

				"disabled": function disabled(elem) {
					return elem.disabled === true;
				},

				"checked": function checked(elem) {
					// In CSS3, :checked should return both checked and selected elements
					// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
					var nodeName = elem.nodeName.toLowerCase();
					return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;
				},

				"selected": function selected(elem) {
					// Accessing this property makes selected-by-default
					// options in Safari work properly
					if (elem.parentNode) {
						elem.parentNode.selectedIndex;
					}

					return elem.selected === true;
				},

				// Contents
				"empty": function empty(elem) {
					// http://www.w3.org/TR/selectors/#empty-pseudo
					// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
					//   but not by others (comment: 8; processing instruction: 7; etc.)
					// nodeType < 6 works because attributes (2) do not appear as children
					for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
						if (elem.nodeType < 6) {
							return false;
						}
					}
					return true;
				},

				"parent": function parent(elem) {
					return !Expr.pseudos["empty"](elem);
				},

				// Element/input types
				"header": function header(elem) {
					return rheader.test(elem.nodeName);
				},

				"input": function input(elem) {
					return rinputs.test(elem.nodeName);
				},

				"button": function button(elem) {
					var name = elem.nodeName.toLowerCase();
					return name === "input" && elem.type === "button" || name === "button";
				},

				"text": function text(elem) {
					var attr;
					return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && (

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					(attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
				},

				// Position-in-collection
				"first": createPositionalPseudo(function () {
					return [0];
				}),

				"last": createPositionalPseudo(function (matchIndexes, length) {
					return [length - 1];
				}),

				"eq": createPositionalPseudo(function (matchIndexes, length, argument) {
					return [argument < 0 ? argument + length : argument];
				}),

				"even": createPositionalPseudo(function (matchIndexes, length) {
					var i = 0;
					for (; i < length; i += 2) {
						matchIndexes.push(i);
					}
					return matchIndexes;
				}),

				"odd": createPositionalPseudo(function (matchIndexes, length) {
					var i = 1;
					for (; i < length; i += 2) {
						matchIndexes.push(i);
					}
					return matchIndexes;
				}),

				"lt": createPositionalPseudo(function (matchIndexes, length, argument) {
					var i = argument < 0 ? argument + length : argument;
					for (; --i >= 0;) {
						matchIndexes.push(i);
					}
					return matchIndexes;
				}),

				"gt": createPositionalPseudo(function (matchIndexes, length, argument) {
					var i = argument < 0 ? argument + length : argument;
					for (; ++i < length;) {
						matchIndexes.push(i);
					}
					return matchIndexes;
				})
			}
		};

		Expr.pseudos["nth"] = Expr.pseudos["eq"];

		// Add button/input type pseudos
		for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
			Expr.pseudos[i] = createInputPseudo(i);
		}
		for (i in { submit: true, reset: true }) {
			Expr.pseudos[i] = createButtonPseudo(i);
		}

		// Easy API for creating new setFilters
		function setFilters() {}
		setFilters.prototype = Expr.filters = Expr.pseudos;
		Expr.setFilters = new setFilters();

		tokenize = Sizzle.tokenize = function (selector, parseOnly) {
			var matched,
			    match,
			    tokens,
			    type,
			    soFar,
			    groups,
			    preFilters,
			    cached = tokenCache[selector + " "];

			if (cached) {
				return parseOnly ? 0 : cached.slice(0);
			}

			soFar = selector;
			groups = [];
			preFilters = Expr.preFilter;

			while (soFar) {

				// Comma and first run
				if (!matched || (match = rcomma.exec(soFar))) {
					if (match) {
						// Don't consume trailing commas as valid
						soFar = soFar.slice(match[0].length) || soFar;
					}
					groups.push(tokens = []);
				}

				matched = false;

				// Combinators
				if (match = rcombinators.exec(soFar)) {
					matched = match.shift();
					tokens.push({
						value: matched,
						// Cast descendant combinators to space
						type: match[0].replace(rtrim, " ")
					});
					soFar = soFar.slice(matched.length);
				}

				// Filters
				for (type in Expr.filter) {
					if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
						matched = match.shift();
						tokens.push({
							value: matched,
							type: type,
							matches: match
						});
						soFar = soFar.slice(matched.length);
					}
				}

				if (!matched) {
					break;
				}
			}

			// Return the length of the invalid excess
			// if we're just parsing
			// Otherwise, throw an error or return tokens
			return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) :
			// Cache the tokens
			tokenCache(selector, groups).slice(0);
		};

		function toSelector(tokens) {
			var i = 0,
			    len = tokens.length,
			    selector = "";
			for (; i < len; i++) {
				selector += tokens[i].value;
			}
			return selector;
		}

		function addCombinator(matcher, combinator, base) {
			var dir = combinator.dir,
			    checkNonElements = base && dir === "parentNode",
			    doneName = done++;

			return combinator.first ?
			// Check against closest ancestor/preceding element
			function (elem, context, xml) {
				while (elem = elem[dir]) {
					if (elem.nodeType === 1 || checkNonElements) {
						return matcher(elem, context, xml);
					}
				}
			} :

			// Check against all ancestor/preceding elements
			function (elem, context, xml) {
				var oldCache,
				    outerCache,
				    newCache = [dirruns, doneName];

				// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
				if (xml) {
					while (elem = elem[dir]) {
						if (elem.nodeType === 1 || checkNonElements) {
							if (matcher(elem, context, xml)) {
								return true;
							}
						}
					}
				} else {
					while (elem = elem[dir]) {
						if (elem.nodeType === 1 || checkNonElements) {
							outerCache = elem[expando] || (elem[expando] = {});
							if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {

								// Assign to newCache so results back-propagate to previous elements
								return newCache[2] = oldCache[2];
							} else {
								// Reuse newcache so results back-propagate to previous elements
								outerCache[dir] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if (newCache[2] = matcher(elem, context, xml)) {
									return true;
								}
							}
						}
					}
				}
			};
		}

		function elementMatcher(matchers) {
			return matchers.length > 1 ? function (elem, context, xml) {
				var i = matchers.length;
				while (i--) {
					if (!matchers[i](elem, context, xml)) {
						return false;
					}
				}
				return true;
			} : matchers[0];
		}

		function multipleContexts(selector, contexts, results) {
			var i = 0,
			    len = contexts.length;
			for (; i < len; i++) {
				Sizzle(selector, contexts[i], results);
			}
			return results;
		}

		function condense(unmatched, map, filter, context, xml) {
			var elem,
			    newUnmatched = [],
			    i = 0,
			    len = unmatched.length,
			    mapped = map != null;

			for (; i < len; i++) {
				if (elem = unmatched[i]) {
					if (!filter || filter(elem, context, xml)) {
						newUnmatched.push(elem);
						if (mapped) {
							map.push(i);
						}
					}
				}
			}

			return newUnmatched;
		}

		function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
			if (postFilter && !postFilter[expando]) {
				postFilter = setMatcher(postFilter);
			}
			if (postFinder && !postFinder[expando]) {
				postFinder = setMatcher(postFinder, postSelector);
			}
			return markFunction(function (seed, results, context, xml) {
				var temp,
				    i,
				    elem,
				    preMap = [],
				    postMap = [],
				    preexisting = results.length,


				// Get initial elements from seed or context
				elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),


				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems,
				    matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || (seed ? preFilter : preexisting || postFilter) ?

				// ...intermediate processing is necessary
				[] :

				// ...otherwise use results directly
				results : matcherIn;

				// Find primary matches
				if (matcher) {
					matcher(matcherIn, matcherOut, context, xml);
				}

				// Apply postFilter
				if (postFilter) {
					temp = condense(matcherOut, postMap);
					postFilter(temp, [], context, xml);

					// Un-match failing elements by moving them back to matcherIn
					i = temp.length;
					while (i--) {
						if (elem = temp[i]) {
							matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
						}
					}
				}

				if (seed) {
					if (postFinder || preFilter) {
						if (postFinder) {
							// Get the final matcherOut by condensing this intermediate into postFinder contexts
							temp = [];
							i = matcherOut.length;
							while (i--) {
								if (elem = matcherOut[i]) {
									// Restore matcherIn since elem is not yet a final match
									temp.push(matcherIn[i] = elem);
								}
							}
							postFinder(null, matcherOut = [], temp, xml);
						}

						// Move matched elements from seed to results to keep them synchronized
						i = matcherOut.length;
						while (i--) {
							if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {

								seed[temp] = !(results[temp] = elem);
							}
						}
					}

					// Add elements to results, through postFinder if defined
				} else {
					matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
					if (postFinder) {
						postFinder(null, results, matcherOut, xml);
					} else {
						push.apply(results, matcherOut);
					}
				}
			});
		}

		function matcherFromTokens(tokens) {
			var checkContext,
			    matcher,
			    j,
			    len = tokens.length,
			    leadingRelative = Expr.relative[tokens[0].type],
			    implicitRelative = leadingRelative || Expr.relative[" "],
			    i = leadingRelative ? 1 : 0,


			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator(function (elem) {
				return elem === checkContext;
			}, implicitRelative, true),
			    matchAnyContext = addCombinator(function (elem) {
				return indexOf(checkContext, elem) > -1;
			}, implicitRelative, true),
			    matchers = [function (elem, context, xml) {
				var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			}];

			for (; i < len; i++) {
				if (matcher = Expr.relative[tokens[i].type]) {
					matchers = [addCombinator(elementMatcher(matchers), matcher)];
				} else {
					matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);

					// Return special upon seeing a positional matcher
					if (matcher[expando]) {
						// Find the next relative operator (if any) for proper handling
						j = ++i;
						for (; j < len; j++) {
							if (Expr.relative[tokens[j].type]) {
								break;
							}
						}
						return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice(0, i - 1).concat({ value: tokens[i - 2].type === " " ? "*" : "" })).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
					}
					matchers.push(matcher);
				}
			}

			return elementMatcher(matchers);
		}

		function matcherFromGroupMatchers(elementMatchers, setMatchers) {
			var bySet = setMatchers.length > 0,
			    byElement = elementMatchers.length > 0,
			    superMatcher = function superMatcher(seed, context, xml, results, outermost) {
				var elem,
				    j,
				    matcher,
				    matchedCount = 0,
				    i = "0",
				    unmatched = seed && [],
				    setMatched = [],
				    contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]("*", outermost),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1,
				    len = elems.length;

				if (outermost) {
					outermostContext = context !== document && context;
				}

				// Add elements passing elementMatchers directly to results
				// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for (; i !== len && (elem = elems[i]) != null; i++) {
					if (byElement && elem) {
						j = 0;
						while (matcher = elementMatchers[j++]) {
							if (matcher(elem, context, xml)) {
								results.push(elem);
								break;
							}
						}
						if (outermost) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if (bySet) {
						// They will have gone through all possible matchers
						if (elem = !matcher && elem) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if (seed) {
							unmatched.push(elem);
						}
					}
				}

				// Apply set filters to unmatched elements
				matchedCount += i;
				if (bySet && i !== matchedCount) {
					j = 0;
					while (matcher = setMatchers[j++]) {
						matcher(unmatched, setMatched, context, xml);
					}

					if (seed) {
						// Reintegrate element matches to eliminate the need for sorting
						if (matchedCount > 0) {
							while (i--) {
								if (!(unmatched[i] || setMatched[i])) {
									setMatched[i] = pop.call(results);
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense(setMatched);
					}

					// Add matches to results
					push.apply(results, setMatched);

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {

						Sizzle.uniqueSort(results);
					}
				}

				// Override manipulation of globals by nested matchers
				if (outermost) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

			return bySet ? markFunction(superMatcher) : superMatcher;
		}

		compile = Sizzle.compile = function (selector, match /* Internal Use Only */) {
			var i,
			    setMatchers = [],
			    elementMatchers = [],
			    cached = compilerCache[selector + " "];

			if (!cached) {
				// Generate a function of recursive functions that can be used to check each element
				if (!match) {
					match = tokenize(selector);
				}
				i = match.length;
				while (i--) {
					cached = matcherFromTokens(match[i]);
					if (cached[expando]) {
						setMatchers.push(cached);
					} else {
						elementMatchers.push(cached);
					}
				}

				// Cache the compiled function
				cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));

				// Save selector and tokenization
				cached.selector = selector;
			}
			return cached;
		};

		/**
   * A low-level selection function that works with Sizzle's compiled
   *  selector functions
   * @param {String|Function} selector A selector or a pre-compiled
   *  selector function built with Sizzle.compile
   * @param {Element} context
   * @param {Array} [results]
   * @param {Array} [seed] A set of elements to match against
   */
		select = Sizzle.select = function (selector, context, results, seed) {
			var i,
			    tokens,
			    token,
			    type,
			    find,
			    compiled = typeof selector === "function" && selector,
			    match = !seed && tokenize(selector = compiled.selector || selector);

			results = results || [];

			// Try to minimize operations if there is no seed and only one group
			if (match.length === 1) {

				// Take a shortcut and set the context if the root selector is an ID
				tokens = match[0] = match[0].slice(0);
				if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {

					context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
					if (!context) {
						return results;

						// Precompiled matchers will still verify ancestry, so step up a level
					} else if (compiled) {
						context = context.parentNode;
					}

					selector = selector.slice(tokens.shift().value.length);
				}

				// Fetch a seed set for right-to-left matching
				i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
				while (i--) {
					token = tokens[i];

					// Abort if we hit a combinator
					if (Expr.relative[type = token.type]) {
						break;
					}
					if (find = Expr.find[type]) {
						// Search, expanding context for leading sibling combinators
						if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {

							// If seed is empty or no tokens remain, we can return early
							tokens.splice(i, 1);
							selector = seed.length && toSelector(tokens);
							if (!selector) {
								push.apply(results, seed);
								return results;
							}

							break;
						}
					}
				}
			}

			// Compile and execute a filtering function if one is not provided
			// Provide `match` to avoid retokenization if we modified the selector above
			(compiled || compile(selector, match))(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context);
			return results;
		};

		// One-time assignments

		// Sort stability
		support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

		// Support: Chrome 14-35+
		// Always assume duplicates if they aren't passed to the comparison function
		support.detectDuplicates = !!hasDuplicate;

		// Initialize against the default document
		setDocument();

		// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
		// Detached nodes confoundingly follow *each other*
		support.sortDetached = assert(function (div1) {
			// Should return 1, but returns 4 (following)
			return div1.compareDocumentPosition(document.createElement("div")) & 1;
		});

		// Support: IE<8
		// Prevent attribute/property "interpolation"
		// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
		if (!assert(function (div) {
			div.innerHTML = "<a href='#'></a>";
			return div.firstChild.getAttribute("href") === "#";
		})) {
			addHandle("type|href|height|width", function (elem, name, isXML) {
				if (!isXML) {
					return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
				}
			});
		}

		// Support: IE<9
		// Use defaultValue in place of getAttribute("value")
		if (!support.attributes || !assert(function (div) {
			div.innerHTML = "<input/>";
			div.firstChild.setAttribute("value", "");
			return div.firstChild.getAttribute("value") === "";
		})) {
			addHandle("value", function (elem, name, isXML) {
				if (!isXML && elem.nodeName.toLowerCase() === "input") {
					return elem.defaultValue;
				}
			});
		}

		// Support: IE<9
		// Use getAttributeNode to fetch booleans when getAttribute lies
		if (!assert(function (div) {
			return div.getAttribute("disabled") == null;
		})) {
			addHandle(booleans, function (elem, name, isXML) {
				var val;
				if (!isXML) {
					return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
				}
			});
		}

		return Sizzle;
	}(window);

	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[":"] = jQuery.expr.pseudos;
	jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;

	var rneedsContext = jQuery.expr.match.needsContext;

	var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;

	var risSimple = /^.[^:#\[\.,]*$/;

	// Implement the identical functionality for filter and not
	function winnow(elements, qualifier, not) {
		if (jQuery.isFunction(qualifier)) {
			return jQuery.grep(elements, function (elem, i) {
				/* jshint -W018 */
				return !!qualifier.call(elem, i, elem) !== not;
			});
		}

		if (qualifier.nodeType) {
			return jQuery.grep(elements, function (elem) {
				return elem === qualifier !== not;
			});
		}

		if (typeof qualifier === "string") {
			if (risSimple.test(qualifier)) {
				return jQuery.filter(qualifier, elements, not);
			}

			qualifier = jQuery.filter(qualifier, elements);
		}

		return jQuery.grep(elements, function (elem) {
			return indexOf.call(qualifier, elem) >= 0 !== not;
		});
	}

	jQuery.filter = function (expr, elems, not) {
		var elem = elems[0];

		if (not) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function (elem) {
			return elem.nodeType === 1;
		}));
	};

	jQuery.fn.extend({
		find: function find(selector) {
			var i,
			    len = this.length,
			    ret = [],
			    self = this;

			if (typeof selector !== "string") {
				return this.pushStack(jQuery(selector).filter(function () {
					for (i = 0; i < len; i++) {
						if (jQuery.contains(self[i], this)) {
							return true;
						}
					}
				}));
			}

			for (i = 0; i < len; i++) {
				jQuery.find(selector, self[i], ret);
			}

			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function filter(selector) {
			return this.pushStack(winnow(this, selector || [], false));
		},
		not: function not(selector) {
			return this.pushStack(winnow(this, selector || [], true));
		},
		is: function is(selector) {
			return !!winnow(this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
		}
	});

	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,


	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	    init = jQuery.fn.init = function (selector, context) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if (!selector) {
			return this;
		}

		// Handle HTML strings
		if (typeof selector === "string") {
			if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [null, selector, null];
			} else {
				match = rquickExpr.exec(selector);
			}

			// Match html or make sure no context is specified for #id
			if (match && (match[1] || !context)) {

				// HANDLE: $(html) -> $(array)
				if (match[1]) {
					context = context instanceof jQuery ? context[0] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));

					// HANDLE: $(html, props)
					if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
						for (match in context) {
							// Properties of context are called as methods if possible
							if (jQuery.isFunction(this[match])) {
								this[match](context[match]);

								// ...and otherwise set as attributes
							} else {
								this.attr(match, context[match]);
							}
						}
					}

					return this;

					// HANDLE: $(#id)
				} else {
					elem = document.getElementById(match[2]);

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if (elem && elem.parentNode) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

				// HANDLE: $(expr, $(...))
			} else if (!context || context.jquery) {
				return (context || rootjQuery).find(selector);

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor(context).find(selector);
			}

			// HANDLE: $(DOMElement)
		} else if (selector.nodeType) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

			// HANDLE: $(function)
			// Shortcut for document ready
		} else if (jQuery.isFunction(selector)) {
			return typeof rootjQuery.ready !== "undefined" ? rootjQuery.ready(selector) :
			// Execute immediately if ready is not present
			selector(jQuery);
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray(selector, this);
	};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery(document);

	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

	jQuery.extend({
		dir: function dir(elem, _dir, until) {
			var matched = [],
			    truncate = until !== undefined;

			while ((elem = elem[_dir]) && elem.nodeType !== 9) {
				if (elem.nodeType === 1) {
					if (truncate && jQuery(elem).is(until)) {
						break;
					}
					matched.push(elem);
				}
			}
			return matched;
		},

		sibling: function sibling(n, elem) {
			var matched = [];

			for (; n; n = n.nextSibling) {
				if (n.nodeType === 1 && n !== elem) {
					matched.push(n);
				}
			}

			return matched;
		}
	});

	jQuery.fn.extend({
		has: function has(target) {
			var targets = jQuery(target, this),
			    l = targets.length;

			return this.filter(function () {
				var i = 0;
				for (; i < l; i++) {
					if (jQuery.contains(this, targets[i])) {
						return true;
					}
				}
			});
		},

		closest: function closest(selectors, context) {
			var cur,
			    i = 0,
			    l = this.length,
			    matched = [],
			    pos = rneedsContext.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;

			for (; i < l; i++) {
				for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
					// Always skip document fragments
					if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {

						matched.push(cur);
						break;
					}
				}
			}

			return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
		},

		// Determine the position of an element within the set
		index: function index(elem) {

			// No argument, return index in parent
			if (!elem) {
				return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if (typeof elem === "string") {
				return indexOf.call(jQuery(elem), this[0]);
			}

			// Locate the position of the desired element
			return indexOf.call(this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem);
		},

		add: function add(selector, context) {
			return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
		},

		addBack: function addBack(selector) {
			return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
		}
	});

	function sibling(cur, dir) {
		while ((cur = cur[dir]) && cur.nodeType !== 1) {}
		return cur;
	}

	jQuery.each({
		parent: function parent(elem) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function parents(elem) {
			return jQuery.dir(elem, "parentNode");
		},
		parentsUntil: function parentsUntil(elem, i, until) {
			return jQuery.dir(elem, "parentNode", until);
		},
		next: function next(elem) {
			return sibling(elem, "nextSibling");
		},
		prev: function prev(elem) {
			return sibling(elem, "previousSibling");
		},
		nextAll: function nextAll(elem) {
			return jQuery.dir(elem, "nextSibling");
		},
		prevAll: function prevAll(elem) {
			return jQuery.dir(elem, "previousSibling");
		},
		nextUntil: function nextUntil(elem, i, until) {
			return jQuery.dir(elem, "nextSibling", until);
		},
		prevUntil: function prevUntil(elem, i, until) {
			return jQuery.dir(elem, "previousSibling", until);
		},
		siblings: function siblings(elem) {
			return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
		},
		children: function children(elem) {
			return jQuery.sibling(elem.firstChild);
		},
		contents: function contents(elem) {
			return elem.contentDocument || jQuery.merge([], elem.childNodes);
		}
	}, function (name, fn) {
		jQuery.fn[name] = function (until, selector) {
			var matched = jQuery.map(this, fn, until);

			if (name.slice(-5) !== "Until") {
				selector = until;
			}

			if (selector && typeof selector === "string") {
				matched = jQuery.filter(selector, matched);
			}

			if (this.length > 1) {
				// Remove duplicates
				if (!guaranteedUnique[name]) {
					jQuery.unique(matched);
				}

				// Reverse order for parents* and prev-derivatives
				if (rparentsprev.test(name)) {
					matched.reverse();
				}
			}

			return this.pushStack(matched);
		};
	});
	var rnotwhite = /\S+/g;

	// String to Object options format cache
	var optionsCache = {};

	// Convert String-formatted options into Object-formatted ones and store in cache
	function createOptions(options) {
		var object = optionsCache[options] = {};
		jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
			object[flag] = true;
		});
		return object;
	}

	/*
  * Create a callback list using the following parameters:
  *
  *	options: an optional list of space-separated options that will change how
  *			the callback list behaves or a more traditional option object
  *
  * By default a callback list will act like an event callback list and can be
  * "fired" multiple times.
  *
  * Possible options:
  *
  *	once:			will ensure the callback list can only be fired once (like a Deferred)
  *
  *	memory:			will keep track of previous values and will call any callback added
  *					after the list has been fired right away with the latest "memorized"
  *					values (like a Deferred)
  *
  *	unique:			will ensure a callback can only be added once (no duplicate in the list)
  *
  *	stopOnFalse:	interrupt callings when a callback returns false
  *
  */
	jQuery.Callbacks = function (options) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);

		var // Last fire value (for non-forgettable lists)
		memory,

		// Flag to know if list was already fired
		_fired,

		// Flag to know if list is currently firing
		firing,

		// First callback to fire (used internally by add and fireWith)
		firingStart,

		// End of the loop when firing
		firingLength,

		// Index of currently firing callback (modified by remove if needed)
		firingIndex,

		// Actual callback list
		list = [],

		// Stack of fire calls for repeatable lists
		stack = !options.once && [],

		// Fire callbacks
		fire = function fire(data) {
			memory = options.memory && data;
			_fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for (; list && firingIndex < firingLength; firingIndex++) {
				if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if (list) {
				if (stack) {
					if (stack.length) {
						fire(stack.shift());
					}
				} else if (memory) {
					list = [];
				} else {
					self.disable();
				}
			}
		},

		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function add() {
				if (list) {
					// First, we save the current length
					var start = list.length;
					(function add(args) {
						jQuery.each(args, function (_, arg) {
							var type = jQuery.type(arg);
							if (type === "function") {
								if (!options.unique || !self.has(arg)) {
									list.push(arg);
								}
							} else if (arg && arg.length && type !== "string") {
								// Inspect recursively
								add(arg);
							}
						});
					})(arguments);
					// Do we need to add the callbacks to the
					// current firing batch?
					if (firing) {
						firingLength = list.length;
						// With memory, if we're not firing then
						// we should call right away
					} else if (memory) {
						firingStart = start;
						fire(memory);
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function remove() {
				if (list) {
					jQuery.each(arguments, function (_, arg) {
						var index;
						while ((index = jQuery.inArray(arg, list, index)) > -1) {
							list.splice(index, 1);
							// Handle firing indexes
							if (firing) {
								if (index <= firingLength) {
									firingLength--;
								}
								if (index <= firingIndex) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function has(fn) {
				return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
			},
			// Remove all callbacks from the list
			empty: function empty() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function disable() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function disabled() {
				return !list;
			},
			// Lock the list in its current state
			lock: function lock() {
				stack = undefined;
				if (!memory) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function locked() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function fireWith(context, args) {
				if (list && (!_fired || stack)) {
					args = args || [];
					args = [context, args.slice ? args.slice() : args];
					if (firing) {
						stack.push(args);
					} else {
						fire(args);
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function fire() {
				self.fireWith(this, arguments);
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function fired() {
				return !!_fired;
			}
		};

		return self;
	};

	jQuery.extend({

		Deferred: function Deferred(func) {
			var tuples = [
			// action, add listener, listener list, final state
			["resolve", "done", jQuery.Callbacks("once memory"), "resolved"], ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"], ["notify", "progress", jQuery.Callbacks("memory")]],
			    _state = "pending",
			    _promise = {
				state: function state() {
					return _state;
				},
				always: function always() {
					deferred.done(arguments).fail(arguments);
					return this;
				},
				then: function then() /* fnDone, fnFail, fnProgress */{
					var fns = arguments;
					return jQuery.Deferred(function (newDefer) {
						jQuery.each(tuples, function (i, tuple) {
							var fn = jQuery.isFunction(fns[i]) && fns[i];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[tuple[1]](function () {
								var returned = fn && fn.apply(this, arguments);
								if (returned && jQuery.isFunction(returned.promise)) {
									returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
								} else {
									newDefer[tuple[0] + "With"](this === _promise ? newDefer.promise() : this, fn ? [returned] : arguments);
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function promise(obj) {
					return obj != null ? jQuery.extend(obj, _promise) : _promise;
				}
			},
			    deferred = {};

			// Keep pipe for back-compat
			_promise.pipe = _promise.then;

			// Add list-specific methods
			jQuery.each(tuples, function (i, tuple) {
				var list = tuple[2],
				    stateString = tuple[3];

				// promise[ done | fail | progress ] = list.add
				_promise[tuple[1]] = list.add;

				// Handle state
				if (stateString) {
					list.add(function () {
						// state = [ resolved | rejected ]
						_state = stateString;

						// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[i ^ 1][2].disable, tuples[2][2].lock);
				}

				// deferred[ resolve | reject | notify ]
				deferred[tuple[0]] = function () {
					deferred[tuple[0] + "With"](this === deferred ? _promise : this, arguments);
					return this;
				};
				deferred[tuple[0] + "With"] = list.fireWith;
			});

			// Make the deferred a promise
			_promise.promise(deferred);

			// Call given func if any
			if (func) {
				func.call(deferred, deferred);
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function when(subordinate /* , ..., subordinateN */) {
			var i = 0,
			    resolveValues = _slice.call(arguments),
			    length = resolveValues.length,


			// the count of uncompleted subordinates
			remaining = length !== 1 || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0,


			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),


			// Update function for both resolve and progress values
			updateFunc = function updateFunc(i, contexts, values) {
				return function (value) {
					contexts[i] = this;
					values[i] = arguments.length > 1 ? _slice.call(arguments) : value;
					if (values === progressValues) {
						deferred.notifyWith(contexts, values);
					} else if (! --remaining) {
						deferred.resolveWith(contexts, values);
					}
				};
			},
			    progressValues,
			    progressContexts,
			    resolveContexts;

			// Add listeners to Deferred subordinates; treat others as resolved
			if (length > 1) {
				progressValues = new Array(length);
				progressContexts = new Array(length);
				resolveContexts = new Array(length);
				for (; i < length; i++) {
					if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
						resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
					} else {
						--remaining;
					}
				}
			}

			// If we're not waiting on anything, resolve the master
			if (!remaining) {
				deferred.resolveWith(resolveContexts, resolveValues);
			}

			return deferred.promise();
		}
	});

	// The deferred used on DOM ready
	var readyList;

	jQuery.fn.ready = function (fn) {
		// Add the callback
		jQuery.ready.promise().done(fn);

		return this;
	};

	jQuery.extend({
		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Hold (or release) the ready event
		holdReady: function holdReady(hold) {
			if (hold) {
				jQuery.readyWait++;
			} else {
				jQuery.ready(true);
			}
		},

		// Handle when the DOM is ready
		ready: function ready(wait) {

			// Abort if there are pending holds or we're already ready
			if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if (wait !== true && --jQuery.readyWait > 0) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith(document, [jQuery]);

			// Trigger any bound ready events
			if (jQuery.fn.triggerHandler) {
				jQuery(document).triggerHandler("ready");
				jQuery(document).off("ready");
			}
		}
	});

	/**
  * The ready event handler and self cleanup method
  */
	function completed() {
		document.removeEventListener("DOMContentLoaded", completed, false);
		window.removeEventListener("load", completed, false);
		jQuery.ready();
	}

	jQuery.ready.promise = function (obj) {
		if (!readyList) {

			readyList = jQuery.Deferred();

			// Catch cases where $(document).ready() is called after the browser event has already occurred.
			// We once tried to use readyState "interactive" here, but it caused issues like the one
			// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
			if (document.readyState === "complete") {
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				setTimeout(jQuery.ready);
			} else {

				// Use the handy event callback
				document.addEventListener("DOMContentLoaded", completed, false);

				// A fallback to window.onload, that will always work
				window.addEventListener("load", completed, false);
			}
		}
		return readyList.promise(obj);
	};

	// Kick off the DOM ready check even if the user does not
	jQuery.ready.promise();

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = jQuery.access = function (elems, fn, key, value, chainable, emptyGet, raw) {
		var i = 0,
		    len = elems.length,
		    bulk = key == null;

		// Sets many values
		if (jQuery.type(key) === "object") {
			chainable = true;
			for (i in key) {
				jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
			}

			// Sets one value
		} else if (value !== undefined) {
			chainable = true;

			if (!jQuery.isFunction(value)) {
				raw = true;
			}

			if (bulk) {
				// Bulk operations run against the entire set
				if (raw) {
					fn.call(elems, value);
					fn = null;

					// ...except when executing function values
				} else {
					bulk = fn;
					fn = function fn(elem, key, value) {
						return bulk.call(jQuery(elem), value);
					};
				}
			}

			if (fn) {
				for (; i < len; i++) {
					fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
				}
			}
		}

		return chainable ? elems :

		// Gets
		bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet;
	};

	/**
  * Determines whether an object can have data
  */
	jQuery.acceptData = function (owner) {
		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		/* jshint -W018 */
		return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
	};

	function Data() {
		// Support: Android<4,
		// Old WebKit does not have Object.preventExtensions/freeze method,
		// return new empty object instead with no [[set]] accessor
		Object.defineProperty(this.cache = {}, 0, {
			get: function get() {
				return {};
			}
		});

		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;
	Data.accepts = jQuery.acceptData;

	Data.prototype = {
		key: function key(owner) {
			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return the key for a frozen object.
			if (!Data.accepts(owner)) {
				return 0;
			}

			var descriptor = {},

			// Check if the owner object already has a cache key
			unlock = owner[this.expando];

			// If not, create one
			if (!unlock) {
				unlock = Data.uid++;

				// Secure it in a non-enumerable, non-writable property
				try {
					descriptor[this.expando] = { value: unlock };
					Object.defineProperties(owner, descriptor);

					// Support: Android<4
					// Fallback to a less secure definition
				} catch (e) {
					descriptor[this.expando] = unlock;
					jQuery.extend(owner, descriptor);
				}
			}

			// Ensure the cache object
			if (!this.cache[unlock]) {
				this.cache[unlock] = {};
			}

			return unlock;
		},
		set: function set(owner, data, value) {
			var prop,

			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key(owner),
			    cache = this.cache[unlock];

			// Handle: [ owner, key, value ] args
			if (typeof data === "string") {
				cache[data] = value;

				// Handle: [ owner, { properties } ] args
			} else {
				// Fresh assignments by object are shallow copied
				if (jQuery.isEmptyObject(cache)) {
					jQuery.extend(this.cache[unlock], data);
					// Otherwise, copy the properties one-by-one to the cache object
				} else {
					for (prop in data) {
						cache[prop] = data[prop];
					}
				}
			}
			return cache;
		},
		get: function get(owner, key) {
			// Either a valid cache is found, or will be created.
			// New caches will be created and the unlock returned,
			// allowing direct access to the newly created
			// empty data object. A valid owner object must be provided.
			var cache = this.cache[this.key(owner)];

			return key === undefined ? cache : cache[key];
		},
		access: function access(owner, key, value) {
			var stored;
			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if (key === undefined || key && typeof key === "string" && value === undefined) {

				stored = this.get(owner, key);

				return stored !== undefined ? stored : this.get(owner, jQuery.camelCase(key));
			}

			// [*]When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set(owner, key, value);

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function remove(owner, key) {
			var i,
			    name,
			    camel,
			    unlock = this.key(owner),
			    cache = this.cache[unlock];

			if (key === undefined) {
				this.cache[unlock] = {};
			} else {
				// Support array or space separated string of keys
				if (jQuery.isArray(key)) {
					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = key.concat(key.map(jQuery.camelCase));
				} else {
					camel = jQuery.camelCase(key);
					// Try the string as a key before any manipulation
					if (key in cache) {
						name = [key, camel];
					} else {
						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						name = camel;
						name = name in cache ? [name] : name.match(rnotwhite) || [];
					}
				}

				i = name.length;
				while (i--) {
					delete cache[name[i]];
				}
			}
		},
		hasData: function hasData(owner) {
			return !jQuery.isEmptyObject(this.cache[owner[this.expando]] || {});
		},
		discard: function discard(owner) {
			if (owner[this.expando]) {
				delete this.cache[owner[this.expando]];
			}
		}
	};
	var data_priv = new Data();

	var data_user = new Data();

	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	    rmultiDash = /([A-Z])/g;

	function dataAttr(elem, key, data) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if (data === undefined && elem.nodeType === 1) {
			name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
			data = elem.getAttribute(name);

			if (typeof data === "string") {
				try {
					data = data === "true" ? true : data === "false" ? false : data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
				} catch (e) {}

				// Make sure we set the data so it isn't changed later
				data_user.set(elem, key, data);
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend({
		hasData: function hasData(elem) {
			return data_user.hasData(elem) || data_priv.hasData(elem);
		},

		data: function data(elem, name, _data) {
			return data_user.access(elem, name, _data);
		},

		removeData: function removeData(elem, name) {
			data_user.remove(elem, name);
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to data_priv methods, these can be deprecated.
		_data: function _data(elem, name, data) {
			return data_priv.access(elem, name, data);
		},

		_removeData: function _removeData(elem, name) {
			data_priv.remove(elem, name);
		}
	});

	jQuery.fn.extend({
		data: function data(key, value) {
			var i,
			    name,
			    data,
			    elem = this[0],
			    attrs = elem && elem.attributes;

			// Gets all values
			if (key === undefined) {
				if (this.length) {
					data = data_user.get(elem);

					if (elem.nodeType === 1 && !data_priv.get(elem, "hasDataAttrs")) {
						i = attrs.length;
						while (i--) {

							// Support: IE11+
							// The attrs elements can be null (#14894)
							if (attrs[i]) {
								name = attrs[i].name;
								if (name.indexOf("data-") === 0) {
									name = jQuery.camelCase(name.slice(5));
									dataAttr(elem, name, data[name]);
								}
							}
						}
						data_priv.set(elem, "hasDataAttrs", true);
					}
				}

				return data;
			}

			// Sets multiple values
			if ((typeof key === "undefined" ? "undefined" : _typeof(key)) === "object") {
				return this.each(function () {
					data_user.set(this, key);
				});
			}

			return access(this, function (value) {
				var data,
				    camelKey = jQuery.camelCase(key);

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if (elem && value === undefined) {
					// Attempt to get data from the cache
					// with the key as-is
					data = data_user.get(elem, key);
					if (data !== undefined) {
						return data;
					}

					// Attempt to get data from the cache
					// with the key camelized
					data = data_user.get(elem, camelKey);
					if (data !== undefined) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr(elem, camelKey, undefined);
					if (data !== undefined) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				this.each(function () {
					// First, attempt to store a copy or reference of any
					// data that might've been store with a camelCased key.
					var data = data_user.get(this, camelKey);

					// For HTML5 data-* attribute interop, we have to
					// store property names with dashes in a camelCase form.
					// This might not apply to all properties...*
					data_user.set(this, camelKey, value);

					// *... In the case of properties that might _actually_
					// have dashes, we need to also store a copy of that
					// unchanged property.
					if (key.indexOf("-") !== -1 && data !== undefined) {
						data_user.set(this, key, value);
					}
				});
			}, null, value, arguments.length > 1, null, true);
		},

		removeData: function removeData(key) {
			return this.each(function () {
				data_user.remove(this, key);
			});
		}
	});

	jQuery.extend({
		queue: function queue(elem, type, data) {
			var queue;

			if (elem) {
				type = (type || "fx") + "queue";
				queue = data_priv.get(elem, type);

				// Speed up dequeue by getting out quickly if this is just a lookup
				if (data) {
					if (!queue || jQuery.isArray(data)) {
						queue = data_priv.access(elem, type, jQuery.makeArray(data));
					} else {
						queue.push(data);
					}
				}
				return queue || [];
			}
		},

		dequeue: function dequeue(elem, type) {
			type = type || "fx";

			var queue = jQuery.queue(elem, type),
			    startLength = queue.length,
			    fn = queue.shift(),
			    hooks = jQuery._queueHooks(elem, type),
			    next = function next() {
				jQuery.dequeue(elem, type);
			};

			// If the fx queue is dequeued, always remove the progress sentinel
			if (fn === "inprogress") {
				fn = queue.shift();
				startLength--;
			}

			if (fn) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if (type === "fx") {
					queue.unshift("inprogress");
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call(elem, next, hooks);
			}

			if (!startLength && hooks) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function _queueHooks(elem, type) {
			var key = type + "queueHooks";
			return data_priv.get(elem, key) || data_priv.access(elem, key, {
				empty: jQuery.Callbacks("once memory").add(function () {
					data_priv.remove(elem, [type + "queue", key]);
				})
			});
		}
	});

	jQuery.fn.extend({
		queue: function queue(type, data) {
			var setter = 2;

			if (typeof type !== "string") {
				data = type;
				type = "fx";
				setter--;
			}

			if (arguments.length < setter) {
				return jQuery.queue(this[0], type);
			}

			return data === undefined ? this : this.each(function () {
				var queue = jQuery.queue(this, type, data);

				// Ensure a hooks for this queue
				jQuery._queueHooks(this, type);

				if (type === "fx" && queue[0] !== "inprogress") {
					jQuery.dequeue(this, type);
				}
			});
		},
		dequeue: function dequeue(type) {
			return this.each(function () {
				jQuery.dequeue(this, type);
			});
		},
		clearQueue: function clearQueue(type) {
			return this.queue(type || "fx", []);
		},
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function promise(type, obj) {
			var tmp,
			    count = 1,
			    defer = jQuery.Deferred(),
			    elements = this,
			    i = this.length,
			    resolve = function resolve() {
				if (! --count) {
					defer.resolveWith(elements, [elements]);
				}
			};

			if (typeof type !== "string") {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while (i--) {
				tmp = data_priv.get(elements[i], type + "queueHooks");
				if (tmp && tmp.empty) {
					count++;
					tmp.empty.add(resolve);
				}
			}
			resolve();
			return defer.promise(obj);
		}
	});
	var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;

	var cssExpand = ["Top", "Right", "Bottom", "Left"];

	var isHidden = function isHidden(elem, el) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
	};

	var rcheckableType = /^(?:checkbox|radio)$/i;

	(function () {
		var fragment = document.createDocumentFragment(),
		    div = fragment.appendChild(document.createElement("div")),
		    input = document.createElement("input");

		// Support: Safari<=5.1
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute("type", "radio");
		input.setAttribute("checked", "checked");
		input.setAttribute("name", "t");

		div.appendChild(input);

		// Support: Safari<=5.1, Android<4.2
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;

		// Support: IE<=11+
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
	})();
	var strundefined =  true ? "undefined" : _typeof(undefined);

	support.focusinBubbles = "onfocusin" in window;

	var rkeyEvent = /^key/,
	    rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	    rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	    rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch (err) {}
	}

	/*
  * Helper functions for managing events -- not part of the public interface.
  * Props to Dean Edwards' addEvent library for many of the ideas.
  */
	jQuery.event = {

		global: {},

		add: function add(elem, types, handler, data, selector) {

			var handleObjIn,
			    eventHandle,
			    tmp,
			    events,
			    t,
			    handleObj,
			    special,
			    handlers,
			    type,
			    namespaces,
			    origType,
			    elemData = data_priv.get(elem);

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if (!elemData) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if (handler.handler) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if (!handler.guid) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if (!(events = elemData.events)) {
				events = elemData.events = {};
			}
			if (!(eventHandle = elemData.handle)) {
				eventHandle = elemData.handle = function (e) {
					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return (typeof jQuery === "undefined" ? "undefined" : _typeof(jQuery)) !== strundefined && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = (types || "").match(rnotwhite) || [""];
			t = types.length;
			while (t--) {
				tmp = rtypenamespace.exec(types[t]) || [];
				type = origType = tmp[1];
				namespaces = (tmp[2] || "").split(".").sort();

				// There *must* be a type, no attaching namespace-only handlers
				if (!type) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[type] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = (selector ? special.delegateType : special.bindType) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[type] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend({
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test(selector),
					namespace: namespaces.join(".")
				}, handleObjIn);

				// Init the event handler queue if we're the first
				if (!(handlers = events[type])) {
					handlers = events[type] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
						if (elem.addEventListener) {
							elem.addEventListener(type, eventHandle, false);
						}
					}
				}

				if (special.add) {
					special.add.call(elem, handleObj);

					if (!handleObj.handler.guid) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if (selector) {
					handlers.splice(handlers.delegateCount++, 0, handleObj);
				} else {
					handlers.push(handleObj);
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[type] = true;
			}
		},

		// Detach an event or set of events from an element
		remove: function remove(elem, types, handler, selector, mappedTypes) {

			var j,
			    origCount,
			    tmp,
			    events,
			    t,
			    handleObj,
			    special,
			    handlers,
			    type,
			    namespaces,
			    origType,
			    elemData = data_priv.hasData(elem) && data_priv.get(elem);

			if (!elemData || !(events = elemData.events)) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = (types || "").match(rnotwhite) || [""];
			t = types.length;
			while (t--) {
				tmp = rtypenamespace.exec(types[t]) || [];
				type = origType = tmp[1];
				namespaces = (tmp[2] || "").split(".").sort();

				// Unbind all events (on this namespace, if provided) for the element
				if (!type) {
					for (type in events) {
						jQuery.event.remove(elem, type + types[t], handler, selector, true);
					}
					continue;
				}

				special = jQuery.event.special[type] || {};
				type = (selector ? special.delegateType : special.bindType) || type;
				handlers = events[type] || [];
				tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");

				// Remove matching events
				origCount = j = handlers.length;
				while (j--) {
					handleObj = handlers[j];

					if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
						handlers.splice(j, 1);

						if (handleObj.selector) {
							handlers.delegateCount--;
						}
						if (special.remove) {
							special.remove.call(elem, handleObj);
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if (origCount && !handlers.length) {
					if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
						jQuery.removeEvent(elem, type, elemData.handle);
					}

					delete events[type];
				}
			}

			// Remove the expando if it's no longer used
			if (jQuery.isEmptyObject(events)) {
				delete elemData.handle;
				data_priv.remove(elem, "events");
			}
		},

		trigger: function trigger(event, data, elem, onlyHandlers) {

			var i,
			    cur,
			    tmp,
			    bubbleType,
			    ontype,
			    handle,
			    special,
			    eventPath = [elem || document],
			    type = hasOwn.call(event, "type") ? event.type : event,
			    namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if (elem.nodeType === 3 || elem.nodeType === 8) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if (rfocusMorph.test(type + jQuery.event.triggered)) {
				return;
			}

			if (type.indexOf(".") >= 0) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf(":") < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[jQuery.expando] ? event : new jQuery.Event(type, (typeof event === "undefined" ? "undefined" : _typeof(event)) === "object" && event);

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join(".");
			event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if (!event.target) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ? [event] : jQuery.makeArray(data, [event]);

			// Allow special events to draw outside the lines
			special = jQuery.event.special[type] || {};
			if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

				bubbleType = special.delegateType || type;
				if (!rfocusMorph.test(bubbleType + type)) {
					cur = cur.parentNode;
				}
				for (; cur; cur = cur.parentNode) {
					eventPath.push(cur);
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if (tmp === (elem.ownerDocument || document)) {
					eventPath.push(tmp.defaultView || tmp.parentWindow || window);
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {

				event.type = i > 1 ? bubbleType : special.bindType || type;

				// jQuery handler
				handle = (data_priv.get(cur, "events") || {})[event.type] && data_priv.get(cur, "handle");
				if (handle) {
					handle.apply(cur, data);
				}

				// Native handler
				handle = ontype && cur[ontype];
				if (handle && handle.apply && jQuery.acceptData(cur)) {
					event.result = handle.apply(cur, data);
					if (event.result === false) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if (!onlyHandlers && !event.isDefaultPrevented()) {

				if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery.acceptData(elem)) {

					// Call a native DOM method on the target with the same name name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if (ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ontype];

						if (tmp) {
							elem[ontype] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[type]();
						jQuery.event.triggered = undefined;

						if (tmp) {
							elem[ontype] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		dispatch: function dispatch(event) {

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix(event);

			var i,
			    j,
			    ret,
			    matched,
			    handleObj,
			    handlerQueue = [],
			    args = _slice.call(arguments),
			    handlers = (data_priv.get(this, "events") || {})[event.type] || [],
			    special = jQuery.event.special[event.type] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[0] = event;
			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if (special.preDispatch && special.preDispatch.call(this, event) === false) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call(this, event, handlers);

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
				event.currentTarget = matched.elem;

				j = 0;
				while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {

					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);

						if (ret !== undefined) {
							if ((event.result = ret) === false) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if (special.postDispatch) {
				special.postDispatch.call(this, event);
			}

			return event.result;
		},

		handlers: function handlers(event, _handlers) {
			var i,
			    matches,
			    sel,
			    handleObj,
			    handlerQueue = [],
			    delegateCount = _handlers.delegateCount,
			    cur = event.target;

			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			// Avoid non-left-click bubbling in Firefox (#3861)
			if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {

				for (; cur !== this; cur = cur.parentNode || this) {

					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if (cur.disabled !== true || event.type !== "click") {
						matches = [];
						for (i = 0; i < delegateCount; i++) {
							handleObj = _handlers[i];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if (matches[sel] === undefined) {
								matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length;
							}
							if (matches[sel]) {
								matches.push(handleObj);
							}
						}
						if (matches.length) {
							handlerQueue.push({ elem: cur, handlers: matches });
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			if (delegateCount < _handlers.length) {
				handlerQueue.push({ elem: this, handlers: _handlers.slice(delegateCount) });
			}

			return handlerQueue;
		},

		// Includes some event props shared by KeyEvent and MouseEvent
		props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split(" "),
			filter: function filter(event, original) {

				// Add which for key events
				if (event.which == null) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter: function filter(event, original) {
				var eventDoc,
				    doc,
				    body,
				    button = original.button;

				// Calculate pageX/Y if missing and clientX/Y available
				if (event.pageX == null && original.clientX != null) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
					event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if (!event.which && button !== undefined) {
					event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
				}

				return event;
			}
		},

		fix: function fix(event) {
			if (event[jQuery.expando]) {
				return event;
			}

			// Create a writable copy of the event object and normalize some properties
			var i,
			    prop,
			    copy,
			    type = event.type,
			    originalEvent = event,
			    fixHook = this.fixHooks[type];

			if (!fixHook) {
				this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
			}
			copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

			event = new jQuery.Event(originalEvent);

			i = copy.length;
			while (i--) {
				prop = copy[i];
				event[prop] = originalEvent[prop];
			}

			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if (!event.target) {
				event.target = document;
			}

			// Support: Safari 6.0+, Chrome<28
			// Target should not be a text node (#504, #13143)
			if (event.target.nodeType === 3) {
				event.target = event.target.parentNode;
			}

			return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
		},

		special: {
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
				// Fire native event if possible so blur/focus sequence is correct
				trigger: function trigger() {
					if (this !== safeActiveElement() && this.focus) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function trigger() {
					if (this === safeActiveElement() && this.blur) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
				// For checkbox, fire native event so checked state will be right
				trigger: function trigger() {
					if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function _default(event) {
					return jQuery.nodeName(event.target, "a");
				}
			},

			beforeunload: {
				postDispatch: function postDispatch(event) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if (event.result !== undefined && event.originalEvent) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		},

		simulate: function simulate(type, elem, event, bubble) {
			// Piggyback on a donor event to simulate a different one.
			// Fake originalEvent to avoid donor's stopPropagation, but if the
			// simulated event prevents default then we do the same on the donor.
			var e = jQuery.extend(new jQuery.Event(), event, {
				type: type,
				isSimulated: true,
				originalEvent: {}
			});
			if (bubble) {
				jQuery.event.trigger(e, null, elem);
			} else {
				jQuery.event.dispatch.call(elem, e);
			}
			if (e.isDefaultPrevented()) {
				event.preventDefault();
			}
		}
	};

	jQuery.removeEvent = function (elem, type, handle) {
		if (elem.removeEventListener) {
			elem.removeEventListener(type, handle, false);
		}
	};

	jQuery.Event = function (src, props) {
		// Allow instantiation without the 'new' keyword
		if (!(this instanceof jQuery.Event)) {
			return new jQuery.Event(src, props);
		}

		// Event object
		if (src && src.type) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined &&
			// Support: Android<4.0
			src.returnValue === false ? returnTrue : returnFalse;

			// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if (props) {
			jQuery.extend(this, props);
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[jQuery.expando] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,

		preventDefault: function preventDefault() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if (e && e.preventDefault) {
				e.preventDefault();
			}
		},
		stopPropagation: function stopPropagation() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if (e && e.stopPropagation) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function stopImmediatePropagation() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if (e && e.stopImmediatePropagation) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// Support: Chrome 15+
	jQuery.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function (orig, fix) {
		jQuery.event.special[orig] = {
			delegateType: fix,
			bindType: fix,

			handle: function handle(event) {
				var ret,
				    target = this,
				    related = event.relatedTarget,
				    handleObj = event.handleObj;

				// For mousenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if (!related || related !== target && !jQuery.contains(target, related)) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply(this, arguments);
					event.type = fix;
				}
				return ret;
			}
		};
	});

	// Support: Firefox, Chrome, Safari
	// Create "bubbling" focus and blur events
	if (!support.focusinBubbles) {
		jQuery.each({ focus: "focusin", blur: "focusout" }, function (orig, fix) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function handler(event) {
				jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
			};

			jQuery.event.special[fix] = {
				setup: function setup() {
					var doc = this.ownerDocument || this,
					    attaches = data_priv.access(doc, fix);

					if (!attaches) {
						doc.addEventListener(orig, handler, true);
					}
					data_priv.access(doc, fix, (attaches || 0) + 1);
				},
				teardown: function teardown() {
					var doc = this.ownerDocument || this,
					    attaches = data_priv.access(doc, fix) - 1;

					if (!attaches) {
						doc.removeEventListener(orig, handler, true);
						data_priv.remove(doc, fix);
					} else {
						data_priv.access(doc, fix, attaches);
					}
				}
			};
		});
	}

	jQuery.fn.extend({

		on: function on(types, selector, data, fn, /*INTERNAL*/one) {
			var origFn, type;

			// Types can be a map of types/handlers
			if ((typeof types === "undefined" ? "undefined" : _typeof(types)) === "object") {
				// ( types-Object, selector, data )
				if (typeof selector !== "string") {
					// ( types-Object, data )
					data = data || selector;
					selector = undefined;
				}
				for (type in types) {
					this.on(type, selector, data, types[type], one);
				}
				return this;
			}

			if (data == null && fn == null) {
				// ( types, fn )
				fn = selector;
				data = selector = undefined;
			} else if (fn == null) {
				if (typeof selector === "string") {
					// ( types, selector, fn )
					fn = data;
					data = undefined;
				} else {
					// ( types, data, fn )
					fn = data;
					data = selector;
					selector = undefined;
				}
			}
			if (fn === false) {
				fn = returnFalse;
			} else if (!fn) {
				return this;
			}

			if (one === 1) {
				origFn = fn;
				fn = function fn(event) {
					// Can use an empty set, since event contains the info
					jQuery().off(event);
					return origFn.apply(this, arguments);
				};
				// Use same guid so caller can remove using origFn
				fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
			}
			return this.each(function () {
				jQuery.event.add(this, types, fn, data, selector);
			});
		},
		one: function one(types, selector, data, fn) {
			return this.on(types, selector, data, fn, 1);
		},
		off: function off(types, selector, fn) {
			var handleObj, type;
			if (types && types.preventDefault && types.handleObj) {
				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
				return this;
			}
			if ((typeof types === "undefined" ? "undefined" : _typeof(types)) === "object") {
				// ( types-object [, selector] )
				for (type in types) {
					this.off(type, selector, types[type]);
				}
				return this;
			}
			if (selector === false || typeof selector === "function") {
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if (fn === false) {
				fn = returnFalse;
			}
			return this.each(function () {
				jQuery.event.remove(this, types, fn, selector);
			});
		},

		trigger: function trigger(type, data) {
			return this.each(function () {
				jQuery.event.trigger(type, data, this);
			});
		},
		triggerHandler: function triggerHandler(type, data) {
			var elem = this[0];
			if (elem) {
				return jQuery.event.trigger(type, data, elem, true);
			}
		}
	});

	var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	    rtagName = /<([\w:]+)/,
	    rhtml = /<|&#?\w+;/,
	    rnoInnerhtml = /<(?:script|style|link)/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	    rscriptType = /^$|\/(?:java|ecma)script/i,
	    rscriptTypeMasked = /^true\/(.*)/,
	    rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,


	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE9
		option: [1, "<select multiple='multiple'>", "</select>"],

		thead: [1, "<table>", "</table>"],
		col: [2, "<table><colgroup>", "</colgroup></table>"],
		tr: [2, "<table><tbody>", "</tbody></table>"],
		td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

		_default: [0, "", ""]
	};

	// Support: IE9
	wrapMap.optgroup = wrapMap.option;

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;

	// Support: 1.x compatibility
	// Manipulating tables requires a tbody
	function manipulationTarget(elem, content) {
		return jQuery.nodeName(elem, "table") && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript(elem) {
		elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
		return elem;
	}
	function restoreScript(elem) {
		var match = rscriptTypeMasked.exec(elem.type);

		if (match) {
			elem.type = match[1];
		} else {
			elem.removeAttribute("type");
		}

		return elem;
	}

	// Mark scripts as having already been evaluated
	function setGlobalEval(elems, refElements) {
		var i = 0,
		    l = elems.length;

		for (; i < l; i++) {
			data_priv.set(elems[i], "globalEval", !refElements || data_priv.get(refElements[i], "globalEval"));
		}
	}

	function cloneCopyEvent(src, dest) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

		if (dest.nodeType !== 1) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if (data_priv.hasData(src)) {
			pdataOld = data_priv.access(src);
			pdataCur = data_priv.set(dest, pdataOld);
			events = pdataOld.events;

			if (events) {
				delete pdataCur.handle;
				pdataCur.events = {};

				for (type in events) {
					for (i = 0, l = events[type].length; i < l; i++) {
						jQuery.event.add(dest, type, events[type][i]);
					}
				}
			}
		}

		// 2. Copy user data
		if (data_user.hasData(src)) {
			udataOld = data_user.access(src);
			udataCur = jQuery.extend({}, udataOld);

			data_user.set(dest, udataCur);
		}
	}

	function getAll(context, tag) {
		var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") : context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];

		return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], ret) : ret;
	}

	// Fix IE bugs, see support tests
	function fixInput(src, dest) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if (nodeName === "input" && rcheckableType.test(src.type)) {
			dest.checked = src.checked;

			// Fails to return the selected option to the default selected state when cloning options
		} else if (nodeName === "input" || nodeName === "textarea") {
			dest.defaultValue = src.defaultValue;
		}
	}

	jQuery.extend({
		clone: function clone(elem, dataAndEvents, deepDataAndEvents) {
			var i,
			    l,
			    srcElements,
			    destElements,
			    clone = elem.cloneNode(true),
			    inPage = jQuery.contains(elem.ownerDocument, elem);

			// Fix IE cloning issues
			if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {

				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll(clone);
				srcElements = getAll(elem);

				for (i = 0, l = srcElements.length; i < l; i++) {
					fixInput(srcElements[i], destElements[i]);
				}
			}

			// Copy the events from the original to the clone
			if (dataAndEvents) {
				if (deepDataAndEvents) {
					srcElements = srcElements || getAll(elem);
					destElements = destElements || getAll(clone);

					for (i = 0, l = srcElements.length; i < l; i++) {
						cloneCopyEvent(srcElements[i], destElements[i]);
					}
				} else {
					cloneCopyEvent(elem, clone);
				}
			}

			// Preserve script evaluation history
			destElements = getAll(clone, "script");
			if (destElements.length > 0) {
				setGlobalEval(destElements, !inPage && getAll(elem, "script"));
			}

			// Return the cloned set
			return clone;
		},

		buildFragment: function buildFragment(elems, context, scripts, selection) {
			var elem,
			    tmp,
			    tag,
			    wrap,
			    contains,
			    j,
			    fragment = context.createDocumentFragment(),
			    nodes = [],
			    i = 0,
			    l = elems.length;

			for (; i < l; i++) {
				elem = elems[i];

				if (elem || elem === 0) {

					// Add nodes directly
					if (jQuery.type(elem) === "object") {
						// Support: QtWebKit, PhantomJS
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge(nodes, elem.nodeType ? [elem] : elem);

						// Convert non-html into a text node
					} else if (!rhtml.test(elem)) {
						nodes.push(context.createTextNode(elem));

						// Convert html into DOM nodes
					} else {
						tmp = tmp || fragment.appendChild(context.createElement("div"));

						// Deserialize a standard representation
						tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
						wrap = wrapMap[tag] || wrapMap._default;
						tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];

						// Descend through wrappers to the right content
						j = wrap[0];
						while (j--) {
							tmp = tmp.lastChild;
						}

						// Support: QtWebKit, PhantomJS
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge(nodes, tmp.childNodes);

						// Remember the top-level container
						tmp = fragment.firstChild;

						// Ensure the created nodes are orphaned (#12392)
						tmp.textContent = "";
					}
				}
			}

			// Remove wrapper from fragment
			fragment.textContent = "";

			i = 0;
			while (elem = nodes[i++]) {

				// #4087 - If origin and destination elements are the same, and this is
				// that element, do not do anything
				if (selection && jQuery.inArray(elem, selection) !== -1) {
					continue;
				}

				contains = jQuery.contains(elem.ownerDocument, elem);

				// Append to fragment
				tmp = getAll(fragment.appendChild(elem), "script");

				// Preserve script evaluation history
				if (contains) {
					setGlobalEval(tmp);
				}

				// Capture executables
				if (scripts) {
					j = 0;
					while (elem = tmp[j++]) {
						if (rscriptType.test(elem.type || "")) {
							scripts.push(elem);
						}
					}
				}
			}

			return fragment;
		},

		cleanData: function cleanData(elems) {
			var data,
			    elem,
			    type,
			    key,
			    special = jQuery.event.special,
			    i = 0;

			for (; (elem = elems[i]) !== undefined; i++) {
				if (jQuery.acceptData(elem)) {
					key = elem[data_priv.expando];

					if (key && (data = data_priv.cache[key])) {
						if (data.events) {
							for (type in data.events) {
								if (special[type]) {
									jQuery.event.remove(elem, type);

									// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent(elem, type, data.handle);
								}
							}
						}
						if (data_priv.cache[key]) {
							// Discard any remaining `private` data
							delete data_priv.cache[key];
						}
					}
				}
				// Discard any remaining `user` data
				delete data_user.cache[elem[data_user.expando]];
			}
		}
	});

	jQuery.fn.extend({
		text: function text(value) {
			return access(this, function (value) {
				return value === undefined ? jQuery.text(this) : this.empty().each(function () {
					if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
						this.textContent = value;
					}
				});
			}, null, value, arguments.length);
		},

		append: function append() {
			return this.domManip(arguments, function (elem) {
				if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
					var target = manipulationTarget(this, elem);
					target.appendChild(elem);
				}
			});
		},

		prepend: function prepend() {
			return this.domManip(arguments, function (elem) {
				if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
					var target = manipulationTarget(this, elem);
					target.insertBefore(elem, target.firstChild);
				}
			});
		},

		before: function before() {
			return this.domManip(arguments, function (elem) {
				if (this.parentNode) {
					this.parentNode.insertBefore(elem, this);
				}
			});
		},

		after: function after() {
			return this.domManip(arguments, function (elem) {
				if (this.parentNode) {
					this.parentNode.insertBefore(elem, this.nextSibling);
				}
			});
		},

		remove: function remove(selector, keepData /* Internal Use Only */) {
			var elem,
			    elems = selector ? jQuery.filter(selector, this) : this,
			    i = 0;

			for (; (elem = elems[i]) != null; i++) {
				if (!keepData && elem.nodeType === 1) {
					jQuery.cleanData(getAll(elem));
				}

				if (elem.parentNode) {
					if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
						setGlobalEval(getAll(elem, "script"));
					}
					elem.parentNode.removeChild(elem);
				}
			}

			return this;
		},

		empty: function empty() {
			var elem,
			    i = 0;

			for (; (elem = this[i]) != null; i++) {
				if (elem.nodeType === 1) {

					// Prevent memory leaks
					jQuery.cleanData(getAll(elem, false));

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function clone(dataAndEvents, deepDataAndEvents) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map(function () {
				return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
			});
		},

		html: function html(value) {
			return access(this, function (value) {
				var elem = this[0] || {},
				    i = 0,
				    l = this.length;

				if (value === undefined && elem.nodeType === 1) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if (typeof value === "string" && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

					value = value.replace(rxhtmlTag, "<$1></$2>");

					try {
						for (; i < l; i++) {
							elem = this[i] || {};

							// Remove element nodes and prevent memory leaks
							if (elem.nodeType === 1) {
								jQuery.cleanData(getAll(elem, false));
								elem.innerHTML = value;
							}
						}

						elem = 0;

						// If using innerHTML throws an exception, use the fallback method
					} catch (e) {}
				}

				if (elem) {
					this.empty().append(value);
				}
			}, null, value, arguments.length);
		},

		replaceWith: function replaceWith() {
			var arg = arguments[0];

			// Make the changes, replacing each context element with the new content
			this.domManip(arguments, function (elem) {
				arg = this.parentNode;

				jQuery.cleanData(getAll(this));

				if (arg) {
					arg.replaceChild(elem, this);
				}
			});

			// Force removal if there was no new content (e.g., from empty arguments)
			return arg && (arg.length || arg.nodeType) ? this : this.remove();
		},

		detach: function detach(selector) {
			return this.remove(selector, true);
		},

		domManip: function domManip(args, callback) {

			// Flatten any nested arrays
			args = concat.apply([], args);

			var fragment,
			    first,
			    scripts,
			    hasScripts,
			    node,
			    doc,
			    i = 0,
			    l = this.length,
			    set = this,
			    iNoClone = l - 1,
			    value = args[0],
			    isFunction = jQuery.isFunction(value);

			// We can't cloneNode fragments that contain checked, in WebKit
			if (isFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
				return this.each(function (index) {
					var self = set.eq(index);
					if (isFunction) {
						args[0] = value.call(this, index, self.html());
					}
					self.domManip(args, callback);
				});
			}

			if (l) {
				fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
				first = fragment.firstChild;

				if (fragment.childNodes.length === 1) {
					fragment = first;
				}

				if (first) {
					scripts = jQuery.map(getAll(fragment, "script"), disableScript);
					hasScripts = scripts.length;

					// Use the original fragment for the last item instead of the first because it can end up
					// being emptied incorrectly in certain situations (#8070).
					for (; i < l; i++) {
						node = fragment;

						if (i !== iNoClone) {
							node = jQuery.clone(node, true, true);

							// Keep references to cloned scripts for later restoration
							if (hasScripts) {
								// Support: QtWebKit
								// jQuery.merge because push.apply(_, arraylike) throws
								jQuery.merge(scripts, getAll(node, "script"));
							}
						}

						callback.call(this[i], node, i);
					}

					if (hasScripts) {
						doc = scripts[scripts.length - 1].ownerDocument;

						// Reenable scripts
						jQuery.map(scripts, restoreScript);

						// Evaluate executable scripts on first document insertion
						for (i = 0; i < hasScripts; i++) {
							node = scripts[i];
							if (rscriptType.test(node.type || "") && !data_priv.access(node, "globalEval") && jQuery.contains(doc, node)) {

								if (node.src) {
									// Optional AJAX dependency, but won't run scripts if not present
									if (jQuery._evalUrl) {
										jQuery._evalUrl(node.src);
									}
								} else {
									jQuery.globalEval(node.textContent.replace(rcleanScript, ""));
								}
							}
						}
					}
				}
			}

			return this;
		}
	});

	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function (name, original) {
		jQuery.fn[name] = function (selector) {
			var elems,
			    ret = [],
			    insert = jQuery(selector),
			    last = insert.length - 1,
			    i = 0;

			for (; i <= last; i++) {
				elems = i === last ? this : this.clone(true);
				jQuery(insert[i])[original](elems);

				// Support: QtWebKit
				// .get() because push.apply(_, arraylike) throws
				push.apply(ret, elems.get());
			}

			return this.pushStack(ret);
		};
	});

	var iframe,
	    elemdisplay = {};

	/**
  * Retrieve the actual display of a element
  * @param {String} name nodeName of the element
  * @param {Object} doc Document object
  */
	// Called only from within defaultDisplay
	function actualDisplay(name, doc) {
		var style,
		    elem = jQuery(doc.createElement(name)).appendTo(doc.body),


		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && (style = window.getDefaultComputedStyle(elem[0])) ?

		// Use of this method is a temporary fix (more like optimization) until something better comes along,
		// since it was removed from specification and supported only in FF
		style.display : jQuery.css(elem[0], "display");

		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();

		return display;
	}

	/**
  * Try to determine the default display value of an element
  * @param {String} nodeName
  */
	function defaultDisplay(nodeName) {
		var doc = document,
		    display = elemdisplay[nodeName];

		if (!display) {
			display = actualDisplay(nodeName, doc);

			// If the simple way fails, read from inside an iframe
			if (display === "none" || !display) {

				// Use the already-created iframe if possible
				iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement);

				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = iframe[0].contentDocument;

				// Support: IE
				doc.write();
				doc.close();

				display = actualDisplay(nodeName, doc);
				iframe.detach();
			}

			// Store the correct default display
			elemdisplay[nodeName] = display;
		}

		return display;
	}
	var rmargin = /^margin/;

	var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

	var getStyles = function getStyles(elem) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		if (elem.ownerDocument.defaultView.opener) {
			return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
		}

		return window.getComputedStyle(elem, null);
	};

	function curCSS(elem, name, computed) {
		var width,
		    minWidth,
		    maxWidth,
		    ret,
		    style = elem.style;

		computed = computed || getStyles(elem);

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if (computed) {
			ret = computed.getPropertyValue(name) || computed[name];
		}

		if (computed) {

			if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
				ret = jQuery.style(elem, name);
			}

			// Support: iOS < 6
			// A tribute to the "awesome hack by Dean Edwards"
			// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if (rnumnonpx.test(ret) && rmargin.test(name)) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" : ret;
	}

	function addGetHookIf(conditionFn, hookFn) {
		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function get() {
				if (conditionFn()) {
					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return (this.get = hookFn).apply(this, arguments);
			}
		};
	}

	(function () {
		var pixelPositionVal,
		    boxSizingReliableVal,
		    docElem = document.documentElement,
		    container = document.createElement("div"),
		    div = document.createElement("div");

		if (!div.style) {
			return;
		}

		// Support: IE9-11+
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode(true).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" + "position:absolute";
		container.appendChild(div);

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computePixelPositionAndBoxSizingReliable() {
			div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" + "box-sizing:border-box;display:block;margin-top:1%;top:1%;" + "border:1px;padding:1px;width:4px;position:absolute";
			div.innerHTML = "";
			docElem.appendChild(container);

			var divStyle = window.getComputedStyle(div, null);
			pixelPositionVal = divStyle.top !== "1%";
			boxSizingReliableVal = divStyle.width === "4px";

			docElem.removeChild(container);
		}

		// Support: node.js jsdom
		// Don't assume that getComputedStyle is a property of the global object
		if (window.getComputedStyle) {
			jQuery.extend(support, {
				pixelPosition: function pixelPosition() {

					// This test is executed only once but we still do memoizing
					// since we can use the boxSizingReliable pre-computing.
					// No need to check if the test was already performed, though.
					computePixelPositionAndBoxSizingReliable();
					return pixelPositionVal;
				},
				boxSizingReliable: function boxSizingReliable() {
					if (boxSizingReliableVal == null) {
						computePixelPositionAndBoxSizingReliable();
					}
					return boxSizingReliableVal;
				},
				reliableMarginRight: function reliableMarginRight() {

					// Support: Android 2.3
					// Check if div with explicit width and no margin-right incorrectly
					// gets computed margin-right based on width of container. (#3333)
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// This support function is only executed once so no memoizing is needed.
					var ret,
					    marginDiv = div.appendChild(document.createElement("div"));

					// Reset CSS: box-sizing; display; margin; border; padding
					marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" + "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
					marginDiv.style.marginRight = marginDiv.style.width = "0";
					div.style.width = "1px";
					docElem.appendChild(container);

					ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);

					docElem.removeChild(container);
					div.removeChild(marginDiv);

					return ret;
				}
			});
		}
	})();

	// A method for quickly swapping in/out CSS properties to get correct calculations.
	jQuery.swap = function (elem, options, callback, args) {
		var ret,
		    name,
		    old = {};

		// Remember the old values, and insert the new ones
		for (name in options) {
			old[name] = elem.style[name];
			elem.style[name] = options[name];
		}

		ret = callback.apply(elem, args || []);

		// Revert the old values
		for (name in options) {
			elem.style[name] = old[name];
		}

		return ret;
	};

	var
	// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	    rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
	    rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),
	    cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	    cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},
	    cssPrefixes = ["Webkit", "O", "Moz", "ms"];

	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName(style, name) {

		// Shortcut for names that are not vendor prefixed
		if (name in style) {
			return name;
		}

		// Check for vendor prefixed names
		var capName = name[0].toUpperCase() + name.slice(1),
		    origName = name,
		    i = cssPrefixes.length;

		while (i--) {
			name = cssPrefixes[i] + capName;
			if (name in style) {
				return name;
			}
		}

		return origName;
	}

	function setPositiveNumber(elem, value, subtract) {
		var matches = rnumsplit.exec(value);
		return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
	}

	function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
		var i = extra === (isBorderBox ? "border" : "content") ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,
		    val = 0;

		for (; i < 4; i += 2) {
			// Both box models exclude margin, so add it if we want it
			if (extra === "margin") {
				val += jQuery.css(elem, extra + cssExpand[i], true, styles);
			}

			if (isBorderBox) {
				// border-box includes padding, so remove it if we want content
				if (extra === "content") {
					val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
				}

				// At this point, extra isn't border nor margin, so remove border
				if (extra !== "margin") {
					val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
				}
			} else {
				// At this point, extra isn't content, so add padding
				val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);

				// At this point, extra isn't content nor padding, so add border
				if (extra !== "padding") {
					val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
				}
			}
		}

		return val;
	}

	function getWidthOrHeight(elem, name, extra) {

		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
		    val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		    styles = getStyles(elem),
		    isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";

		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if (val <= 0 || val == null) {
			// Fall back to computed then uncomputed css if necessary
			val = curCSS(elem, name, styles);
			if (val < 0 || val == null) {
				val = elem.style[name];
			}

			// Computed unit is not pixels. Stop here and return.
			if (rnumnonpx.test(val)) {
				return val;
			}

			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);

			// Normalize "", auto, and prepare for extra
			val = parseFloat(val) || 0;
		}

		// Use the active box-sizing model to add/subtract irrelevant styles
		return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
	}

	function showHide(elements, show) {
		var display,
		    elem,
		    hidden,
		    values = [],
		    index = 0,
		    length = elements.length;

		for (; index < length; index++) {
			elem = elements[index];
			if (!elem.style) {
				continue;
			}

			values[index] = data_priv.get(elem, "olddisplay");
			display = elem.style.display;
			if (show) {
				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if (!values[index] && display === "none") {
					elem.style.display = "";
				}

				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if (elem.style.display === "" && isHidden(elem)) {
					values[index] = data_priv.access(elem, "olddisplay", defaultDisplay(elem.nodeName));
				}
			} else {
				hidden = isHidden(elem);

				if (display !== "none" || !hidden) {
					data_priv.set(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
				}
			}
		}

		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for (index = 0; index < length; index++) {
			elem = elements[index];
			if (!elem.style) {
				continue;
			}
			if (!show || elem.style.display === "none" || elem.style.display === "") {
				elem.style.display = show ? values[index] || "" : "none";
			}
		}

		return elements;
	}

	jQuery.extend({

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function get(elem, computed) {
					if (computed) {

						// We should always get a number back from opacity
						var ret = curCSS(elem, "opacity");
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},

		// Get and set the style property on a DOM Node
		style: function style(elem, name, value, extra) {

			// Don't set styles on text and comment nodes
			if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
				return;
			}

			// Make sure that we're working with the right name
			var ret,
			    type,
			    hooks,
			    origName = jQuery.camelCase(name),
			    style = elem.style;

			name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

			// Check if we're setting a value
			if (value !== undefined) {
				type = typeof value === "undefined" ? "undefined" : _typeof(value);

				// Convert "+=" or "-=" to relative numbers (#7345)
				if (type === "string" && (ret = rrelNum.exec(value))) {
					value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (#7116)
				if (value == null || value !== value) {
					return;
				}

				// If a number, add 'px' to the (except for certain CSS properties)
				if (type === "number" && !jQuery.cssNumber[origName]) {
					value += "px";
				}

				// Support: IE9-11+
				// background-* props affect original clone's values
				if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
					style[name] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
					style[name] = value;
				}
			} else {
				// If a hook was provided get the non-computed value from there
				if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
					return ret;
				}

				// Otherwise just get the value from the style object
				return style[name];
			}
		},

		css: function css(elem, name, extra, styles) {
			var val,
			    num,
			    hooks,
			    origName = jQuery.camelCase(name);

			// Make sure that we're working with the right name
			name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

			// If a hook was provided get the computed value from there
			if (hooks && "get" in hooks) {
				val = hooks.get(elem, true, extra);
			}

			// Otherwise, if a way to get the computed value exists, use that
			if (val === undefined) {
				val = curCSS(elem, name, styles);
			}

			// Convert "normal" to computed value
			if (val === "normal" && name in cssNormalTransform) {
				val = cssNormalTransform[name];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if (extra === "" || extra) {
				num = parseFloat(val);
				return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
			}
			return val;
		}
	});

	jQuery.each(["height", "width"], function (i, name) {
		jQuery.cssHooks[name] = {
			get: function get(elem, computed, extra) {
				if (computed) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test(jQuery.css(elem, "display")) && elem.offsetWidth === 0 ? jQuery.swap(elem, cssShow, function () {
						return getWidthOrHeight(elem, name, extra);
					}) : getWidthOrHeight(elem, name, extra);
				}
			},

			set: function set(elem, value, extra) {
				var styles = extra && getStyles(elem);
				return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, jQuery.css(elem, "boxSizing", false, styles) === "border-box", styles) : 0);
			}
		};
	});

	// Support: Android 2.3
	jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function (elem, computed) {
		if (computed) {
			return jQuery.swap(elem, { "display": "inline-block" }, curCSS, [elem, "marginRight"]);
		}
	});

	// These hooks are used by animate to expand properties
	jQuery.each({
		margin: "",
		padding: "",
		border: "Width"
	}, function (prefix, suffix) {
		jQuery.cssHooks[prefix + suffix] = {
			expand: function expand(value) {
				var i = 0,
				    expanded = {},


				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [value];

				for (; i < 4; i++) {
					expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
				}

				return expanded;
			}
		};

		if (!rmargin.test(prefix)) {
			jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
		}
	});

	jQuery.fn.extend({
		css: function css(name, value) {
			return access(this, function (elem, name, value) {
				var styles,
				    len,
				    map = {},
				    i = 0;

				if (jQuery.isArray(name)) {
					styles = getStyles(elem);
					len = name.length;

					for (; i < len; i++) {
						map[name[i]] = jQuery.css(elem, name[i], false, styles);
					}

					return map;
				}

				return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
			}, name, value, arguments.length > 1);
		},
		show: function show() {
			return showHide(this, true);
		},
		hide: function hide() {
			return showHide(this);
		},
		toggle: function toggle(state) {
			if (typeof state === "boolean") {
				return state ? this.show() : this.hide();
			}

			return this.each(function () {
				if (isHidden(this)) {
					jQuery(this).show();
				} else {
					jQuery(this).hide();
				}
			});
		}
	});

	function Tween(elem, options, prop, end, easing) {
		return new Tween.prototype.init(elem, options, prop, end, easing);
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function init(elem, options, prop, end, easing, unit) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || "swing";
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
		},
		cur: function cur() {
			var hooks = Tween.propHooks[this.prop];

			return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
		},
		run: function run(percent) {
			var eased,
			    hooks = Tween.propHooks[this.prop];

			if (this.options.duration) {
				this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
			} else {
				this.pos = eased = percent;
			}
			this.now = (this.end - this.start) * eased + this.start;

			if (this.options.step) {
				this.options.step.call(this.elem, this.now, this);
			}

			if (hooks && hooks.set) {
				hooks.set(this);
			} else {
				Tween.propHooks._default.set(this);
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function get(tween) {
				var result;

				if (tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
					return tween.elem[tween.prop];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css(tween.elem, tween.prop, "");
				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function set(tween) {
				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if (jQuery.fx.step[tween.prop]) {
					jQuery.fx.step[tween.prop](tween);
				} else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
					jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
				} else {
					tween.elem[tween.prop] = tween.now;
				}
			}
		}
	};

	// Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function set(tween) {
			if (tween.elem.nodeType && tween.elem.parentNode) {
				tween.elem[tween.prop] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function linear(p) {
			return p;
		},
		swing: function swing(p) {
			return 0.5 - Math.cos(p * Math.PI) / 2;
		}
	};

	jQuery.fx = Tween.prototype.init;

	// Back Compat <1.8 extension point
	jQuery.fx.step = {};

	var fxNow,
	    timerId,
	    rfxtypes = /^(?:toggle|show|hide)$/,
	    rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"),
	    rrun = /queueHooks$/,
	    animationPrefilters = [defaultPrefilter],
	    tweeners = {
		"*": [function (prop, value) {
			var tween = this.createTween(prop, value),
			    target = tween.cur(),
			    parts = rfxnum.exec(value),
			    unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"),


			// Starting value computation is required for potential unit mismatches
			start = (jQuery.cssNumber[prop] || unit !== "px" && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)),
			    scale = 1,
			    maxIterations = 20;

			if (start && start[3] !== unit) {
				// Trust units reported by jQuery.css
				unit = unit || start[3];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*.
					// Use string for doubling so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style(tween.elem, prop, start + unit);

					// Update scale, tolerating zero or NaN from tween.cur(),
					// break the loop if scale is unchanged or perfect, or if we've just had enough
				} while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);
			}

			// Update tween properties
			if (parts) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];
			}

			return tween;
		}]
	};

	// Animations created synchronously will run synchronously
	function createFxNow() {
		setTimeout(function () {
			fxNow = undefined;
		});
		return fxNow = jQuery.now();
	}

	// Generate parameters to create a standard animation
	function genFx(type, includeWidth) {
		var which,
		    i = 0,
		    attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for (; i < 4; i += 2 - includeWidth) {
			which = cssExpand[i];
			attrs["margin" + which] = attrs["padding" + which] = type;
		}

		if (includeWidth) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween(value, prop, animation) {
		var tween,
		    collection = (tweeners[prop] || []).concat(tweeners["*"]),
		    index = 0,
		    length = collection.length;
		for (; index < length; index++) {
			if (tween = collection[index].call(animation, prop, value)) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter(elem, props, opts) {
		/* jshint validthis: true */
		var prop,
		    value,
		    toggle,
		    tween,
		    hooks,
		    oldfire,
		    display,
		    checkDisplay,
		    anim = this,
		    orig = {},
		    style = elem.style,
		    hidden = elem.nodeType && isHidden(elem),
		    dataShow = data_priv.get(elem, "fxshow");

		// Handle queue: false promises
		if (!opts.queue) {
			hooks = jQuery._queueHooks(elem, "fx");
			if (hooks.unqueued == null) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function () {
					if (!hooks.unqueued) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always(function () {
				// Ensure the complete handler is called before this completes
				anim.always(function () {
					hooks.unqueued--;
					if (!jQuery.queue(elem, "fx").length) {
						hooks.empty.fire();
					}
				});
			});
		}

		// Height/width overflow pass
		if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE9-10 do not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [style.overflow, style.overflowX, style.overflowY];

			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css(elem, "display");

			// Test default display if display is currently "none"
			checkDisplay = display === "none" ? data_priv.get(elem, "olddisplay") || defaultDisplay(elem.nodeName) : display;

			if (checkDisplay === "inline" && jQuery.css(elem, "float") === "none") {
				style.display = "inline-block";
			}
		}

		if (opts.overflow) {
			style.overflow = "hidden";
			anim.always(function () {
				style.overflow = opts.overflow[0];
				style.overflowX = opts.overflow[1];
				style.overflowY = opts.overflow[2];
			});
		}

		// show/hide pass
		for (prop in props) {
			value = props[prop];
			if (rfxtypes.exec(value)) {
				delete props[prop];
				toggle = toggle || value === "toggle";
				if (value === (hidden ? "hide" : "show")) {

					// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
					if (value === "show" && dataShow && dataShow[prop] !== undefined) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);

				// Any non-fx value stops us from restoring the original display value
			} else {
				display = undefined;
			}
		}

		if (!jQuery.isEmptyObject(orig)) {
			if (dataShow) {
				if ("hidden" in dataShow) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = data_priv.access(elem, "fxshow", {});
			}

			// Store state if its toggle - enables .stop().toggle() to "reverse"
			if (toggle) {
				dataShow.hidden = !hidden;
			}
			if (hidden) {
				jQuery(elem).show();
			} else {
				anim.done(function () {
					jQuery(elem).hide();
				});
			}
			anim.done(function () {
				var prop;

				data_priv.remove(elem, "fxshow");
				for (prop in orig) {
					jQuery.style(elem, prop, orig[prop]);
				}
			});
			for (prop in orig) {
				tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);

				if (!(prop in dataShow)) {
					dataShow[prop] = tween.start;
					if (hidden) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}

			// If this is a noop like .hide().hide(), restore an overwritten display value
		} else if ((display === "none" ? defaultDisplay(elem.nodeName) : display) === "inline") {
			style.display = display;
		}
	}

	function propFilter(props, specialEasing) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for (index in props) {
			name = jQuery.camelCase(index);
			easing = specialEasing[name];
			value = props[index];
			if (jQuery.isArray(value)) {
				easing = value[1];
				value = props[index] = value[0];
			}

			if (index !== name) {
				props[name] = value;
				delete props[index];
			}

			hooks = jQuery.cssHooks[name];
			if (hooks && "expand" in hooks) {
				value = hooks.expand(value);
				delete props[name];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for (index in value) {
					if (!(index in props)) {
						props[index] = value[index];
						specialEasing[index] = easing;
					}
				}
			} else {
				specialEasing[name] = easing;
			}
		}
	}

	function Animation(elem, properties, options) {
		var result,
		    stopped,
		    index = 0,
		    length = animationPrefilters.length,
		    deferred = jQuery.Deferred().always(function () {
			// Don't match elem in the :animated selector
			delete tick.elem;
		}),
		    tick = function tick() {
			if (stopped) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
			    remaining = Math.max(0, animation.startTime + animation.duration - currentTime),

			// Support: Android 2.3
			// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
			temp = remaining / animation.duration || 0,
			    percent = 1 - temp,
			    index = 0,
			    length = animation.tweens.length;

			for (; index < length; index++) {
				animation.tweens[index].run(percent);
			}

			deferred.notifyWith(elem, [animation, percent, remaining]);

			if (percent < 1 && length) {
				return remaining;
			} else {
				deferred.resolveWith(elem, [animation]);
				return false;
			}
		},
		    animation = deferred.promise({
			elem: elem,
			props: jQuery.extend({}, properties),
			opts: jQuery.extend(true, { specialEasing: {} }, options),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function createTween(prop, end) {
				var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
				animation.tweens.push(tween);
				return tween;
			},
			stop: function stop(gotoEnd) {
				var index = 0,

				// If we are going to the end, we want to run all the tweens
				// otherwise we skip this part
				length = gotoEnd ? animation.tweens.length : 0;
				if (stopped) {
					return this;
				}
				stopped = true;
				for (; index < length; index++) {
					animation.tweens[index].run(1);
				}

				// Resolve when we played the last frame; otherwise, reject
				if (gotoEnd) {
					deferred.resolveWith(elem, [animation, gotoEnd]);
				} else {
					deferred.rejectWith(elem, [animation, gotoEnd]);
				}
				return this;
			}
		}),
		    props = animation.props;

		propFilter(props, animation.opts.specialEasing);

		for (; index < length; index++) {
			result = animationPrefilters[index].call(animation, elem, props, animation.opts);
			if (result) {
				return result;
			}
		}

		jQuery.map(props, createTween, animation);

		if (jQuery.isFunction(animation.opts.start)) {
			animation.opts.start.call(elem, animation);
		}

		jQuery.fx.timer(jQuery.extend(tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		}));

		// attach callbacks from options
		return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
	}

	jQuery.Animation = jQuery.extend(Animation, {

		tweener: function tweener(props, callback) {
			if (jQuery.isFunction(props)) {
				callback = props;
				props = ["*"];
			} else {
				props = props.split(" ");
			}

			var prop,
			    index = 0,
			    length = props.length;

			for (; index < length; index++) {
				prop = props[index];
				tweeners[prop] = tweeners[prop] || [];
				tweeners[prop].unshift(callback);
			}
		},

		prefilter: function prefilter(callback, prepend) {
			if (prepend) {
				animationPrefilters.unshift(callback);
			} else {
				animationPrefilters.push(callback);
			}
		}
	});

	jQuery.speed = function (speed, easing, fn) {
		var opt = speed && (typeof speed === "undefined" ? "undefined" : _typeof(speed)) === "object" ? jQuery.extend({}, speed) : {
			complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

		// Normalize opt.queue - true/undefined/null -> "fx"
		if (opt.queue == null || opt.queue === true) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function () {
			if (jQuery.isFunction(opt.old)) {
				opt.old.call(this);
			}

			if (opt.queue) {
				jQuery.dequeue(this, opt.queue);
			}
		};

		return opt;
	};

	jQuery.fn.extend({
		fadeTo: function fadeTo(speed, to, easing, callback) {

			// Show any hidden elements after setting opacity to 0
			return this.filter(isHidden).css("opacity", 0).show()

			// Animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback);
		},
		animate: function animate(prop, speed, easing, callback) {
			var empty = jQuery.isEmptyObject(prop),
			    optall = jQuery.speed(speed, easing, callback),
			    doAnimation = function doAnimation() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation(this, jQuery.extend({}, prop), optall);

				// Empty animations, or finishing resolves immediately
				if (empty || data_priv.get(this, "finish")) {
					anim.stop(true);
				}
			};
			doAnimation.finish = doAnimation;

			return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
		},
		stop: function stop(type, clearQueue, gotoEnd) {
			var stopQueue = function stopQueue(hooks) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop(gotoEnd);
			};

			if (typeof type !== "string") {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if (clearQueue && type !== false) {
				this.queue(type || "fx", []);
			}

			return this.each(function () {
				var dequeue = true,
				    index = type != null && type + "queueHooks",
				    timers = jQuery.timers,
				    data = data_priv.get(this);

				if (index) {
					if (data[index] && data[index].stop) {
						stopQueue(data[index]);
					}
				} else {
					for (index in data) {
						if (data[index] && data[index].stop && rrun.test(index)) {
							stopQueue(data[index]);
						}
					}
				}

				for (index = timers.length; index--;) {
					if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
						timers[index].anim.stop(gotoEnd);
						dequeue = false;
						timers.splice(index, 1);
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if (dequeue || !gotoEnd) {
					jQuery.dequeue(this, type);
				}
			});
		},
		finish: function finish(type) {
			if (type !== false) {
				type = type || "fx";
			}
			return this.each(function () {
				var index,
				    data = data_priv.get(this),
				    queue = data[type + "queue"],
				    hooks = data[type + "queueHooks"],
				    timers = jQuery.timers,
				    length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue(this, type, []);

				if (hooks && hooks.stop) {
					hooks.stop.call(this, true);
				}

				// Look for any active animations, and finish them
				for (index = timers.length; index--;) {
					if (timers[index].elem === this && timers[index].queue === type) {
						timers[index].anim.stop(true);
						timers.splice(index, 1);
					}
				}

				// Look for any animations in the old queue and finish them
				for (index = 0; index < length; index++) {
					if (queue[index] && queue[index].finish) {
						queue[index].finish.call(this);
					}
				}

				// Turn off finishing flag
				delete data.finish;
			});
		}
	});

	jQuery.each(["toggle", "show", "hide"], function (i, name) {
		var cssFn = jQuery.fn[name];
		jQuery.fn[name] = function (speed, easing, callback) {
			return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
		};
	});

	// Generate shortcuts for custom animations
	jQuery.each({
		slideDown: genFx("show"),
		slideUp: genFx("hide"),
		slideToggle: genFx("toggle"),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function (name, props) {
		jQuery.fn[name] = function (speed, easing, callback) {
			return this.animate(props, speed, easing, callback);
		};
	});

	jQuery.timers = [];
	jQuery.fx.tick = function () {
		var timer,
		    i = 0,
		    timers = jQuery.timers;

		fxNow = jQuery.now();

		for (; i < timers.length; i++) {
			timer = timers[i];
			// Checks the timer has not already been removed
			if (!timer() && timers[i] === timer) {
				timers.splice(i--, 1);
			}
		}

		if (!timers.length) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function (timer) {
		jQuery.timers.push(timer);
		if (timer()) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};

	jQuery.fx.interval = 13;

	jQuery.fx.start = function () {
		if (!timerId) {
			timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
		}
	};

	jQuery.fx.stop = function () {
		clearInterval(timerId);
		timerId = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	};

	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function (time, type) {
		time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue(type, function (next, hooks) {
			var timeout = setTimeout(next, time);
			hooks.stop = function () {
				clearTimeout(timeout);
			};
		});
	};

	(function () {
		var input = document.createElement("input"),
		    select = document.createElement("select"),
		    opt = select.appendChild(document.createElement("option"));

		input.type = "checkbox";

		// Support: iOS<=5.1, Android<=4.2+
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE<=11+
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: Android<=2.3
		// Options inside disabled selects are incorrectly marked as disabled
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		// Support: IE<=11+
		// An input loses its value after becoming a radio
		input = document.createElement("input");
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	})();

	var nodeHook,
	    boolHook,
	    attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend({
		attr: function attr(name, value) {
			return access(this, jQuery.attr, name, value, arguments.length > 1);
		},

		removeAttr: function removeAttr(name) {
			return this.each(function () {
				jQuery.removeAttr(this, name);
			});
		}
	});

	jQuery.extend({
		attr: function attr(elem, name, value) {
			var hooks,
			    ret,
			    nType = elem.nodeType;

			// don't get/set attributes on text, comment and attribute nodes
			if (!elem || nType === 3 || nType === 8 || nType === 2) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if (_typeof(elem.getAttribute) === strundefined) {
				return jQuery.prop(elem, name, value);
			}

			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
			}

			if (value !== undefined) {

				if (value === null) {
					jQuery.removeAttr(elem, name);
				} else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
					return ret;
				} else {
					elem.setAttribute(name, value + "");
					return value;
				}
			} else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
				return ret;
			} else {
				ret = jQuery.find.attr(elem, name);

				// Non-existent attributes return null, we normalize to undefined
				return ret == null ? undefined : ret;
			}
		},

		removeAttr: function removeAttr(elem, value) {
			var name,
			    propName,
			    i = 0,
			    attrNames = value && value.match(rnotwhite);

			if (attrNames && elem.nodeType === 1) {
				while (name = attrNames[i++]) {
					propName = jQuery.propFix[name] || name;

					// Boolean attributes get special treatment (#10870)
					if (jQuery.expr.match.bool.test(name)) {
						// Set corresponding property to false
						elem[propName] = false;
					}

					elem.removeAttribute(name);
				}
			}
		},

		attrHooks: {
			type: {
				set: function set(elem, value) {
					if (!support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
						var val = elem.value;
						elem.setAttribute("type", value);
						if (val) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		}
	});

	// Hooks for boolean attributes
	boolHook = {
		set: function set(elem, value, name) {
			if (value === false) {
				// Remove boolean attributes when set to false
				jQuery.removeAttr(elem, name);
			} else {
				elem.setAttribute(name, name);
			}
			return name;
		}
	};
	jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function (i, name) {
		var getter = attrHandle[name] || jQuery.find.attr;

		attrHandle[name] = function (elem, name, isXML) {
			var ret, handle;
			if (!isXML) {
				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[name];
				attrHandle[name] = ret;
				ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
				attrHandle[name] = handle;
			}
			return ret;
		};
	});

	var rfocusable = /^(?:input|select|textarea|button)$/i;

	jQuery.fn.extend({
		prop: function prop(name, value) {
			return access(this, jQuery.prop, name, value, arguments.length > 1);
		},

		removeProp: function removeProp(name) {
			return this.each(function () {
				delete this[jQuery.propFix[name] || name];
			});
		}
	});

	jQuery.extend({
		propFix: {
			"for": "htmlFor",
			"class": "className"
		},

		prop: function prop(elem, name, value) {
			var ret,
			    hooks,
			    notxml,
			    nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if (!elem || nType === 3 || nType === 8 || nType === 2) {
				return;
			}

			notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

			if (notxml) {
				// Fix name and attach hooks
				name = jQuery.propFix[name] || name;
				hooks = jQuery.propHooks[name];
			}

			if (value !== undefined) {
				return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : elem[name] = value;
			} else {
				return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
			}
		},

		propHooks: {
			tabIndex: {
				get: function get(elem) {
					return elem.hasAttribute("tabindex") || rfocusable.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
				}
			}
		}
	});

	if (!support.optSelected) {
		jQuery.propHooks.selected = {
			get: function get(elem) {
				var parent = elem.parentNode;
				if (parent && parent.parentNode) {
					parent.parentNode.selectedIndex;
				}
				return null;
			}
		};
	}

	jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
		jQuery.propFix[this.toLowerCase()] = this;
	});

	var rclass = /[\t\r\n\f]/g;

	jQuery.fn.extend({
		addClass: function addClass(value) {
			var classes,
			    elem,
			    cur,
			    clazz,
			    j,
			    finalValue,
			    proceed = typeof value === "string" && value,
			    i = 0,
			    len = this.length;

			if (jQuery.isFunction(value)) {
				return this.each(function (j) {
					jQuery(this).addClass(value.call(this, j, this.className));
				});
			}

			if (proceed) {
				// The disjunction here is for better compressibility (see removeClass)
				classes = (value || "").match(rnotwhite) || [];

				for (; i < len; i++) {
					elem = this[i];
					cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ");

					if (cur) {
						j = 0;
						while (clazz = classes[j++]) {
							if (cur.indexOf(" " + clazz + " ") < 0) {
								cur += clazz + " ";
							}
						}

						// only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim(cur);
						if (elem.className !== finalValue) {
							elem.className = finalValue;
						}
					}
				}
			}

			return this;
		},

		removeClass: function removeClass(value) {
			var classes,
			    elem,
			    cur,
			    clazz,
			    j,
			    finalValue,
			    proceed = arguments.length === 0 || typeof value === "string" && value,
			    i = 0,
			    len = this.length;

			if (jQuery.isFunction(value)) {
				return this.each(function (j) {
					jQuery(this).removeClass(value.call(this, j, this.className));
				});
			}
			if (proceed) {
				classes = (value || "").match(rnotwhite) || [];

				for (; i < len; i++) {
					elem = this[i];
					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "");

					if (cur) {
						j = 0;
						while (clazz = classes[j++]) {
							// Remove *all* instances
							while (cur.indexOf(" " + clazz + " ") >= 0) {
								cur = cur.replace(" " + clazz + " ", " ");
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = value ? jQuery.trim(cur) : "";
						if (elem.className !== finalValue) {
							elem.className = finalValue;
						}
					}
				}
			}

			return this;
		},

		toggleClass: function toggleClass(value, stateVal) {
			var type = typeof value === "undefined" ? "undefined" : _typeof(value);

			if (typeof stateVal === "boolean" && type === "string") {
				return stateVal ? this.addClass(value) : this.removeClass(value);
			}

			if (jQuery.isFunction(value)) {
				return this.each(function (i) {
					jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
				});
			}

			return this.each(function () {
				if (type === "string") {
					// Toggle individual class names
					var className,
					    i = 0,
					    self = jQuery(this),
					    classNames = value.match(rnotwhite) || [];

					while (className = classNames[i++]) {
						// Check each className given, space separated list
						if (self.hasClass(className)) {
							self.removeClass(className);
						} else {
							self.addClass(className);
						}
					}

					// Toggle whole class name
				} else if (type === strundefined || type === "boolean") {
					if (this.className) {
						// store className if set
						data_priv.set(this, "__className__", this.className);
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					this.className = this.className || value === false ? "" : data_priv.get(this, "__className__") || "";
				}
			});
		},

		hasClass: function hasClass(selector) {
			var className = " " + selector + " ",
			    i = 0,
			    l = this.length;
			for (; i < l; i++) {
				if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
					return true;
				}
			}

			return false;
		}
	});

	var rreturn = /\r/g;

	jQuery.fn.extend({
		val: function val(value) {
			var hooks,
			    ret,
			    isFunction,
			    elem = this[0];

			if (!arguments.length) {
				if (elem) {
					hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];

					if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
						return ret;
					}

					ret = elem.value;

					return typeof ret === "string" ?
					// Handle most common string cases
					ret.replace(rreturn, "") :
					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction(value);

			return this.each(function (i) {
				var val;

				if (this.nodeType !== 1) {
					return;
				}

				if (isFunction) {
					val = value.call(this, i, jQuery(this).val());
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if (val == null) {
					val = "";
				} else if (typeof val === "number") {
					val += "";
				} else if (jQuery.isArray(val)) {
					val = jQuery.map(val, function (value) {
						return value == null ? "" : value + "";
					});
				}

				hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

				// If set returns undefined, fall back to normal setting
				if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
					this.value = val;
				}
			});
		}
	});

	jQuery.extend({
		valHooks: {
			option: {
				get: function get(elem) {
					var val = jQuery.find.attr(elem, "value");
					return val != null ? val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim(jQuery.text(elem));
				}
			},
			select: {
				get: function get(elem) {
					var value,
					    option,
					    options = elem.options,
					    index = elem.selectedIndex,
					    one = elem.type === "select-one" || index < 0,
					    values = one ? null : [],
					    max = one ? index + 1 : options.length,
					    i = index < 0 ? max : one ? index : 0;

					// Loop through all the selected options
					for (; i < max; i++) {
						option = options[i];

						// IE6-9 doesn't update selected after form reset (#2551)
						if ((option.selected || i === index) && (
						// Don't return options that are disabled or in a disabled optgroup
						support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {

							// Get the specific value for the option
							value = jQuery(option).val();

							// We don't need an array for one selects
							if (one) {
								return value;
							}

							// Multi-Selects return an array
							values.push(value);
						}
					}

					return values;
				},

				set: function set(elem, value) {
					var optionSet,
					    option,
					    options = elem.options,
					    values = jQuery.makeArray(value),
					    i = options.length;

					while (i--) {
						option = options[i];
						if (option.selected = jQuery.inArray(option.value, values) >= 0) {
							optionSet = true;
						}
					}

					// Force browsers to behave consistently when non-matching value is set
					if (!optionSet) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	});

	// Radios and checkboxes getter/setter
	jQuery.each(["radio", "checkbox"], function () {
		jQuery.valHooks[this] = {
			set: function set(elem, value) {
				if (jQuery.isArray(value)) {
					return elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0;
				}
			}
		};
		if (!support.checkOn) {
			jQuery.valHooks[this].get = function (elem) {
				return elem.getAttribute("value") === null ? "on" : elem.value;
			};
		}
	});

	// Return jQuery for attributes-only inclusion


	jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "), function (i, name) {

		// Handle event binding
		jQuery.fn[name] = function (data, fn) {
			return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
		};
	});

	jQuery.fn.extend({
		hover: function hover(fnOver, fnOut) {
			return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
		},

		bind: function bind(types, data, fn) {
			return this.on(types, null, data, fn);
		},
		unbind: function unbind(types, fn) {
			return this.off(types, null, fn);
		},

		delegate: function delegate(selector, types, data, fn) {
			return this.on(types, selector, data, fn);
		},
		undelegate: function undelegate(selector, types, fn) {
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
		}
	});

	var nonce = jQuery.now();

	var rquery = /\?/;

	// Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON = function (data) {
		return JSON.parse(data + "");
	};

	// Cross-browser xml parsing
	jQuery.parseXML = function (data) {
		var xml, tmp;
		if (!data || typeof data !== "string") {
			return null;
		}

		// Support: IE9
		try {
			tmp = new DOMParser();
			xml = tmp.parseFromString(data, "text/xml");
		} catch (e) {
			xml = undefined;
		}

		if (!xml || xml.getElementsByTagName("parsererror").length) {
			jQuery.error("Invalid XML: " + data);
		}
		return xml;
	};

	var rhash = /#.*$/,
	    rts = /([?&])_=[^&]*/,
	    rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	    rnoContent = /^(?:GET|HEAD)$/,
	    rprotocol = /^\/\//,
	    rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,


	/* Prefilters
  * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
  * 2) These are called:
  *    - BEFORE asking for a transport
  *    - AFTER param serialization (s.data is a string if s.processData is true)
  * 3) key is the dataType
  * 4) the catchall symbol "*" can be used
  * 5) execution will start with transport dataType and THEN continue down to "*" if needed
  */
	prefilters = {},


	/* Transports bindings
  * 1) key is the dataType
  * 2) the catchall symbol "*" can be used
  * 3) selection will start with transport dataType and THEN go to "*" if needed
  */
	transports = {},


	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*"),


	// Document location
	ajaxLocation = window.location.href,


	// Segment location into parts
	ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports(structure) {

		// dataTypeExpression is optional and defaults to "*"
		return function (dataTypeExpression, func) {

			if (typeof dataTypeExpression !== "string") {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
			    i = 0,
			    dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];

			if (jQuery.isFunction(func)) {
				// For each dataType in the dataTypeExpression
				while (dataType = dataTypes[i++]) {
					// Prepend if requested
					if (dataType[0] === "+") {
						dataType = dataType.slice(1) || "*";
						(structure[dataType] = structure[dataType] || []).unshift(func);

						// Otherwise append
					} else {
						(structure[dataType] = structure[dataType] || []).push(func);
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {

		var inspected = {},
		    seekingTransport = structure === transports;

		function inspect(dataType) {
			var selected;
			inspected[dataType] = true;
			jQuery.each(structure[dataType] || [], function (_, prefilterOrFactory) {
				var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
				if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
					options.dataTypes.unshift(dataTypeOrTransport);
					inspect(dataTypeOrTransport);
					return false;
				} else if (seekingTransport) {
					return !(selected = dataTypeOrTransport);
				}
			});
			return selected;
		}

		return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend(target, src) {
		var key,
		    deep,
		    flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for (key in src) {
			if (src[key] !== undefined) {
				(flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
			}
		}
		if (deep) {
			jQuery.extend(true, target, deep);
		}

		return target;
	}

	/* Handles responses to an ajax request:
  * - finds the right dataType (mediates between content-type and expected dataType)
  * - returns the corresponding response
  */
	function ajaxHandleResponses(s, jqXHR, responses) {

		var ct,
		    type,
		    finalDataType,
		    firstDataType,
		    contents = s.contents,
		    dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while (dataTypes[0] === "*") {
			dataTypes.shift();
			if (ct === undefined) {
				ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
			}
		}

		// Check if we're dealing with a known content-type
		if (ct) {
			for (type in contents) {
				if (contents[type] && contents[type].test(ct)) {
					dataTypes.unshift(type);
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if (dataTypes[0] in responses) {
			finalDataType = dataTypes[0];
		} else {
			// Try convertible dataTypes
			for (type in responses) {
				if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
					finalDataType = type;
					break;
				}
				if (!firstDataType) {
					firstDataType = type;
				}
			}
			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if (finalDataType) {
			if (finalDataType !== dataTypes[0]) {
				dataTypes.unshift(finalDataType);
			}
			return responses[finalDataType];
		}
	}

	/* Chain conversions given the request and the original response
  * Also sets the responseXXX fields on the jqXHR instance
  */
	function ajaxConvert(s, response, jqXHR, isSuccess) {
		var conv2,
		    current,
		    conv,
		    tmp,
		    prev,
		    converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if (dataTypes[1]) {
			for (conv in s.converters) {
				converters[conv.toLowerCase()] = s.converters[conv];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while (current) {

			if (s.responseFields[current]) {
				jqXHR[s.responseFields[current]] = response;
			}

			// Apply the dataFilter if provided
			if (!prev && isSuccess && s.dataFilter) {
				response = s.dataFilter(response, s.dataType);
			}

			prev = current;
			current = dataTypes.shift();

			if (current) {

				// There's only work to do if current dataType is non-auto
				if (current === "*") {

					current = prev;

					// Convert response if prev dataType is non-auto and differs from current
				} else if (prev !== "*" && prev !== current) {

					// Seek a direct converter
					conv = converters[prev + " " + current] || converters["* " + current];

					// If none found, seek a pair
					if (!conv) {
						for (conv2 in converters) {

							// If conv2 outputs current
							tmp = conv2.split(" ");
							if (tmp[1] === current) {

								// If prev can be converted to accepted input
								conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
								if (conv) {
									// Condense equivalence converters
									if (conv === true) {
										conv = converters[conv2];

										// Otherwise, insert the intermediate dataType
									} else if (converters[conv2] !== true) {
										current = tmp[0];
										dataTypes.unshift(tmp[1]);
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if (conv !== true) {

						// Unless errors are allowed to bubble, catch and return them
						if (conv && s["throws"]) {
							response = conv(response);
						} else {
							try {
								response = conv(response);
							} catch (e) {
								return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend({

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: ajaxLocation,
			type: "GET",
			isLocal: rlocalProtocol.test(ajaxLocParts[1]),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
   timeout: 0,
   data: null,
   dataType: null,
   username: null,
   password: null,
   cache: null,
   throws: false,
   traditional: false,
   headers: {},
   */

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /xml/,
				html: /html/,
				json: /json/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function ajaxSetup(target, settings) {
			return settings ?

			// Building a settings object
			ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) :

			// Extending ajaxSettings
			ajaxExtend(jQuery.ajaxSettings, target);
		},

		ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
		ajaxTransport: addToPrefiltersOrTransports(transports),

		// Main method
		ajax: function ajax(url, options) {

			// If url is an object, simulate pre-1.5 signature
			if ((typeof url === "undefined" ? "undefined" : _typeof(url)) === "object") {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			    responseHeaders,

			// timeout handle
			timeoutTimer,

			// Cross-domain detection vars
			parts,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// Create the final options object
			s = jQuery.ajaxSetup({}, options),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			    completeDeferred = jQuery.Callbacks("once memory"),

			// Status-dependent callbacks
			_statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			    requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function getResponseHeader(key) {
					var match;
					if (state === 2) {
						if (!responseHeaders) {
							responseHeaders = {};
							while (match = rheaders.exec(responseHeadersString)) {
								responseHeaders[match[1].toLowerCase()] = match[2];
							}
						}
						match = responseHeaders[key.toLowerCase()];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function getAllResponseHeaders() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function setRequestHeader(name, value) {
					var lname = name.toLowerCase();
					if (!state) {
						name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
						requestHeaders[name] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function overrideMimeType(type) {
					if (!state) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function statusCode(map) {
					var code;
					if (map) {
						if (state < 2) {
							for (code in map) {
								// Lazy-add the new callback in a way that preserves old ones
								_statusCode[code] = [_statusCode[code], map[code]];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always(map[jqXHR.status]);
						}
					}
					return this;
				},

				// Cancel the request
				abort: function abort(statusText) {
					var finalText = statusText || strAbort;
					if (transport) {
						transport.abort(finalText);
					}
					done(0, finalText);
					return this;
				}
			};

			// Attach deferreds
			deferred.promise(jqXHR).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;

			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""];

			// A cross-domain request is in order when we have a protocol:host:port mismatch
			if (s.crossDomain == null) {
				parts = rurl.exec(s.url.toLowerCase());
				s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? "80" : "443")) !== (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443"))));
			}

			// Convert data if not already a string
			if (s.data && s.processData && typeof s.data !== "string") {
				s.data = jQuery.param(s.data, s.traditional);
			}

			// Apply prefilters
			inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

			// If request was aborted inside a prefilter, stop there
			if (state === 2) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if (fireGlobals && jQuery.active++ === 0) {
				jQuery.event.trigger("ajaxStart");
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test(s.type);

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;

			// More options handling for requests with no content
			if (!s.hasContent) {

				// If data is available, append data to url
				if (s.data) {
					cacheURL = s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data;
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add anti-cache in url if needed
				if (s.cache === false) {
					s.url = rts.test(cacheURL) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace(rts, "$1_=" + nonce++) :

					// Otherwise add one to the end
					cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++;
				}
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if (s.ifModified) {
				if (jQuery.lastModified[cacheURL]) {
					jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
				}
				if (jQuery.etag[cacheURL]) {
					jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
				}
			}

			// Set the correct header, if data is being sent
			if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
				jqXHR.setRequestHeader("Content-Type", s.contentType);
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);

			// Check for headers option
			for (i in s.headers) {
				jqXHR.setRequestHeader(i, s.headers[i]);
			}

			// Allow custom headers/mimetypes and early abort
			if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			for (i in { success: 1, error: 1, complete: 1 }) {
				jqXHR[i](s[i]);
			}

			// Get transport
			transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

			// If no transport, we auto-abort
			if (!transport) {
				done(-1, "No Transport");
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if (fireGlobals) {
					globalEventContext.trigger("ajaxSend", [jqXHR, s]);
				}
				// Timeout
				if (s.async && s.timeout > 0) {
					timeoutTimer = setTimeout(function () {
						jqXHR.abort("timeout");
					}, s.timeout);
				}

				try {
					state = 1;
					transport.send(requestHeaders, done);
				} catch (e) {
					// Propagate exception as error if not done
					if (state < 2) {
						done(-1, e);
						// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}

			// Callback for when everything is done
			function done(status, nativeStatusText, responses, headers) {
				var isSuccess,
				    success,
				    error,
				    response,
				    modified,
				    statusText = nativeStatusText;

				// Called once
				if (state === 2) {
					return;
				}

				// State is "done" now
				state = 2;

				// Clear timeout if it exists
				if (timeoutTimer) {
					clearTimeout(timeoutTimer);
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if (responses) {
					response = ajaxHandleResponses(s, jqXHR, responses);
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert(s, response, jqXHR, isSuccess);

				// If successful, handle type chaining
				if (isSuccess) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if (s.ifModified) {
						modified = jqXHR.getResponseHeader("Last-Modified");
						if (modified) {
							jQuery.lastModified[cacheURL] = modified;
						}
						modified = jqXHR.getResponseHeader("etag");
						if (modified) {
							jQuery.etag[cacheURL] = modified;
						}
					}

					// if no content
					if (status === 204 || s.type === "HEAD") {
						statusText = "nocontent";

						// if not modified
					} else if (status === 304) {
						statusText = "notmodified";

						// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {
					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if (status || !statusText) {
						statusText = "error";
						if (status < 0) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = (nativeStatusText || statusText) + "";

				// Success/Error
				if (isSuccess) {
					deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
				} else {
					deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
				}

				// Status-dependent callbacks
				jqXHR.statusCode(_statusCode);
				_statusCode = undefined;

				if (fireGlobals) {
					globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
				}

				// Complete
				completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

				if (fireGlobals) {
					globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
					// Handle the global AJAX counter
					if (! --jQuery.active) {
						jQuery.event.trigger("ajaxStop");
					}
				}
			}

			return jqXHR;
		},

		getJSON: function getJSON(url, data, callback) {
			return jQuery.get(url, data, callback, "json");
		},

		getScript: function getScript(url, callback) {
			return jQuery.get(url, undefined, callback, "script");
		}
	});

	jQuery.each(["get", "post"], function (i, method) {
		jQuery[method] = function (url, data, callback, type) {
			// Shift arguments if data argument was omitted
			if (jQuery.isFunction(data)) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			return jQuery.ajax({
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			});
		};
	});

	jQuery._evalUrl = function (url) {
		return jQuery.ajax({
			url: url,
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		});
	};

	jQuery.fn.extend({
		wrapAll: function wrapAll(html) {
			var wrap;

			if (jQuery.isFunction(html)) {
				return this.each(function (i) {
					jQuery(this).wrapAll(html.call(this, i));
				});
			}

			if (this[0]) {

				// The elements to wrap the target around
				wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

				if (this[0].parentNode) {
					wrap.insertBefore(this[0]);
				}

				wrap.map(function () {
					var elem = this;

					while (elem.firstElementChild) {
						elem = elem.firstElementChild;
					}

					return elem;
				}).append(this);
			}

			return this;
		},

		wrapInner: function wrapInner(html) {
			if (jQuery.isFunction(html)) {
				return this.each(function (i) {
					jQuery(this).wrapInner(html.call(this, i));
				});
			}

			return this.each(function () {
				var self = jQuery(this),
				    contents = self.contents();

				if (contents.length) {
					contents.wrapAll(html);
				} else {
					self.append(html);
				}
			});
		},

		wrap: function wrap(html) {
			var isFunction = jQuery.isFunction(html);

			return this.each(function (i) {
				jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
			});
		},

		unwrap: function unwrap() {
			return this.parent().each(function () {
				if (!jQuery.nodeName(this, "body")) {
					jQuery(this).replaceWith(this.childNodes);
				}
			}).end();
		}
	});

	jQuery.expr.filters.hidden = function (elem) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
	};
	jQuery.expr.filters.visible = function (elem) {
		return !jQuery.expr.filters.hidden(elem);
	};

	var r20 = /%20/g,
	    rbracket = /\[\]$/,
	    rCRLF = /\r?\n/g,
	    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	    rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams(prefix, obj, traditional, add) {
		var name;

		if (jQuery.isArray(obj)) {
			// Serialize array item.
			jQuery.each(obj, function (i, v) {
				if (traditional || rbracket.test(prefix)) {
					// Treat each array item as a scalar.
					add(prefix, v);
				} else {
					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(prefix + "[" + ((typeof v === "undefined" ? "undefined" : _typeof(v)) === "object" ? i : "") + "]", v, traditional, add);
				}
			});
		} else if (!traditional && jQuery.type(obj) === "object") {
			// Serialize object item.
			for (name in obj) {
				buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
			}
		} else {
			// Serialize scalar item.
			add(prefix, obj);
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function (a, traditional) {
		var prefix,
		    s = [],
		    add = function add(key, value) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction(value) ? value() : value == null ? "" : value;
			s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
		};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if (traditional === undefined) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if (jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) {
			// Serialize the form elements
			jQuery.each(a, function () {
				add(this.name, this.value);
			});
		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for (prefix in a) {
				buildParams(prefix, a[prefix], traditional, add);
			}
		}

		// Return the resulting serialization
		return s.join("&").replace(r20, "+");
	};

	jQuery.fn.extend({
		serialize: function serialize() {
			return jQuery.param(this.serializeArray());
		},
		serializeArray: function serializeArray() {
			return this.map(function () {
				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop(this, "elements");
				return elements ? jQuery.makeArray(elements) : this;
			}).filter(function () {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
			}).map(function (i, elem) {
				var val = jQuery(this).val();

				return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function (val) {
					return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
				}) : { name: elem.name, value: val.replace(rCRLF, "\r\n") };
			}).get();
		}
	});

	jQuery.ajaxSettings.xhr = function () {
		try {
			return new XMLHttpRequest();
		} catch (e) {}
	};

	var xhrId = 0,
	    xhrCallbacks = {},
	    xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	    xhrSupported = jQuery.ajaxSettings.xhr();

	// Support: IE9
	// Open requests must be manually aborted on unload (#5280)
	// See https://support.microsoft.com/kb/2856746 for more info
	if (window.attachEvent) {
		window.attachEvent("onunload", function () {
			for (var key in xhrCallbacks) {
				xhrCallbacks[key]();
			}
		});
	}

	support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport(function (options) {
		var _callback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if (support.cors || xhrSupported && !options.crossDomain) {
			return {
				send: function send(headers, complete) {
					var i,
					    xhr = options.xhr(),
					    id = ++xhrId;

					xhr.open(options.type, options.url, options.async, options.username, options.password);

					// Apply custom fields if provided
					if (options.xhrFields) {
						for (i in options.xhrFields) {
							xhr[i] = options.xhrFields[i];
						}
					}

					// Override mime type if needed
					if (options.mimeType && xhr.overrideMimeType) {
						xhr.overrideMimeType(options.mimeType);
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if (!options.crossDomain && !headers["X-Requested-With"]) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Set headers
					for (i in headers) {
						xhr.setRequestHeader(i, headers[i]);
					}

					// Callback
					_callback = function callback(type) {
						return function () {
							if (_callback) {
								delete xhrCallbacks[id];
								_callback = xhr.onload = xhr.onerror = null;

								if (type === "abort") {
									xhr.abort();
								} else if (type === "error") {
									complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status, xhr.statusText);
								} else {
									complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined, xhr.getAllResponseHeaders());
								}
							}
						};
					};

					// Listen to events
					xhr.onload = _callback();
					xhr.onerror = _callback("error");

					// Create the abort callback
					_callback = xhrCallbacks[id] = _callback("abort");

					try {
						// Do send the request (this may raise an exception)
						xhr.send(options.hasContent && options.data || null);
					} catch (e) {
						// #14683: Only rethrow if this hasn't been notified as an error yet
						if (_callback) {
							throw e;
						}
					}
				},

				abort: function abort() {
					if (_callback) {
						_callback();
					}
				}
			};
		}
	});

	// Install script dataType
	jQuery.ajaxSetup({
		accepts: {
			script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /(?:java|ecma)script/
		},
		converters: {
			"text script": function textScript(text) {
				jQuery.globalEval(text);
				return text;
			}
		}
	});

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter("script", function (s) {
		if (s.cache === undefined) {
			s.cache = false;
		}
		if (s.crossDomain) {
			s.type = "GET";
		}
	});

	// Bind script tag hack transport
	jQuery.ajaxTransport("script", function (s) {
		// This transport only deals with cross domain requests
		if (s.crossDomain) {
			var script, _callback2;
			return {
				send: function send(_, complete) {
					script = jQuery("<script>").prop({
						async: true,
						charset: s.scriptCharset,
						src: s.url
					}).on("load error", _callback2 = function callback(evt) {
						script.remove();
						_callback2 = null;
						if (evt) {
							complete(evt.type === "error" ? 404 : 200, evt.type);
						}
					});
					document.head.appendChild(script[0]);
				},
				abort: function abort() {
					if (_callback2) {
						_callback2();
					}
				}
			};
		}
	});

	var oldCallbacks = [],
	    rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup({
		jsonp: "callback",
		jsonpCallback: function jsonpCallback() {
			var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce++;
			this[callback] = true;
			return callback;
		}
	});

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {

		var callbackName,
		    overwritten,
		    responseContainer,
		    jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if (jsonProp || s.dataTypes[0] === "jsonp") {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;

			// Insert callback into url or form data
			if (jsonProp) {
				s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
			} else if (s.jsonp !== false) {
				s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters["script json"] = function () {
				if (!responseContainer) {
					jQuery.error(callbackName + " was not called");
				}
				return responseContainer[0];
			};

			// force json dataType
			s.dataTypes[0] = "json";

			// Install callback
			overwritten = window[callbackName];
			window[callbackName] = function () {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always(function () {
				// Restore preexisting value
				window[callbackName] = overwritten;

				// Save back as free
				if (s[callbackName]) {
					// make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// save the callback name for future use
					oldCallbacks.push(callbackName);
				}

				// Call if it was a function and we have a response
				if (responseContainer && jQuery.isFunction(overwritten)) {
					overwritten(responseContainer[0]);
				}

				responseContainer = overwritten = undefined;
			});

			// Delegate to script
			return "script";
		}
	});

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function (data, context, keepScripts) {
		if (!data || typeof data !== "string") {
			return null;
		}
		if (typeof context === "boolean") {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec(data),
		    scripts = !keepScripts && [];

		// Single tag
		if (parsed) {
			return [context.createElement(parsed[1])];
		}

		parsed = jQuery.buildFragment([data], context, scripts);

		if (scripts && scripts.length) {
			jQuery(scripts).remove();
		}

		return jQuery.merge([], parsed.childNodes);
	};

	// Keep a copy of the old load method
	var _load = jQuery.fn.load;

	/**
  * Load a url into a page
  */
	jQuery.fn.load = function (url, params, callback) {
		if (typeof url !== "string" && _load) {
			return _load.apply(this, arguments);
		}

		var selector,
		    type,
		    response,
		    self = this,
		    off = url.indexOf(" ");

		if (off >= 0) {
			selector = jQuery.trim(url.slice(off));
			url = url.slice(0, off);
		}

		// If it's a function
		if (jQuery.isFunction(params)) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

			// Otherwise, build a param string
		} else if (params && (typeof params === "undefined" ? "undefined" : _typeof(params)) === "object") {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if (self.length > 0) {
			jQuery.ajax({
				url: url,

				// if "type" variable is undefined, then "GET" method will be used
				type: type,
				dataType: "html",
				data: params
			}).done(function (responseText) {

				// Save response for use in complete callback
				response = arguments;

				self.html(selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) :

				// Otherwise use the full result
				responseText);
			}).complete(callback && function (jqXHR, status) {
				self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
			});
		}

		return this;
	};

	// Attach a bunch of functions for handling common AJAX events
	jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (i, type) {
		jQuery.fn[type] = function (fn) {
			return this.on(type, fn);
		};
	});

	jQuery.expr.filters.animated = function (elem) {
		return jQuery.grep(jQuery.timers, function (fn) {
			return elem === fn.elem;
		}).length;
	};

	var docElem = window.document.documentElement;

	/**
  * Gets a window from an element
  */
	function getWindow(elem) {
		return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
	}

	jQuery.offset = {
		setOffset: function setOffset(elem, options, i) {
			var curPosition,
			    curLeft,
			    curCSSTop,
			    curTop,
			    curOffset,
			    curCSSLeft,
			    calculatePosition,
			    position = jQuery.css(elem, "position"),
			    curElem = jQuery(elem),
			    props = {};

			// Set position first, in-case top/left are set even on static elem
			if (position === "static") {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css(elem, "top");
			curCSSLeft = jQuery.css(elem, "left");
			calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if (calculatePosition) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;
			} else {
				curTop = parseFloat(curCSSTop) || 0;
				curLeft = parseFloat(curCSSLeft) || 0;
			}

			if (jQuery.isFunction(options)) {
				options = options.call(elem, i, curOffset);
			}

			if (options.top != null) {
				props.top = options.top - curOffset.top + curTop;
			}
			if (options.left != null) {
				props.left = options.left - curOffset.left + curLeft;
			}

			if ("using" in options) {
				options.using.call(elem, props);
			} else {
				curElem.css(props);
			}
		}
	};

	jQuery.fn.extend({
		offset: function offset(options) {
			if (arguments.length) {
				return options === undefined ? this : this.each(function (i) {
					jQuery.offset.setOffset(this, options, i);
				});
			}

			var docElem,
			    win,
			    elem = this[0],
			    box = { top: 0, left: 0 },
			    doc = elem && elem.ownerDocument;

			if (!doc) {
				return;
			}

			docElem = doc.documentElement;

			// Make sure it's not a disconnected DOM node
			if (!jQuery.contains(docElem, elem)) {
				return box;
			}

			// Support: BlackBerry 5, iOS 3 (original iPhone)
			// If we don't have gBCR, just use 0,0 rather than error
			if (_typeof(elem.getBoundingClientRect) !== strundefined) {
				box = elem.getBoundingClientRect();
			}
			win = getWindow(doc);
			return {
				top: box.top + win.pageYOffset - docElem.clientTop,
				left: box.left + win.pageXOffset - docElem.clientLeft
			};
		},

		position: function position() {
			if (!this[0]) {
				return;
			}

			var offsetParent,
			    offset,
			    elem = this[0],
			    parentOffset = { top: 0, left: 0 };

			// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
			if (jQuery.css(elem, "position") === "fixed") {
				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();
			} else {
				// Get *real* offsetParent
				offsetParent = this.offsetParent();

				// Get correct offsets
				offset = this.offset();
				if (!jQuery.nodeName(offsetParent[0], "html")) {
					parentOffset = offsetParent.offset();
				}

				// Add offsetParent borders
				parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
				parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
				left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
			};
		},

		offsetParent: function offsetParent() {
			return this.map(function () {
				var offsetParent = this.offsetParent || docElem;

				while (offsetParent && !jQuery.nodeName(offsetParent, "html") && jQuery.css(offsetParent, "position") === "static") {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || docElem;
			});
		}
	});

	// Create scrollLeft and scrollTop methods
	jQuery.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (method, prop) {
		var top = "pageYOffset" === prop;

		jQuery.fn[method] = function (val) {
			return access(this, function (elem, method, val) {
				var win = getWindow(elem);

				if (val === undefined) {
					return win ? win[prop] : elem[method];
				}

				if (win) {
					win.scrollTo(!top ? val : window.pageXOffset, top ? val : window.pageYOffset);
				} else {
					elem[method] = val;
				}
			}, method, val, arguments.length, null);
		};
	});

	// Support: Safari<7+, Chrome<37+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each(["top", "left"], function (i, prop) {
		jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function (elem, computed) {
			if (computed) {
				computed = curCSS(elem, prop);
				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
			}
		});
	});

	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each({ Height: "height", Width: "width" }, function (name, type) {
		jQuery.each({ padding: "inner" + name, content: type, "": "outer" + name }, function (defaultExtra, funcName) {
			// Margin is only for outerHeight, outerWidth
			jQuery.fn[funcName] = function (margin, value) {
				var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
				    extra = defaultExtra || (margin === true || value === true ? "margin" : "border");

				return access(this, function (elem, type, value) {
					var doc;

					if (jQuery.isWindow(elem)) {
						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement["client" + name];
					}

					// Get document width or height
					if (elem.nodeType === 9) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
					}

					return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css(elem, type, extra) :

					// Set width or height on the element
					jQuery.style(elem, type, value, extra);
				}, type, chainable ? margin : undefined, chainable, null);
			};
		});
	});

	// The number of elements contained in the matched element set
	jQuery.fn.size = function () {
		return this.length;
	};

	jQuery.fn.andSelf = jQuery.fn.addBack;

	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.

	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

	if (true) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return jQuery;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

	var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,


	// Map over the $ in case of overwrite
	_$ = window.$;

	jQuery.noConflict = function (deep) {
		if (window.$ === jQuery) {
			window.$ = _$;
		}

		if (deep && window.jQuery === jQuery) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ((typeof noGlobal === "undefined" ? "undefined" : _typeof(noGlobal)) === strundefined) {
		window.jQuery = window.$ = jQuery;
	}

	return jQuery;
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)(module)))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function () {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function get() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function get() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function (jqlite) {
	jqlite.JSON = {
		stringify: function stringify(json) {
			try {
				return (typeof json === 'undefined' ? 'undefined' : _typeof(json)) === 'object' ? JSON.stringify(json) : json;
			} catch (e) {
				console.error('json数据转换字符串失败：' + String(json));
			}
			return json;
		},
		parse: function parse(val) {
			try {
				return JSON.parse(val);
			} catch (e) {
				val = new Function('return ' + val + ';')();
				if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) !== 'object') {
					console.error('json字符串转换对象失败：' + String(val));
					return null;
				};
			}
			return val;
		}
	};

	jqlite.vm = function (el, data) {
		var MVVM = __webpack_require__(9);
		return new MVVM(el, data);
	};

	jqlite.vm.addParser = function (rules) {
		var Parser = __webpack_require__(1);
		Parser.add(rules);
	};

	jqlite.vm.addEventFilter = function (filters, type) {
		var Parser = __webpack_require__(1);
		Parser.addEventFilter(filters, type);
	};

	jqlite.vm.setVMPre = function (setting) {
		var Parser = __webpack_require__(1);
		Parser.setVMPre(setting);
	};
	jqlite.vm.getVMPre = function () {
		var Parser = __webpack_require__(1);
		return Parser.getVMPre();
	};

	jqlite.BaseComponent = __webpack_require__(14);
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
	var $ = __webpack_require__(0).JQLite;
	var Compiler = __webpack_require__(10);

	/**
  * MVVM 构造函数入口
  * @param  {JQLite}      element  [视图的挂载节点]
  * @param  {Object}      model    [数据模型对象]
  */
	function MVVM(element, model) {

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
	mp.destroy = function () {
		if (!this.vm) return;
		this.vm.destroy();
		this.backup = this.vm = this.$data = null;
	};

	/**
  * 重置数据模型至初始状态
  * @param   {Array|String}  key  [数据模型字段，或字段数组，空则重置所有]
  */
	mp.reset = function (key) {
		var vm = this.$data;

		if ($.util.isString(key)) {
			vm[key] = backup[key];
		} else if ($.isArray(key)) {
			$.util.each(key, function (i, v) {
				vm[v] = backup[v];
			});
		} else {
			$.util.each(vm, function (k, v) {
				vm[k] = backup[k];
			});
		}
	};

	mp.extend = function (target, source) {
		for (var k in source) {
			var tObj = target[k],
			    sObj = source[k];
			var tf = typeof tObj === 'undefined' ? 'undefined' : _typeof(tObj);
			if (['undefined', 'function'].indexOf(tf) > -1) continue;
			if (tObj instanceof Array) {
				target[k] = sObj instanceof Array ? $.extend(true, [], sObj) : [];
			} else if (tf === 'object') {
				this.extend(tObj, sObj);
			} else {
				target[k] = sObj;
			}
		}
	};

	/**
  * 设置绑定数据
  */
	mp.setData = function (obj) {
		var viewData = this.getData();
		for (var k in obj) {
			var func = new Function('d', 'v', 'try{d.' + k + '=v;}catch(e){console.error(e);}');
			var v = obj[k];
			if ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object') v = JSON.parse(JSON.stringify(v));
			func(viewData, v);
		}
	};

	/**
  * 设置数据变化回调
  */
	mp.dataChange = function (cb) {
		var _this = this;
		this.vm.$element.on('__mvvmDataChange', function (e, options) {
			var pre = _this.getVMPre() + '.';
			if (options.path.indexOf(pre) === 0) {
				options.path = options.path.replace(pre, '');
			}
			cb.call(_this, JSON.parse(JSON.stringify(options)));
		});
	};

	/**
  * 获取 mvvm 绑定的数据
  */
	mp.getData = function () {
		var pre = this.getVMPre();
		return pre ? this.$data[pre] : this.$data;
	};

	/**
  * 获取vm前缀
  */
	mp.getVMPre = function (type) {
		return this.vm.parser.getVmPre(type);
	};

	module.exports = MVVM;
})();

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
	var $ = __webpack_require__(0).JQLite;
	var Parser = __webpack_require__(1);

	var BRACE2RE = /\{\{([^\}]*)\}\}/;
	var SPLITRE = /[\:\#\$\*\.]/;
	var TEMPTEXT = '$$text';

	var compileUtil = {
		isDirective: function isDirective(directive) {
			//判断是否是指令
			return directive.indexOf('v-') === 0;
		},
		getDirName: function getDirName(dir) {
			//获取指令名，v-bind -> vbind
			return dir.split(SPLITRE)[0].replace('-', '');
		},
		isInPre: function isInPre($node) {
			//是否需要预编译
			return $node.isElement() && ($node.hasAttr('v-if') || $node.hasAttr('v-for') || $node.hasAttr('v-pre'));
		},
		useTemplate: function useTemplate($node) {
			return $node.isElement() && !$node.hasAttr('v-for') && $node.hasAttr('v-template');
		},
		hasDirective: function hasDirective($node) {
			//节点是否包含指令属性
			var nodeAttrs,
			    ret = false;
			if ($node.isElement() && (nodeAttrs = $node.attrs()).length > 0) {
				$.util.each(nodeAttrs, function (i, attr) {
					if (compileUtil.isDirective(attr.name)) {
						ret = true;
						return false;
					}
				});
			} else if ($node.elementType() === '#text' && BRACE2RE.test($node.text())) {
				ret = true;
			}
			return ret;
		},
		isTheDirective: function isTheDirective(type, dir) {
			//是否为指定指令
			return dir === type;
		},
		getSlotParent: function getSlotParent(el) {
			var soltParent = el.soltParent;
			if (soltParent && soltParent.soltParent) {
				return this.getSlotParent(soltParent);
			}
			return soltParent;
		},
		getSlotChildren: function getSlotChildren(slot, root, isToggle) {
			isToggle = !!isToggle;
			var slotChild = slot.firstChild,
			    $renderChildren,
			    canAdd = isToggle;
			while (slotChild) {
				if (canAdd && slotChild.refer === root) {
					canAdd = !isToggle;
				} else if (!canAdd && slotChild.refer === root) {
					canAdd = isToggle;
				}
				if (canAdd) {
					if (!$renderChildren) {
						$renderChildren = $(slotChild);
					} else {
						$renderChildren = $.merge($renderChildren, $(slotChild));
					}
				}
				slotChild = slotChild.nextSibling;
			}

			return $renderChildren;
		}
	};

	/**
  * 指令提取和编译模块
  * @param  {JQLite|Native}      element [视图根节点]
  * @param  {Object}             model   [数据模型对象]
  */
	var Compiler = function Compiler(element, model) {

		var compiler = this;

		var $element = $(element),
		    element = $element[0];

		// $element.on('DOMNodeRemoved', function(){
		// 	compiler.destroy();
		// });

		if (!$element.isElement() || $element.length === 0) {
			return $.util.warn('第一个参数element必须是一个原生DOM对象或者一个JQLite对象: ', element);
		}

		if (!$.util.isObject(model)) {
			return $.util.warn('第二个参数model必须是一个JSON对象: ', model);
		}

		//缓存根节点
		this.$element = $element;
		this.slotParent = element.isComponent ? element.slotParent : null;

		//数据模型对象
		this.$data = model;

		//子取值域挂载对象
		$.util.defRec(model, '$alias', {});

		//实例化解析器
		this.parser = new Parser(this);

		this.init();
	};

	var cp = Compiler.prototype;

	//初始化
	cp.init = function () {
		this.root = this.$element[0];
		//按步骤编译
		this.compileSteps(this.$element);
	};

	/**
  * 按步骤编译节点
  * @param   {JQFragment|JQLite}    $element            [文档碎片/节点]
  * @param   {Object}               fors                [for别名映射]
  * @param   {Boolean}              isHold              [是否保持指令不删除]
  */
	cp.compileSteps = function ($element, fors, isHold) {
		//指令节点缓存
		var directiveNodes = [];
		//第一步：深度遍历并缓存指令节点
		this.walkElement($element, fors, directiveNodes);
		//第二步：编译所有指令节点
		this.compileDirectives(directiveNodes, isHold);
	};
	/**
  * 深度遍历并缓存指令节点
  * @param   {JQFragment|JQLite}    $element            [文档碎片/节点]
  * @param   {Object}               fors                [for别名映射]
  * @param   {Array}                directiveNodes      [指令节点缓存]
  */
	cp.walkElement = function ($element, fors, directiveNodes) {

		var _this = this;

		$element.each(function () {
			var $node = $(this);

			// 若节点使用模板，预先对模板进行注入
			if (compileUtil.useTemplate($node)) _this.compileTemplate($node, fors);

			if ($node.hasAttr('vmignore')) return;

			var isRoot = _this.root === this;
			if (!isRoot && this.isSlotParent) {
				if (compileUtil.hasDirective($node)) {
					directiveNodes.push({
						el: $node,
						fors: fors
					});
				}

				var $renderChildren = compileUtil.getSlotChildren(this, _this.root, true);
				if ($renderChildren) _this.walkElement($renderChildren, fors, directiveNodes);

				return;
			}

			if (this.isComponent && !isRoot) {
				//缓存指令节点
				if (compileUtil.hasDirective($node)) {
					directiveNodes.push({
						el: $node,
						fors: fors
					});
				}
				if (compileUtil.isInPre($node)) return;
				//对slot子节点递归调用
				// _this.walkElement($(this.slotParent).childs(), fors, directiveNodes);
				if (!this.slotParent) return;

				var $renderChildren = compileUtil.getSlotChildren(this.slotParent.firstChild, _this.root);
				if ($renderChildren) _this.walkElement($renderChildren, fors, directiveNodes);
				return;
			} else if (this.isComponent && isRoot) {
				_this.walkElement($node.childs(), fors, directiveNodes);
				return;
			}

			var ignoreRoot = $node.hasAttr('vmignoreroot');

			if (!ignoreRoot || ignoreRoot && !isRoot) {
				//缓存指令节点
				if (compileUtil.hasDirective($node)) {
					directiveNodes.push({
						el: $node,
						fors: fors
					});
				}
			}

			if (compileUtil.isInPre($node)) return;

			if (ignoreRoot && !isRoot) return;

			//对子节点递归调用
			_this.walkElement($node.childs(), fors, directiveNodes);
		});
	};

	/**
  * 编译所有指令节点
  * @param   {Array}     directiveNodes      [指令节点缓存]
  * @param   {Boolean}   isHold              [是否保持指令不删除]
  */
	cp.compileDirectives = function (directiveNodes, isHold) {
		$.util.each(directiveNodes, function (i, info) {
			this.compileDirective(info, isHold);
		}, this);
	};

	/**
  * 编译单个指令节点
  * @param   {Array}    info                [{$node, fors}]
  * @param   {Boolean}  isHold              [是否保持指令不删除]
  */
	cp.compileDirective = function (info, isHold) {
		var $node = info.el,
		    fors = info.fors;

		if ($node.isElement()) {
			var nodeAttrs = $node.attrs(),
			    priorityDirs = {
				vfor: null,
				vlike: null,
				vfilter: null,
				vcontext: null,
				vif: null
			};

			$.util.each(nodeAttrs, function (i, attr) {
				var name = attr.name;
				if (compileUtil.isDirective(name)) {
					if (compileUtil.isTheDirective('v-for', name)) {
						priorityDirs.vfor = attr; //v-for指令节点其他指令延后编译
						var filterAttr = $node.attr('v-filter');
						if (filterAttr) priorityDirs.vfilter = { name: 'v-filter', value: filterAttr };
						return false;
					} else if (compileUtil.isTheDirective('v-like', name)) {
						priorityDirs.vlike = attr; //v-like指令节点优先编译
						return null;
					} else if (compileUtil.isTheDirective('v-context', name)) {
						priorityDirs.vcontext = attr; //v-like指令节点优先编译
						return null;
					} else if (compileUtil.isTheDirective('v-if', name) || compileUtil.isTheDirective('v-elseif', name) || compileUtil.isTheDirective('v-else', name)) {
						priorityDirs.vif = attr; //v-if指令最后编译
						return null;
					}
				} else {
					return null;
				}
			});

			//对指令优先级进行处理
			if (priorityDirs.vfor) {
				nodeAttrs = [priorityDirs.vfor];
				if (priorityDirs.vfilter) nodeAttrs.unshift(priorityDirs.vfilter);
			} else {
				if (priorityDirs.vlike) nodeAttrs.unshift(priorityDirs.vlike);
				if (priorityDirs.vcontext) nodeAttrs.unshift(priorityDirs.vcontext);
			}
			if (priorityDirs.vif) {
				nodeAttrs = [priorityDirs.vif];
			}

			//编译节点指令
			$.util.each(nodeAttrs, function (i, attr) {
				this.compile($node, attr, fors, isHold);
			}, this);
		} else if ($node.elementType() === '#text') {
			//编译文本指令
			this.compileText($node, fors, isHold);
		}
	};

	/**
  * 编译元素节点指令
  * @param   {JQLite}       $node
  * @param   {Object}       attr
  * @param   {Array}        fors
  * @param   {Boolean}      isHold
  */
	cp.compile = function ($node, attr, fors, isHold) {
		var dir = attr.name;
		var exp = attr.value;
		var args = [$node, fors, exp, dir];

		// 移除指令标记
		if (!isHold) $node.removeAttr(dir);

		//获取对应指令解析器
		var hander = this.parser[compileUtil.getDirName(dir)];

		if (hander) {
			hander.apply(hander, args);
		} else {
			$.util.warn('指令 [' + dir + '] 未添加规则!');
		}
	};

	/**
  * 编译模板节点 {{template}}
  * @param   {JQLite}       $node
  * @param   {Object}       fors
  * @param   {Boolean}      isHold
  */
	cp.compileTemplate = function ($node, fors, isHold) {
		var attr = {
			name: 'v-template',
			value: $node.attr('v-template')
		};

		this.compile($node, attr, fors, isHold);
	};

	/**
  * 编译文本节点 {{text}}
  * @param   {JQLite}       $node
  * @param   {Object}       fors
  * @param   {Boolean}      isHold
  */
	cp.compileText = function ($node, fors, isHold) {

		var text = $node.text().trim().replace(/\n/g, '').replace(/\"/g, '\\"');

		//a{{b}}c -> "a"+b+"c"，其中a和c不能包含英文双引号"，否则会编译报错
		text = ('"' + text.replace(new RegExp(BRACE2RE.source, 'g'), function (s, s1) {
			return '"+(__$extend.toString(' + s1 + '))+"';
		}) + '"').replace(/(\+"")|(""\+)/g, '');

		if (isHold) {
			$node.parent().attr('v-text', text);
		}

		var vtext = this.parser.vtext;
		vtext.call(vtext, $node, fors, text, 'v-text');
	};

	/**
  * 销毁
  */
	cp.destroy = function () {
		this.parser.destroy();
		this.parser = this.$data = null;
	};

	module.exports = Compiler;
})();

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {

	var $ = __webpack_require__(0).JQLite;

	/**
  * updater 视图刷新模块
  */
	function Updater(vm) {
		this.vm = vm;
		this.eventHandler = this.createEventHandler();
	}

	var up = Updater.prototype;

	//事件处理器
	up.createEventHandler = function () {
		return {
			callbacks: {},
			index: 2016,
			listeners: {},
			add: function add($node, evt, callback, context) {
				var index = this.index++;

				this.callbacks[index] = callback;

				this.listeners[index] = function () {
					callback.apply(context || this, arguments);
				};
				$node.__on__(evt, this.listeners[index]);
			},
			remove: function remove($node, evt, callback) {
				var _this = this;
				// 找到对应的 callback index
				$.util.each(this.callbacks, function (index, cb) {
					if (cb === callback) {
						$node.off(evt, _this.listeners[index]);
						delete _this.callbacks[index];
						delete _this.listeners[index];
						return false;
					}
				});
			}
		};
	};

	/**
  * 更新节点的文本内容 realize v-text
  * @param   {JQLite}      $node
  * @param   {String}      text
  */
	up.updateTextContent = function ($node, text) {
		$node.textContent(String(text));
	};

	/**
  * 更新节点的 html 内容 realize v-html
  * @param   {JQLite}      $node
  * @param   {String}      html
  */
	up.updateHTMLContent = function ($node, html) {
		// $node.each(function(){
		// 	if(this.setHtml){
		// 		this.setHtml(html);
		// 	}else{
		// 		this.clear();
		// 		this.appendChild($.parseHTML(String(html)));
		// 	}
		// });
		$node.html(html);
	};

	/**
  * 更新节点vfor数据 realize v-for
  * @param   {JQLite}      $parent    [父节点对象]
  * @param   {Object}      $node      [vfor指令节点对象]
  * @param   {Object}      options    [操作选项]
  * @param   {Function}    cb         [回调函数]
  */
	up.updateList = function ($parent, $node, options, cb) {
		var method = options.method;
		switch (method) {
			case 'xReset':
				this.updateListXReset.apply(this, arguments);
				break;
			case 'pop':
				this.updateListPop.apply(this, arguments);
				break;
			case 'xPush':
			case 'push':
				this.updateListPush.apply(this, arguments);
				break;
			case 'shift':
				this.updateListShift.apply(this, arguments);
				break;
			case 'unshift':
				this.updateListUnshift.apply(this, arguments);
				break;
			case 'splice':
				this.updateListSplice.apply(this, arguments);
				break;
			case 'xSort':
			case 'sort':
			case 'reverse':
				this.updateListCommon.apply(this, arguments);
				break;
			default:
				$.util.log('尚未处理' + method + '方法');
		}
	};

	//获取vfor数据的第一个节点
	var getVforFirstChild = function getVforFirstChild(children) {
		return children.length === 0 ? null : children[0];
	};

	//获取vfor数据的最后一个节点
	var getVforLastChild = function getVforLastChild(children) {
		return children.length === 0 ? null : children[children.length - 1];
	};

	//获取vfor数据的所有节点
	// var getVforChildren = function($parent, vforIndex){
	// 	var $children = $parent.childs(), len = $children.length;
	// 	var arr = [];
	// 	$parent.childs().each(function(){
	// 		var $child = $(this);
	// 		if($child.data('vforIndex')===vforIndex){
	// 			arr.push($child);
	// 		}
	// 	})
	// 	return arr;
	// };

	function copyFragment($fragment, arr) {
		arr = arr || [];
		$fragment.children().each(function () {
			arr.push($(this));
		});
		return arr;
	}

	up.updateListXReset = function ($parent, $node, options, cb) {
		var cbrs = cb(options.args, true),
		    $fragment = cbrs.$fragment,
		    children = cbrs.domList,
		    copy$fragment = copyFragment($fragment);
		var $placeholder = $node.def('$placeholder');
		if ($placeholder) {
			var before$placeholder = $placeholder.before,
			    $next = before$placeholder.next();
			//var children = getVforChildren($parent, options['vforIndex']);
			while ($next && $next.length === 1 && !$next.def('isPlaceholder')) {
				$next.remove();
				$next = before$placeholder.next();
			}
			$fragment.insertAfter(before$placeholder);
		} else {
			// var children = getVforChildren($parent, options['vforIndex']);
			if (children.length === 0) {
				$fragment.appendTo($parent);
			} else {
				$fragment.replaceTo(children[0]);
				$.util.each(children, function (i, $child) {
					//$parent.remove($child);
					$child.remove();
				});
			}
		}
		copy$fragment.unshift(0, children.length);
		children.splice.apply(children, copy$fragment);
	};

	up.updateListPop = function ($parent, $node, options, cb) {
		var cbrs = cb(options.args),
		    children = cbrs.domList;
		var $placeholder = $node.def('$placeholder');
		if ($placeholder) {
			var after$placeholder = $placeholder.after;
			var $last = after$placeholder.prev();
			$last && $last.length === 1 && !$last.def('isPlaceholder') && $last.remove();
		} else {
			var $children = getVforFirstChild(children);
			$children && $children.remove();
		}
		children.pop();
	};

	up.updateListPush = function ($parent, $node, options, cb) {
		var cbrs = cb(options.args, true),
		    $fragment = cbrs.$fragment,
		    children = cbrs.domList,
		    copy$fragment = copyFragment($fragment);
		var $placeholder = $node.def('$placeholder');
		if ($placeholder) {
			var after$placeholder = $placeholder.after;
			$fragment.insertBefore(after$placeholder);
		} else {
			var $children = getVforLastChild(children);
			if ($children && $children.length > 0) {
				$fragment.insertAfter($children);
			} else {
				$fragment.appendTo($parent);
			}
		}
		children.push.apply(children, copy$fragment);
	};

	up.updateListShift = function ($parent, $node, options, cb) {
		var cbrs = cb(options.args),
		    children = cbrs.domList;
		var $placeholder = $node.def('$placeholder');
		if ($placeholder) {
			var before$placeholder = $placeholder.before;
			var $first = before$placeholder.next();
			$first && $first.length === 1 && !$first.def('isPlaceholder') && $first.remove();
		} else {
			var $children = getVforFirstChild(children);
			$children && $children.remove();
		}
		children.shift();
	};

	up.updateListUnshift = function ($parent, $node, options, cb) {
		var cbrs = cb(options.args, true),
		    $fragment = cbrs.$fragment,
		    children = cbrs.domList,
		    copy$fragment = copyFragment($fragment);
		var $placeholder = $node.def('$placeholder');
		if ($placeholder) {
			var before$placeholder = $placeholder.before;
			$fragment.insertAfter(before$placeholder);
		} else {
			var $children = getVforFirstChild(children);
			if ($children && $children.length > 0) {
				$fragment.insertBefore($children);
			} else {
				$fragment.appendTo($parent);
			}
		}
		children.unshift.apply(children, copy$fragment);
	};

	up.updateListSplice = function ($parent, $node, options, cb) {

		var cbrs = cb(options.args),
		    children = cbrs.domList,
		    copy$fragment = [];

		var $placeholder = $node.def('$placeholder');

		var args = $.util.copyArray(options.args);
		var startP = args.shift(),
		    rank = args.shift(),
		    spliceLen;

		if (typeof rank === 'undefined') rank = children.length;

		spliceLen = startP + (rank || 1);

		for (var i = startP; i < spliceLen; i++) {
			var $child = children[i];
			if (args.length > 0) {
				// var $fragment = cb(args);
				var child$cbrs = cb(args, true),
				    $fragment = child$cbrs.$fragment;
				copy$fragment.push.apply(copy$fragment, copyFragment($fragment));
				if ($child) {
					$fragment.insertBefore($child);
				} else {
					if ($placeholder) {
						var after$placeholder = $placeholder.after;
						$fragment.insertBefore(after$placeholder);
					} else {
						$fragment.appendTo($parent);
					}
				}
				args = [];
			};
			if (rank !== 0) $child && $child.remove();
		}

		copy$fragment.unshift(startP, rank);

		children.splice.apply(children, copy$fragment);
	};

	up.updateListCommon = function ($parent, $node, options, cb) {
		var cbrs = cb(options.args),
		    children = cbrs.domList,
		    copy$fragment;
		var $placeholder = $node.def('$placeholder');
		var args = options.newArray;
		for (var i = 0, len = children.length; i < len; i++) {
			var $child = children[i];
			if (args.length > 0) {
				var child$cbrs = cb(args, true),
				    $fragment = child$cbrs.$fragment,
				    copy$fragment = copyFragment($fragment);
				if ($child) {
					$fragment.insertBefore($child);
				} else {
					if ($placeholder) {
						var after$placeholder = $placeholder.after;
						$fragment.insertBefore(after$placeholder);
					} else {
						$fragment.appendTo($parent);
					}
				}
				args = [];
			};
			$child && $child.remove();
		}
		if (copy$fragment) {
			copy$fragment.unshift(0, children.length);
			children.splice.apply(children, copy$fragment);
		}
	};

	/**
  * 更新节点显隐 realize v-show
  * @param   {JQLite}     $node            [节点对象]
  * @param   {String}     defaultValue     [默认值]
  * @param   {Boolean}    isDisplay        [是否显示]
  */
	up.updateShowHide = function ($node, defaultValue, isDisplay) {
		$node.css('display', isDisplay ? defaultValue === 'none' ? null : defaultValue : 'none');
	};

	var __RENDER = '__render'; //缓存标记

	/**
  * 互斥节点内容渲染
  */
	up.mutexRender = function ($node, cb, isShow) {

		var $placeholder = $node.def('__$placeholder'),
		    $fragment = $placeholder.def('__$fragment'),
		    $replace = $placeholder.def('__$replace');

		// 渲染
		if (isShow) {
			cb($node);
			if ($replace) {
				$fragment.append($replace);
			}
			$node.insertAfter($placeholder);
			$placeholder.def('__$replace', $node);
		} else {
			$fragment.append($node);
		}
	};
	up.branchRender = function ($placeholder, $node, cb) {
		var $old = $placeholder.def('old');
		$old && $old.remove();
		if ($node) {
			cb($node);
			$node.insertAfter($placeholder);
		}
		$placeholder.def('old', $node);
	};

	/**
  * 更新节点的 attribute realize v-bind
  * @param   {JQLite}      $node
  * @param   {String}      attribute
  * @param   {String}      value
  */
	up.updateAttribute = function ($node, attribute, value) {
		// null 则移除该属性
		if (value === null) {
			$node.removeAttr(attribute);
		} else {
			$node.attr(attribute, value);
		}
	};

	/**
  * 更新节点的 class realize v-bind:class
  * @param   {JQLite}              $node
  * @param   {String|Object}       className
  * @param   {Boolean}             isAdd
  */
	up.updateClass = function ($node, className, isAdd) {
		if (arguments.length === 2) {
			$.util.each(className, function (name, flag) {
				this.updateClass($node, name, flag);
			}, this);
		} else {
			$node[isAdd ? 'addClass' : 'removeClass'](className);
		}
	};

	/**
  * 更新节点的 style realize v-bind:style
  * @param   {JQLite}      $node
  * @param   {String}      property  [属性名称]
  * @param   {String}      value     [样式值]
  */
	up.updateStyle = function ($node, property, value) {
		if (arguments.length === 2) {
			$.util.each(property, function (name, val) {
				this.updateStyle($node, name, val);
			}, this);
		} else {
			if ($node.css(property) !== value) {
				$node.css(property, value);
			}
		}
	};

	/**
  * 更新 value realize v-model
  * @param   {JQLite}  $text
  * @param   {String}        value
  */
	up.updateValue = function ($text, value) {
		if ($text.val() !== value) {
			$text.val(value);
		}
	};

	/**
  * 更新 radio 的激活状态 realize v-model
  * @param   {JQLite/input}  $radio
  * @param   {String} value
  */
	up.updateRadioChecked = function ($radio, value) {
		var checkStatus = $radio.val() === ($.util.isNotNaNNumber(value) ? String(value) : value);
		if ($radio.xprop('checked') != checkStatus) $radio.xprop('checked', checkStatus);
	};

	/**
  * 更新 checkbox 的激活状态 realize v-model
  * @param   {JQLite/input}          $checkbox
  * @param   {Array|Boolean}         values      [激活数组或状态]
  */
	up.updateCheckboxChecked = function ($checkbox, values) {
		var value = $checkbox.val();

		if (!$.isArray(values) && !$.util.isBoolean(values)) {
			return $.util.warn('Checkbox v-model value must be a type of Boolean or Array');
		}

		if ($checkbox.hasAttr('number')) {
			value = +value;
		}

		var checkStatus = $.util.isBoolean(values) ? values : values.indexOf(value) > -1;

		if ($checkbox.xprop('checked') != checkStatus) $checkbox.xprop('checked', checkStatus);
	};

	/**
  * 更新 swtich 的激活状态 realize v-model
  * @param   {JQLite/input}          $checkbox
  * @param   {Boolean}               value      [激活数组或状态]
  */
	up.updateSwitchChecked = function ($switch, value) {
		var checkStatus = !!value;
		if ($switch.xprop('checked') != checkStatus) $switch.xprop('checked', checkStatus);
	};

	/**
  * 更新 select 的激活状态 realize v-model
  * @param   {JQLite/select}         $select
  * @param   {Array|String}          selected  [选中值]
  * @param   {Boolean}               multi
  */
	up.updateSelectChecked = function ($select, selected, multi) {
		// var getNumber = $select.hasAttr('number');
		// var $options = $select.children(), leng = $options.length;
		// var multiple = multi || $select.hasAttr('multiple');

		// $options.each(function(i){
		// 	var $option = $(this);
		// 	var value = $option.val();
		// 	value = getNumber ? +value : ($option.hasAttr('number') ? +value : value);
		// 	$option.prop('selected', multiple ? selected.indexOf(value) > -1 : selected === value);
		// });
		$select.val(selected);
	};

	module.exports = Updater;
})();

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {

	var $ = __webpack_require__(0).JQLite;
	var Observer = __webpack_require__(13);

	var watcherUtil = {
		iterator: function iterator(deps, subs) {
			//深度遍历订阅
			if (!deps || deps.length === 0) return subs;
			var dep = deps.shift();
			var sub = subs[dep] = subs[dep] || {};
			return this.iterator(deps, sub);
		},
		fomateSubPath: function fomateSubPath(path) {
			//格式化订阅路径
			return path.replace(/\.([^\.]+)/g, '["$1"]');
		},
		deleteSub: function deleteSub(subs, $access) {
			//删除订阅
			var func = new Function('subs', 'delete subs.' + this.fomateSubPath($access) + ';');
			func(subs);
		},
		swapSub: function swapSub(subs, tSub, oSub) {
			//交换订阅绑定
			var func = new Function('subs', 'subs.' + this.fomateSubPath(tSub) + ' = subs.' + this.fomateSubPath(oSub) + ';');
			func(subs);
		},
		typeExts: {
			string: ['length', 'endsWith', 'indexOf', 'substr', 'substring', 'toLowerCase', 'toUpperCase', 'replace', 'charAt'],
			array: ['length', 'indexOf']
		},
		getTypeExts: function getTypeExts(val) {
			var type = (val instanceof Array ? 'array' : typeof val === 'undefined' ? 'undefined' : _typeof(val)).toLowerCase();
			return $.util.copyArray(watcherUtil.typeExts[type] || []);
		}
	};

	/**
  * watcher 数据订阅模块
  * @param   {Parser}  parser       [Parser示例对象]
  * @param   {Object}  model        [数据模型]
  */
	function Watcher(parser, model) {

		this.parser = parser;

		this.$model = model;

		//依赖订阅缓存
		this.$depSub = {};
		this.$directDepSub = {};

		this.swapFuncCache = {};
		this.delFuncCache = {};

		this.observer = new Observer(model, this);
	}

	Watcher.addTypeExt = function (type, exts) {
		watcherUtil[type] = (watcherUtil[type] || []).concat(exts);
	};

	var wp = Watcher.prototype;

	/**
  * watch订阅数据改变回调
  * @param   {Object}    options
  */
	wp.change = function (options) {
		var exts = watcherUtil.getTypeExts(options.newArray || options.newVal);
		$.util.each(exts, function (i, ext) {
			exts[i] = options.path + '.' + ext;
		});
		exts.unshift(options.path);
		var subs = this.$depSub;

		$.util.each(exts, function (index, ext) {
			var sub = watcherUtil.iterator(ext.split('.'), subs);
			$.util.each(sub['$'] || [], function (i, cb) {
				cb(_extends({}, options, { path: ext }), i);
			});
		});
	};

	wp.changeDirect = function () {
		$.util.each(this.$directDepSub, function (k, arr) {
			$.util.each(arr, function (i, cb) {
				cb({ path: k }, i);
			});
		});
	};

	wp.makeSwapFunc = function ($access) {
		if (this.swapFuncCache[$access]) return this.swapFuncCache[$access];
		var prePath = watcherUtil.fomateSubPath($access);
		var func = new Function('subs', 'tIndex', 'oIndex', 'subs.' + prePath + '[tIndex] = subs.' + prePath + '[oIndex];');
		return this.swapFuncCache[$access] = func;
	};

	wp.makeDelFunc = function ($access) {
		if (this.delFuncCache[$access]) return this.delFuncCache[$access];
		var prePath = watcherUtil.fomateSubPath($access);
		var func = new Function('subs', 'index', 'delete subs.' + prePath + '[index];');
		return this.delFuncCache[$access] = func;
	};

	/**
  * 订阅依赖集合的变化回调
  * @param   {Object}    depends
  * @param   {Function}  callback
  * @param   {Object}    fors
  */
	wp.watch = function (depends, callback, fors) {
		var parser = this.parser,
		    _this = this;
		var subs = this.$depSub;
		$.util.each(depends, function (i, dep) {
			// list[0].username   list[0].attrs[1].username
			var _dep = dep.replace(/\[/, '.').replace(/\]/, '');
			var isDirect = _dep === dep ? false : true;
			dep = _dep;
			if (isDirect) {
				_this.$directDepSub[dep] = _this.$directDepSub[dep] || [];
				_this.$directDepSub[dep].push(function () {
					parser.watchBack(fors, callback, arguments);
				});
			} else {
				var sub = watcherUtil.iterator(dep.split('.'), subs);
				sub['$'] = sub['$'] || [];

				sub['$'].push(function () {
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
	wp.updateIndex = function ($access, options, cb, handlerFlag) {
		var method = options.method;
		switch (method) {
			case 'pop':
				this.updateIndexForPop.apply(this, arguments);
				break;
			case 'xPush':
			case 'push':
				this.updateIndexForPush.apply(this, arguments);
				break;
			case 'shift':
				this.updateIndexForShift.apply(this, arguments);
				break;
			case 'unshift':
				this.updateIndexForUnshift.apply(this, arguments);
				break;
			case 'splice':
				this.updateIndexForSplice.apply(this, arguments);
				break;
			/*case 'revers' :
   case 'sort' :
   case 'xSort' :*/
			default:
				break;
		}
	};

	wp.updateIndexForPop = function ($access, options, cb, handlerFlag) {
		var subs = this.$depSub;
		var len = options.oldLen;
		var delFunc = this.makeDelFunc($access);
		if (handlerFlag) delFunc(subs, len - 1); // watcherUtil.deleteSub(subs, $access+'.'+(len-1));
	};

	wp.updateIndexForPush = function ($access, options, cb, handlerFlag) {};

	wp.updateIndexForShift = function ($access, options, cb, handlerFlag) {
		var len = options.oldLen;
		var subs = this.$depSub;
		var swapFunc = this.makeSwapFunc($access);
		var delFunc = this.makeDelFunc($access);
		for (var i = 1; i < len; i++) {
			var ni = i - 1,
			    oPath = $access + '.' + i,
			    nPath = $access + '.' + ni,
			    oIndexPath = oPath + '.*',
			    nIndexPath = nPath + '.*';

			if (handlerFlag) swapFunc(subs, ni, i); // watcherUtil.swapSub(subs, nPath, oPath);

			cb({
				path: nIndexPath,
				oldVal: i,
				newVal: ni
			});
		}

		if (handlerFlag) delFunc(subs, len - 1); //watcherUtil.deleteSub(subs, $access+'.'+(len-1));
	};

	wp.updateIndexForUnshift = function ($access, options, cb, handlerFlag) {
		var len = options.oldLen;
		var gap = options.newLen - options.oldLen;
		var subs = this.$depSub;
		var swapFunc = this.makeSwapFunc($access);
		var delFunc = this.makeDelFunc($access);
		for (var i = len - 1; i > -1; i--) {
			var ni = i + gap,
			    oPath = $access + '.' + i,
			    nPath = $access + '.' + ni,
			    oIndexPath = oPath + '.*',
			    nIndexPath = nPath + '.*';

			if (handlerFlag) swapFunc(subs, ni, i); //watcherUtil.swapSub(subs, nPath, oPath);

			cb({
				path: nIndexPath,
				oldVal: i,
				newVal: ni
			});
		}

		if (!handlerFlag) return;
		for (var i = 0; i < gap; i++) {
			// watcherUtil.deleteSub(subs, $access+'.'+i);
			delFunc(subs, i);
		}
	};

	wp.updateIndexForSplice = function ($access, options, cb, handlerFlag) {

		var args = $.util.copyArray(options.args),
		    start = args.shift(),
		    rank = args.shift(),
		    len = options.oldLen,
		    gap = 0;

		var subs = this.$depSub;

		var swapFunc = this.makeSwapFunc($access);
		var delFunc = this.makeDelFunc($access);

		if (options.args.length === 1) {
			if (!handlerFlag) return;
			for (var i = start; i < len; i++) {
				// watcherUtil.deleteSub(subs, $access+'.'+i);
				delFunc(subs, i);
			}
		} else if (rank === 0) {
			var len = options.oldLen;
			var gap = options.newLen - options.oldLen;
			var subs = this.$depSub;

			for (var i = len - 1; i > start - 1; i--) {
				var ni = i + gap,
				    oPath = $access + '.' + i,
				    nPath = $access + '.' + ni,
				    oIndexPath = oPath + '.*',
				    nIndexPath = nPath + '.*';

				if (handlerFlag) swapFunc(subs, ni, i); //watcherUtil.swapSub(subs, nPath, oPath);

				cb({
					path: nIndexPath,
					oldVal: i,
					newVal: ni
				});
			}

			if (!handlerFlag) return;
			for (var i = start; i < start + gap; i++) {
				// watcherUtil.deleteSub(subs, $access+'.'+i);
				delFunc(subs, i);
			}
		} else {
			var pos = start + rank;
			gap = args.length - rank;

			for (var i = pos; i < len; i++) {

				var ni = i + gap,
				    oPath = $access + '.' + i,
				    nPath = $access + '.' + ni,
				    oIndexPath = oPath + '.*',
				    nIndexPath = nPath + '.*';

				if (handlerFlag) swapFunc(subs, ni, i); // watcherUtil.swapSub(subs, nPath, oPath);

				cb({
					path: nIndexPath,
					oldVal: i,
					newVal: ni
				});
			}
			if (!handlerFlag) return;
			if (gap < 0) {
				for (var i = len + gap; i < len; i++) {
					// watcherUtil.deleteSub(subs, $access+'.'+i);
					delFunc(subs, i);
				}
			} else if (gap > 0) {
				for (var i = start; i < pos + 1; i++) {
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
	wp.destroy = function () {
		this.observer.destroy();
		this.$depSub = {};
		this.$directDepSub = {};
		this.swapFuncCache = {};
		this.delFuncCache = {};
		this.parser = this.observer = null;
	};

	module.exports = Watcher;
})();

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {

	var $ = __webpack_require__(0).JQLite;

	var util = {
		def: function def(obj, prop, val) {
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
		var fn = fn || function (a, b) {
			return a > b;
		};
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
		if (pos > len) {
			return this.push(item);
		} else if (pos < 0) {
			return this.unshift(item);
		}
		return this.splice(pos, 1, item);
	});

	// 增加$reset方法重置数组，如果没有参数则重置为空数组
	util.def(__arrProto, '$reset', function (arr) {
		return this.splice.apply(this, [0, this.length || 1].concat(arr || []));
	});

	// 重写的数组操作方法
	var rewriteArrayMethods = ['pop', 'push', 'sort', 'shift', 'splice', 'unshift', 'reverse', 'xSort', 'xPush'];

	var observeUtil = {
		isNeed: function isNeed(val) {
			return $.isArray(val) ? 2 : $.util.isObject(val) ? 1 : 0;
		}
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
		try {
			this.watcher.parser.vm.$element.triggerHandler('__mvvmDataChange', [options]);
		} catch (e) {
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

			if (!isArr) this.observeObject(object, ps, value, parent);

			if (observeUtil.isNeed(value)) {
				this.observe(value, ps, object);
			}
		}, this);

		return this;
	};

	op.updateTruePaths = function (paths, obj, parent) {
		var len = paths.length;
		if (len > 2) {
			var lastIndex = len - 2,
			    last = paths[lastIndex],
			    p = last.p;
			if ($.util.isNumber(p)) {
				var trueIndex = $.inArray(obj, parent);
				if (trueIndex > -1) last.p = trueIndex;
			}
		}
	};

	op.formatPaths = function (paths) {
		var ps = [];
		$.util.each(paths, function (index, path) {
			ps.push(path.p);
		});
		return ps;
	};

	op.getAllPathFromArr = function (obj, arr, property) {
		var paths = arr.oPaths;
		var pObj = this.getPObj(obj, arr, property);
		return paths.concat([pObj]);
	};

	op.getPObj = function (obj, arr, property) {
		if (!$.isArray(arr)) return { p: property };
		var pObj = {};
		$.util.defObj(pObj, 'p', function () {
			return $.inArray(obj, arr);
		});
		return pObj;
	};

	op.isEqual = function (a, b) {
		var ta = typeof a === 'undefined' ? 'undefined' : _typeof(a),
		    tb = typeof b === 'undefined' ? 'undefined' : _typeof(b);
		if (ta !== tb) return false;
		if (ta === 'object') {
			return JSON.stringify(a) === JSON.stringify(b);
		}
		return a === b;
	};

	/**
  * 拦截对象属性存取描述符（绑定监测）
  * @param   {Object|Array}  object  [对象或数组]
  * @param   {Array}         paths   [访问路径数组]
  * @param   {Any}           val     [默认值]
  */
	op.observeObject = function (object, paths, val, parent) {
		var prop = paths[paths.length - 1].p;
		var descriptor = Object.getOwnPropertyDescriptor(object, prop);
		var getter = descriptor.get,
		    setter = descriptor.set,
		    ob = this;

		// 已经监测过则无需检测， 至更新关键变量
		if (getter && getter.__o__) {
			return;
		};

		var Getter = function Getter() {
			return getter ? getter.call(object) : val;
		};
		Getter.__o__ = true;

		var Setter = function Setter(newValue) {
			var oldValue = getter ? getter.call(object) : val;

			// ob.updateTruePaths(paths, object, parent);

			var myPath = ob.formatPaths(paths).join('.');

			if (ob.isEqual(newValue, oldValue)) {
				return;
			}

			// 新值为对象或数组重新监测
			var isNeed = observeUtil.isNeed(newValue);
			if (isNeed) {
				if (isNeed === 1) $.extend(true, oldValue || {}, newValue);
				if (isNeed === 2) {
					try {
						oldValue.$reset(newValue);
					} catch (e) {
						// 如果赋值的为数组，但是初始值不是数组，则需要执行setter
						if (setter) {
							setter.call(object, newValue);
						} else {
							val = newValue;
						}

						ob.trigger({
							path: myPath,
							oldVal: oldValue,
							newVal: newValue
						});
					}
				}
				ob.observe(newValue, paths, parent);
				return;
			}

			if (setter) {
				setter.call(object, newValue);
			} else {
				val = newValue;
			}

			// 触发变更回调
			ob.trigger({
				path: myPath,
				oldVal: oldValue,
				newVal: newValue
			});
		};

		// 定义 object[prop] 的 getter 和 setter
		Object.defineProperty(object, prop, {
			get: Getter,
			set: Setter
		});
	};

	/**
  * 重写数组方法的回调处理
  * 由于有的数组可能被同时render到不同的视图中，这时候需要区分当前触发的是哪个视图
  * @param   {Array}     array  [目标数组]
  * @param   {Number}    index  [observ对象的索引]
  * @param   {Funciton}  cb     [当前数组的回调函数]
  */
	var rewriteArrayMethodsCallback = function () {

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
	}();

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
		if (arrCbs[this.observeIndex]) return;

		rewriteArrayMethodsCallback(array, this.observeIndex, function (item) {
			// 重新检测，仅对变化部分重新监听，以提高性能，但仍需优化
			_this.reObserveArray(item, paths);

			item.path = _this.formatPaths(paths).join('.');

			// 触发回调
			_this.trigger(item);
		});
	};

	op.reObserveArray = function (item, paths) {
		var inserted,
		    method = item.method,
		    arr = item.newArray,
		    args = item.args,
		    _this = this,
		    start;

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
			$.util.each(inserted, function (index, obj) {
				// var ps = paths.slice(0).concat([{p:start+index}]);
				var ps = paths.slice(0).concat([_this.getPObj(obj, arr)]);
				// _this.observeObject(inserted, ps, obj);
				_this.observe(obj, ps, arr);
			});
		}
	};

	// 销毁
	op.destroy = function () {
		this.$subs = {};
	};

	module.exports = Observer;
})();

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseComponent = function () {
    function BaseComponent(el) {
        _classCallCheck(this, BaseComponent);

        this.jsDom = el;
    }

    _createClass(BaseComponent, [{
        key: '__initInnerDom',
        value: function __initInnerDom() {
            var jsDom = this.jsDom,
                $ = __webpack_require__(0).JQLite;
            jsDom.component = this;
            jsDom.isComponent = true;
            if (jsDom.slotParent) jsDom.slotParent.isSlotParent = true;
            this.$ = $;
            this.$jsDom = $(jsDom);
            var root = jsDom.getRootElement && jsDom.getRootElement();
            if (root) {
                root.trueDom = jsDom;
                this.root = root;
                this.$root = $(root);
            } else {
                this.$root = this.$jsDom;
            }

            // this.__setThisData();
        }
    }, {
        key: '__setThisData',
        value: function __setThisData(isCreat) {
            if (this.data) return;
            if (!this.viewData && isCreat) {
                this.viewData = {};
            }
            var viewData = this.viewData;
            if (!viewData) return;
            if (!viewData.data) viewData.data = {};
            var pre = this.__getVmPre();
            if (pre) {
                this.data = viewData[pre] = viewData[pre] || {};
            } else {
                this.data = viewData;
            }
        }
    }, {
        key: '__setViewData',
        value: function __setViewData(k, v) {
            var data = this.data,
                $jsDom = this.$jsDom,
                $ = this.$;

            data[k] = v;

            Object.defineProperty(data, k, {
                get: function get() {
                    return v;
                },
                set: function set(n) {
                    try {
                        if (String(n) !== $jsDom.attr(k)) $jsDom.attr(k, n);
                    } catch (e) {
                        $jsDom.attr(k, n);
                    }
                    if (v instanceof Array) {
                        v.$reset(n);
                    } else if ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object') {
                        $.extend(v, n);
                    } else {
                        v = n;
                    }
                }
            });
        }
    }, {
        key: '__addCommProps',
        value: function __addCommProps() {
            var props = this.props;
            if (!props) props = this.props = {};
            var $jsDom = this.$jsDom,
                comp = this;
            var commProps = {
                hidden: {
                    type: Boolean,
                    handler: function handler(val) {
                        $jsDom[val ? 'hide' : 'show']();
                    },
                    init: function init() {
                        if ($jsDom.hasAttr('hidden')) this.handler(comp.getAttrValue('hidden'));
                    }
                },
                slotClass: {
                    type: String,
                    lastVal: null,
                    handler: function handler(val) {
                        var $slot = comp.getSlotWrapper && comp.getSlotWrapper();
                        if (this.lastVal) {
                            // $jsDom.removeClass(this.lastVal);
                            $slot && $slot.removeClass(this.lastVal);
                        }
                        if (val) {
                            // $jsDom.addClass(val);
                            $slot && $slot.addClass(val);
                        }
                        this.lastVal = val;
                    },
                    init: function init() {
                        if ($jsDom.hasAttr('slotClass')) this.handler(comp.getAttrValue('slotClass'));
                    }
                }
            };
            for (var k in commProps) {
                if (!props[k]) props[k] = commProps[k];
            }
        }
    }, {
        key: '__initProto',
        value: function __initProto() {
            var _this = this;
            // var __props = [];
            // this.__props = __props;

            // 内部方法挂载
            // this.__wrapperMethod(this.methods);

            // 外部方法挂载
            // var viewData = this.viewData || {};
            // this.__wrapperMethod(viewData.methods);

            var jqUtil = __webpack_require__(2);

            // 内部事件
            for (var k in this.events) {
                var event = this.events[k];
                event.init ? event.init() : event.handler && event.handler();
            }
            var __propRefers = this.__propRefers = {};
            // 外部属性
            this.__setThisData(this.properties);
            for (var k in this.properties || {}) {
                // __props.push(k);
                __propRefers[k.toLowerCase()] = k;
                var prop = this.properties[k];
                if (prop.type === Boolean) jqUtil.booleanAttr(k); // 添加boolean类型处理
                (function (k) {
                    _this.__setViewData(k, _this.getAttrValue(k));
                    prop.handler = function (val) {
                        _this.data[k] = val;
                    };
                    prop.init = function () {};
                    prop.observer && prop.observer.call(_this, _this.getAttrValue(k));
                })(k);
            }

            // 内部属性
            for (var k in this.props || {}) {
                // __props.push(k);
                __propRefers[k.toLowerCase()] = k;
                var prop = this.props[k];
                if (prop.type === Boolean) jqUtil.booleanAttr(k); // 添加boolean类型处理
                prop.init ? prop.init() : prop.handler && prop.handler(this.getAttrValue(k));
            }
        }
    }, {
        key: '__setBeforeCreated',
        value: function __setBeforeCreated(func, args) {
            this.__beforeFuncs = this.__beforeFuncs || [];
            this.__beforeFuncs.push({
                func: func,
                args: args
            });
        }
    }, {
        key: '__triggerCreated',
        value: function __triggerCreated() {
            this.isCreated = true;
            var rs = (this.__beforeFuncs || []).splice(0);
            for (var i = 0, len = rs.length; i < len; i++) {
                var fnObj = rs[i];
                fnObj.func.apply(this, fnObj.args);
            }
        }
    }, {
        key: '__wrapperMethod',
        value: function __wrapperMethod(methods) {
            var comp = this;
            for (var k in methods || {}) {
                var method = methods[k];
                if (typeof method !== 'function') continue;
                (function (ctx, k) {
                    var oldFunc = ctx[k];
                    ctx[k] = function () {
                        if (!comp.isCreated) {
                            comp.__setBeforeCreated(ctx[k], arguments);
                            return;
                        }
                        oldFunc && oldFunc.apply(ctx, arguments);
                        return methods[k].apply(ctx, arguments);
                    };
                })(this, k);
            }
        }
    }, {
        key: '__mvvmRender',
        value: function __mvvmRender() {
            var _this2 = this;

            if (!this.viewData) return;

            this.$root //.attr('vmignoreroot', 'true')
            .on('__destroy__', function () {
                _this2.$vm.destroy();
            });
            this.$vm = this.$root.render(this.viewData);
            this.__observerData();
        }
    }, {
        key: '__getProp',
        value: function __getProp(name) {
            return this.props && this.props[name] || this.properties && this.properties[name];
        }

        // 获取属性值，基础组件内可调用

    }, {
        key: 'getAttrValue',
        value: function getAttrValue(name) {
            var prop = this.__getProp(name),
                defaultValue = prop.value,
                type = prop.type || String; // String, Number, Boolean, Object, Array, null
            if (prop.getValue) return prop.getValue(); // hook
            var attrValue = this.$jsDom.attr(name);
            if (attrValue === null || attrValue === '' || attrValue === undefined) {
                attrValue = defaultValue;
            }
            var rs = attrValue;

            if (type === Boolean) {
                rs = attrValue === 'true' || attrValue === true ? true : false;
            } else if (type === Number) {
                try {
                    var cur = Number(attrValue);
                    rs = typeof cur === 'number' ? cur : null;
                } catch (e) {
                    rs = null;
                }
            } else if (type === Object || type === Array) {
                try {
                    // rs = typeof attrValue!=='object' ? JSON.parse(attrValue) : attrValue;
                    rs = (typeof attrValue === 'undefined' ? 'undefined' : _typeof(attrValue)) !== 'object' ? new Function('try{ return ' + attrValue + ';}catch(e){return null;}')() : attrValue;
                } catch (e) {
                    rs = null;
                }
            }

            return rs;
        }
    }, {
        key: '__getVmPre',
        value: function __getVmPre() {
            return this.viewData && this.viewData.data ? 'data' : this.$.vm.getVMPre().data;
        }
    }, {
        key: '__observerData',
        value: function __observerData() {
            var _this = this;
            this.$vm.dataChange(function (options) {
                // var ps = options.path;
                // var pre = _this.__getVmPre();
                // if(pre) ps = ps.replace(pre+'.', '');
                // _this.__handlerObservers && _this.__handlerObservers([ps]);
                _this.__handlerObservers && _this.__handlerObservers([options.path]);
            });
        }
        // 设置data值，基础组件和扩展组件都可调用，对应小程序setData

    }, {
        key: 'setData',
        value: function setData(data) {
            var pre = this.__getVmPre(),
                keyArr = [];
            this.__transDataChange = true;
            for (var k in data) {
                keyArr.push(k);
                var exp = 'obj.' + (pre ? pre + '.' : '') + k;
                var val = data[k];
                if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') val = JSON.parse(JSON.stringify(val));
                new Function('obj', 'val', 'try{ ' + exp + ' = val; }catch(e){console.log(e);}')(this.viewData, val);
            }
            this.__transDataChange = false;
            this.__handlerObservers && this.__handlerObservers(keyArr);
            // var nObj = {};
            // if(pre){
            // 	nObj[pre] = obj;
            // }else{
            // 	nObj = obj;
            // }
            // if (!this.$vm){
            // 	this.$.extend(true, this.viewData, nObj);
            // }else{
            // 	this.$vm.setViewData(nObj);
            // }
        }
    }, {
        key: '__initEvent',
        value: function __initEvent() {
            this.__attrChangeHandler();
        }
    }, {
        key: '__attrChangeHandler',
        value: function __attrChangeHandler() {
            var _this3 = this;

            if (!this.attrChanged) return;
            this.$jsDom.on('attrChanged', function (e) {
                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                _this3.attrChanged.apply(_this3, args);
            });
        }
        // 组件创建回调函数，基础组件和扩展组件都可调用，对应小程序的loaded

    }, {
        key: 'created',
        value: function created() {
            this.__initInnerDom();
            // this.initViewData && this.initViewData();
            this.initProto && this.initProto();
            this.__addCommProps();
            this.__initEvent();
            this.__initProto();
            this.__mvvmRender();
            this.__triggerCreated();
        }
        // 属性变化回调，基础组件内可调用

    }, {
        key: 'attrChanged',
        value: function attrChanged(attrName, attrValue) {
            attrName = attrName.toLowerCase();
            var __propRefers = this.__propRefers;
            if (__propRefers[attrName]) {
                attrName = __propRefers[attrName];
                var prop = this.__getProp(attrName),
                    val = this.getAttrValue(attrName);
                prop.handler && prop.handler(val);
                prop.observer && prop.observer.call(this, val);
            }
        }
        // 事件触发方法，基础组件和扩展组件都可调用，对应小程序triggerEvent

    }, {
        key: 'triggerEvent',
        value: function triggerEvent(evtName, param) {
            var jsDom = this.$jsDom[0],
                k = '__before' + evtName.toLowerCase();
            if (param) {
                jsDom[k] = function (el, e) {
                    e.detail = param;
                    return this.getComponent();
                };
            }
            this.$jsDom.triggerHandler(evtName);
        }
        // 获取dom对象的component实例，基础组件和扩展组件都可调用，对应小程序selectComponent

    }, {
        key: 'selectComponent',
        value: function selectComponent(selector) {
            var selectCom = this.$root.find(selector)[0];
            return selectCom && selectCom.component;
        }
    }, {
        key: 'selectAllComponents',
        value: function selectAllComponents(selector) {
            var selectCom = this.$root.find(selector),
                rs = [];
            selectCom.each(function () {
                var curComp = this && this.component;
                if (curComp) rs.push(curComp);
            });
            return rs;
        }
    }, {
        key: '__selectAllComponents',
        value: function __selectAllComponents(selector, isFirst) {
            var $page = this.$jsDom.getPage();
            var selectCom = $page.find(selector),
                rs = [];
            selectCom.each(function () {
                var curComp = this && this.component;
                if (curComp) rs.push(curComp);
            });
            return isFirst ? rs[0] : rs;
        }
    }, {
        key: 'selectById',
        value: function selectById(id) {
            return this.__selectAllComponents('#' + id, true);
        }
    }, {
        key: 'selectByName',
        value: function selectByName(name) {
            return this.__selectAllComponents('[name="' + name + '"]');
        }
    }, {
        key: 'selectBySelector',
        value: function selectBySelector(selector, isFirst) {
            return this.__selectAllComponents(selector, isFirst);
        }
    }, {
        key: 'getValueByName',
        value: function getValueByName(name) {
            var comps = this.__selectAllComponents('[name="' + name + '"][checked="true"]');
            return comps.length > 0 ? comps[0].getAttrValue('value') : '';
        }
    }, {
        key: 'getValuesByName',
        value: function getValuesByName(name) {
            var comps = this.__selectAllComponents('[name="' + name + '"][checked="true"]'),
                rs = [];
            for (var i = 0, len = comps.length; i < len; i++) {
                rs.push(comps[0].getAttrValue('value'));
            }
            return rs;
        }
    }]);

    return BaseComponent;
}();

BaseComponent.wrapperClass = function (MyClass) {
    var Wrapper = function (_MyClass) {
        _inherits(Wrapper, _MyClass);

        function Wrapper(el) {
            _classCallCheck(this, Wrapper);

            var _this4 = _possibleConstructorReturn(this, (Wrapper.__proto__ || Object.getPrototypeOf(Wrapper)).call(this, el));

            var $ = __webpack_require__(0).JQLite;
            _this4.jsDom = el;
            _this4.$jsDom = $(el);
            _this4.initViewData && _this4.initViewData();
            // this.initProto && this.initProto();
            // this.__addCommProps();

            // 内部方法挂载
            _this4.__wrapperMethod(_this4.methods);

            // 外部方法挂载
            var viewData = _this4.viewData || {};
            _this4.__wrapperMethod(viewData.methods);
            return _this4;
        }

        return Wrapper;
    }(MyClass);

    var bp = BaseComponent.prototype;
    var cp = Wrapper.prototype;
    var methods = Object.getOwnPropertyNames(bp);
    for (var i = 0, len = methods.length; i < len; i++) {
        var k = methods[i];
        if (k === 'constructor') continue;
        if (cp[k]) {
            (function (k) {
                var bpFunc = bp[k],
                    cpFunc = cp[k];
                cp[k] = function () {
                    var args = Array.prototype.slice.apply(arguments);
                    bpFunc.apply(this, args);
                    cpFunc.apply(this, args);
                };
            })(k);
        } else {
            cp[k] = bp[k];
        }
    }

    return Wrapper;
};

function _structure(options) {
    var $ = __webpack_require__(0).JQLite;
    var json = $.extend(true, {}, options);
    // var methods = json.methods; delete json.methods;
    var properties = json.properties;delete json.properties;
    var events = json.events;delete json.events;
    var props = json.props;delete json.props;
    var observers = json.observers;delete json.observers;
    var viewData = $.isEmptyObject(json) ? properties ? {} : null : json;

    var json = {
        // methods: methods,
        properties: properties,
        events: events,
        props: props,
        viewData: viewData,
        lifecycle: {},
        observers: observers
    };
    var lifecycleFuncs = BaseComponent.lifecycleFuncs.slice(0),
        funcName;
    while (funcName = lifecycleFuncs.shift()) {
        _setLifecycleFunc(json, funcName);
    }

    return json;
}

function _setLifecycleFunc(json, funcName) {
    var func = json.viewData && json.viewData[funcName] || json.methods && json.methods[funcName];
    json.lifecycle[funcName] = func;
}

BaseComponent.lifecycleFuncs = ['onLoad', 'onShow', 'onHide', 'created'];

BaseComponent.createClass = function (options, fullTag) {
    // var json = _structure(options);

    function MyPage(jsDom) {
        this.__json = _structure(options);
    }

    MyPage.prototype = {
        created: function created() {
            var $jsDom = this.$jsDom,
                comp = this,
                json = this.__json;

            $jsDom.on('enter', function () {
                json.lifecycle.onShow && json.lifecycle.onShow.call(comp);
            });
            $jsDom.on('leave', function () {
                json.lifecycle.onHide && json.lifecycle.onHide.call(comp);
            });
            json.lifecycle.onLoad && json.lifecycle.onLoad.call(comp);

            json.lifecycle.created && json.lifecycle.created.call(comp);

            // if(json.observers) $jsDom.on('__mvvmDataChange', function(e, options){
            //     comp.mvvmDataChangeHandler(options);
            // });
        },
        mvvmDataChangeHandler: function mvvmDataChangeHandler(options) {
            var json = this.__json;
            var ps = options.path;
            var pre = this.__getVmPre();
            if (pre) ps = ps.replace(pre + '.', '');
        },
        __handlerObservers: function __handlerObservers(keyArr) {

            if (keyArr.length === 0) return;

            if (this.__transDataChange) return;

            var json = this.__json,
                observers = json.observers;
            if (!observers) return;
            for (var k in observers) {
                var ks = k.replace(/ /g, '').split(','),
                    flag = false;
                for (var i = 0, len = keyArr.length; i < len; i++) {
                    if (ks.indexOf(keyArr[i]) > -1) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    observers[k].apply(this);
                }
            }
            this.__transDataChange = false;
        },
        initViewData: function initViewData() {
            var json = this.__json;
            if (json.viewData) this.viewData = json.viewData;
        },
        initProto: function initProto() {
            var json = this.__json;
            // if(json.methods) this.methods = json.methods;
            if (json.properties) this.properties = json.properties;
            if (json.props) this.props = json.props;
            if (json.events) this.events = json.events;
        }
    };

    if (fullTag) MyPage.fullTag = fullTag;
    if (options.isNode) MyPage.isNode = true;

    return MyPage;
};

module.exports = BaseComponent;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
*	Template JS模板引擎
*	Version	:	1.0.1 beta
*	Author	:	nandy007
*   License MIT @ https://github.com/nandy007/agile-template
*/
(function () {

	var _templateCache = {},
	    _compileCache = {},
	    _config = {
		openTag: '<%', // 逻辑语法开始标签
		closeTag: '%>', // 逻辑语法结束标签
		originalTag: '#', //逻辑语法原样输出标签
		annotation: '/\\*((?!\\*/).)*\\*/', //代码注释块正则，此处为 /*注释内容*/
		escape: true // 是否编码输出变量的 HTML 字符
	},
	    _hooks = {};

	//工具类
	var _helper = {
		getDom: function getDom(id) {
			return document.getElementById(id);
		},
		cache: { //内置函数和自定义函数调用全部存放于_helper.cache里
			include: function include(str, _data) {
				_data = _data || this || {};
				return { include: _engine.render(str, _data) };
			},
			escape: function escape(s1, s2) {
				return (typeof s2 === 'undefined' ? 'undefined' : _typeof(s2)) === 'object' ? s2.include || '' : typeof s2 === 'string' ? _config.escape && !(s1 === _config.originalTag) ? s2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&apos;") : s2 : s2;
			},
			error: function error(msg) {
				_errorHandler('template.error', msg);
			}
		},
		setCache: function setCache(k, func) {
			this.cache[k] = func;
		},
		getCacheKey: function getCacheKey() {
			var _cache = this.cache,
			    arr = [];
			for (var k in _cache) {
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
		setter: function setter(id, content) {
			return _templateCache[id] = this.syntax(content);
		},
		/**
   * 获取模板内容语法解析后的内容
   * @method getter
   * @param {String} str 模板的唯一标识||模板id||模板内容
   * @return {String} 模板内容经过语法解析后的内容
   */
		getter: function getter(str) {
			var _html;
			if (_templateCache[str]) {
				return _templateCache[str];
			} else if (_html = _helper.getDom(str)) {
				_html = /^(textarea|input)$/i.test(_html.nodeName) ? _html.value : _html.innerHTML;
				return this.setter(str, _html);
			} else if (_html = _hooks.get ? _hooks.get(str) : '') {
				//此处有hook
				return this.setter(str, _html);
			} else {
				_errorHandler('template.error', { 'msg': '模板找不到输入内容为：' + str });
				return this.syntax(str || '');
			}
		},
		/**
   * 模板编译器，将模板内容转成编译器，为渲染前做准备
   * @method compile
   * @param {String} str 模板的唯一标识||模板id||模板内容
   * @return {Function(data)} 将模板编译后的函数，此函数在被调用的时候接收一个参数data，data为一个JSON对象，data会渲染编译后的模板内容结束整个模板渲染过程
   */
		compile: function compile(str) {
			var _cache = _helper.cache,
			    syntaxBody = this.getter(str);
			return function (data) {
				var dataArr = [];
				for (var k in _cache) {
					if (typeof _cache[k] === 'function') {
						(function (data, k) {
							data[k] = function () {
								return _cache[k].apply(data, arguments);
							};
						})(data, k);
					} else {
						data[k] = _cache[k];
					}
				}
				var key = str;
				for (var k in data) {
					dataArr.push('var ' + k + '=$data["' + k + '"];');
					key += k;
				}

				try {
					var fn = _compileCache[key] || new Function('$data', dataArr.join('') + syntaxBody);
					if (_templateCache[str]) {
						_compileCache[key] = fn;
					}
					return fn(data);
				} catch (e) {
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
		syntax: function syntax(str, data) {
			var _openTag = _config.openTag,
			    _closeTag = _config.closeTag,
			    _originalTag = _config.originalTag;
			var syntaxBody = "tplArr.push(__s('" + str + "').__f()";
			//此处有hooks
			syntaxBody = (_hooks.syntax ? _hooks.syntax : function (s) {
				return s;
			})(syntaxBody.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[\r\t\n]/g, '').replace(new RegExp(_config.annotation, 'g'), '').replace(new RegExp(_openTag + '[ ]*(\$data\.)?(' + _helper.getCacheKey().join('|') + ')', 'g'), _openTag + '=$1$2')
			/*[data?'replace':'toString'](new RegExp(_openTag+'(((?!'+_closeTag+').)*)'+_closeTag, 'g'), function(s, s1){
   	return _openTag
   		+s1.replace(/([^\'\"\w])([\w]+)([ ]*)([\:]?)/g, function(sa, sa1, sa2, sa3, sa4){
   			return sa1+(!sa4&&data[sa2]?'$data.':'')+sa2+sa3+sa4;
   		})
   		+_closeTag;
   })*/
			.replace(new RegExp(_openTag + '=(' + _originalTag + '?)(.*?)' + _closeTag, 'g'), "').__f(),$data.escape('$1',$2),__s('").replace(new RegExp(_openTag, 'g'), "').__f());").replace(new RegExp(_closeTag, 'g'), "tplArr.push(__s('").replace(/__s\('(((?!__f).)*)'\).__f\(\)/g, function (s, s1) {
				return "'" + s1.replace(/'/g, "\\'") + "'";
			}), data);
			return syntaxBody = "try{var tplArr=[];" + syntaxBody + ");return tplArr.join('');}catch(e){$data.error(e); return '';}";
		},
		/**
   * 模板渲染器，简化和扩展模板渲染调用
   * @method render
   * @param {String} str 模板的唯一标识||模板id||模板内容
   * @param {Object} data 要注入的JSON数据
   * @return {String} JSON数据渲染模板后的标签代码片段
   */
		render: function render(str, data) {
			if (data instanceof Array) {
				var html = '',
				    i = 0,
				    len = data.length;
				for (; i < len; i++) {
					html += this.compile(str)(data[i]);
				}
				return html;
			} else {
				return this.compile(str)(data);
			}
		},
		/**
   * 帮助类，需要在模板中要调用的自定义函数设置
   * @method helper
   * @param {String} funcName 函数名，在模板中调用方式为funcName()
   * @param {Function} func 实际的处理函数
   */
		helper: function helper(funcName, func) {
			_helper.setCache(funcName, func);
		},
		hookHelper: function hookHelper(funcName, func) {
			_helper[funcName] = func;
		},
		/**
   * 对template类进行配置设置，可进行设置的配置请参考_config内部对象
   * @method config
   * @param {String} k 配置名
   * @param {String|Boolean} v 配置内容，取值视具体配置的要求
   */
		config: function config(k, v) {
			_config[k] = v;
		},
		/**
   * 此类中包含若干可以进行hook的函数，如果开发者希望自己定义可以在此设置，所有可设置hook的函数为_engine的函数
   * @method config
   * @param {String} k 函数名
   * @param {Function} v 具体处理的函数
   */
		hooks: function hooks(k, v) {
			_hooks[k] = typeof v === 'function' ? v : new Function(String(v));
		}
	};

	/**
  * 错误处理类，当模板渲染过程出现错误会向document触发template.error事件
  * @method _errorHandler
  * @param {String} eName 事件名，此处为template.error
  * @param {Obejct} params 错误信息，开发者可以通过在监听document的template.error事件的回调函数中获取此错误信息
  */
	var _errorHandler = function _errorHandler(eName, params) {
		if (!(document && document.createEvent)) return;
		var event = document.createEvent('HTMLEvents');
		event.initEvent(eName, true, true);
		event.params = params;
		document.dispatchEvent(event);
	};

	var _template = function _template(str, data, unCompress) {
		var html = _engine.render(str, data);
		if (!unCompress) html = html.replace(/>[ \r\n]+</, '><');
		return html;
	};

	for (var k in _engine) {
		(function (k) {
			_template[k] = function () {
				return _engine[k].apply(_engine, arguments);
			};
		})(k);
	}

	if (true) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return _template;
		}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if ((typeof module === 'function' || (typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object') && _typeof(module.exports) === 'object') {
		module.exports = _template;
	} else if (typeof this.template === 'undefined') {
		this.template = _template;
	}
})();

/***/ })
/******/ ]);