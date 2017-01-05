"use strict";

module.exports = (models,libs)=> {
  const AccessToken = models.AccessToken;
  const moment = require("moment")
  const checkToken = (req,res,next) => {
    let token = req.accessToken;
    AccessToken.findToken(token,req.locale).then((accessToken)=> {
      req.tokenData = accessToken;//overwrite access token string with actual data
      let expireDate = moment(accessToken.expires);
 	    if ( expireDate !== null && (!expireDate  || expireDate  < new Date())) {
 	      res.status(400).send({
          error: "invalid_grant",
          error_description: req.__("expired_token")
        });
 	    } else if(! accessToken.is_active ){
        res.status(400).send({
          error: "invalid_grant",
          error_description: req.__("invalidated_token")
        });
      } else {
        return next();
      }
    }).catch((error) => {
      res.status(400).send(error);
    });
  }
  return checkToken;
}
