var env = require('./libs/env');
env.JQLite = require('./libs/JQLite.browser');
if(!env.$) env.$ = env.JQLite;

module.exports = env.JQLite;
