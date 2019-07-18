
(function(){

	var $ = require('./env').JQLite;

	/**
	 * updater 视图刷新模块
	 */
	function Updater (vm) {
		this.vm = vm;
		this.eventHandler = this.createEventHandler();
	}

	var up = Updater.prototype;

	//事件处理器
	up.createEventHandler = function(){
		return {
			callbacks : {},
			index : 2016,
			listeners : {},
			add : function ($node, evt, callback, context) {
				var index = this.index++;

				this.callbacks[index] = callback;

				this.listeners[index] = function () {
					callback.apply(context || this, arguments);
				};
				$node.__on__(evt, this.listeners[index]);
			},
			remove : function ($node, evt, callback) {
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
	up.updateList = function($parent, $node, options, cb){
		var method = options.method;
		switch(method){
			case 'xReset' : 
				this.updateListXReset.apply(this, arguments);
				break;
			case 'pop' : 
				this.updateListPop.apply(this, arguments);
				break;
			case 'xPush' : 
			case 'push' : 
				this.updateListPush.apply(this, arguments);
				break;
			case 'shift' : 
				this.updateListShift.apply(this, arguments);
				break;
			case 'unshift' : 
				this.updateListUnshift.apply(this, arguments);
				break;
			case 'splice' : 
				this.updateListSplice.apply(this, arguments);
				break;
			case 'xSort' : 
			case 'sort' : 
			case 'reverse' : 
				this.updateListCommon.apply(this, arguments);
				break;
			default : 
				$.util.log('尚未处理'+method+'方法');
		}
	};

	//获取vfor数据的第一个节点
	var getVforFirstChild = function(children){
		return children.length===0?null:children[0];
	};

	//获取vfor数据的最后一个节点
	var getVforLastChild = function(children){
		return children.length===0?null:children[children.length-1];
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

	function copyFragment($fragment, arr){
		arr = arr || [];
		$fragment.children().each(function(){
			arr.push($(this));
		});
		return arr;
	}

	up.updateListXReset = function($parent, $node, options, cb){
		var cbrs = cb(options.args, true), $fragment = cbrs.$fragment, children = cbrs.domList, copy$fragment = copyFragment($fragment);
		var	$placeholder = $node.def('$placeholder');
		if($placeholder){
			var	before$placeholder = $placeholder.before,
				$next = before$placeholder.next();
			//var children = getVforChildren($parent, options['vforIndex']);
			while($next && ($next.length===1) && !$next.def('isPlaceholder')){
				$next.remove();
				$next = before$placeholder.next();
			}
			$fragment.insertAfter(before$placeholder);
		}else{
			// var children = getVforChildren($parent, options['vforIndex']);
			if(children.length===0){
				$fragment.appendTo($parent);
			}else{
				$fragment.replaceTo(children[0]);
				$.util.each(children, function(i, $child){
					//$parent.remove($child);
					$child.remove();
				});
			}
		}
		copy$fragment.unshift(0, children.length);
		children.splice.apply(children, copy$fragment);
	};

	up.updateListPop = function($parent, $node, options, cb){
		var cbrs = cb(options.args), children = cbrs.domList;
		var $placeholder = $node.def('$placeholder');
		if($placeholder){
			var	after$placeholder = $placeholder.after;
			var $last = after$placeholder.prev();
			$last&&($last.length===1)&&(!$last.def('isPlaceholder'))&&$last.remove();
		}else{
			var $children = getVforFirstChild(children);
			$children&&$children.remove();
		}
		children.pop();
	};

	up.updateListPush = function($parent, $node, options, cb){
		var cbrs = cb(options.args, true), $fragment = cbrs.$fragment, children = cbrs.domList, copy$fragment = copyFragment($fragment);
		var $placeholder = $node.def('$placeholder');
		if($placeholder){
			var	after$placeholder = $placeholder.after;
			$fragment.insertBefore(after$placeholder);
		}else{
			var $children = getVforLastChild(children);
			if($children&&$children.length>0){
				$fragment.insertAfter($children);
			}else{
				$fragment.appendTo($parent);
			}
		}
		children.push.apply(children, copy$fragment);
	};

	up.updateListShift = function($parent, $node, options, cb){
		var cbrs = cb(options.args), children = cbrs.domList;
		var $placeholder = $node.def('$placeholder');
		if($placeholder){
			var	before$placeholder = $placeholder.before;
			var $first = before$placeholder.next();
			$first&&($first.length===1)&&(!$first.def('isPlaceholder'))&&$first.remove();
		}else{
			var $children = getVforFirstChild(children);
			$children&&$children.remove();
		}
		children.shift();
	};

	up.updateListUnshift = function($parent, $node, options, cb){
		var cbrs = cb(options.args, true), $fragment = cbrs.$fragment, children = cbrs.domList, copy$fragment = copyFragment($fragment);
		var $placeholder = $node.def('$placeholder');
		if($placeholder){
			var	before$placeholder = $placeholder.before;
			$fragment.insertAfter(before$placeholder);
		}else{
			var $children = getVforFirstChild(children);
			if($children&&$children.length>0){
				$fragment.insertBefore($children);
			}else{
				$fragment.appendTo($parent);
			}	
		}
		children.unshift.apply(children, copy$fragment);
	};

	up.updateListSplice = function($parent, $node, options, cb){

		var cbrs = cb(options.args), children = cbrs.domList, copy$fragment = [];

		var $placeholder = $node.def('$placeholder');

		var args = $.util.copyArray(options.args);
		var startP = args.shift(), rank = args.shift(), spliceLen;

		if(typeof rank==='undefined') rank = children.length;

		spliceLen = startP + (rank||1);

		for(var i=startP;i<spliceLen;i++){
			var $child = children[i];
			if(args.length>0){
				// var $fragment = cb(args);
				var child$cbrs = cb(args, true), $fragment = child$cbrs.$fragment;
				copy$fragment.push.apply(copy$fragment, copyFragment($fragment));
				if($child){
					$fragment.insertBefore($child);
				}else{
					if($placeholder){
						var	after$placeholder = $placeholder.after;
						$fragment.insertBefore(after$placeholder);
					}else{
						$fragment.appendTo($parent);
					}
				}
				args = [];
			};
			if(rank!==0) $child&&$child.remove();
		}

		copy$fragment.unshift(startP, rank);
		
		children.splice.apply(children, copy$fragment);

	};

	up.updateListCommon = function($parent, $node, options, cb){
		var cbrs = cb(options.args), children = cbrs.domList, copy$fragment;
		var $placeholder = $node.def('$placeholder');
		var args = options.newArray;
		for(var i=0, len=children.length;i<len;i++){
			var $child = children[i];
			if(args.length>0){
				var child$cbrs = cb(args, true), $fragment =  child$cbrs.$fragment, copy$fragment = copyFragment($fragment);
				if($child){
					$fragment.insertBefore($child);
				}else{
					if($placeholder){
						var	after$placeholder = $placeholder.after;
						$fragment.insertBefore(after$placeholder);
					}else{
						$fragment.appendTo($parent);
					}
				}
				args = [];
			};
			$child&&$child.remove();
		}
		if(copy$fragment){
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
	up.updateShowHide = function($node, defaultValue, isDisplay){
		$node.css('display', isDisplay?(defaultValue==='none'?null:defaultValue):'none');
	};

	var __RENDER = '__render';//缓存标记

	/**
	 * 互斥节点内容渲染
	 */
	up.mutexRender = function ($node, cb, isShow) {

		var $placeholder = $node.def('__$placeholder'), $fragment = $placeholder.def('__$fragment'), $replace = $placeholder.def('__$replace');

		// 渲染
		if(isShow){
			cb($node);
			if($replace){
				$fragment.append($replace);
			}
			$node.insertAfter($placeholder);
			$placeholder.def('__$replace', $node);
		}else{
			$fragment.append($node);
		}

	};
	up.branchRender = function($placeholder, $node, cb){
		var $old = $placeholder.def('old');
		$old && $old.remove();
		if($node){
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
		}else {
			$node.attr(attribute, value);
		}
	};

	/**
	 * 更新节点的 data realize v-data
	 * @param   {JQLite}      $node
	 * @param   {String}      dataName
	 * @param   {String}      value
	 */
	up.updateDataSet = function ($node, attribute, value) {
		$node.data(attribute, value);
	};

	/**
	 * 更新节点的 class realize v-bind:class
	 * @param   {JQLite}              $node
	 * @param   {String|Object}       className
	 * @param   {Boolean}             isAdd
	 */
	up.updateClass = function($node, className, isAdd){
		if(arguments.length===2){
			$.util.each(className, function(name, flag){
				this.updateClass($node, name, flag);
			}, this);
		}else{
			$node[isAdd?'addClass':'removeClass'](className);
		}
	};

	/**
	 * 更新节点的 style realize v-bind:style
	 * @param   {JQLite}      $node
	 * @param   {String}      property  [属性名称]
	 * @param   {String}      value     [样式值]
	 */
	up.updateStyle = function ($node, property, value) {
		if(arguments.length===2){
			$.util.each(property, function(name, val){
				this.updateStyle($node, name, val);
			}, this);
		}else{
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
		if($radio.xprop('checked')!=checkStatus) $radio.xprop('checked', checkStatus);
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
		
		var checkStatus = $.util.isBoolean(values) ? values : (values.indexOf(value) > -1);

		if($checkbox.xprop('checked')!=checkStatus) $checkbox.xprop('checked', checkStatus);

	};

	/**
	 * 更新 swtich 的激活状态 realize v-model
	 * @param   {JQLite/input}          $checkbox
	 * @param   {Boolean}               value      [激活数组或状态]
	 */
	up.updateSwitchChecked = function ($switch, value) {
		var checkStatus = !!value;
		if($switch.xprop('checked')!=checkStatus) $switch.xprop('checked', checkStatus);

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