var Q = require('q');
var tools = require('video-tools');
var fs = require('fs');
var path = require("path");
var debug = require("debug")('autosub');
var _ = require('lodash');


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
  return this.search(path.basename(filePath), filePath).then(function (results) {
    var deferred = Q.defer();
    var r = results;
    var temp = r.sort(function(a, b){
      return 0;
    });
    debug(temp);

    // Show Choicies!
    for(var i=0; i<r.length; i++){
      console.log("%d : [%s] %s", i, r[i].engine, r[i].name);
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
        debug("Download %j", sub);
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

autosub.prototype.search = function (name, filePath) {
  var info = tools.info(name);
  if(info === null) {
    var deferred = Q.defer();
    deferred.resolve([]);
    return deferred.promise;
  }

  var searchs = [];
  var plugins = this.plugins;
  Object.keys(plugins).forEach(function(key){
    debug('launch search for %s', key);
    searchs.push(plugins[key].search(info, filePath));
  });
  return Q.allSettled(searchs).then(function(results) {
    return _.flattenDeep(_.pluck(
      _.filter(results, {state: 'fulfilled'}),
      'value'));
  });
};

exports = module.exports = autosub;
