"use strict";

module.exports = (sequelizeResource,models,middlewares) => {
  const express = require("express");
  const apiAccountRouter  = express.Router();
  const ApiAccount = models.ApiAccount;
  const ApiAccountController = sequelizeResource.createController(ApiAccount,{

  },{
    primaryKeyURL: "/:account_id([0-9]+)",
    middleware: {
      before: middlewares.authorizeResource,

    }
  });

  ApiAccountController.attachController(apiAccountRouter);

  return apiAccountRouter;
}
