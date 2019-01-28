
module.exports = function(jqlite){
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
    
    jqlite.vm.addEventFilter = function (filters) {
		var Parser = require('./Parser');
		Parser.addEventFilter(filters);
    };
    
    jqlite.BaseComponent = require('./BaseComponent');
};