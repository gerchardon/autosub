exports = module.exports = {};

var Q = require('q');
var OS = require("opensubtitles");
var os = new OS();
var config = require("config");
var request = require("request");
var debug = require('debug')('autosub:plugin:opensub');


// [{'moviehash': '7d9cd5def91c9432', 'sublanguageid': 'eng', 'moviebytesize': 735934464}]);
// [{'query': 'Scorpion S01E04', 'sublanguageid': 'eng,fra'}]
exports.search = function (info) {
  var deferred = Q.defer();
  if(!config.has("OpenSub.user")) {
    debug('OpenSub.user not config');
    deferred.resolve([]);
    return deferred.promise;
  }
  // TODO: Serie by NAME+SEASON+EP , by hash
  if(info.type==="SERIE") {
    os.api.LogIn(function(err, res){
      if(err) {
        debug("Error when login to OpenSub", err);
        deferred.resolve([]);
      }else if(res.status != '200 OK')  {
        debug("Error when login to OpenSub, code : %s", res.status);
        deferred.resolve([]);
      }else {
        os.api.SearchSubtitles(function(err, r){
          // console.log(r.data);
          var ret = [];
          r.data.forEach(function(d) {
            ret.push({
              engine: 'OpenSub',
              name: d.SubFileName,
              team: 'TODO...',
              language: d.SubLanguageID,
              download: function(){
                // TODO: Download as gunzip
                return request({
                  url: d.SubDownloadLink.replace(/.gz$/,'')
                });
              }
            });
          });
          deferred.resolve(ret);
        }, res.token,[{'query': info.serie, 'season': info.season, 'episode': info.episodes[0], 'sublanguageid': 'eng,fra'}]);
      }
    }, config.get("OpenSub.user"),config.get("OpenSub.password"), "fr",
                 "Autosub.JS v0.1");
  }else{
  // TODO: Movie by Hash , by Name
    deferred.reject('Type not handle yet!');
  }
  return deferred.promise;
};
