"use strict";

module.exports = function(sequelize, DataTypes, common) {
	const localize = common.localize;
	const memcached = common.memcached;
	const RefreshToken = sequelize.define('refresh_token', {
		refresh_token: {
		  type : DataTypes.STRING,
		  field : "refresh_token",
		  primaryKey: true
		},
		client_id: {
	    type: DataTypes.STRING,
	    field: 'client_id'
	  },
	  token_data: {
	    type: DataTypes.JSON,
	    field: 'token_data'
	  },
	  scopes : {
	  	type : DataTypes.STRING,
	  	field: "scopes"
	  },
		is_used: {
			field : "is_used",
			type: DataTypes.BOOLEAN
		},
	  expires: {
	    type: DataTypes.DATE,
	    field: 'expires'
	  }
	}, {
	  schema: 'oauth',
		freezeTableName : true,
		classMethods : {
		  associate: (models) => {
		  		RefreshToken.belongsTo(models.OAuthClient,{foreignKey : "client_id"})
		  },
			findToken: (token,locale) => {
				return new Promise((resolve,reject)=> {
					localize.setLocale(locale)
					let memorySearch = `refreshToken@${token}`;
					memcached.get(memorySearch,(err,memoryToken) => {
						if(err) {
							return reject(err);
						} else if (memoryToken != null ) {
							return resolve(memoryToken);
						} else {
							RefreshToken.findById(token).then((instance)=> {
								if( instance != null ) {
									return resolve(instance);
								} else {
									return reject({
										error : "invalid_grant",
										error_description: localize.__("invalid_refresh_token")
									});
								}
							}).catch((error) => {
								return reject({
									error: "invalid_request",
									error_description: error.message
								});
							});
						}
					});
				});
			}
		}
	});

	return RefreshToken;
};
