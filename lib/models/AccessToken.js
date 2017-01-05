"use strict";

module.exports = function(sequelize, DataTypes, common) {
	const crypto    = require("crypto");
	const moment    = require("moment");
	const memcached = common.memcached;
	const localize  = common.localize;
	const MEMORY_CACHE_INTERVAL = 74500;

	const AccessToken = sequelize.define('access_token', {
		access_token: {
		  type : DataTypes.STRING,
		  field : "access_token",
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
		is_active: {
			field: "is_active",
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
	  expires: {
	    type: DataTypes.DATE,
	    field: 'expires'
	  }

	}, {
	  schema: 'oauth',
		freezeTableName : true,
		hooks: {
			afterCreate: (instance) => {
				let memorySearch = `accessToken@${instance.access_token}`
				memcached.set(memorySearch,instance,MEMORY_CACHE_INTERVAL,(error)=>{
					if (error) {
						console.error("Could not save token in cache: "+error);
					}
				})
			}
		},
	  classMethods: {
		  associate: (models) => {
		  		AccessToken.belongsTo(models.OAuthClient,{foreignKey : "client_id"})
		  },
			generateTokens: () => {
				let nowTz = moment().format("x");
				let expireTx = moment().add(MEMORY_CACHE_INTERVAL,"seconds").format("x");
				let token = crypto.createHmac('sha256', "BULDE_SECRET").update(nowTz).digest('hex');
				let refreshToken = crypto.createHmac("sha256",expireTx).update(token).digest("hex");
		    return {
					token: token,
					refresh: refreshToken
				};
			},
			findToken: (token,locale) => {
				let memorySearch = `accessToken@${token}`
				return new Promise((resolve,reject)=> {
					localize.setLocale(locale);
					memcached.get(memorySearch,(err,memoryToken) => {
						if( err ) {
							return reject(err);
						} else if (memoryToken != null ) {
							return resolve(memoryToken);
						} else {
							AccessToken.findById(token).then((instance)=> {
								if( instance != null ) {
									memcached.set(memorySearch,instance,MEMORY_CACHE_INTERVAL,(err)=>{
										if(err) {
											console.error("Could not save token in cache: "+err);
										}
									});
									return resolve(instance.get({plain: true}));
								} else {
									return reject({
										error : "invalid_grant",
										error_description: localize.__("invalid_token")
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
			},
			/**
			 * @method updateToken
			 * @param  {[type]} token     [description]
			 * @param  {[type]} tokenData [description]
			 * @return {[type]}           [description]
			 */
			updateToken : (token, tokenData) => {
				AccessToken.findById(token).then((instance) => {
					if( instance != null ){
						let memoryKey = `accessToken@${token}`
						instance.updateAttributes({ token_data : JSON.stringify(tokenData)});
						memcached.set(memoryKey, instance, MEMORY_CACHE_INTERVAL, (err) => {
							if(err){
								console.log(err);
							}
						});

						return sequelize.transaction((t)=> {
							return instance.update({transaction: t});
						}).catch((err) => {
							console.error(err);
						});
					}
				});
			}
	  }
	});

	return AccessToken;
};
