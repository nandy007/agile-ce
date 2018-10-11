(function(){
	var $ = require('./env').JQLite;
	var Parser = require('./Parser');

	var BRACE2RE = /\{\{([^\}]*)\}\}/;
	var SPLITRE = /[\:\#\$\*\.]/;
	var TEMPTEXT = '$$text';

	var compileUtil = {	
		isDirective : function (directive) {//判断是否是指令
			return directive.indexOf('v-') === 0;
		},
		getDirName : function(dir){//获取指令名，v-bind -> vbind
			return dir.split(SPLITRE)[0].replace('-', '');
		},
		isInPre : function ($node) {//是否需要预编译
			return $node.isElement()&&($node.hasAttr('v-if') || $node.hasAttr('v-for') || $node.hasAttr('v-pre'));
		},
		useTemplate: function($node){
			return $node.isElement()&&(!$node.hasAttr('v-for'))&&($node.hasAttr('v-template') || $node.hasAttr('useTemplate'));
		},
		hasDirective : function ($node) {//节点是否包含指令属性
			var nodeAttrs, ret = false;
			if ($node.isElement() && (nodeAttrs=$node.attrs()).length>0) {
				$.util.each(nodeAttrs, function(i, attr){
					if (compileUtil.isDirective(attr.name)) {
						ret =  true;
						return false;
					}
				});
			} else if ($node.elementType()==='#text' && BRACE2RE.test($node.text())) {
				ret =  true;
			}
			return ret;
		},
		isTheDirective : function(type, dir){//是否为指定指令
			return dir === type;
		}
	};



	/**
	 * 指令提取和编译模块
	 * @param  {JQLite|Native}      element [视图根节点]
	 * @param  {Object}             model   [数据模型对象]
	 */
	var Compiler = function(element, model) {

		var compiler = this;

		var $element = $(element);

		// $element.on('DOMNodeRemoved', function(){
		// 	compiler.destroy();
		// });

		if (!$element.isElement()||$element.length===0) {
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
		//按步骤编译
		this.compileSteps(this.$element);
	};

	/**
	 * 按步骤编译节点
	 * @param   {JQFragment|JQLite}    $element            [文档碎片/节点]
	 * @param   {Object}               fors                [for别名映射]
	 * @param   {Boolean}              isHold              [是否保持指令不删除]
	 */
	cp.compileSteps = function($element, fors, isHold){
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
		
		$element.each(function(){
			var $node = $(this);

			// 若节点使用模板，预先对模板进行注入
			if(compileUtil.useTemplate($node)) _this.compileTemplate($node, fors);

			if($node.hasAttr('vmignore')) return;
			//缓存指令节点
			if (compileUtil.hasDirective($node)) {
				directiveNodes.push({
					el : $node,
					fors : fors
				});
			}

			if(compileUtil.isInPre($node)) return;
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
		$.util.each(directiveNodes, function(i, info){
			this.compileDirective(info, isHold);
		}, this);
	};

	/**
	 * 编译单个指令节点
	 * @param   {Array}    info                [{$node, fors}]
	 * @param   {Boolean}  isHold              [是否保持指令不删除]
	 */
	cp.compileDirective = function (info, isHold) {
		var $node = info.el, fors = info.fors;

		if($node.isElement()){
			var nodeAttrs = $node.attrs(),
				priorityDirs = {
					vfor : null,
					vlike : null,
					vfilter : null,
					vcontext : null,
					vif : null
				};

			$.util.each(nodeAttrs, function(i, attr){
				var name = attr.name;
				if (compileUtil.isDirective(name)) {
					if (compileUtil.isTheDirective('v-for', name)) {
						priorityDirs.vfor = attr;//v-for指令节点其他指令延后编译
						var filterAttr = $node.attr('v-filter');
						if(filterAttr) priorityDirs.vfilter = {name:'v-filter', value:filterAttr};
						return false;
					}else if(compileUtil.isTheDirective('v-like', name)){
						priorityDirs.vlike = attr;//v-like指令节点优先编译
						return null;
					}else if(compileUtil.isTheDirective('v-context', name)){
						priorityDirs.vcontext = attr;//v-like指令节点优先编译
						return null;
					}else if(compileUtil.isTheDirective('v-if', name) || compileUtil.isTheDirective('v-elseif', name) || compileUtil.isTheDirective('v-else', name)){
						priorityDirs.vif = attr;//v-if指令最后编译
						return null;
					}
				}else{
					return null;
				}
			});

			//对指令优先级进行处理
			if(priorityDirs.vfor){
				nodeAttrs = [priorityDirs.vfor];
				if(priorityDirs.vfilter) nodeAttrs.unshift(priorityDirs.vfilter);
			}else{
				if((priorityDirs.vlike)) nodeAttrs.unshift(priorityDirs.vlike);
				if((priorityDirs.vcontext)) nodeAttrs.unshift(priorityDirs.vcontext);
			}
			if(priorityDirs.vif){
				nodeAttrs.push(priorityDirs.vif);
			}
			
			//编译节点指令
			$.util.each(nodeAttrs, function (i, attr) {
				this.compile($node, attr, fors, isHold);
			}, this);

		}else if($node.elementType()==='#text'){
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
		if(!isHold) $node.removeAttr(dir);

		//获取对应指令解析器
		var hander = this.parser[compileUtil.getDirName(dir)];

		if(hander){
			hander.apply(hander, args);
		}else{
			$.util.warn('指令 [' + dir + '] 未添加规则!');
		}
	};

	/**
	 * 编译模板节点 {{template}}
	 * @param   {JQLite}       $node
	 * @param   {Object}       fors
	 * @param   {Boolean}      isHold
	 */
	cp.compileTemplate = function($node, fors, isHold){
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
		text = ('"'+text.replace(new RegExp(BRACE2RE.source, 'g'), function(s, s1){
			return '"+('+s1+')+"';
		})+'"').replace(/(\+"")|(""\+)/g, '');

		if(isHold){
			$node.parent().attr('v-text', text);
		}

		var vtext = this.parser.vtext;
		vtext.call(vtext, $node, fors, text, 'v-text');
	};

	/**
	 * 销毁
	 */
	cp.destroy = function(){
		this.parser.destroy();
		this.parser = this.$data = null;
	}

	module.exports = Compiler;
})();