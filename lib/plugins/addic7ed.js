exports = module.exports = {};

var parseString = require('xml2js').parseString;
var xmldoc = require('xmldoc');
var request = require('request');
var winston = require('winston');
var Q = require('q');
exports.search = function (info) {
    var deferred = Q.defer();
    if(info.type == 'SERIE') {
        // TODO: fix
        // http://www.addic7ed.com/ajax_getShows.php?showID=344
        request.get('http://www.addic7ed.com/ajax_getShows.php?showID=344', function(error, response, body) {
            var document = new xmldoc.XmlDocument('<root>'+body+'</root>');
            var options = document.children[1].children;
            for(var i=1; i<options.length; i++) {
                if (options[i].val == info.serie) {
                    console.log(options);
                }
            }
            // console.log(document.children[1].children[1]);
            deferred.resolve([]);
        });
        // http://www.addic7ed.com/ajax_getSeasons.php?showID=3249
        // http://www.addic7ed.com/ajax_getEpisodes.php?showID=3249&season=2
    }else{
        winston.error('Error !');
        deferred.resolve([]);
    }
    return deferred.promise;
};
