"use strict";
/**
 * Middleware to expose two accessToken data manipulation methods,
 * this methods are attached to the req object and are:
 * req.getSessionData: Gets the session data from the current access token
 * given a key, if the property does not exists on the token data it will return null
 *
 * req.setSessionData: Sets and synchronizes data from the current token for
 * a given key with a given value, it will sync the value in token data on
 * booth sources(memcached & database persistence)
 *
 * @param  {Object} models [description]
 * @param  {Object} libs   [description]
 * @return {Function}        [description]
 */
module.exports = (models,libs)=> {

  const AccessToken = models.AccessToken;
  const sessionHandler = (req,res,next) => {
    req.getSessionData = function(key) {
      let accessTokenData = req.tokenData.token_data;
      return (accessTokenData && accessTokenData[key] ) ? accessTokenData[key] : null;
    };

    req.setSessionData = function(key,value) {
      let accessTokenData = req.tokenData.token_data;
      accessTokenData[key] = value;
      AccessToken.updateToken(req.accessToken,accessTokenData);
    };
    next();
  };
  return sessionHandler;
};
