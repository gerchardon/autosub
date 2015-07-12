(function(){
  "use strict";
  exports = module.exports = {};
  var config = require("config");
  var debug = require('debug')('autosub:plugin:opensub');
  var fs = require('fs');
  var OS = require("opensubtitles");
  var os = new OS();
  var Q = require('q');
  var request = require("request");
  var tools = require('video-tools');
  var _ = require('lodash');


  function computeHash(filePath) {
    debug('start compute hash');
    var deferred = Q.defer();
    os.computeHash(filePath, function(err, hash){
      debug('end compute hash');
      if(err) deferred.reject(err);
      deferred.resolve(hash);
      // os.checkMovieHash([hahs], function(err, res){});
    });
    return deferred.promise;
  }

  function logIn(){
    debug('start login');
    var deferred = Q.defer();
    os.api.LogIn(function(err, res){
      debug('end login');
      if(err) {
        debug("Error when login to OpenSub", err);
        deferred.reject('loging failed');
      }else if(res.status != '200 OK')  {
        debug("Error when login to OpenSub, code : %s", res.status);
        deferred.resolve('login failed');
      }else{
        deferred.resolve(res.token);
      }
    }, config.get("OpenSub.user"),config.get("OpenSub.password"), "fr",
                 "Autosub.JS v0.1");
    return deferred.promise;
  }

  function searchWithQuery(query) {
    debug('launch query', query);
    return logIn().then(function(token) {
      var deferred = Q.defer();
      os.api.SearchSubtitles(function(err, r){
        var ret = [];
        if(r.data) {
          debug("OpenSub SearchSubtitles find :", r.data.length);
          // Delete sub with same IDSubtitleFile
          var subs = _.uniq(r.data, 'IDSubtitleFile');
          subs.forEach(function(d) {
            var i = tools.info(d.SubFileName.replace('.srt', '.avi'));
            ret.push({
              engine: 'OpenSub',
              name: d.SubFileName,
              team: (i) ? i.team : null,
              language: d.SubLanguageID,
              download: function(){
                // TODO: Download as gunzip
                return request({
                  url: d.SubDownloadLink.replace(/.gz$/,'')
                });
              }
            });
          });
          }
        deferred.resolve(ret);
      }, token, query);
      return  deferred.promise;
    });
  }


  // [{'moviehash': '7d9cd5def91c9432', 'sublanguageid': 'eng', 'moviebytesize': 735934464}]);
  // [{'query': 'Scorpion S01E04', 'sublanguageid': 'eng,fra'}]
  exports.search = function (info, filePath) {
    debug('Find with :', info, filePath);
    if(!config.has("OpenSub.user")) {
      var deferred = Q.defer();
      debug('OpenSub.user not config');
      deferred.resolve([]);
      return deferred.promise;
    }
    return computeHash(filePath).then(function(hash) {
      var query = [];
      var size = fs.statSync(filePath).size;
      query.push({moviehash: hash, moviebytesize: size, sublanguageid: 'eng,fra'});
      if(info && info.type==="SERIE") {
        query.push({'query': info.serie, 'season': info.season, 'episode': info.episodes[0], 'sublanguageid': 'eng,fra'});
      }
      return searchWithQuery(query);
    });
  };
})();
