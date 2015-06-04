/*jslint node: true */
"use strict";

var _ = require('lodash');
var globby = require("globby");
var path = require("path");
var resolver = module.exports;


resolver.lookup = function(cb) {
  var subPlugins = this._findPluginsIn(this);

  if(_.isFunction(cb)) {
    cb(null);
  }
};

resolver._findPluginsIn = function (searchPaths) {
  var modules = [];
  searchPaths.forEach(function(root) {
    if (!root) {
      return ;
    }

    modules = globby.sync([
      'subplugin-*',
      '@*/subplugin-*'
    ], { cwd: root}).map(function(match) {
      return path.join(root, match);
    }).concat(modules);
  });
  return modules;
};

resolver._getNpmPaths = function() {
  var paths = [];
  return paths.reverse();
};
