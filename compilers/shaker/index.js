/*jslint sloppy:true, nomen:true, white: true, node: true*/
var utils, command, path = require('path');

try{
    utils = require('mojito/management/utils');
} catch(e) {
    utils = require('../../app/node_modules/mojito/lib/management/utils');
}

function run (appPath, params, options, cb){
    var command = require(path.join(appPath, 'node_modules', 'mojito-shaker', 'commands' , 'shake.js'));
    command.run(params, options, function(err) {
        var data = null;
        if (err) {
            utils.error(err);
            cb(err);
        } else {
            utils.success("Shaken your assets!");
            cb();
        }
    });
}

module.exports = {
    compile: function (config, callback) {
        config = config || {};
        var params =  config.params || [],
            options = config.options || {},
            appPath = config._app_root;

        run(appPath, params, options, callback);
    }
};
