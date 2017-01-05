"use strict"

module.exports = (sequelize,DataTypes) => {

  const ApiAccount = sequelize.define("api_accounts",{
    account_id: {
      field : "account_id",
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey: true,
      comment : "Identificador único de la cuenta de API"
    },
    client_id : {
      field : "client_id",
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment : "Identificador del cliente"
    },
    account_name : {
      field : "account_name",
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment : "Nombre de la cuenta del api"
    },
    account_details: {
      field : "account_details",
      type: DataTypes.JSON,
      comment : "Detalles de la cuenta como metadata"
    },
    scopes: {
      field : "base_scopes",
      type: DataTypes.STRING,
      comment : "Scopes ó ámbitos básicos otorgados a los token del cliente"
    }

  },{
      schema : "oauth",
  		freezeTableName : true,
      classMethods : {
        associate : (models) => {
          ApiAccount.belongsTo(models.OAuthClient,{
            foreignKey: "client_id",
            constraints: false,
            as: "client"
          })
        }
      }
  });

  return ApiAccount;
};
