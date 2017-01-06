"use strict";

module.exports = function(sequelize, DataTypes, common) {
	const crypto    = require("crypto");
	const moment    = require("moment");
	const memcached = common.memcached;
	const MEMORY_CACHE_INTERVAL = 3500;

	const OAuthClient = sequelize.define('oauth_clients', {
		client_id : {
			type: DataTypes.STRING,
	    field: 'client_id',
	    primaryKey: true
		},
		client_secret : {
			type: DataTypes.STRING,
	    field: 'client_secret'
		},
		suscriber_id : {
		  type: DataTypes.INTEGER,
	    field: 'suscriber_id',
	    allowNull: false,
			validate : {
				notEmpty: true
			}
		},
		redirect_uri: {
			type: DataTypes.STRING,
	    field: 'redirect_uri',
	    allowNull: false,
			validate : {
				notEmpty: true,
				isUrl: true
			}
		},
		app_name : {
			type: DataTypes.STRING,
	    field: 'app_name',
	    allowNull: false,
			validate : {
				notEmpty: true
			}
		},
		app_logo : {
		  type: DataTypes.BLOB,
	    field: 'app_logo',
		  get : function() {
		    return `/app_logo`;
		  }
		},
		grant_types : {
			type: DataTypes.ARRAY(DataTypes.STRING(140)),
	    allowNull: false,
	    field: 'grant_types'
		}

	}, {
	  schema: 'oauth',
		freezeTableName : true,
	  hooks: {
	  	 beforeCreate: function(instance, transaction) {
				 let secret = instance.app_name + instance.redirect_uri;
				 let generatedPair = OAuthClient.createIdSecretPair(instance.app_name,secret);
				 if( instance.client_id == null ) {
					instance.client_id = generatedPair.id;
				 }
				 instance.client_secret = generatedPair.secret;
				 return transaction;
	  	 },
			 beforeBulkCreate: function(clients,options){
				 clients.forEach(function (client) {
					 let secret = client.app_name + client.redirect_uri;
  				 let generatedPair = OAuthClient.createIdSecretPair(client.app_name,secret);
  				 if( client.client_id == null ) {
  					client.client_id = generatedPair.id;
  				 }
					 client.client_secret = generatedPair.secret;
			  });
			 }
	  },
	  classMethods : {
		  associate: (models) => {
		  	OAuthClient.belongsTo(models.OAuthSuscriber,{foreignKey : "suscriber_id",as:"suscriber"});
				OAuthClient.hasMany(models.AccessToken,{foreignKey:"client_id",as:"tokens"})
		  },
			createIdSecretPair: (baseString,secret) => {
				let nowTz = moment().format("x");
				let hash = crypto.createHmac('sha256', secret).update(baseString + nowTz).digest('hex');
				let digestableString = baseString + (nowTz)+ hash;
				let generatedSecret = crypto.createHmac("sha512",secret).update(digestableString).digest("hex");
				return { id: baseString+ "-" + hash,secret: generatedSecret };
			},
			findClient: (clientId,clientSecret) => {
				const memoryHash = `oauth_client@${clientId}:${clientSecret}`;
				return new Promise((resolve,reject) => {
					memcached.get(memoryHash,(err,memoryClient) => {
						if(err) {
							return reject(err);
						} else if (memoryClient != null ) {
							return resolve(memoryClient);
						} else {
							OAuthClient.findOne({
								where : { client_id: clientId,client_secret: clientSecret }
							}).then((instance) => {
								if( instance != null ) {
									memcached.set(memoryHash,instance,MEMORY_CACHE_INTERVAL,(err) => {
										if(err) {
											console.error("Could not save client in cache: "+err);
										}
									});
									return resolve(instance);
								} else {
									return reject({ error : "invalid_client", error_description: "Client was not found" });
								}
							}).catch((error) => {
									return reject({ error: "invalid_client", error_description: error.message });
							});
						}
					});
				});
			}
	  }
	});

	return OAuthClient;
};
