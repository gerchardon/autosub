exports = module.exports = {};

var parseString = require('xml2js').parseString;
var xmldoc = require('xmldoc');
var request = require('request');
var winston = require('winston');
var Q = require('q');

// http://www.addic7ed.com/ajax_getShows.php
// http://www.addic7ed.com/ajax_getSeasons.php?showID=3249
// http://www.addic7ed.com/ajax_getEpisodes.php?showID=3249&season=2
// Get subs... ???
function getSerieId(serie) {
  var deferred = Q.defer();
  request.get('http://www.addic7ed.com/ajax_getShows.php', function(error, response, body) {
    var document = new xmldoc.XmlDocument('<root>'+body+'</root>');
    var options = document.children[1].children;
    for(var i=1; i<options.length; i++) {
      if (options[i].val === serie) {
        deferred.resolve(options[i].attr.value);
        return;
      }
    }
    deferred.error(new Error("Not found serie : "+serie));
  });
  return deferred.promise;
}

function getEpisodes(serieId, season) {
  var deferred = Q.defer();
  var url = 'http://www.addic7ed.com/ajax_getEpisodes.php?showID='+serieId+'&season='+season;
  request.get(url, function(error, response, body) {
    var document = new xmldoc.XmlDocument('<root>'+body+'</root>');
    var options = document.children[0].children;

    console.log(options);
    deferred.resolve([]);
  });
  return deferred.promise;
}

exports.search = function (info) {
  return getSerieId(info.serie).then(function(serieId){
    return getEpisodes(serieId, info.season);
  });
};
