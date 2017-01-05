"use strict"

module.exports = (sequelize,DataTypes) => {
  const AuthorizationCode = sequelize.define("authorization_codes",{

  },{
      schema : "public",
      freezeTableName : true,
      associate : (models) => {

      },
      classMethods : {

      },
      instanceMethods : {

      }
  });

  return AuthorizationCode;
};
