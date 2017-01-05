"use strict"

module.exports = (models,libs) => {
  const grantService = libs.grantService;
  const checkClientGrant = (req,res,next) => {
  const clientGrants = (req.client && req.client.grant_types)? req.client.grant_types : null;

    if( clientGrants && clientGrants.length ) {
      if( clientGrants.indexOf(req.grant_type) > -1 ) {
        next();
      } else {
        res.status(400).send({
          error: "invalid_grant",
          error_description: req.__("unsupported_client_grant",{
            client: req.client.appName
          })
        });
      }

    } else {
      res.status(400).send({
        error: "invalid_grant",
        error_description: req.__("invalid_grant")
      });
    }
  };
  return checkClientGrant;
};
