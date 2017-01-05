"use strict";

module.exports = (sequelizeResource,models,middlewares) => {
  const express = require("express");
  const oauthSuscriberRouter  = express.Router();
  const OAuthSuscriber = models.OAuthSuscriber;
  const OAuthSuscriberController = sequelizeResource.createController(OAuthSuscriber,{

  },{
    primaryKeyURL: "/:suscriber_id([a-zA-Z0-9]+)",
    middleware: {
      before: middlewares.authorizeResource
    }
  });

  OAuthSuscriberController.attachController(oauthSuscriberRouter);

  return oauthSuscriberRouter;
}
