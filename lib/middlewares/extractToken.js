"use strict";

module.exports = (models,libs)=> {

  const checkToken = (req,res,next) => {
    let headerToken = (req.headers && req.headers.authorization) ? req.headers.authorization : null;
    let queryToken = (req.query && req.query.access_token)? req.query.access_token : null;
    let accessToken = null;

    if ( headerToken != null || queryToken != null ) {
      if( headerToken != null ) {
        let matches = headerToken.match(/Bearer\s(\S+)/);
        if (!matches) {
    	    return res.status(400).send({
            error : "invalid_request",
            error_description : req.__("malformed_auth")
          });
    	  }
        req.accessToken = matches[1];
      } else {
        req.accessToken = queryToken;
      }
      return next();
    } else {
      res.status(400).send({
        error : "invalid_request",
        error_description : req.__("missing_token")
      })
    }
  }
  return checkToken;
}
