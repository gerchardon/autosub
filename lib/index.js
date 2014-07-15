exports = module.exports = createAutoSub;

function createAutoSub(additionalsPluginPath){
    // Load Plugins
    var plugins = require('./plugins');

    return {
        "plugins": plugins
    };
}


exports.prototype.search = function (name) {
    console.log(name);
};
