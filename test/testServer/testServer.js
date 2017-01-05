"use strict"
let server        = null;
let config        = require("../config/config");

const express     = require("express");
const app         = express();
const OAuthServer = require("../../");
const PasswordGrantHandler = require("../../examples/advanced/PasswordGrantHandler")(OAuthServer.GrantHandler)//Extract this dude from examples dir
const router = express.Router();

config.grantHandlers = {
  password: new PasswordGrantHandler()
};

OAuthServer.init(app,config);

router.route("/private").get(OAuthServer.authorizeResource(),function(req,res,next){
  res.send({
    message : "acceso al recurso protegido vía get",
    tokenData: req.tokenData
  })
});

router.route("/private").post(OAuthServer.authorizeResource(),function(req,res,next){
  res.send({
    message : "acceso al recurso protegido vía post",
    tokenData: req.tokenData
  })
});

router.route("/private").put(OAuthServer.authorizeResource(),function(req,res,next){
  res.send({
    message : "acceso al recurso protegido vía put",
    tokenData: req.tokenData
  })
});
app.use("/",router);

module.exports = {

  loadData: function(db,data) {
    let responseData = {};
    const OAuthSuscriber = db.OAuthSuscriber;
    const OAuthClient    = db.OAuthClient;
    const ApiAccount     = db.ApiAccount;
    return new Promise(function(resolve, reject) {
      OAuthServer.synchronize().then(() => {
        OAuthSuscriber.create(data.oauth_suscriber).then((oauth_suscriber)=> {
          responseData["oauth_suscriber"] = oauth_suscriber.get({plain : true});
          OAuthClient.create(data.oauth_client).then((oauth_client)=> {
            responseData["oauth_client"] = oauth_client.get({plain : true});;
            ApiAccount.create(data.api_account).then((api_account)=>{
              responseData["api_account"] = api_account.get({plain : true});;
              return resolve(responseData);
            }).catch(error => {
              return reject(error);
            });
          }).catch(error => {
            return reject(error);
          });
        }).catch(error => {
          return reject(error);
        });
      })
    });

  },
  setup: function(options){
    if(options && options.setupData) {
      let db = OAuthServer.getDB();
      return this.loadData(db,options.setupData);
    } else {
      return OAuthServer.synchronize();
    }

  },
  start: function(port,done) {
    server = app.listen(port,done);
  },
  stop: function(done) {
    server.close(done);
  }
};
