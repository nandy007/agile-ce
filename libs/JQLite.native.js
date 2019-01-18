
(function () {

	var ui = require('UI'), document = require('Document'), window = require("Window"), Adapter = require("ListAdapter");
	var _util = {
		setClass: function (el, className) {
			var context, contextFunc = el['__context'];
			if (contextFunc) context = contextFunc();
			el.setClassStyle(className, context);
			this.refresh(el);
		},
		setStyle: function(el, styleName, styleValue){
			el.setStyle(styleName, styleValue);
			this.refresh(el);
		},
		refresh: function(el){
			var parent = el.getParent();
			if(parent && parent.refresh){
				parent.refresh();
			}else if(el.refresh){
				el.refresh();
			}
		},
		triggerDomChange: function(el){
			if(!el) return;
			el.refresh && el.refresh();
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
	var JQLite = function (selector, scope) {

		if (jqlite.ui.isJQS(selector)) return selector;

		if (jqlite.isFunction(selector)) {
			return jqlite(window).on('ready', selector);
		}

		var els = selector ? (selector instanceof Array ? selector : (typeof selector === 'string' ? (selector.indexOf('<') === 0 ? jqlite.parseHTML(selector) : jqlite.parseSelector(selector, scope)) : [selector])) : [];

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

	JQLite.prototype = {
		add: function (el) {
			$el = el instanceof JQLite ? el : new JQLite(el);
			var domList = this.domList;
			$el.each(function () {
				domList.push(this);
			});
			return new JQLite(domList);
		},
		get: function (index) {
			var len = this.domList.length;
			return new JQLite(index < 0 || index >= len ? [] : this.domList[index]);
		},
		childs: function (index) {
			return this.children.apply(this, arguments);
		},
		textContent: function () {
			return this.text.apply(this, arguments);
		},
		attrs: function () {
			return this.attr.apply(this, arguments);
		},
		isElement: function () {
			return this.length > 0 && this.elementType() !== '#text';
		},
		elementType: function () {
			var el = this.domList[0] || {}, nodeType = el.getTag && el.getTag();
			var type = nodeType;
			return type;
		},
		each: function (callback) {
			var domList = this.domList;
			jqlite.each(this.domList, function (i, el) {
				return callback.call(el, i);
			});
			return this;
		},
		children: function (index) {
			var arr = [];

			this.each(function () {
				var el = this;
				var children = el ? (jqlite.ui.isText(el.getTag()) ? [jqlite.ui.createTextNode(el)] : el.getChildren()) : [];
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
		parent: function () {
			var arr = [];
			this.each(function () {
				var el = this;
				if (el = el.getParent && el.getParent()) arr.push(el);
			});
			return new JQLite(arr);
		},
		find: function (selector) {
			var arr = [];
			this.each(function () {
				arr = arr.concat(jqlite.parseSelector(selector, this));
			});
			return new JQLite(arr);
		},
		first: function () {
			return new JQLite(this.domList[0] || []);
		},
		last: function () {
			return new JQLite(this.domList[this.domList.length - 1] || []);
		},
		html: function () {
			var content = arguments[0], el = this.domList[0];
			if (arguments.length === 0) {
				return el && el.getInnerHTML();
			} else {
				this.each(function () {
					if(this.setHtml){
						this.setHtml(html);
					}else{
						this.clear();
						this.appendChild(jqlite.parseHTML(String(content)));
					}
				});
				return this;
			}
		},
		text: function () {
			var content = arguments[0], el = this.domList[0];
			if (arguments.length === 0) {
				return el && el.getText();
			} else {
				this.each(function () {
					this.setText(content);
				});
				return this;
			}
		},
		val: function () {
			var args = jqlite.util.copyArray(arguments);
			args.unshift('value');
			return this.attr.apply(this, args);
		},
		is: function (str) {
			var arr = str.split(':');
			var tagName = arr[0];
			var pseudo = arr[1] || '';

			if (tagName && (this.elementType() !== tagName.toLowerCase())) return false;
			if (!pseudo) return true;
			switch (pseudo) {
				case 'checked':
				case 'selected':
				default:
					return this.attr(pseudo) === true;
			}
		},
		css: function () {
			var args$1 = arguments[0], args$2 = arguments[1], el = this.domList[0];
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
		attr: function () {
			var name = arguments[0], val = arguments[1], el = this.domList[0];
			if (arguments.length === 0) {
				return el && (function () {
					var arr = [];
					jqlite.each(el.getAttrs(), function (k, v) {
						if (k === 'checked' || k === 'selected') {
							v = v === 'true' ? true : false;
						}
						arr.push({ name: k, value: v });
					});
					return arr;
				})();
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
							window.hideSip();
						}
					} else if (typeof this[name] === 'function') {
						this[name](val);
					} else if(this.setAttr){
						this.setAttr(name, val);
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
		prop: function () {
			this.attr.apply(this, arguments);
		},
		removeAttr: function (name) {
			this.each(function () {
				this.removeAttr(name);
			});
			return this;
		},
		hasAttr: function (name) {
			var el = this.length>0&&this[0];
			return el&&el.hasAttr&&el.hasAttr(name);
		},
		height: function(type){
			var el = this.length>0&&this[0];
			if(!el) return null;
			type = type || 'height';
			try{
				var size = el.getFrame()[type] || el.getStyle(type);
				if(size){
					return Number(size);
				}
				return null;
			}catch(e){
				return null;
			}
		},
		width: function(){
			this.height('width');
		},
		hasClass: function (className) {
			var classStr = this.length > 0 && this.domList[0].getClassStyle() || '';
			return (' ' + classStr + ' ').indexOf(' ' + className + ' ') > -1;
		},
		addClass: function (className) {
			this.each(function () {
				var classStr = (this.getClassStyle() || '').trim();
				if (!classStr) {
					_util.setClass(this, className);
				}

				var cns = [], classStr = ' ' + classStr + ' ';

				jqlite.util.each((className || '').split(' '), function (i, cn) {
					if ((classStr).indexOf(' ' + cn + ' ') < 0) {
						cns.push(cn);
					}
				});

				if (cns.length > 0) _util.setClass(this, classStr.trim() + ' ' + cns.join(' '));
			});
			return this;
		},
		removeClass: function (className) {
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
		data: function (name, val, type) {
			name = 'data-' + name;
			if (arguments.length > 1) {
				this.each(function () {
					if (type === true && !jqlite.isEmptyObject(this[name])) return;
					jqlite.util.defRec(this, name, jqlite.isPlainObject(val) ? JSON.stringify(val) : String(val));
				});
				return this;
			} else {
				var rs = (this.domList.length > 0 && this.domList[0][name]) || '';
				try {
					return JSON.parse(rs);
				} catch (e) {
					return rs;
				}
			}
		},
		def: function (name, val) {
			if (arguments.length === 1) {
				return this.domList.length > 0 && this.domList[0][name];
			} else if (arguments.length === 2) {
				this.each(function () {
					jqlite.util.defRec(this, name, val)
				});
			}
			return this;
		},
		before: function ($child) {
			this.each(function () {
				this.getParent().insertBefore($child[0], this);
			});
			return this;
		},
		after: function ($child) {
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
		next: function (selector) {
			var rs = [];
			this.each(function () {
				var next = selector ? jqlite.parseSelector(selector, [this], 'next')[0] : this.getNext();
				if (next) rs.push(next);
			});
			return new JQLite(rs);
		},
		prev: function (selector) {
			var rs = [];
			this.each(function () {
				var prev = selector ? jqlite.parseSelector(selector, [this], 'prev')[0] : this.getPrevious();
				if (prev) rs.push(prev);
			});
			return new JQLite(rs);
		},
		siblings: function (selector) {
			var rs = [];
			this.each(function () {
				var cur = this;
				rs = rs.concat(selector ? jqlite.parseSelector(selector, this.getParent(), 'children') : getSiblings(this));
			});
			return new JQLite(rs);
		},
		empty: function () {
			this.each(function () {
				this.clear();
				_util.triggerDomChange(this);
			});
			return this;
		},
		remove: function () {
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
		append: function (el) {
			var $el = el instanceof JQLite ? el : [el];
			var parent = this.domList[0];
			if (!parent) return this;
			jqlite.each($el, function (i, ele) {
				parent.appendChild(ele);
				_util.triggerDomChange(parent);
			});
			return this;
		},
		replaceWith: function ($newNode) {
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
		appendTo: function (el) {
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
		insertAfter: function (el) {
			var $el = new JQLite(el);
			this.each(function () {
				var child = this;
				$el.each(function () {
					var target = this.getNext(), parent = this.getParent();
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
		insertBefore: function (el) {
			var $el = new JQLite(el);
			this.each(function () {
				var child = this;
				$el.each(function () {
					var target = this, parent = this.getParent();
					parent.insertBefore(child, target);
					_util.triggerDomChange(parent);
				});
			});
			return this;
		},
		replaceTo: function (el) {
			var $el = new JQLite(el);
			var $this = this;
			$el.each(function () {
				var target = this, parent = this.getParent();
				$this.each(function () {
					parent.insertBefore(this, target);
				});
				target.remove();
				_util.triggerDomChange(parent);
			});
			return this;
		},
		clone: function (deep) {
			return new JQLite((this.length > 0 && this.domList[0].clone(deep)) || []);
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
				jqlite.util.each(aceEvents, function (i, evt) {
					$node.off(evt);
				});
			});
		},
		on: function (evt, selector, callback) {
			evt = _eventRefer.get(evt);
			if (typeof selector === 'function') {
				callback = selector;
				selector = null;
			}

			var getEl = function (cur, el, root) {
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
					var root = this, cur = e.target;
					jqlite.each(jqlite.parseSelector(selector, root), function (i, el) {
						var _this = getEl(cur, el, root);
						if (_this) callback.apply(_this, arguments);
					});
				} : callback);
			});
			return this;
		},
		trigger: function () {
			var args = arguments;
			args[0] = _eventRefer.get(args[0]);
			this.each(function () {
				this.fire.apply(this, args);
			});
			return this;
		},
		off: function (evt, callback) {
			evt = _eventRefer.get(evt);
			this.each(function () {
				this.off.call(this, evt, callback);
			});
			return this;
		},
		exe: function (funcName, params) {
			var ret;
			this.each(function () {
				var el = this;
				if (el && typeof el[funcName] === 'function') {
					ret = el[funcName].apply(el, params);
				}
			});
			return ret;
		},
		ready: function (func) {
			window.on(_eventRefer.ready, func);
		},
		render: function (data) {
			if (this.length !== 1) return null;
			var el = this[0], vm = el.vm;
			if (!data) return vm;
			return el.vm = jqlite.vm(this, data);
		},
		show: function (p) {
			p = _animateDirectionRefer.formateShowHide(p);
			this.each(function () {
				// this.show(p);
				this.setStyle('display', '');
			});
		},
		hide: function (p) {
			p = _animateDirectionRefer.formateShowHide(p);
			this.each(function () {
				// this.hide(p);
				this.setStyle('display', 'none');
			});
		},
		//目前仅针对startAnimator进行封装
		animate: function (props, duration, easing, complete) {
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
		}
	};

	var _animateFlag = 0;

	var _animateDirectionRefer = {
		get: function (an) {
			return _animateDirectionRefer[an] || an;
		},
		formateShowHide: function (p) {
			return typeof p === 'object' ? (function () {
				p.type = _animateDirectionRefer.get(p.type)
				return p;
			})() : {
					type: p
				};
		},
		slideRight: 'slide_l2r',
		slideLeft: 'slide_r2l',
		slideUp: 'slide_b2t',
		slideDown: 'slide_t2b'
	};

	var _eventRefer = {
		get: function (evt) {
			return _eventRefer[evt] || evt;
		},
		// dbclick: 'doubleClick',
		// ready: 'loaded',
		// touchstart: 'touchDown',
		// touchmove: 'touchMove',
		// touchend: 'touchUp',
		// mousedown: 'touchDown',
		// mousemove: 'touchMove',
		// mouseup: 'touchUp',
		// scroll: 'scrollChange',
		input: 'textChanged'
	};

	var jqlite = function (selector, scope) {
		return new JQLite(selector, scope);
	};


	var toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty,
		cons = require('Console'),
		consoleLevel = ['error', 'warn', 'log'],
		_cons = function (type, args) {
			if (consoleLevel.indexOf(jqlite.util.consoleLevel) < consoleLevel.indexOf(type)) return;

			if (cons) cons[type].apply(cons, args);
		};
	cons.setFilePath("res:page/log.txt");

	jqlite.each = function (obj, callback, context) {
		if (!obj) return;
		var ret;
		if (this.isArray(obj) || (!this.util.isString(obj) && this.util.isNotNaNNumber(obj.length))) {
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
		}/*else{
			callback.call(context, 0, obj);
		}*/
	};

	var querySelector = function (slts, scopes, mode) {
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
				while ((scope = scope && scope.getPrevious()) && (el = matchQuery([scope], sltsCopy)).length === 0) { }
				eles = eles.concat(el);
			} else if (mode === 'next') {
				var el = [];
				while ((scope = scope && scope.getNext()) && (el = matchQuery([scope], sltsCopy)).length === 0) { }
				eles = eles.concat(el);
			}
		});
		return eles;
	};

	var getSiblings = function (el) {
		var next = el, prev = el, arr = [];
		while ((next = next && next.getNext()) || (prev = prev && prev.getPrevious())) {
			arr.push(next || prev);
		}
		return arr;
	};

	var walker = function (scope, slt, flag) {
		var rs = [];
		jqlite.util.each(scope.getChildren ? scope.getChildren() : [], function (i, el) {
			if (el.hasAttr && el.hasAttr(slt.attrName)) rs.push(el);
			if (flag) rs = rs.concat(walker(el, slt, flag));
		});
		return rs;
	};

	var matchQuery = function (nodes, slts) {
		if (slts.length === 0) return nodes;
		var eles = [];
		jqlite.util.each(nodes, function (j, el) {
			var flag = true;
			jqlite.util.each(slts, function (k, slt) {
				if (
					(slt.type === 'id' && el.getId() !== slt.id)
					||
					(slt.type === 'class' && ((' ' + el.getClassStyle() + ' ').indexOf(' ' + slt.className + ' ') < 0))
					||
					(slt.type === 'attr' && (typeof slt.attrValue === 'undefined' ? !el.hasAttr(slt.attrName) : el.getAttr(slt.attrName) !== slt.attrValue))
					||
					(slt.type === 'tag' && el.getTag() !== slt.tagName)
				) {

					return flag = false;
				}
			});
			if (flag) {
				eles.push(el);
			}
		});
		return eles;
	};

	function getSeletorSplit(str){
		var reg = /([^ \~\>]+)([ \~\>]?)/g;
		var arr, group = [];
		while(arr=reg.exec(str)){
			var selector = arr[1], flag = arr[2];
			group.push(selector);
			if(flag) group.push(flag);
		}
		return group;
	}

	jqlite.parseSelector = function (selector, scope, baseMode) {
		selector = selector.replace(/['"]/g, '')//去掉'和"引号
			.replace(/[ ]*([\=\:,>~])[ ]*/g, '$1')//去掉=、:、,、>、~两侧的空格
			.replace(/([\[\.])[ ]*/g, '$1')//去掉[和.右侧的空格
			.replace(/[ ]*\]/g, ']')//去掉]左侧的空格
			.replace(/[ ]+/g, ' ');//合并多个空格为一个空格
		var exeps = selector.split(',');
		var $scope = jqlite(scope || document), scope = [];
		$scope.each(function () {
			scope.push(this);
		});
		var rs = [];
		jqlite.util.each(exeps, function (i, exep) {
			exep = jqlite.util.trim(exep);
			// var funcStr = 'return ["' + exep.replace(/([ >~])/g, '","$1","') + '"];';
			var scopes = scope, mode = baseMode || 'all';
			// var group = (new Function(funcStr))();
			var group = getSeletorSplit(exep);

			jqlite.util.each(group, function (j, slts) {
				if (slts === ' ') { // 空格代表找后面所有子节点和子孙节点
					mode = 'all';
				} else if (slts === '>') { // >代表找当前节点的子节点（第一层）
					mode = 'children';
				} else if (slts === '~') { // ~代表当前节点同级的后续节点
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
					})
						.replace(/\.([\w\-]+)/g, function (s, s1) {
							sltArr.push({
								type: 'class',
								exep: s,
								className: s1
							});
							return '';
						})
						.replace(/\[([^\]]+)\]/g, function (s, s1) {
							var attr = s1.split('='), attrName = attr[0], attrValue = attr[1] || '';
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
						})
						.replace(/[\w\-]+/, function (s) {
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

			rs = jqlite.util.mergeArray(rs, scopes);//去重合并
		});

		return rs;
	};

	jqlite.parseHTML = function (html) {
		if (/<[^>]+>/g.test(html)) {

		} else {
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
		if (obj.constructor && !hasOwn.call(obj, "constructor")
			&& !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
			return false;
		}
		var key;
		for (key in obj) {
		}
		return key === undefined || hasOwn.call(obj, key);
	};
	jqlite.extend = function () {
		var arguments$1 = arguments;
		var this$1 = this;

		var options, name, src, copy, copyIsArray, clone;
		var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

		// Handle a deep copy situation
		if (jqlite.util.isBoolean(target)) {
			deep = target;
			target = arguments[i] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== 'object' && !this.isFunction(target)) {
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

	jqlite.inArray = function( elem, arr, i ) {
		return arr == null ? -1 : arr.indexOf.call( arr, elem, i );
	};

	jqlite.util = {
		consoleLevel: 'warn',
		each: function (obj, callback, context) {
			if (!obj) return;
			var ret;
			if (jqlite.isArray(obj) || (!jqlite.util.isString(obj) && jqlite.util.isNotNaNNumber(obj.length))) {
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
			}/*else{
				callback.call(context, 0, obj);
			}*/
		},
		isString: function (str) {
			return jqlite.type(str) === 'string';
		},
		isBoolean: function (bool) {
			return jqlite.type(bool) === 'boolean';
		},
		isNumber: function (num) {
			return jqlite.type(num) === 'number';
		},
		isNotNaNNumber: function (num) {
			return !isNaN(num) && this.isNumber(num);
		},
		isObject: function (obj) {
			return jqlite.type(obj) === 'object';
		},
		isEvent: function (e) {
			return typeof e === 'obejct' && e.type && e.target && e.timestamp;
		},
		clearObject: function (object) {
			jqlite.util.each(object, function () {
				return null;
			});
		},
		trim: function (str) { //删除左右两端的空格
			return str.replace(/(^\s*)|(\s*$)/g, "");
		},
		removeSpace: function (string) {
			return string.replace(/\s/g, '');
		},
		hasOwn: function (obj, key) {
			return obj && hasOwn.call(obj, key);
		},
		copy: function (target) {
			var ret;

			if (jqlite.isArray(target)) {
				ret = target.slice(0);
			} else if (this.isObject(target)) {
				ret = jqlite.extend(true, {}, target);
			}

			return ret || target;
		},
		defObj: function (o, a, getter, setter) {
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
		defRec: function (object, property, value) {
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
		copyArray: function (arr) {
			return Array.prototype.slice.call(arr || [], 0);
		},
		mergeArray: function (ta, na) {
			jqlite.util.each(ta, function (i, t) {
				jqlite.util.each(na, function (j, n) {
					if (n === t) return null;
				});
			});
			return ta.concat(na);
		},
		log: function () {
			_cons('log', arguments);
		},
		warn: function () {
			_cons('warn', arguments);
		},
		error: function () {
			_cons('error', arguments);
		},
		paramTransForm: function (param) {
			if (this.isObject(param)) {//如果param是Object则转为键值对参数
				var rs = [];
				this.each(param, function (k, v) {
					rs.push(k + '=' + v);
				});
				return rs.join('&');
			} else {//如果参数是键值对则转为Object
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
	var _fi = 0, JQFragment = function () {
		JQLite.apply(this, arguments.length == 0 ? jqlite.parseHTML('<box id="f_' + (_fi++) + '"></box>') : arguments);
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
				var target = this.getNext(), parent = this.getParent();
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
				var target = this, parent = this.getParent();
				parent.insertBefore(child, target);
				_util.triggerDomChange(parent);
			});
		});
		return this;
	};
	fo.replaceTo = function (el) {
		var $el = new JQLite(el);
		var $this = this, parent;
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

	var JQAdapter = function () {
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
		$parent.def('__'+$cell.attr('id'), $cell.clone(true));

		return index === 0;
	};
	ao.initEvent = function ($parent, $el, getter, callback) {

		var useSection = $parent.hasAttr('use-section');

		var cellType = 'type', sectionTitle = 'title', array;

		var getCellClone = function(id){
			return $parent.def('__'+id);
		}

		var getCells = function (sectionindex) {
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
		if(!cbs.getCellId) this.off("getView").on("getView", function(e, position, sectionindex) {
			array = getter();
		   	var $copy = getCellClone(getCells(sectionindex)[position][cellType]);
		    var $temp = $copy.clone(true);
			callback.apply(null, [$temp, position, useSection?array[sectionindex]['cells']:array]);
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
		isJQS: function (o) {
			return this.isJQLite(o) || this.isJQFragment(o) || this.isJQAdapter(o);
		},
		isJQLite: function (o) {
			return o instanceof JQLite;
		},
		isJQFragment: function (o) {
			return o instanceof JQFragment;
		},
		isJQAdapter: function (o) {
			return o instanceof JQAdapter;
		},
		isText: function (tagName) {
			return tagName === 'text' || tagName === 'iconfont';
		},
		useAdapter: function ($el) {
			var parent = $el.parent()[0];
			return parent && (typeof parent.setAdapter === 'function');
		},
		createTextNode: function (p) {

			return {
				getTag: function () {
					return '#text';
				},
				getChildren: function () {
					return [];
				},
				getParent: function () {
					return p;
				},
				setText: function (txt) {
					p.setText(txt);
				},
				getText: function () {
					return p.getText();
				}
			};
		},
		createJQAdapter: function (el) {
			return el ? new JQAdapter(el) : new JQAdapter();
		},
		createJQPlaceholder: function(){
			var dom = document.createElement("text", {style:'display:none;'});
			dom.isPlaceholder = true;
			return jqlite(dom);
		},
		createJQFragment: function () {
			return new JQFragment();
		},
		toJQFragment: function ($el) {
			var $fragment = this.createJQFragment();

			if ($el instanceof JQLite) {
				$el.children().each(function () {
					$fragment.append(this);
					return null;
				});
			} else if (typeof $el === 'object') {
				jqlite.each(jqlite.util.copyArray($el.getChildren()), function (i, child) {
					$fragment.append(child);
					return null;
				});
			} else {

				if (/<[^>]+>/g.test($el)) {

				} else {
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
		clear: function (el) {
			jqlite.each(el.getAttrs(), function (k, v) {
				if (k !== 'id') el.removeAttr(k);
				return null;
			});
		},
		copyElement: function (t, $o) {
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
					var tV = t.getText(), oV = $o[i].getText();
					if (typeof tV !== 'undefined' && tV !== oV) {
						t.setText(oV);
					}
				}
			}
		},
		closeWindow: function (params) {
			window.close(params);
		},
		openWindow: function (params, data) {
			var url = params.url, content = '';
			if (data) {
				content = jqlite.template(url, data);
				params.content = content;
			}
			if (params.content) delete params.url;
			window[params.content ? 'openData' : 'open'](params);
		},
		refreshDom: function () {
			if (arguments.length === 0) document.refresh();
			jqlite.util.each(arguments, function (i, dom) {
				jqlite(dom).each(function () {
					if (!dom) {
						document.refresh();
						return;
					}
					var tag = this.getTag && this.getTag();
					var parent = this.getParent && this.getParent(), pTag = parent && parent.getTag();
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
		toast: function (content, duration) {
			ui.toast({
				content: content,
				duration: duration
			});
		}
	};



	var converstHTTPParams = function (options) {
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
			option[k] = refer.ref ? options[refer.ref] : (options[k] || refer.dft);
		});

		var callFunction = function (json) {
			var status = json.status, data = json.data;
			(status > 199 && status < 300) ? (function () {
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
			})() : (function () {
				options.error && options.error(status)
			})();

			options.complete && options.complete(data);
		};

		var requestProgressFunction = function (json, isReq) {
			var size = json.length;
			var totleSize = json.totalLength;
			var percent = totleSize ? size / (totleSize * 2) : 0;
			percent = String(Math.floor(percent * 100) + (isReq ? 50 : 0)) + '%';
			options.uploadProgress({ type: 'requestProgress' }, size, totleSize, percent);
		};

		var responseProgressFunction = function (json) {
			requestProgressFunction(json, true);
		};

		return {
			option: option,
			callFunction: callFunction,
			requestProgressFunction: requestProgressFunction,
			responseProgressFunction: responseProgressFunction
		};

	};

	var http = require('Http');

	var go = function (options, ajax) {
		var opts = {
			url: '',
			type: 'get',
			dataType: 'text',
			data: '',
			headers: {},
			timeout: 45 * 1000,
			success: function () {

			},
			error: function () {

			},
			complete: function () {

			},
			uploadProgress: function () {

			}
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
		extend: function (opts) {
			jqlite.each(opts, function (funcName, handler) {
				JQLite.prototype[funcName] = handler;
			});
		}
	};

	jqlite.file = {
		f: require('File'),
		read: function (path) {
			return this.f.readTextFile(path);
		},
		write: function (path, content) {
			return this.f.writeTextFile({
				path: path
			}, content);
		}
	};

	jqlite.JSON = {
		parse: function (str) {
			return JSON.parse(str) || {};
		},
		stringify: function (str) {
			return JSON.stringify(str) || '';
		}
	};


	jqlite.vm = function (el, data) {
		var MVVM = require('./MVVM');
		return new MVVM(el, data);
	};

	jqlite.vm.addParser = function (rules) {
		var Parser = require('./Parser');
		Parser.add(rules);
	};


	module.exports = jqlite;

	if (typeof __EXPORTS_DEFINED__ === 'function') __EXPORTS_DEFINED__(jqlite, 'JQLite');

	var _template = require('./template');
	_template.hooks('get', function (str) {
		return jqlite.file.read(str);
	});
	_template.hookHelper('getDom', function (id) {
		return require('Document').getElement(id);
	});
	jqlite.template = _template;


})();
