"use strict";

module.exports = (models,libs) => {
  const grantService = libs.grantService;
  const checkGrant = (req,res,next) => {
    let grantHandler = libs.grantHandlers[req.grant_type];
    grantService.handle(grantHandler,req).then((response) => {
      req.user = response;
      if( req.user && req.user.scopes ) {
        req.authorizedScopes = req.user.scopes
      }
      next();
    }).catch((error) => {
      res.status(400).send(error);
    })
  };

  return checkGrant;
};
