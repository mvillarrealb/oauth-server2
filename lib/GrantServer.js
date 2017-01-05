"use strict";

const GrantHandler = require("./GrantHandler");
const moment = require("moment");
const Ajv = require("ajv");

/**
 * Class GrantServer handles grant type requests, either predefined
 * grant_types(client_credentials,refresh_token,authorization_code)  or custom ones
 *
 * @class GrantServer
 * @author Marco Villarreal
 *
 */
class GrantServer {

  constructor(db) {
    this.db = db;
    this.grantSchemas = {}
  }

  set db(db) {
    this._db = db;
  }

  get db() {
    return this._db;
  }
  /**
   * @method get ajv
   * @return {Ajv} Returns a instance of Ajv json validator
   */
  get ajv(){
    if(this._ajv == null) {
      this._ajv = new Ajv();
    }
    return this._ajv;
  }
  /**
   * Handles grant autorization for a given grant type
   * @method handle
   * @param {Mixed} grantHandler
   * @param {Object} req
   * @return {Promise}
   */
  handle(grantHandler,req) {
    if( typeof grantHandler == "string" ) {
      if( typeof this[grantHandler] == "function") {
        return this[grantHandler].call(this,req);
      } else {
        return this.rejectPromise(`Provided grantHandler ${grantHandler}  is not a processable one by this server`)
      }

    } else if(typeof grantHandler == "object") {
      if( grantHandler instanceof GrantHandler ){
        return this.dispatchGrantHandler(grantHandler,req);
      } else {
        return this.rejectPromise("Provided grantHandler is not instanceof GrantHandler class");
      }
    } else {
      return this.rejectPromise("Unprocessable grantHandler you may check your oauth-server2 grantHandlers config")
    }
  }
  /**
   * @method rejectPromise
   * @param {String} errorMessage
   * @return {Promise}
   */
  rejectPromise(errorMessage) {
    return new Promise((resolve,reject) => {
      return reject(errorMessage);
    })
  }
  /**
   * Returns a grant type schema
   */
  getGrantSchema(grantHandler) {
    if (!this.grantSchemas[grantHandler.name]) {
      const schema = grantHandler.getSchema();
      console.info("Compiling json schema for grant Handler");
      this.grantSchemas[grantHandler.name] = this.ajv.compile(schema);
    }
    return this.grantSchemas[grantHandler.name];
  }
  /**
   * @method dispatchGrantHandler
   * @param {GrantHandler} grantHandler
   * @param {Object} req
   */
  dispatchGrantHandler(grantHandler,req) {
    return new Promise((resolve,reject) => {
      const validate = this.getGrantSchema(grantHandler);
      console.info("Validating compiled schema against req.body");
      validate(req.body).then((valid) => {
        console.info("Validation successful, performing authorization");
        grantHandler.authorise(req.body).then((identity) => {
          console.info("Authorization successful, performing scope getting");
          grantHandler.getScopes(identity).then((scopes) => {
            identity.scopes = scopes;
            return resolve(identity);
          }).catch((error) => {
            return reject(error);
          });
        }).catch((error) => {
          if( typeof error == "object" ){
            if(error.error && error.error_description) {
              return reject(error);
            } else if( error.error) {
              return reject({
                error: "invalid_grant",
                error_description: error.error
              })
            }
          } else if(error instanceof Error){
            return reject({
                error: "internal_error",
                error_description: error.message,
                errors:[error]
            })
          } else if(typeof error == "string") {
            return reject({
              error: "internal_error",
              error_description: error
            })
          }

        });
      }).catch((errors) => {
        return reject({
          error : "invalid_request",
          error_description: req.__("validation_failed"),
          errors: errors.errors
        });
      });
    });

  }
  /**
   *
   * @method handleClientCredentials
   */
  handleClientCredentials(req) {
    const ApiAccount = this.db.ApiAccount;
    return new Promise((resolve,reject) => {
      let client = ApiAccount.associations.client;
      ApiAccount.findOne({
        include: [
          { model:client.target,as: client.as }
        ],
        where: { client_id: req.client.client_id }
      }).then((instance) => {
        if (instance == null) {
          reject({
            error : "invalid_client",
            error_description: req.__("client_notexists",{ clientId: req.client.clientId })
          });
        } else {
          resolve(instance);
        }
      }).catch((error) => {
        reject({error: "server_error",error_description: error.message })
      });

    });
  }
  /**
   * @method handleRefreshToken
   */
  handleRefreshToken(req) {

    const RefreshToken = this.db.RefreshToken;

    return new Promise((resolve,reject) => {
      if( req.body && req.body.refresh_token ) {
        try {
          RefreshToken.findToken(req.body.refresh_token,req.locale).then((tokenInstance)=> {
            if( tokenInstance == null ){
              return reject({error : "invalid_grant",error_description: req.__("refresh_token_notfound")});
            } else {
              //tokenData is resolved as user identity
              let expireDate = moment(tokenInstance.expires);

              if ( expireDate !== null && (!expireDate  || expireDate  < new Date())) {
                return reject({
                  error : "invalid_grant",
                  error_description: req.__("expired_refreshtoken")
                });

         	    } else if( tokenInstance.is_used ) {
                return reject({
                  error : "invalid_grant",
                  error_description: req.__("used_refreshtoken")
                });

              } else {
                tokenInstance.update({ is_used: true }).then((instance) => {
                  return resolve(tokenInstance.token_data);
                }).catch((error) => {
                  reject({error: "server_error",error_description: error.message });
                });

              }
            }
          }).catch((error) => {
            reject(error);
          });
        } catch(eror) {
          reject(error);
        }
      } else {
        reject({ error:"invalid_grant",error_description:req.__("required_refresh_token")});
      }
    });
  }
  /**
   * FIXME this is in development
   * @method handleAuthorizationCode
   */
  handleAuthorizationCode(req) {
    return new Promise((resolve,reject)=> {

    });
  }
}

module.exports = GrantServer;
