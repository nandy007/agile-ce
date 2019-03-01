var env = require('./libs/env');
env.JQLite = require('./libs/JQLite.browser');
if(!env.$) env.$ = env.JQLite;

module.exports = env.JQLite;

if(console.debug){
    console.log = console.warn = console.error = console.debug;
}
