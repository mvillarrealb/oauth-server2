"use strict"

module.exports = (models,libs) => {
  const moduleLoader = require("mod-loader");
  const path         = require("path");
  let middlewares = {};
  moduleLoader.loadModulesSync({
    baseDirectory: path.join(__dirname),
    moduleHolder: middlewares,
    doNotInclude: [
      "index.js"
    ]
  },(moduleLoaded) => {
    return require(moduleLoaded)(models,libs);
  });

  return middlewares;
};
