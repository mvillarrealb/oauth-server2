"use strict";

module.exports = (models,libs) => {
  const OAuthClient = models.OAuthClient;
  const checkClient = (req,res,next) => {

    OAuthClient.findClient(req.client.clientId,req.client.clientSecret).then((client) => {
      req.client = client;
      next();
    }).catch((error) => {
      res.status(400).send(error);
    });

  };
  return checkClient;
}
