
module.exports = function(jqlite){
  jqlite.JSON = {
		stringify: function(json){
			try{
				return typeof json==='object' ? JSON.stringify(json) : json;
			}catch(e){
				console.error('json数据转换字符串失败：'+String(json));
			}
			return json;
		},
		parse: function(val){
			try{
				return JSON.parse(val);
			}catch(e){
				val = new Function(`return ${val};`)();
				if(typeof val!=='object') {
					console.error('json字符串转换对象失败：'+String(val));
					return null;
				};
			}
			return val;
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
    
  jqlite.vm.addEventFilter = function (filters, type) {
		var Parser = require('./Parser');
		Parser.addEventFilter(filters, type);
	};
	
	jqlite.vm.setVMPre = function(setting){
		var Parser = require('./Parser');
		Parser.setVMPre(setting);
	};
	jqlite.vm.getVMPre = function(){
		var Parser = require('./Parser');
		return Parser.getVMPre();
	};
    
  jqlite.BaseComponent = require('./BaseComponent');
};