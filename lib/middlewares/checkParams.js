"use strict";

module.exports = (models,libs)=> {
  const checkParams = (req,res,next) => {

    if (!req.is('application/x-www-form-urlencoded') ) {
      return res.status(400).send({
        error : "invalid_request",
        error_description: req.__("required_formurl")
      });
    }

    if(!req.body || !req.body.grant_type) {
      return res.status(400).send({
        error : "invalid_grant",
        error_description: req.__("missing_grant")
      });
    }

    if (!req.body.client_id) {
      return res.status(400).send({
        error : "invalid_request",
        error_description: req.__("missing_client")
      });
    }

    if(!req.body.client_secret) {
      return res.status(400).send({
        error : "invalid_request",
        error_description: req.__("missing_secret")
      });
    }

    req.grant_type = req.body.grant_type;

    req.client = { clientId: req.body.client_id,clientSecret: req.body.client_secret };
    
    return next();
  }
  return checkParams;
}
