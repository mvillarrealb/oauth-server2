"use strict"

const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const api = express();
const config = require("../config");
const OAuthServer = require("../..");
const PasswordGrantHandler = require("./PasswordGrantHandler")(OAuthServer.GrantHandler);


api.disable("x-powered-by");
api.enable("trust proxy");
api.enable("etag");

OAuthServer.init(api,{
  db : config.db,
  memcached: config.memcached,
  grantHandlers: {
    password: new PasswordGrantHandler()
  }
});

let router = express.Router();

router.route("/private").get(OAuthServer.authorizeResource(),(req,res,next)=> {
  res.send({
    message : "All nice",
    other: req.accessToken
  })
})

api.use("/",router);

api.listen(9000,()=>{
  console.log("Listening on port 9000");
})
