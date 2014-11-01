exports = module.exports = {};

var Q = require('q');
var request = require('request');
var path = require("path");
// var zlib = require('zlib');
// var http = require('http');
// var https = require('https');
// var fs = require('fs');
// var os = require("os");
var JSZip = require("jszip");

function clean(file) {
    return function() {
        fs.rmdir(file);
    };
}

function downloadSubtitleEpisode(entry) { // Where
    return function(writable){
        var Stream = require('stream');
        var stream = new Stream();
        stream.pipe(writable);
        stream.emit('data', entry.asText());
    };
}

/**
 * Extract subtitles in temp directory
 * @param {String} url
 */
function extractResult(url) {
    var deferred = Q.defer();
    request({ url: url, encoding: null}, function(error, response, body) {
        if(error) {
            console.log("ERROR!!!!");
            deferred.resolve([]);
        }else{
            var zip = new JSZip();
            zip.load(body);
            var s = [];
            Object.keys(zip.files).forEach(function(k) {
                var dn = downloadSubtitleEpisode(zip.files[k]);
                s.push({ name: k, engine: 'sous-titres.eu', download: dn });
            });
            deferred.resolve(s);
        }
    });
    return deferred.promise;
}

exports.search = function (info) {
    var deferred = Q.defer();
    if (info.type == 'SERIE') {
        // https://www.sous-titres.eu/series/game_of_thrones.xml
        var url = 'https://www.sous-titres.eu/series/' + info.serie.toLowerCase().replace(" ", "_") +'.xml';
        request(url, function(error, response, body) {
            if(error) {
                deferred.reject(error);
            }else{
                var xml2js = require('xml2js');
                var parser = new xml2js.Parser();
                parser.parseString(body, function(err, result) {
                    var subs = [];
                    var items = result.rss.channel[0].item;
                    items.forEach(function(item) {
                        // Find episode zip or season zip
                        // ex: Utopia.S1.HAGGiS.FR.FDC.zip , Utopia.2x01.FR.FDC.zip
                        // RegExp Episodes
                        var regexp = new RegExp(info.season + "x0" + info.episodes[0]);
                        // RegExp Season
                        var sRegexp = new RegExp("S"+info.season);
                        var r;
                        if(regexp.test(item.title[0])) {
                            subs.push(extractResult(item.link[0]));
                        } else if(sRegexp.test(item.title[0])){
                            subs.push(extractResult(item.link[0]));
                        }
                    });
                    deferred.resolve(Q.all(subs));
                });
            }
        });
    }else{
        deferred.reject(new Error("Handle only Serie!"));
    }
    return deferred.promise;
};
