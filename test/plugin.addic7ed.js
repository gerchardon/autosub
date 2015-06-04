var should = require('chai').should();

var addicted = require('../lib/plugins/addic7ed');
var tools = require('video-tools');
var info = tools.info('Scorpion.S01E04.HDTV.x264-LOL.mp4');
var winston = require("winston");

describe('autosub.plugins.addic7ed', function() {
  this.timeout(5000);

  it('search', function(done) {
    addicted.search(info).then(function(results) {
      should.exist(results);
      results.should.be.a('array');
      results.should.not.empty;

      results.forEach(function(r){
        // TODO: Check all result ...
        // winston.info(r);
        should.exist(r.language);
        should.exist(r.download);
        // r.download().pipe(process.stdout);
      });
      done();
    }).done();
  });
});
