"use strict";

module.exports = (sequelizeResource,models,middlewares) => {
  const express     = require("express");
  const bodyParser  = require("body-parser");
  const router      = express.Router();
  const expiresIn   = 3600;
  const AccessToken = models.AccessToken;
  const Controller  = sequelizeResource.createController(AccessToken,{

  },{
    primaryKeyURL:"/:access_token"
  });

  /**
   * RFC OAuth 2.0 token grant follows the middlewares
   * as specified:
   *
   * checkParams: Check the existence of minimum required params
   * client_id, client_secret and grant_type
   *
   * grantTypeSupported: Check if the provided Grant Type is registered
   * in the server
   *
   * checkClient: Checks if the current client_id and client_secret are
   * registered as valid apps in the server.
   *
   * checkClientGrant: Checks if supported client grant types match the requested
   * grant_type
   *
   * checkGrant: Performs Grant step for the requested grant_type, this will define
   * if the access_token is created and granted to the user
   *
   */
  Controller.create = [
    middlewares.checkParams,
    middlewares.grantTypeSupported,
    middlewares.checkClient,
    middlewares.checkClientGrant,
    middlewares.checkGrant,
    (req,res,next) => {

        let tokens = AccessToken.generateTokens();
        let expires = new Date();
        let expiresRefresh = new Date();
            expires.setSeconds(expires.getSeconds() + expiresIn);
            expiresRefresh.setSeconds(expires.getSeconds() + expiresIn);//double of time
        let accessTokenData = {
          access_token: tokens.token,
          client_id: req.client.client_id,
          expires: expires,
          scopes: req.authorizedScopes,
          token_data:req.user
        };

        let refreshTokenData = {
          refresh_token: tokens.refresh,
          client_id: req.client.client_id,
          expires: expiresRefresh,
          scopes: req.authorizedScopes,
          token_data:req.user
        };

        AccessToken.create(accessTokenData).then((response) => {
          models.RefreshToken.create(refreshTokenData);
          /**
           * Send response according to official OAuth2 RFC
           * https://tools.ietf.org/html/rfc6749#section-5.1
           * @type {[type]}
           */
          res.status(200).send({
            token_type: "Bearer",
            access_token: response.access_token,
            expires_in: expiresIn,
            refresh_token: tokens.refresh,
            token_data:req.user,
            scope: response.scopes
          });

        }).catch((error)=> {
          /**
           * Send error response according to official OAuth2 rfc6749
           * https://tools.ietf.org/html/rfc6749#section-5.2
           *
           */
          res.status(400).send({
            error: "invalid_request",
            error_description: error.message
          });
        });
    }
  ];
  router.use(bodyParser.urlencoded({ extended : false, limit : "10mb"}));
  router.route("/").post(Controller.create);
  router.route("/:token").get(Controller.findOne.bind(Controller));
  router.route("/:token").delete(Controller.destroy.bind(Controller));

  return router;
}
