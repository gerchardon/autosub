exports = module.exports = {};

var Q = require('q');
var OS = require("opensubtitles");
var os = new OS();


// [{'moviehash': '7d9cd5def91c9432', 'sublanguageid': 'eng', 'moviebytesize': 735934464}]);
// [{'query': 'Scorpion S01E04', 'sublanguageid': 'eng,fra'}]
exports.search = function (info) {
    var deferred = Q.defer();
    // FIXME: change user agent !
    if(info.type==="SERIE") {
        os.api.LogIn(function(err, res){
            os.api.SearchSubtitles(function(err, r){
                deferred.resolve(r.data);
            }, res.token,[{'query': info.serie, 'season': info.season, 'episode': info.episodes[0], 'sublanguageid': 'eng,fra'}]);
        }, "<USERNAME>","<PASSWORD>","fr", "OS Test User Agent");
    }else{
        deferred.reject('Type not handle yet!');
    }
    return deferred.promise;
};
