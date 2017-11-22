var __ACE__ = {};
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
};