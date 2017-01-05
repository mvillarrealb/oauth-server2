"use strict";

module.exports = (sequelizeResource,models,middlewares) => {
  const express = require("express");
  const oauthClientRouter  = express.Router();
  const OAuthClientController  = sequelizeResource.createController(models.OAuthClient,{

  },{
    primaryKeyURL: "/:client_id",
    middleware: {
      before: middlewares.authorizeResource
    }
  });

  OAuthClientController.attachController(oauthClientRouter);

  oauthClientRouter.route("/:client_id/app_logo").get((req,res,next)=> {
    Resource.findOne(req.params).then((response) => {
      let instance = response.data;
      let byteaBuffer = instance.getDataValue("appLogo");
      if (!res.getHeader('Cache-Control') || !res.getHeader('Expires') ){
        res.setHeader('Cache-Control', 'public, max-age=' + ( 1209600 / 1000));
        res.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString());
      }
      res.header("Content-Type", "image/jpg");
      res.end(byteaBuffer,"binary");
    }).catch((error) => {
      res.status(error.code).send(error);
    })
  });

  return oauthClientRouter;
}
