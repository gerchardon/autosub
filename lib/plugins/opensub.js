exports = module.exports = {};

var Q = require('q');
var OS = require("opensubtitles");
var os = new OS();
var config = require("config");
var winston = require("winston");


// [{'moviehash': '7d9cd5def91c9432', 'sublanguageid': 'eng', 'moviebytesize': 735934464}]);
// [{'query': 'Scorpion S01E04', 'sublanguageid': 'eng,fra'}]
exports.search = function (info) {
    var deferred = Q.defer();
    if(info.type==="SERIE") {
        os.api.LogIn(function(err, res){
            if(err) {
                winston.error("Error when login to OpenSub", err);
                deferred.resolve([]);
            }else if(res.status != '200 OK')  {
                winston.error("Error when login to OpenSub, code : %s", res.status);
                deferred.resolve([]);
            }else {
                os.api.SearchSubtitles(function(err, r){
                    deferred.resolve(r.data);
                }, res.token,[{'query': info.serie, 'season': info.season, 'episode': info.episodes[0], 'sublanguageid': 'eng,fra'}]);
            }
        }, config.get("OpenSub.user"),config.get("OpenSub.password"), "fr",
        "Autosub.JS v0.1");
    }else{
        deferred.reject('Type not handle yet!');
    }
    return deferred.promise;
};
