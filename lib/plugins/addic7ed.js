exports = module.exports = {};

var parseString = require('xml2js').parseString;
// var xmldoc = require('xmldoc');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var _ = require('lodash');

// var request = require('request');
var debug = require('debug')('autosub:plugin:addic7ed');
var Q = require('q');
var request = require('request').defaults({
  'headers':{
    'User-Agent': "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:34.0) Gecko/20100101 Firefox/34.0"
  }
});

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


/**
 * lang: 1 = English, 8 = French
 */
function getSubtitles(serieName, season, episode, lang) {
  var deferred = Q.defer();
  var url = 'http://www.addic7ed.com/serie/'+serieName+'/'+season+'/'+episode+'/'+lang;
  request.get(url, function(error, response, body) {
    var ret = [];
    var doc = new dom({
      locator: {},
      errorHandler: {
        warning: function(w){}
      }
    }).parseFromString(body);
    var select = xpath.useNamespaces({'html': 'http://www.w3.org/1999/xhtml'});
    var nodes = select("//html:a[@class='buttonDownload']", doc);
    nodes.forEach(function(n) {
      var root = n.parentNode.parentNode.parentNode;
      var subUrl = n.getAttribute('href');
      var desc = n.textContent;
      var info = select(".//html:td[@class='NewsTitle']", root)[0];
      var team = info.textContent.split(',')[0].replace('Version ', '');
      var language = _.trim(select(".//*[@class='language']", root)[0].textContent);
      var completed = _.trim(select('.//html:b', n.parentNode.parentNode)[0].textContent);
      // FIXME: Create valid sub info
      ret.push({
        engine: 'Addic7ed',
        name: team + ': ' + desc + '('+completed+')',
        team: team,
        language: language,
        download: function() {
          // Stream file
          return request({
            url: 'http://www.addic7ed.com'+subUrl,
            headers: {
              'Referer': 'http://www.addic7ed.com/'
            }
          });
        }
      });
    });
    deferred.resolve(ret);
  });
  return deferred.promise;
}

exports.search = function (info) {
  if (info===null || info.type !=='SERIE') return [];
  return Q.all([getSubtitles(info.serie, info.season, info.episodes[0], 1),
               getSubtitles(info.serie, info.season, info.episodes[0], 8)]);
};
