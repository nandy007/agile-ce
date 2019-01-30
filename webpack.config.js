var webpack = require('webpack'),
    path = require('path'),
    packageJSON = require('./package.json');
//var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var argv = require('yargs').argv;
var env = argv.env || {};
var usein = env.usein || 'browser';
var compress = env.compress&&env.compress==='false'?false:true;
var version = packageJSON.version+'.'+new Date().getTime();
var fileName = 'agile.ce.'+usein+(compress?'.min':'');

var copyright = [
    '/*',
    ' *	Agile CE 移动前端MVVM框架',
    ' *	Version	:	'+version+' beta',
    ' *	Author	:	nandy007',
    ' *	License MIT @ https://github.com/nandy007/agile-ce',
    ' */'
].join('\r\n');

var plugins = (function(){
    var plugins = [];
    if(compress){
        plugins.push(new webpack.optimize.UglifyJsPlugin({//加密压缩
            beautify: false,
            mangle: {
                except: ['$', 'exports', 'require']
            },
            compress: {
                warnings: false
            }
        }));
    }

    plugins.push((function(){
        function NativeModulePlugin(options) {
            // Setup the plugin instance with options...
        }

        NativeModulePlugin.prototype.apply = function(compiler) {
            compiler.plugin('done', function() {
                var fs = require('fs'), filePath = './dist/'+fileName+'.js', encoding = 'utf-8';
                var file = fs.readFileSync(filePath, encoding);
                var content = [];
                content.push(copyright);

                if(usein==='native'){
                    var appendContent = fs.readFileSync('./libs/append.js', encoding);
                    content.push(appendContent);  
                }

                content.push(file);
                fs.writeFile(filePath, content.join(''), {encoding:encoding}, function(err){
                    err?console.error('写入失败'):console.log('写入成功');
                });
            });
        };

        return new NativeModulePlugin({options: true});
    })());

    return plugins;
})();

module.exports = {
    //插件项
    plugins: plugins,
    //页面入口文件配置
    entry: ['./main.js'],
    //入口文件输出配置
    output: {
        path: path.join(__dirname, './dist'),
        filename: fileName+'.js'
    },
    module: {
        //加载器配置
        loaders: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": ["es2015", "react", "stage-3"],
                        "plugins": [["transform-es2015-arrow-functions"], "transform-object-assign", "transform-async-to-generator"]
                    }
                }
            }
        ]
    },
    externals: {
      "Document": "commonjs Document",
      "Window": "commonjs Window",
      "Console": "commonjs Console",
      "ListAdapter": "commonjs ListAdapter",
      "Http": "commonjs Http",
      "File": "commonjs File",
      "UI": "commonjs UI",
      "Time": "commonjs Time"
    },
    //其它解决方案配置
    resolve: {
        extensions: ['.js', '.json', '.scss'],
        alias: {
            "JQLite": path.join(__dirname, "./libs/JQLite."+usein+".js"),
        }
    }
};