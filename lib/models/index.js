"use strict"

module.exports = (config,common) => {
  config.define = {
    createdAt : "created_at",
    updatedAt : "updated_at",
    timestamps : true,
    freezeTableName : true
  };
  const db = {};
  const moduleLoader = require("mod-loader");
  const Sequelize = require("sequelize");
  const sequelize = new Sequelize(config.database,config.username,config.password,config);
  const path = require("path");

  moduleLoader.loadModulesSync({
    baseDirectory: path.join(__dirname),
    moduleHolder: db,
    doNotInclude: [
      "index.js"
    ]
  },(moduleLoaded) => {
    return require(moduleLoaded)(sequelize,Sequelize,common);
  });

  Object.keys(db).forEach((modelName) => {
    if ("associate" in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
};
