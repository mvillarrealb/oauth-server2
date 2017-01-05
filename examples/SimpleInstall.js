"use strict"

const express = require("express");
const app = express();
const config = require("./config");
const OAuthServer = require("..");
let router = express.Router();

app.disable("x-powered-by");
app.enable("trust proxy");
app.enable("etag");

OAuthServer.init(app,config);

//Protecting the resource using the middleware
router.route("/private").get(OAuthServer.authorizeResource(),(req,res,next)=> {
  res.send({
    message : "access to the private stuff",
    other: req.accessToken
  })
});

//public resource
router.route("/public").get((req,res,next)=> {
  res.send({
    message: "This is public junk"
  });
});

app.use("/",router);

app.listen(9000,() => {
  console.log("Listening on port 9000");
})
