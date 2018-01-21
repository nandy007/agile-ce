var env = require('./libs/env');
env.JQLite = require('JQLite');
if(!env.$) env.$ = env.JQLite;

module.exports = env.JQLite;
