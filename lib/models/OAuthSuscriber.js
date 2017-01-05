"use strict";

module.exports = function(sequelize, DataTypes, common) {

	const OAuthSuscriber = sequelize.define('oauth_suscriber', {
	  suscriber_id: {
	  	type : DataTypes.INTEGER,
	  	field : "suscriber_id",
	  	primaryKey: true,
			autoIncrement: true
	  },
	  suscriber_name: {
	    type: DataTypes.STRING,
	    field: 'suscriber_name',
	    allowNull: false,
			validate : {
				notEmpty: true
			}
	  },
	  suscriber_email: {
	    type: DataTypes.STRING,
	    field: 'suscriber_email',
	    allowNull: false,
	    isEmail: true,
			validate : {
				notEmpty: true
			}
	  },
	  suscriber_contact: {
	    type: DataTypes.STRING,
	    field:"suscriber_contact"
	  },
	  suscriber_logo: {
	    type: DataTypes.BLOB,
	    field: "suscriber_logo",
	    get : function() {
	    	return `${this.href}/logo`;
	    }
	  },
	  suscriber_url: {
	    type: DataTypes.STRING,
	    field: "suscriber_url",
	    validate : {
	    	isUrl: true
	    }
	  },
	  is_native : {
	  	type : DataTypes.BOOLEAN,
	  	field : "is_native"
	  }
	},
	{
	   schema: 'oauth',
		 freezeTableName : true,
	   classMethods : {
	   	associate : (models) => {
	   		OAuthSuscriber.hasMany(models.OAuthClient,{foreignKey : "suscriber_id", as : "clients"});
	   	}
	   }
	});

	return OAuthSuscriber;
};
