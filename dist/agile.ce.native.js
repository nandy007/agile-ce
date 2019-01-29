/*
 *	Agile CE 移动前端MVVM框架
 *	Version	:	0.4.46.1548728520764 beta
 *	Author	:	nandy007
 *	License MIT @ https://github.com/nandy007/agile-ce
 */var __ACE__ = {};
var __EXPORTS_DEFINED_FACTORY__ = function() {

    if ((typeof module === "object" || typeof module === "function") && typeof module.exports === "object") {
        module.exports = __ACE__;
    }

    if (typeof window === 'undefined') return;

    const modName = window.__AGILE_CE_ID__ || 'ace';

    if (typeof window.define === "function" && window.define.amd) {
        //window.define(modName, [], function () {
        window.define([], function () {
            return __ACE__;
        });
    }

    if (!window[modName]) window[modName] = __ACE__;

};
var __EXPORTS_DEFINED__ = function (mod, modName) {
    if(modName==='JQLite'){
         for(var k in __ACE__){
            mod[k] = __ACE__[k];
         }
         __ACE__ = mod;
         __EXPORTS_DEFINED_FACTORY__();
    }else{
        __ACE__[modName] = mod;
    }
};/******/ (function(modules) { // webpackBootstrap
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


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
	var $ = __webpack_require__(0).JQLite;
	var Updater = __webpack_require__(16);
	var Watcher = __webpack_require__(17);

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

			var parser = this,
			    updater = this.updater;

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
		'von': function von($node, fors, expression, dir, isOnce) {
			var parser = this;
			var vm = this.vm,
			    scope = this.$scope;
			var evts = Parser.parseDir(dir, expression);

			$.util.each(evts, function (evt, func) {
				var depsAlias = Parser.getDepsAlias(expression, fors, 'method');

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
					var afterHandler = this['__after' + evt.toLowerCase()];
					afterHandler && afterHandler(rs);
					return rs;
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
			args.push(true);
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

				var depsAlias = Parser.getDepsAlias(exp, fors);

				exp = depsAlias.exps.join('.');

				updater.updateAttribute($node, attr, parser.getValue(exp, fors));

				var deps = depsAlias.deps;

				parser.watcher.watch(deps, function (options) {
					updater.updateAttribute($node, attr, parser.getValue(exp, fors));
				}, fors);
			});
		},
		'vstyle': function vstyle($node, fors, expression) {

			var parser = this,
			    updater = this.updater;

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
		'vclass': function vclass($node, fors, expression) {
			var parser = this,
			    updater = this.updater;

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
		'vshow': function vshow($node, fors, expression) {
			var parser = this,
			    updater = this.updater;

			var defaultValue = $node.css('display');
			if (!defaultValue || defaultValue === 'none') defaultValue = '';

			updater.updateShowHide($node, defaultValue, parser.getValue(expression, fors));

			var deps = Parser.getDepsAlias(expression, fors).deps;

			parser.watcher.watch(deps, function (options) {
				updater.updateShowHide($node, defaultValue, parser.getValue(expression, fors));
			}, fors);
		},
		'vif': function vif($node, fors, expression, dir) {

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

			var deps = Parser.getDepsAlias(expression, fors).deps;

			parser.watcher.watch(deps, function (options) {
				$node.def('__isrender', parser.getValue(expression, fors));
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
		'vmodel': function vmodel($node, fors, expression) {
			var type = $node.data('__like') || $node.elementType();
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

			var access = Parser.makeDep(expression, fors);

			// var duplexField = parser.getDuplexField(access), duplex = duplexField.duplex, field = duplexField.field;;

			updater.updateValue($node, parser.getValue(expression, fors));

			var deps = [access];
			parser.watcher.watch(deps, function () {
				updater.updateValue($node, parser.getValue(expression, fors));
			}, fors);

			Parser.bindTextEvent($node, function () {
				var access = Parser.makeDep(expression, fors);
				var duplexField = parser.getDuplexField(access),
				    duplex = duplexField.duplex(parser.$scope),
				    field = duplexField.field;
				duplex[field] = $node.val();
			});
		},
		'vmradio': function vmradio($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

			var access = Parser.makePath(expression, fors);

			var duplexField = parser.getDuplexField(access),
			    duplex = duplexField.duplex(parser.$scope),
			    field = duplexField.field;

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
				if ($node.is(':checked')) {
					var access = Parser.makeDep(expression, fors);
					var duplexField = parser.getDuplexField(access),
					    duplex = duplexField.duplex(parser.$scope),
					    field = duplexField.field;
					duplex[field] = Parser.formatValue($node, $node.val());
				}
			});
		},
		'vmcheckbox': function vmcheckbox($node, fors, expression, dir) {

			var parser = this,
			    updater = this.updater;

			var access = Parser.makePath(expression, fors);

			var duplexField = parser.getDuplexField(access),
			    duplex = duplexField.duplex(this.$scope),
			    field = duplexField.field;

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
				var duplexField = parser.getDuplexField(access),
				    duplex = duplexField.duplex(parser.$scope),
				    field = duplexField.field;

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
		'vmselect': function vmselect($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

			var access = Parser.makePath(expression, fors);

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
				var access = Parser.makeDep(expression, fors);
				var duplexField = parser.getDuplexField(access),
				    duplex = duplexField.duplex(parser.$scope),
				    field = duplexField.field;
				var selects = Parser.getSelecteds($(this));
				duplex[field] = multi ? selects : selects[0];
			});
		},
		'vmnativeselect': function vmnativeselect($node, fors, expression, dir) {
			var parser = this,
			    updater = this.updater;

			var access = Parser.makePath(expression, fors);

			var duplexField = parser.getDuplexField(access),
			    duplex = duplexField.duplex(parser.$scope),
			    field = duplexField.field;

			updater.updateValue($node, duplex[field]);

			var deps = [access];
			parser.watcher.watch(deps, function () {
				$node.val(parser.getValue(expression, fors));
			}, fors);

			Parser.bindChangeEvent($node, function () {
				var access = Parser.makePath(expression, fors);
				var duplexField = parser.getDuplexField(access),
				    duplex = duplexField.duplex(parser.$scope),
				    field = duplexField.field;
				duplex[field] = $node.val();
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
			var depsalias = Parser.getDepsAlias(expression, fors);
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
				$node.attr('acee', parser.parserIndex);
				if (dir) {
					var __directiveDef = $node.def('__directive');
					if (!__directiveDef) {
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
		return Object.create(this.vm.$data);
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
		if (name === fors.alias) return fors;
		return Parser.findMyFors(name, fors.fors);
	};

	//深度查找指令表达式的别名对应的真实路径
	Parser.deepFindScope = function (_exp, fors) {
		if (!fors) return _exp;

		var exps = _exp.split('.');

		var myFors = Parser.findMyFors(exps[0], fors);

		if (!myFors) myFors = fors;

		var alias = myFors.alias;
		var access = myFors.access;
		var $index = myFors.$index;

		var $access = Parser.deepFindScope(access, myFors.fors);

		if (_exp === access) return $access;

		$.util.each(exps, function (i, exp) {
			if (exp === '$index') {
				exps[i] = $access + '.' + myFors.$index + '.*';
			} else {
				if (alias === exp) {
					exps[i] = $access + '.' + $index;
				}
			}
		});
		if (_exp === 'itemA.active') console.log(exps);
		return exps.join('.');
	};

	//获取指令表达式的别名路径
	Parser.makePath = function (exp, fors) {
		var NOT_AVIR_RE = /[^\w\.\[\]\$]/g;
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
	Parser.makeAliasPath = function (exp, fors, type) {
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
				return s1 + 'scope.' + Parser.__addPre(s2, type);
			}
		});
		var exps = exp.split('.');
		exps[0] = /^['"\/].*$/.test(exps[0]) ? exps[0] : exps[0].replace(/[\w\$]+/, function (s) {
			if (Parser.isConst(s) || s === '$event' || s === 'scope') {
				return s;
			}

			if (s === '$index' || Parser.hasAlias(s, fors)) {
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

		var eventRefer = $node[0].__eventRefer || {}; // hook 

		var composeLock;

		// 解决中文输入时 input 事件在未选择词组时的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		$node.__on__(eventRefer.compositionstart || 'compositionstart', function () {
			composeLock = true;
		});
		$node.__on__(eventRefer.compositionend || 'compositionend', function () {
			composeLock = false;
		});

		// input 事件(实时触发)
		$node.__on__(eventRefer.input || 'input', function () {
			callbacl.apply(this, arguments);
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
		default: null
	};
	Parser.addEventFilter = function (filters) {
		for (var k in filters) {
			__eventFilter[k] = filters[k];
		}
	};
	Parser.getEventFilter = function (el, evtName) {
		if (!el) return null;
		evtName = evtName.toLowerCase();
		if (el['__before' + evtName]) return el['__before' + evtName];
		if (__eventFilter[evtName]) return __eventFilter[evtName];
		if (__eventFilter['default']) return __eventFilter['default'];
		return null;
	};

	var __vmPre = {
		data: '',
		method: ''
	};
	Parser.__addPre = function (exp, type) {
		var pre = __vmPre && __vmPre[type || 'data'] || '';
		return (pre ? pre + '.' : '') + exp;
	};
	Parser.setVMPre = function (setting) {
		__vmPre = setting;
	};
	Parser.getVMPre = function (setting) {
		return __vmPre || {};
	};

	module.exports = Parser;

	if (typeof __EXPORTS_DEFINED__ === 'function') __EXPORTS_DEFINED__(Parser, 'Parser');
})();

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("Document");

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
	var jqliteUtil = __webpack_require__(6);
	var ui = __webpack_require__(7),
	    document = __webpack_require__(2),
	    window = __webpack_require__(8),
	    Adapter = __webpack_require__(9);
	var _util = {
		setClass: function setClass(el, className) {
			var context,
			    contextFunc = el['__context'];
			if (contextFunc) context = contextFunc();
			el.setClassStyle(className, context);
			this.refresh(el);
		},
		setStyle: function setStyle(el, styleName, styleValue) {
			el.setStyle(styleName, styleValue);
			this.refresh(el);
		},
		refresh: function refresh(el) {
			// var parent = el.getParent();
			// if(parent && parent.refresh){
			// 	parent.refresh();
			// }else if(el.refresh){
			// 	el.refresh();
			// }
			document.refresh();
		},
		triggerDomChange: function triggerDomChange(el) {
			if (!el) return;
			// el.refresh && el.refresh();
			this.refresh(el);
			el.fire('__domchange__');
		}
	};
	var LISTCBS = {
		getCellId: 1,
		getView: 1,
		getCount: 1,
		getItem: 1,
		getSectionCount: 1,
		getSectionText: 1
	};
	var JQLite = function JQLite(selector, scope) {

		if (jqlite.ui.isJQS(selector)) return selector;

		if (jqlite.isFunction(selector)) {
			return jqlite(window).on('ready', selector);
		}

		var els = selector ? selector instanceof Array ? selector : typeof selector === 'string' ? selector.indexOf('<') === 0 ? jqlite.parseHTML(selector) : jqlite.parseSelector(selector, scope) : [selector] : [];

		var _this = this;

		this.domList = els;

		jqlite.util.defObj(this, 'length', function () {
			return els.length;
		}, function () {
			cons.log('不能修改length值');
		});

		jqlite.each(els, function (i, el) {
			(function (i) {
				jqlite.util.defObj(_this, i, function () {
					return els[i];
				}, function () {
					cons.log('不能修改元素内容');
				});
			})(i);
		});

		//this.data('_event', {index:0}, true);
	};

	function clearSelector(selector) {
		return selector.replace(/['"]/g, '') //去掉'和"引号
		.replace(/[ ]*([\=\:,>~])[ ]*/g, '$1') //去掉=、:、,、>、~两侧的空格
		.replace(/([\[\.])[ ]*/g, '$1') //去掉[和.右侧的空格
		.replace(/[ ]*\]/g, ']') //去掉]左侧的空格
		.replace(/[ ]+/g, ' '); //合并多个空格为一个空格
	}

	JQLite.prototype = {
		add: function add(el) {
			$el = el instanceof JQLite ? el : new JQLite(el);
			var domList = this.domList;
			$el.each(function () {
				domList.push(this);
			});
			return new JQLite(domList);
		},
		get: function get(index) {
			var len = this.domList.length;
			return new JQLite(index < 0 || index >= len ? [] : this.domList[index]);
		},
		childs: function childs(index) {
			return this.children.apply(this, arguments);
		},
		textContent: function textContent() {
			return this.text.apply(this, arguments);
		},
		attrs: function attrs() {
			return this.attr.apply(this, arguments);
		},
		isElement: function isElement() {
			return this.length > 0 && this.elementType() !== '#text';
		},
		elementType: function elementType() {
			var el = this.domList[0] || {},
			    nodeType = el.getTag && el.getTag();
			var type = nodeType;
			return type;
		},
		each: function each(callback) {
			var domList = this.domList;
			jqlite.each(this.domList, function (i, el) {
				return callback.call(el, i);
			});
			return this;
		},
		children: function children(index) {
			var arr = [];

			this.each(function () {
				var el = this;
				var children = el ? jqlite.ui.isText(el.getTag()) ? [jqlite.ui.createTextNode(el)] : el.getChildren() : [];
				if (jqlite.util.isNumber(index)) {
					arr = arr.concat(children.length === 0 ? [] : [children[index]]);
				} else if (jqlite.util.isString(index)) {
					arr = arr.concat(jqlite.parseSelector(index, el, 'children'));
				} else {
					arr = arr.concat(children);
				}
			});

			return new JQLite(arr);
		},
		parent: function parent() {
			var arr = [];
			this.each(function () {
				var el = this;
				if (el = el.getParent && el.getParent()) arr.push(el);
			});
			return new JQLite(arr);
		},
		closest: function closest(selector) {
			selector = clearSelector(selector); //合并多个空格为一个空格

			var sltModel = {};
			selector.replace(/\#([\w\-]+)/, function (s, s1) {
				sltModel.id = s1;
				return '';
			}).replace(/\.([\w\-]+)/g, function (s, s1) {
				sltModel.class = sltModel.class || [];
				sltModel.class.push(s1);
				return '';
			}).replace(/\[([^\]]+)\]/g, function (s, s1) {
				var attr = s1.split('='),
				    attrName = attr[0],
				    attrValue = attr[1] || '';
				sltModel.attr = sltModel.attr || [];
				sltModel.attr.push(attrName);
				if (attrValue) {
					sltModel['_' + attrName] = sltModel['_' + attrName] || [];
					sltModel['_' + attrName].push(attrValue);
				}
				return '';
			}).replace(/[\w\-]+/, function (s) {
				sltModel.tag = sltModel.tag || [];
				sltModel.tag.push(s);
				return '';
			});
			var $p = this,
			    $target;
			while (($p = $p.parent()) && $p.length === 1 && !$target) {
				if (sltModel.id && $p.attr('id') !== sltModel.id) {
					continue;
				}
				if (sltModel.class) {
					var cls = ($p.attr('class') || '').split(' ');
					if (cls.length === 0) continue;
					var clsCopy = jqlite.util.copyArray(sltModel.class);
					var tar;
					while (tar = clsCopy.pop()) {
						if (cls.indexOf(tar) === -1) {
							break;
						}
					}
					if (tar) continue;
				}
				if (sltModel.attr) {
					var attrCopy = jqlite.util.copyArray(sltModel.attr);
					var attrName;
					while (attrName = attrCopy.pop()) {
						var attrValue = sltModel['_' + attrName];
						if (!attrValue && !$p.hasAttr(attrName) || attrValue && $p.attr(attrName) !== attrValue) {
							break;
						}
					}
					if (attrName) continue;
				}
				if (sltModel.tag) {
					if ($p.trueTag() != sltModel.tag) {
						continue;
					} else if (($p[0].trueDom && $p[0].trueDom.getTag()) == sltModel.tag) {
						$p = jqlite($p[0].trueDom);
					}
				}
				$target = $p;
				break;
			}
			return $target;
		},
		find: function find(selector) {
			var arr = [];
			this.each(function () {
				arr = arr.concat(jqlite.parseSelector(selector, this));
			});
			return new JQLite(arr);
		},
		first: function first() {
			return new JQLite(this.domList[0] || []);
		},
		last: function last() {
			return new JQLite(this.domList[this.domList.length - 1] || []);
		},
		html: function html() {
			var content = arguments[0],
			    el = this.domList[0];
			if (arguments.length === 0) {
				return el && el.getInnerHTML();
			} else {
				this.each(function () {
					if (this.setHtml) {
						this.setHtml(content);
					} else {
						this.clear();
						this.appendChild(jqlite.parseHTML(String(content)));
					}
				});
				return this;
			}
		},
		text: function text() {
			var content = arguments[0],
			    el = this.domList[0];
			if (arguments.length === 0) {
				return el && el.getText();
			} else {
				this.each(function () {
					this.setText(content);
				});
				return this;
			}
		},
		val: function val() {
			var args = jqlite.util.copyArray(arguments);
			args.unshift('value');
			return this.attr.apply(this, args);
		},
		is: function is(str) {
			var arr = str.split(':');
			var tagName = arr[0];
			var pseudo = arr[1] || '';

			if (tagName && this.elementType() !== tagName.toLowerCase()) return false;
			if (!pseudo) return true;
			switch (pseudo) {
				case 'checked':
				case 'selected':
				default:
					return this.attr(pseudo) === true;
			}
		},
		css: function css() {
			var args$1 = arguments[0],
			    args$2 = arguments[1],
			    el = this.domList[0];
			if (arguments.length === 1 && typeof args$1 === 'string') {
				return el && el.getStyle(args$1);
			} else if (arguments.length === 2) {
				this.each(function () {
					_util.setStyle(this, args$1, args$2);
				});
				return this;
			} else if (jqlite.isPlainObject(args$1)) {
				this.each(function () {
					jqlite.each(args$1, function (k, v) {
						_util.setStyle(this, k, v);
					}, this);
				});
				return this;
			}
		},
		attr: function attr() {
			var name = arguments[0],
			    val = arguments[1],
			    el = this.domList[0];
			if (arguments.length === 0) {
				return el && function () {
					var arr = [];
					jqlite.each(el.getAttrs(), function (k, v) {
						if (k === 'checked' || k === 'selected') {
							v = v === 'true' ? true : false;
						}
						arr.push({ name: k, value: v });
					});
					return arr;
				}();
			} else if (arguments.length > 1) {
				this.each(function () {
					if (name === 'class') {
						_util.setClass(this, val);
					} else if (name === 'adapter') {
						this.setAdapter(val instanceof JQLite ? val[0] : val);
					} else if (name === 'checked' || name === 'selected') {
						this.setAttr(name, val === true || val === 'true' ? 'true' : 'false');
					} else if (name === 'isFocus') {
						if (val) {
							this.setFocus();
						} else {
							this.setBlur();
						}
					} else if (typeof this[name] === 'function') {
						this[name](val);
					} else if (this.setAttr) {
						val = jqliteUtil.stringify(val);
						if (this.getAttr(name) !== val) this.setAttr(name, val);
					}
				});
				return this;
			} else {
				if (!el) return '';
				var ret;
				try {
					if (name === 'class') {
						ret = el.getClassStyle();
					} else if (name === 'id') {
						ret = el.getId();
					} else if (name === 'adapter') {
						var adapter = el.getAdapter();
						if (!adapter) {
							adapter = new Adapter();
							el.setAdapter(adapter);
						}
						ret = new JQAdapter(adapter);
					} else if (name === 'checked' || name === 'selected') {
						ret = el.getAttr(name) === 'true' ? true : false;
					} else if (typeof el[name] === 'function') {
						ret = el[name]();
					} else {
						ret = el.getAttr(name);
					}
				} catch (e) {
					$.util.error(e);
				}

				return ret || '';
			}
		},
		prop: function prop() {
			this.attr.apply(this, arguments);
		},
		removeAttr: function removeAttr(name) {
			this.each(function () {
				this.removeAttr(name);
			});
			return this;
		},
		hasAttr: function hasAttr(name) {
			var el = this.length > 0 && this[0];
			return el && el.hasAttr && el.hasAttr(name);
		},
		height: function height(type) {
			var el = this.length > 0 && this[0];
			if (!el) return null;
			type = type || 'height';
			try {
				var size = el.getFrame()[type] || el.getStyle(type);
				if (size) {
					return Number(size);
				}
				return null;
			} catch (e) {
				return null;
			}
		},
		width: function width() {
			this.height('width');
		},
		hasClass: function hasClass(className) {
			var classStr = this.length > 0 && this.domList[0].getClassStyle() || '';
			return (' ' + classStr + ' ').indexOf(' ' + className + ' ') > -1;
		},
		addClass: function addClass(className) {
			this.each(function () {
				var classStr = (this.getClassStyle() || '').trim();
				if (!classStr) {
					_util.setClass(this, className);
				}

				var cns = [],
				    classStr = ' ' + classStr + ' ';

				jqlite.util.each((className || '').split(' '), function (i, cn) {
					if (classStr.indexOf(' ' + cn + ' ') < 0) {
						cns.push(cn);
					}
				});

				if (cns.length > 0) _util.setClass(this, classStr.trim() + ' ' + cns.join(' '));
			});
			return this;
		},
		removeClass: function removeClass(className) {
			this.each(function () {
				var classStr = (this.getClassStyle() || '').trim();
				if (!classStr) return;
				classStr = ' ' + classStr + ' ';
				jqlite.util.each((className || '').split(' '), function (i, cn) {
					cn = ' ' + cn + ' ';
					if (classStr.indexOf(cn) > -1) {

						classStr = classStr.split(cn).join(' ');
					}
				});
				_util.setClass(this, classStr);
			});
			return this;
		},
		data: function data(name, val, type) {
			name = 'data-' + name;
			if (arguments.length > 1) {
				this.each(function () {
					if (type === true && !jqlite.isEmptyObject(this[name])) return;
					jqlite.util.defRec(this, name, jqlite.isPlainObject(val) ? JSON.stringify(val) : String(val));
				});
				return this;
			} else {
				var rs = this.domList.length > 0 && this.domList[0][name] || '';
				try {
					return JSON.parse(rs);
				} catch (e) {
					return rs;
				}
			}
		},
		def: function def(name, val) {
			if (arguments.length === 1) {
				return this.domList.length > 0 && this.domList[0][name];
			} else if (arguments.length === 2) {
				this.each(function () {
					jqlite.util.defRec(this, name, val);
				});
			}
			return this;
		},
		before: function before($child) {
			this.each(function () {
				this.getParent().insertBefore($child[0], this);
			});
			return this;
		},
		after: function after($child) {
			this.each(function () {
				var parent = this.getParent();
				if (parent.getLastChild() === this) {
					parent.appendChild($child[0]);
				} else {
					parent.insertBefore($child[0], this.getNext());
				}
			});
			return this;
		},
		next: function next(selector) {
			var rs = [];
			this.each(function () {
				var next = selector ? jqlite.parseSelector(selector, [this], 'next')[0] : this.getNext();
				if (next) rs.push(next);
			});
			return new JQLite(rs);
		},
		prev: function prev(selector) {
			var rs = [];
			this.each(function () {
				var prev = selector ? jqlite.parseSelector(selector, [this], 'prev')[0] : this.getPrevious();
				if (prev) rs.push(prev);
			});
			return new JQLite(rs);
		},
		siblings: function siblings(selector) {
			var rs = [];
			this.each(function () {
				var cur = this;
				rs = rs.concat(selector ? jqlite.parseSelector(selector, this.getParent(), 'children') : getSiblings(this));
			});
			return new JQLite(rs);
		},
		empty: function empty() {
			this.each(function () {
				this.clear();
				_util.triggerDomChange(this);
			});
			return this;
		},
		remove: function remove() {
			var args = jqlite.util.copyArray(arguments);
			if (args.length === 0) {
				this.each(function () {
					this.remove();
					var parent = this.getParent();
					_util.triggerDomChange(parent);
					return null;
				});
			} else {
				this.each(function () {
					jqlite.each(args, function (i, $child) {
						$child = typeof $child === 'string' ? this.find($child) : jqlite($child);
						$child.remove();
					}, this);
					_util.triggerDomChange(this);
				});
			}
			return this;
		},
		append: function append(el) {
			var $el = el instanceof JQLite ? el : [el];
			var parent = this.domList[0];
			if (!parent) return this;
			jqlite.each($el, function (i, ele) {
				parent.appendChild(ele);
				_util.triggerDomChange(parent);
			});
			return this;
		},
		replaceWith: function replaceWith($newNode) {
			$newNode = new JQLite($newNode);
			this.each(function (i) {
				var parent = this.parentNode;
				var oldNode = this;
				$newNode.each(function (j) {
					if (i === 0) this.domList[j] = this;
					parent.insertBefore(this, oldNode);
					_util.triggerDomChange(parent);
				});
				oldNode.remove();
			});
			return new JQLite(this.domList);
		},
		appendTo: function appendTo(el) {
			var $el = new JQLite(el);
			this.each(function () {
				var child = this;
				$el.each(function () {
					this.appendChild(child);
				});
			});
			_util.triggerDomChange(el);
			return this;
		},
		insertAfter: function insertAfter(el) {
			var $el = new JQLite(el);
			this.each(function () {
				var child = this;
				$el.each(function () {
					var target = this.getNext(),
					    parent = this.getParent();
					if (target) {
						parent.insertBefore(child, target);
					} else {
						parent.appendChild(child);
					}
					_util.triggerDomChange(parent);
				});
			});
			return this;
		},
		insertBefore: function insertBefore(el) {
			var $el = new JQLite(el);
			this.each(function () {
				var child = this;
				$el.each(function () {
					var target = this,
					    parent = this.getParent();
					parent.insertBefore(child, target);
					_util.triggerDomChange(parent);
				});
			});
			return this;
		},
		replaceTo: function replaceTo(el) {
			var $el = new JQLite(el);
			var $this = this;
			$el.each(function () {
				var target = this,
				    parent = this.getParent();
				$this.each(function () {
					parent.insertBefore(this, target);
				});
				target.remove();
				_util.triggerDomChange(parent);
			});
			return this;
		},
		clone: function clone(deep) {
			// 应该实现deep的时候同时拷贝事件，目前尚未实现
			return new JQLite(this.length > 0 && this.domList[0].clone(true) || []);
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
		on: function on(evt, selector, callback) {
			// evt = _eventRefer.get(evt);
			if (typeof selector === 'function') {
				callback = selector;
				selector = null;
			}

			var getEl = function getEl(cur, el, root) {
				var parent = cur.getParent();
				if (cur === el) {
					return el;
				} else if (parent === root) {
					return null;
				} else {
					return getEl(parent, el, root);
				}
			};
			if (LISTCBS[evt] && this.is('list')) {
				var _this = this;
				this.attr('event_' + evt, evt).attr('adapter').on(evt, function (e) {
					callback.apply(_this[0], arguments);
				});
				return this;
			}
			this.each(function () {
				this.on(evt, selector ? function (e) {
					var root = this,
					    cur = e.target;
					jqlite.each(jqlite.parseSelector(selector, root), function (i, el) {
						var _this = getEl(cur, el, root);
						if (_this) callback.apply(_this, arguments);
					});
				} : callback);
			});
			return this;
		},
		trigger: function trigger() {
			var args = arguments;
			// args[0] = _eventRefer.get(args[0]);
			this.each(function () {
				this.fire.apply(this, args);
			});
			return this;
		},
		off: function off(evt, callback) {
			// evt = _eventRefer.get(evt);
			this.each(function () {
				this.off.call(this, evt, callback);
			});
			return this;
		},
		exe: function exe(funcName, params) {
			var ret;
			this.each(function () {
				var el = this;
				if (el && typeof el[funcName] === 'function') {
					ret = el[funcName].apply(el, params);
				}
			});
			return ret;
		},
		ready: function ready(func) {
			window.on(_eventRefer.ready, func);
		},
		render: function render(data) {
			if (this.length !== 1) return null;
			var el = this[0],
			    vm = el.vm;
			if (!data) return vm;
			return el.vm = jqlite.vm(this, data);
		},
		show: function show(p) {
			// p = _animateDirectionRefer.formateShowHide(p);
			// this.each(function () {
			// 	// this.show(p);
			// 	this.setStyle('display', 'flex');
			// });
			this.css('display', 'flex');
		},
		hide: function hide(p) {
			// p = _animateDirectionRefer.formateShowHide(p);
			// this.each(function () {
			// 	// this.hide(p);
			// 	this.setStyle('display', 'none');
			// });
			this.css('display', 'none');
		},
		//目前仅针对startAnimator进行封装
		animate: function animate(props, duration, easing, complete) {
			if (typeof easing === 'function') {
				complete = easing;
				easing = 'linear';
			} else if (typeof duration === 'function') {
				complete = duration;
				duration = 1000;
				easing = 'linear';
			} else if (arguments.length < 2) {
				complete = null;
				easing = 'linear';
				duration = 1000;
			}

			var animators = [];
			if (jqlite.isArray(props)) {
				animators = props;
			} else if (jqlite.isPlainObject(props)) {
				animators.push({
					duration: duration,
					curve: easing,
					props: props
				});
			}

			this.each(function () {
				_animateFlag++;
				var _this = this;
				this.startAnimator({
					animators: animators
				}, function (error) {
					_animateFlag--;
					complete && complete.apply(_this, arguments);
					_this.releaseAnimator();
					if (_animateFlag === 0) document.refresh();
				});
			});
		},
		trueTag: function trueTag() {
			var el = this.length > 0 && this[0];
			if (!el) return '';
			var tag = el.trueDom && el.trueDom.getTag && el.trueDom.getTag() || el.getTag && el.getTag();
			return tag;
		},
		tag: function tag() {
			var el = this.length > 0 && this[0];
			return el && el.getTag && el.getTag().toLowerCase();
		},
		getComponent: function getComponent() {
			var el = this.length > 0 && this[0];
			return el && (el.trueDom ? el.trueDom.component : el.component);
		}
	};

	var _animateFlag = 0;

	var _animateDirectionRefer = {
		get: function get(an) {
			return _animateDirectionRefer[an] || an;
		},
		formateShowHide: function formateShowHide(p) {
			return (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object' ? function () {
				p.type = _animateDirectionRefer.get(p.type);
				return p;
			}() : {
				type: p
			};
		},
		slideRight: 'slide_l2r',
		slideLeft: 'slide_r2l',
		slideUp: 'slide_b2t',
		slideDown: 'slide_t2b'
	};

	var _eventRefer = {
		get: function get(evt) {
			return _eventRefer[evt] || evt;
		},
		dbclick: 'doubleClick',
		ready: 'loaded',
		touchstart: 'touchDown',
		touchmove: 'touchMove',
		touchend: 'touchUp',
		mousedown: 'touchDown',
		mousemove: 'touchMove',
		mouseup: 'touchUp',
		scroll: 'scrollChange',
		input: 'textChanged'
	};

	var jqlite = function jqlite(selector, scope) {
		return new JQLite(selector, scope);
	};

	var toString = Object.prototype.toString,
	    _hasOwn = Object.prototype.hasOwnProperty,
	    cons = __webpack_require__(10),
	    consoleLevel = ['error', 'warn', 'log'],
	    _cons = function _cons(type, args) {
		if (consoleLevel.indexOf(jqlite.util.consoleLevel) < consoleLevel.indexOf(type)) return;

		if (cons) {
			args = jqlite.util.copyArray(args);
			var func = cons[type],
			    arg;
			while (arg = args.shift()) {
				func.call(cons, arg);
			}
		}
	};
	cons.setFilePath("res:page/log.txt");

	jqlite.each = function (obj, callback, context) {
		if (!obj) return;
		var ret;
		if (this.isArray(obj) || !this.util.isString(obj) && this.util.isNotNaNNumber(obj.length)) {
			for (var i = 0; i < obj.length; i++) {
				ret = callback.call(context, i, obj[i]);
				if (ret === false) {
					break;
				} else if (ret === null) {
					obj.splice(i, 1);
					i--;
				}
			}
		} else if (this.util.isObject(obj)) {
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
	};

	var querySelector = function querySelector(slts, scopes, mode) {
		var eles = [];

		jqlite.util.each(scopes, function (i, scope) {
			var sltsCopy = jqlite.util.copyArray(slts);
			if (mode === 'all') {
				var slt = sltsCopy.shift();
				eles = eles.concat(matchQuery((slt.type === 'attr' && typeof slt.attrValue === 'undefined' ? walker(scope, slt, true) : scope.getElements(slt.exep)) || [], sltsCopy));
			} else if (mode === 'children') {
				eles = eles.concat(matchQuery(scope.getChildren() || [], sltsCopy));
			} else if (mode === 'siblings') {
				eles = eles.concat(matchQuery(getSiblings(scope), sltsCopy));
			} else if (mode === 'prev') {
				var el = [];
				while ((scope = scope && scope.getPrevious()) && (el = matchQuery([scope], sltsCopy)).length === 0) {}
				eles = eles.concat(el);
			} else if (mode === 'next') {
				var el = [];
				while ((scope = scope && scope.getNext()) && (el = matchQuery([scope], sltsCopy)).length === 0) {}
				eles = eles.concat(el);
			}
		});
		return eles;
	};

	var getSiblings = function getSiblings(el) {
		var next = el,
		    prev = el,
		    arr = [];
		while ((next = next && next.getNext()) || (prev = prev && prev.getPrevious())) {
			arr.push(next || prev);
		}
		return arr;
	};

	var walker = function walker(scope, slt, flag) {
		var rs = [];
		jqlite.util.each(scope.getChildren ? scope.getChildren() : [], function (i, el) {
			if (el.hasAttr && el.hasAttr(slt.attrName)) rs.push(el);
			if (flag) rs = rs.concat(walker(el, slt, flag));
		});
		return rs;
	};

	var matchQuery = function matchQuery(nodes, slts) {
		if (slts.length === 0) return nodes;
		var eles = [];
		jqlite.util.each(nodes, function (j, el) {
			var flag = true;
			jqlite.util.each(slts, function (k, slt) {
				if (slt.type === 'id' && el.getId() !== slt.id || slt.type === 'class' && (' ' + el.getClassStyle() + ' ').indexOf(' ' + slt.className + ' ') < 0 || slt.type === 'attr' && (typeof slt.attrValue === 'undefined' ? !el.hasAttr(slt.attrName) : el.getAttr(slt.attrName) !== slt.attrValue) || slt.type === 'tag' && el.getTag() !== slt.tagName) {

					return flag = false;
				}
			});
			if (flag) {
				eles.push(el);
			}
		});
		return eles;
	};

	function getSeletorSplit(str) {
		var reg = /([^ \~\>]+)([ \~\>]?)/g;
		var arr,
		    group = [];
		while (arr = reg.exec(str)) {
			var selector = arr[1],
			    flag = arr[2];
			group.push(selector);
			if (flag) group.push(flag);
		}
		return group;
	}

	jqlite.parseSelector = function (selector, scope, baseMode) {
		selector = clearSelector(selector);
		var exeps = selector.split(',');
		var $scope = jqlite(scope || document),
		    scope = [];
		$scope.each(function () {
			scope.push(this);
		});
		var rs = [];
		jqlite.util.each(exeps, function (i, exep) {
			exep = jqlite.util.trim(exep);
			// var funcStr = 'return ["' + exep.replace(/([ >~])/g, '","$1","') + '"];';
			var scopes = scope,
			    mode = baseMode || 'all';
			// var group = (new Function(funcStr))();
			var group = getSeletorSplit(exep);

			jqlite.util.each(group, function (j, slts) {
				if (slts === ' ') {
					// 空格代表找后面所有子节点和子孙节点
					mode = 'all';
				} else if (slts === '>') {
					// >代表找当前节点的子节点（第一层）
					mode = 'children';
				} else if (slts === '~') {
					// ~代表当前节点同级的后续节点
					mode = 'siblings';
				} else {
					var sltArr = [];
					slts.replace(/\#([\w\-]+)/, function (s, s1) {
						sltArr.push({
							type: 'id',
							exep: s,
							id: s1
						});
						return '';
					}).replace(/\.([\w\-]+)/g, function (s, s1) {
						sltArr.push({
							type: 'class',
							exep: s,
							className: s1
						});
						return '';
					}).replace(/\[([^\]]+)\]/g, function (s, s1) {
						var attr = s1.split('='),
						    attrName = attr[0],
						    attrValue = attr[1] || '';
						sltArr.push(attr.length < 2 ? {
							type: 'attr',
							exep: s,
							attrName: attrName
						} : {
							type: 'attr',
							exep: s,
							attrName: attrName,
							attrValue: attrValue
						});
						return '';
					}).replace(/[\w\-]+/, function (s) {
						sltArr.push({
							type: 'tag',
							exep: s,
							tagName: s
						});
						return '';
					});
					if (sltArr.length === 0) return;

					scopes = querySelector(sltArr, scopes, mode);
				}
			});

			rs = jqlite.util.mergeArray(rs, scopes); //去重合并
		});

		return rs;
	};

	jqlite.parseHTML = function (html) {
		if (/<[^>]+>/g.test(html)) {} else {
			html = '<text>' + html + '</text>';
		}
		var el = document.createElementByXml('<box>' + html + '</box>');
		return new JQLite(el).children();
	};
	jqlite.type = function (obj) {
		var class2type = {};
		jqlite.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
			class2type["[object " + name + "]"] = name.toLowerCase();
		});
		return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
	};
	jqlite.isArray = Array.isArray || function (obj) {
		return this.type(obj) === "array";
	};
	jqlite.isFunction = function (func) {
		return func instanceof Function;
	};
	jqlite.isEmptyObject = function (obj) {
		return obj ? Object.keys(obj).length === 0 : true;
	};
	jqlite.isPlainObject = function (obj) {
		if (!obj || this.type(obj) !== "object") {
			return false;
		}
		if (obj.constructor && !_hasOwn.call(obj, "constructor") && !_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
			return false;
		}
		var key;
		for (key in obj) {}
		return key === undefined || _hasOwn.call(obj, key);
	};
	jqlite.extend = function () {
		var arguments$1 = arguments;
		var this$1 = this;

		var options, name, src, copy, copyIsArray, clone;
		var target = arguments[0] || {},
		    i = 1,
		    length = arguments.length,
		    deep = false;

		// Handle a deep copy situation
		if (jqlite.util.isBoolean(target)) {
			deep = target;
			target = arguments[i] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object' && !this.isFunction(target)) {
			target = {};
		}

		// Extend Util itself if only one argument is passed
		if (i === length) {
			target = this;
			i--;
		}

		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments$1[i]) != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && this.isArray(src) ? src : [];
						} else {
							clone = src && this.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = this$1.extend(deep, clone, copy);
					}
					// Don't bring in undefined values
					else if (copy !== undefined) {
							target[name] = copy;
						}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jqlite.inArray = function (elem, arr, i) {
		return arr == null ? -1 : arr.indexOf.call(arr, elem, i);
	};

	jqlite.util = {
		consoleLevel: 'warn',
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
			return typeof e === 'obejct' && e.type && e.target && e.timestamp;
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
			return string.replace(/\s/g, '');
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
		mergeArray: function mergeArray(ta, na) {
			jqlite.util.each(ta, function (i, t) {
				jqlite.util.each(na, function (j, n) {
					if (n === t) return null;
				});
			});
			return ta.concat(na);
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
	var _fi = 0,
	    JQFragment = function JQFragment() {
		JQLite.apply(this, arguments.length == 0 ? jqlite.parseHTML('<box id="f_' + _fi++ + '"></box>') : arguments);
	};

	var fo = JQFragment.prototype = Object.create(JQLite.prototype);

	fo.appendTo = function (el) {
		var $el = new JQLite(el);
		this.children().each(function () {
			var child = this;
			$el.each(function () {
				this.appendChild(child);
			});
		});
		_util.triggerDomChange($el[0]);
		return this;
	};
	fo.insertAfter = function (el) {
		var $el = new JQLite(el);
		this.children().each(function () {
			var child = this;
			$el.each(function () {
				var target = this.getNext(),
				    parent = this.getParent();
				if (target) {
					parent.insertBefore(child, target);
				} else {
					parent.appendChild(child);
				}
				_util.triggerDomChange(parent);
			});
		});
		return this;
	};
	fo.insertBefore = function (el) {
		var $el = new JQLite(el);
		this.children().each(function () {
			var child = this;
			$el.each(function () {
				var target = this,
				    parent = this.getParent();
				parent.insertBefore(child, target);
				_util.triggerDomChange(parent);
			});
		});
		return this;
	};
	fo.replaceTo = function (el) {
		var $el = new JQLite(el);
		var $this = this,
		    parent;
		$el.each(function () {
			var target = this;
			parent = this.getParent();
			$this.children().each(function () {
				parent.insertBefore(this, target);
			});
			target.remove();
			_util.triggerDomChange(parent);
		});

		return this;
	};

	var JQAdapter = function JQAdapter() {
		JQLite.apply(this, arguments.length == 0 ? new Adapter() : arguments);
		this._listElement = null;
		this._cells = {};
	};

	var ao = JQAdapter.prototype = Object.create(JQLite.prototype);

	ao.on = function (eName, callback) {
		var el = this.domList[0];
		el && el.on(eName, callback);
		return this;
	};
	ao.refresh = function () {
		var el = this.domList[0];
		el && el.refresh();
		return this;
	};
	ao.setCell = function ($cell) {
		var $parent = $cell.parent();
		var index = ($cell.parent().data('AdapteCell') || $parent.children('cell').length) - 1;

		$parent.data('AdapteCell', index);
		$parent.def('__' + $cell.attr('id'), $cell.clone());

		return index === 0;
	};
	ao.initEvent = function ($parent, $el, getter, callback) {

		var useSection = $parent.hasAttr('use-section');

		var cellType = 'type',
		    sectionTitle = 'title',
		    array;

		var getCellClone = function getCellClone(id) {
			return $parent.def('__' + id);
		};

		var getCells = function getCells(sectionindex) {
			array = getter();
			return (useSection ? array[sectionindex]['cells'] : array) || [];
		};

		var cbs = {
			getCellId: $parent.attr('event_getCellId'),
			getView: $parent.attr('event_getView'),
			getCount: $parent.attr('event_getCount'),
			getItem: $parent.attr('event_getItem'),
			getSectionCount: $parent.attr('event_getSectionCount'),
			getSectionText: $parent.attr('event_getSectionText')
		};

		if (!cbs.getCellId) this.off("getCellId").on("getCellId", function (e, position, sectionindex) {
			return getCells(sectionindex)[position][cellType];
		});

		// if (!cbs.getView) this.off("getView").on("getView", function (e, position, sectionindex) {
		// 	array = getter();
		// 	var $plate = jqlite(e.target);
		// 	callback.apply(null, [$plate, position, useSection ? array[sectionindex]['cells'] : array]);
		// });
		if (!cbs.getCellId) this.off("getView").on("getView", function (e, position, sectionindex) {
			array = getter();
			var $copy = getCellClone(getCells(sectionindex)[position][cellType]);
			var $temp = $copy.clone();
			callback.apply(null, [$temp, position, useSection ? array[sectionindex]['cells'] : array]);
			jqlite.ui.copyElement(e.target, $temp, true);
		});
		if (!cbs.getCount) this.off("getCount").on("getCount", function (e, sectionindex) {
			return getCells(sectionindex).length;
		});
		if (!cbs.getItem) this.off("getItem").on("getItem", function (e, position, sectionindex) {
			return getCells(sectionindex)[position];
		});

		if (!cbs.getSectionCount) this.off("getSectionCount").on("getSectionCount", function (e) {
			array = getter();
			return useSection ? array.length : 1;
		});
		if (!cbs.getSectionText) this.off("getSectionText").on("getSectionText", function (e, sectionindex) {
			array = getter();
			return useSection ? array[sectionindex][sectionTitle] : null;
		});
	};

	jqlite.ui = {
		isJQS: function isJQS(o) {
			return this.isJQLite(o) || this.isJQFragment(o) || this.isJQAdapter(o);
		},
		isJQLite: function isJQLite(o) {
			return o instanceof JQLite;
		},
		isJQFragment: function isJQFragment(o) {
			return o instanceof JQFragment;
		},
		isJQAdapter: function isJQAdapter(o) {
			return o instanceof JQAdapter;
		},
		isText: function isText(tagName) {
			return tagName === 'text' || tagName === 'iconfont';
		},
		useAdapter: function useAdapter($el) {
			var parent = $el.parent()[0];
			return parent && typeof parent.setAdapter === 'function';
		},
		createTextNode: function createTextNode(p) {

			return {
				getTag: function getTag() {
					return '#text';
				},
				getChildren: function getChildren() {
					return [];
				},
				getParent: function getParent() {
					return p;
				},
				setText: function setText(txt) {
					p.setText(txt);
				},
				getText: function getText() {
					return p.getText();
				}
			};
		},
		createJQAdapter: function createJQAdapter(el) {
			return el ? new JQAdapter(el) : new JQAdapter();
		},
		createJQPlaceholder: function createJQPlaceholder() {
			var dom = document.createElement("text", { style: 'display:none;' });
			dom.isPlaceholder = true;
			return jqlite(dom);
		},
		createJQFragment: function createJQFragment() {
			return new JQFragment();
		},
		toJQFragment: function toJQFragment($el) {
			var $fragment = this.createJQFragment();

			if ($el instanceof JQLite) {
				$el.children().each(function () {
					$fragment.append(this);
					return null;
				});
			} else if ((typeof $el === 'undefined' ? 'undefined' : _typeof($el)) === 'object') {
				jqlite.each(jqlite.util.copyArray($el.getChildren()), function (i, child) {
					$fragment.append(child);
					return null;
				});
			} else {

				if (/<[^>]+>/g.test($el)) {} else {
					$el = '<text>' + $el + '</text>';
				}
				var div = document.createElementByXml('<box>' + $el + '</box>');
				jqlite.util.each(jqlite.util.copyArray(div.getChildren()), function (i, child) {
					$fragment.append(child);
					return null;
				});
			}

			return $fragment;
		},
		clear: function clear(el) {
			jqlite.each(el.getAttrs(), function (k, v) {
				if (k !== 'id') el.removeAttr(k);
				return null;
			});
		},
		copyElement: function copyElement(t, $o) {
			this.clear(t);
			for (var i = 0; i < $o.length; i++) {
				jqlite.each($o[i].getAttrs(), function (k, v) {
					var attrV = t.getAttr(k);
					if (typeof attrV !== 'undefined' && attrV !== v) {
						t.setAttr(k, v);
					}
				});
				var children = t.getChildren();
				jqlite.each($o[i].getChildren(), function (j, child) {
					jqlite.ui.copyElement(children[j], new JQLite(child));
				});
				if ($o[i].getText) {
					var tV = t.getText(),
					    oV = $o[i].getText();
					if (typeof tV !== 'undefined' && tV !== oV) {
						t.setText(oV);
					}
				}
			}
		},
		closeWindow: function closeWindow(params) {
			window.close(params);
		},
		openWindow: function openWindow(params, data) {
			var url = params.url,
			    content = '';
			if (data) {
				content = jqlite.template(url, data);
				params.content = content;
			}
			if (params.content) delete params.url;
			window[params.content ? 'openData' : 'open'](params);
		},
		refreshDom: function refreshDom() {
			if (arguments.length === 0) document.refresh();
			jqlite.util.each(arguments, function (i, dom) {
				jqlite(dom).each(function () {
					if (!dom) {
						document.refresh();
						return;
					}
					var tag = this.getTag && this.getTag();
					var parent = this.getParent && this.getParent(),
					    pTag = parent && parent.getTag();
					if (tag === 'list') {
						this.getAdapter().refresh();
					} else if (tag === 'header' && parent && pTag === 'list') {
						parent.refreshHeader();
					} else if (tag === 'footer' && parent && pTag === 'list') {
						parent.refreshFooter();
					} else {
						this.refresh();
					}
				});
			});
		},
		toast: function toast(content, duration) {
			ui.toast({
				content: content,
				duration: duration
			});
		}
	};

	var converstHTTPParams = function converstHTTPParams(options) {
		var refers = {
			url: {
				dft: ''
			},
			data: {
				dft: ''
			},
			method: {
				ref: 'type',
				dft: 'get'
			},
			connectTimeout: {
				ref: 'timeout',
				dft: 15 * 1000
			},
			requestHeader: {
				ref: 'headers',
				dft: {}
			}
		};

		var option = {};

		jqlite.each(refers, function (k, v) {
			var refer = refers[k];
			option[k] = refer.ref ? options[refer.ref] : options[k] || refer.dft;
		});

		var callFunction = function callFunction(json) {
			var status = json.status,
			    data = json.data;
			status > 199 && status < 300 ? function () {
				if (options.dataType === 'json') {
					try {
						data = JSON.parse(data);
					} catch (e) {
						data = null;
						jqlite.util.warn('请求地址：' + option.url);
						jqlite.util.warn('数据格式不正确：' + e);
					}
				}
				options.success && options.success(data);
			}() : function () {
				options.error && options.error(status);
			}();

			options.complete && options.complete(data);
		};

		var requestProgressFunction = function requestProgressFunction(json, isReq) {
			var size = json.length;
			var totleSize = json.totalLength;
			var percent = totleSize ? size / (totleSize * 2) : 0;
			percent = String(Math.floor(percent * 100) + (isReq ? 50 : 0)) + '%';
			options.uploadProgress({ type: 'requestProgress' }, size, totleSize, percent);
		};

		var responseProgressFunction = function responseProgressFunction(json) {
			requestProgressFunction(json, true);
		};

		return {
			option: option,
			callFunction: callFunction,
			requestProgressFunction: requestProgressFunction,
			responseProgressFunction: responseProgressFunction
		};
	};

	var http = __webpack_require__(11);

	var go = function go(options, ajax) {
		var opts = {
			url: '',
			type: 'get',
			dataType: 'text',
			data: '',
			headers: {},
			timeout: 45 * 1000,
			success: function success() {},
			error: function error() {},
			complete: function complete() {},
			uploadProgress: function uploadProgress() {}
		};

		jqlite.extend(opts, options);

		var params = converstHTTPParams(opts);

		http[ajax](params.option, params.callFunction, params.requestProgressFunction, params.responseProgressFunction);
	};

	jqlite.ajax = function (options) {
		go(options, 'ajax');
	};
	jqlite.ajaxForm = function (options) {
		go(options, 'formSubmit');
	};
	jqlite.get = function (url, callback) {
		go({
			url: url,
			dataType: 'json',
			complete: callback
		}, 'ajax');
	};

	jqlite.fn = {
		extend: function extend(opts) {
			jqlite.each(opts, function (funcName, handler) {
				JQLite.prototype[funcName] = handler;
			});
		}
	};

	jqlite.file = {
		f: __webpack_require__(12),
		read: function read(path) {
			return this.f.readTextFile(path);
		},
		write: function write(path, content) {
			return this.f.writeTextFile({
				path: path
			}, content);
		}
	};

	__webpack_require__(13)(jqlite);

	module.exports = jqlite;

	if (typeof __EXPORTS_DEFINED__ === 'function') __EXPORTS_DEFINED__(jqlite, 'JQLite');

	var _template = __webpack_require__(20);
	_template.hooks('get', function (str) {
		return jqlite.file.read(str);
	});
	_template.hookHelper('getDom', function (id) {
		return __webpack_require__(2).getElement(id);
	});
	jqlite.template = _template;
})();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var util = module.exports = {
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
    }
};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("UI");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("Window");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("ListAdapter");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("Console");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("Http");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("File");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (jqlite) {
	jqlite.JSON = {
		parse: function parse(str) {
			return JSON.parse(str) || {};
		},
		stringify: function stringify(str) {
			return JSON.stringify(str) || '';
		}
	};

	jqlite.vm = function (el, data) {
		var MVVM = __webpack_require__(14);
		return new MVVM(el, data);
	};

	jqlite.vm.addParser = function (rules) {
		var Parser = __webpack_require__(1);
		Parser.add(rules);
	};

	jqlite.vm.addEventFilter = function (filters) {
		var Parser = __webpack_require__(1);
		Parser.addEventFilter(filters);
	};

	jqlite.vm.setVMPre = function (setting) {
		var Parser = __webpack_require__(1);
		Parser.setVMPre(setting);
	};
	jqlite.vm.getVMPre = function () {
		var Parser = __webpack_require__(1);
		return Parser.getVMPre();
	};

	jqlite.BaseComponent = __webpack_require__(19);
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
	var $ = __webpack_require__(0).JQLite;
	var Compiler = __webpack_require__(15);

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
	mp.setViewData = function (obj) {
		var viewData = this.$data;
		this.extend(viewData, obj || {});
	};

	/**
  * 获取 mvvm 绑定的数据
  */
	mp.getData = function () {
		return this.$data;
	};

	module.exports = MVVM;
})();

/***/ }),
/* 15 */
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
		}
	};

	/**
  * 指令提取和编译模块
  * @param  {JQLite|Native}      element [视图根节点]
  * @param  {Object}             model   [数据模型对象]
  */
	var Compiler = function Compiler(element, model) {

		var compiler = this;

		var $element = $(element);

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

			var ignoreRoot = $node.hasAttr('vmignoreroot'),
			    isRoot = _this.root === this;

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
				nodeAttrs.push(priorityDirs.vif);
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
			return '"+(' + s1 + ')+"';
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
/* 16 */
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
		if ($radio.prop('checked') != checkStatus) $radio.prop('checked', checkStatus);
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

		if ($checkbox.prop('checked') != checkStatus) $checkbox.prop('checked', checkStatus);
	};

	/**
  * 更新 select 的激活状态 realize v-model
  * @param   {JQLite/select}         $select
  * @param   {Array|String}          selected  [选中值]
  * @param   {Boolean}               multi
  */
	up.updateSelectChecked = function ($select, selected, multi) {
		var getNumber = $select.hasAttr('number');
		var $options = $select.children(),
		    leng = $options.length;
		var multiple = multi || $select.hasAttr('multiple');

		$options.each(function (i) {
			var $option = $(this);
			var value = $option.val();
			value = getNumber ? +value : $option.hasAttr('number') ? +value : value;
			$option.prop('selected', multiple ? selected.indexOf(value) > -1 : selected === value);
		});
	};

	module.exports = Updater;
})();

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {

	var $ = __webpack_require__(0).JQLite;
	var Observer = __webpack_require__(18);

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

	var wp = Watcher.prototype;

	/**
  * watch订阅数据改变回调
  * @param   {Object}    options
  */
	wp.change = function (options) {
		var subs = this.$depSub;
		var sub = watcherUtil.iterator(options.path.split('.'), subs);
		$.util.each(sub['$'] || [], function (i, cb) {
			cb(options, i);
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {

	var $ = __webpack_require__(0).JQLite;

	//v8引擎sort算法与浏览器不同，重写sort函数，以xSort代替
	Array.prototype.xSort = function (fn) {
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
	};
	// 重写push算法，使用索引值添加，提高效率
	Array.prototype.xPush = function () {
		var l = this.length;
		for (var i = 0, len = arguments.length; i < len; i++) {
			this[l + i] = arguments[i];
		}
		return this;
	};

	// 增加$set方法修改元素值
	Array.prototype.$set = function (pos, item) {
		var len = this.length;
		if (pos > len) {
			return this.push(item);
		} else if (pos < 0) {
			return this.unshift(item);
		}
		return this.splice(pos, 1, item);
	};

	// 增加$reset方法重置数组，如果没有参数则重置为空数组
	Array.prototype.$reset = function (arr) {
		return this.splice.apply(this, [0, this.length || 1].concat(arr || []));
	};

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

			if (newValue === oldValue) {
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

			arrayMethods.cbs = arrCbs;

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

		array.oPaths = paths;

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
/* 19 */
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
            var pre = this.$.vm.getVMPre().data;
            if (pre) {
                this.data = viewData[pre] = viewData[pre] || {};
            } else {
                this.data = viewData;
            }
        }
    }, {
        key: '__setViewData',
        value: function __setViewData(k, v) {
            var data = this.data;
            data[k] = v;
        }
    }, {
        key: '__initProto',
        value: function __initProto() {
            var _this = this;
            var __props = [];
            this.__props = __props;
            // 内部属性
            for (var k in this.props || {}) {
                __props.push(k);
                var prop = this.props[k];
                prop.init ? prop.init() : prop.handler && prop.handler(this.getAttrValue(k));
            }

            // 外部属性
            this.__setThisData(this.properties);
            for (var k in this.properties || {}) {
                __props.push(k);
                var prop = this.properties[k];
                (function (k) {
                    _this.__setViewData(k, _this.getAttrValue(k));
                    prop.handler = function (val) {
                        _this.__setViewData(k, val);
                    };
                })(k);
            }
            // 内部事件
            for (var k in this.events) {
                var event = this.events[k];
                event.handler && event.handler();
            }
        }
    }, {
        key: '__mvvmRender',
        value: function __mvvmRender() {
            var _this2 = this;

            if (!this.viewData) return;

            this.$root.attr('vmignoreroot', 'true').on('__destroy__', function () {
                _this2.$vm.destroy();
            });
            this.$vm = this.$root.render(this.viewData);
        }
    }, {
        key: '__getProp',
        value: function __getProp(name) {
            return this.props && this.props[name] || this.properties && this.properties[name];
        }
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
                    rs = (typeof attrValue === 'undefined' ? 'undefined' : _typeof(attrValue)) !== 'object' ? JSON.parse(attrValue) : attrValue;
                } catch (e) {
                    rs = null;
                }
            }

            return rs;
        }
    }, {
        key: 'setData',
        value: function setData(obj) {
            if (!this.$vm) return;
            var pre = this.$.vm.getVMPre().data;
            obj = pre ? { data: obj } : obj;
            this.$vm.setViewData(obj);
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
    }, {
        key: 'created',
        value: function created() {
            this.__initInnerDom();
            this.initViewData && this.initViewData();
            this.initProto && this.initProto();
            this.__initEvent();
            this.__initProto();
            this.__mvvmRender();
        }
    }, {
        key: 'attrChanged',
        value: function attrChanged(attrName, attrValue) {
            if (this.__props && this.__props.indexOf(attrName) > -1) {
                var prop = this.__getProp(attrName);
                prop.handler && prop.handler(this.getAttrValue(attrName));
            }
        }
    }, {
        key: 'triggerEvent',
        value: function triggerEvent(evtName, param) {
            this.$jsDom.trigger(evtName, [param]);
        }
    }, {
        key: 'selectComponent',
        value: function selectComponent(selector) {
            var selectCom = this.$root.find(selector)[0];
            return selectCom && selectCom.component;
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

            _this4.jsDom = el;
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

module.exports = BaseComponent;

/***/ }),
/* 20 */
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