"use strict"

module.exports = (models,middlewares) => {
  const sequelizeResource = require("sequelize-resource")(models.sequelize,models.Sequelize);
  const moduleLoader = require("mod-loader");
  const path         = require("path");
  const bodyParser   = require("body-parser");
  let controllers = {};

  moduleLoader.loadModulesSync({
    baseDirectory: path.join(__dirname),
    moduleHolder: controllers,
    doNotInclude: [
      "index.js"
    ]
  },(moduleLoaded) => {
    return require(moduleLoaded)(sequelizeResource,models,middlewares);
  });

  return controllers;
};
