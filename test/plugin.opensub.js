var should = require('chai').should();

var opensub = require('../lib/plugins/opensub');
var tools = require('video-tools');
var info = tools.info('Scorpion.S01E04.HDTV.x264-LOL.mp4');
var winston = require("winston");

describe('autosub.plugins.opensub', function() {
    this.timeout(5000);

    it('search length', function(done) {
        opensub.search(info).then(function(results) {
            should.exist(results);
            results.should.be.a('array');
            results.should.not.empty;

            results.forEach(function(r){
                winston.debug("zzzz");
                console.log(r.MovieKind);
                console.log(r.SubLanguageID);
                console.log(r.SubFormat);
            });
            done();
        }).done();
    });
});
