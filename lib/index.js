var Q = require('q');
var tools = require('video-tools');
var winston = require('winston');
var fs = require('fs');
var path = require("path");


function autosub() {
  // Load Plugins
  // TODO: Handle external plugins
  this.plugins = require('./plugins');
  this.resolver = require('./resolver');
}

/**
 * Download subtitles
 * @param {String} absolute path name
 */
autosub.prototype.download = function(filePath) {
  // Test if file exist !
  if(!fs.existsSync(filePath)) {
    return Q.fcall(function() {
      throw new Error(filePath+' not found');
    });
  }
  // Sample !
  return this.search(path.basename(filePath)).then(function (results) {
    var deferred = Q.defer();
    // TODO: Opti return !
    var r = [].concat.apply([], results);
    r = [].concat.apply([], r);
    // Order choices
    var temp = r.sort(function(a, b){
      return 0;
    });
    winston.debug(temp);

    // Show Choicies!
    for(var i=0; i<r.length; i++){
      winston.info("%d : [%s] %s", i, r[i].engine, r[i].name);
    }

    var readline = require('readline');
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // FIXME: Add auto choice with favorite / team / quality / ...
    rl.question("What subtitles? ", function(answer) {
      rl.close();
      var sub = r[answer];
      if(sub && sub.download){
        winston.debug("Download %j", sub, {});
        var srtFile = filePath.replace(path.extname(filePath), ".srt");
        sub.download().pipe(fs.createWriteStream(srtFile));
        deferred.resolve();
      }else{
        deferred.resolve();
      }
    });
    return deferred.promise;
  });
};

autosub.prototype.search = function (name) {
  var info = tools.info(name);

  var searchs = [];
  var plugins = this.plugins;
  Object.keys(plugins).forEach(function(key){
    searchs.push(plugins[key].search(info));
  });
  return Q.all(searchs);
};

exports = module.exports = autosub;
