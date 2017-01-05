"use strict"

const chalk   = require("chalk");
const expect  = require("chai").expect;
const should  = require("chai").should;
const request = require("superagent");
const uuid    = require('node-uuid');
const internalApiTest = require("./testServer/internalApiTester")();

describe("oauth-server2 Internal API tests cases",function() {
  let baseUrl     = "http://localhost:9000";
  let app         = require("./testServer/testServer");
  let setupData   = require("./config/testDataInternal");
  let port        = 9000;
  let testData    = {};
  let headers     = {};
  let accessToken = "";

  let fetchToken = (testData,cb) => {
    let oauthClient = testData.oauth_client;
    request.post(`${baseUrl}/oauth/token`)
    .set("Content-Type","application/x-www-form-urlencoded")
    .send({
      client_id: oauthClient.client_id,
      client_secret: oauthClient.client_secret,
      grant_type: "client_credentials"
    }).end(function(err,response) {
      let parsedResponse = JSON.parse(response.text);
      if( err ) {
        cb(err)
      } else {
        cb(null,parsedResponse.access_token)
      }
    });
  };

  before(function(done){
    console.log(chalk.blue("Starting mock test server"));

    app.setup({ setupData: setupData }).then((envData) => {
      testData = envData;
      app.start(port,done);
    }).catch((error)=> {
      console.log(error);
    });
  });

  after(function(done){
    console.log(chalk.blue("Stopping mock test server"));
    app.stop(done);
  });

  /**
   * Setup CRUD test for /oauth/oauth_suscribers
   * @type {[type]}
   */
  internalApiTest({
    baseUrl: baseUrl,
    endPoint: "/oauth/oauth_suscribers",
    elementId: "500",
    mockId: "050102",
    badId: "NAN",
    pkPattern:":suscriber_id",
    before: function(options,done) {
      fetchToken(testData,(err,token) => {
        if(err) {
          process.exit(0);
        } else {
          options.headers = { "Authorization": `Bearer ${token}` }
          accessToken = token;
          done();
        }
      });
    },
    postData: {
      suscriber_id: "500",
      suscriber_name: "LCA Company",
      suscriber_email: "lcacompany@gmail.com",
      suscriber_contact: "Foo Bar",
      suscriber_url:"https://localhost",
      suscriber_logo:""
    },
    putData : {
      suscriber_name: "LCA Software Company associated",
      suscriber_contact: "Marco Antonio Villarreal Benites"
    },
    bulkErrorData: [
      {
        suscriber_name: "Blue Fountain Media",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_url:"http://www.bluefountainmedia.com/",
        suscriber_logo:""
      },
      {
        suscriber_name: "ScienceSoft",
        suscriber_contact: "Foo Bar",
        suscriber_url:"https://www.scnsoft.com",
        suscriber_logo:""
      },
      {
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"https://fueled.com",
        suscriber_logo:""
      }
    ],
    bulkData: [
      {
        suscriber_id: "501",//we will reserve this id for later :)
        suscriber_name: "Blue Fountain Media",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"http://www.bluefountainmedia.com/",
        suscriber_logo:""
      },
      {
        suscriber_name: "ScienceSoft",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"https://www.scnsoft.com",
        suscriber_logo:""
      },
      {
        suscriber_name: "Fueled",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"https://fueled.com",
        suscriber_logo:""
      },
      {
        suscriber_name: "Code brew labs",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"https://www.code-brew.com",
        suscriber_logo:""
      },
      {
        suscriber_name: "WillowTreeApps",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"http://willowtreeapps.com/",
        suscriber_logo:""
      },
      {
        suscriber_name: "Fuzz Producation",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"https://fuzzproductions.com/",
        suscriber_logo:""
      },
      {
        suscriber_name: "Bluewhaleapps",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"http://www.bluewhaleapps.com/",
        suscriber_logo:""
      },
      {
        suscriber_name: "Appster",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"http://www.appsterhq.com/",
        suscriber_logo:""
      },
      {
        suscriber_name: "Blue label Labs",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"https://www.bluelabellabs.com",
        suscriber_logo:""
      },
      {
        suscriber_name: "OpenXcell",
        suscriber_email: "lcacompany@gmail.com",
        suscriber_contact: "Foo Bar",
        suscriber_url:"https://www.openxcell.com",
        suscriber_logo:""
      },
    ],
    assert: {
      findOne: function(err,response,parsedResponse) {
        expect(parsedResponse).to.have.deep.property('data.suscriber_id');
        expect(parsedResponse).to.have.deep.property('data.suscriber_name');
        expect(parsedResponse).to.have.deep.property('data.suscriber_email');
        expect(parsedResponse).to.have.deep.property('data.suscriber_contact');
        expect(parsedResponse).to.have.deep.property('data.suscriber_url');
      },
      findAll: function(err,response,parsedResponse){

        expect(parsedResponse).to.have.deep.property('data.rows[0].suscriber_id');
        expect(parsedResponse).to.have.deep.property('data.rows[0].suscriber_name');
        expect(parsedResponse).to.have.deep.property('data.rows[0].suscriber_email');
        expect(parsedResponse).to.have.deep.property('data.rows[0].suscriber_contact');
        expect(parsedResponse).to.have.deep.property('data.rows[0].suscriber_url');

      },
      bulkCreate: function(err,response,parsedResponse){
        expect(parsedResponse).to.have.deep.property('data[0].suscriber_id');
        expect(parsedResponse).to.have.deep.property('data[0].suscriber_name');
        expect(parsedResponse).to.have.deep.property('data[0].suscriber_email');
        expect(parsedResponse).to.have.deep.property('data[0].suscriber_contact');
        expect(parsedResponse).to.have.deep.property('data[0].suscriber_url');
      },
      create: function(err,response,parsedResponse) {
        expect(parsedResponse).to.have.deep.property('data.suscriber_id');
        expect(parsedResponse).to.have.deep.property('data.suscriber_name');
        expect(parsedResponse).to.have.deep.property('data.suscriber_email');
        expect(parsedResponse).to.have.deep.property('data.suscriber_contact');
        expect(parsedResponse).to.have.deep.property('data.suscriber_url');
      },
      update: function(err,response,parsedResponse) {
        expect(parsedResponse).to.have.deep.property('data.suscriber_id');
        expect(parsedResponse).to.have.deep.property('data.suscriber_name');
        expect(parsedResponse).to.have.deep.property('data.suscriber_email');
        expect(parsedResponse).to.have.deep.property('data.suscriber_contact');
        expect(parsedResponse).to.have.deep.property('data.suscriber_url');
        //Validating update :)
        expect(parsedResponse).to.have.deep.property('data.suscriber_name',"LCA Software Company associated");
        expect(parsedResponse).to.have.deep.property('data.suscriber_contact',"Marco Antonio Villarreal Benites");
      },
      destroy: function(err,response,parsedResponse){

      }
    }
  });

  const generatedClientId = uuid.v4();
  const anotherUUID = uuid.v4();

  /**
   * Setup CRUD test for /oauth/oauth_suscribers
   * @type {[type]}
   */
  internalApiTest({
    baseUrl: baseUrl,
    endPoint: "/oauth/oauth_clients",
    elementId: generatedClientId,
    mockId: anotherUUID,
    badId: "NAN",
    pkPattern: ":client_id",
    before: function(options,done) {
      fetchToken(testData,(err,token) => {
        if(err) {
          process.exit(0);
        } else {
          options.headers = { "Authorization": `Bearer ${token}` }
          accessToken = token;
          done();
        }
      });
    },
    postData: {
      client_id: generatedClientId,
      suscriber_id: "501",//remember the saved id for later? this is it
      app_name: "Blithzer",
      grant_types: ["client_credentials","refresh_token","password"],
      app_logo:"",
      redirect_uri: "https://blithzher.com/app"
    },
    putData : {
      app_name: "Blithzer Android",
      redirect_uri: "https://blithzher.com/android_auth"
    },
    bulkErrorData: [
      {
        app_name: "Blithzer IOS",
        grant_types: ["authorization_code"],
        app_logo:"",
        redirect_uri: "https://blithzher.com/ios_auth"
      }
    ],
    bulkData: [
      {
        suscriber_id: "501",//remember the saved id for later? this is it
        app_name: "Blithzer IOS",
        grant_types: ["authorization_code"],
        app_logo:"",
        redirect_uri: "https://blithzher.com/ios_auth"
      },
      {
        suscriber_id: "501",//remember the saved id for later? this is it
        app_name: "Blithzer Web",
        grant_types: ["authorization_code"],
        app_logo:"",
        redirect_uri: "https://blithzher.com/web_auth"
      },
      {
        suscriber_id: "501",//remember the saved id for later? this is it
        app_name: "Blithzer FireOS",
        grant_types: ["authorization_code"],
        app_logo:"",
        redirect_uri: "https://blithzher.com/fireos_auth"
      }
    ],
    assert: {
      findOne: function(err,response,parsedResponse) {
        expect(parsedResponse).to.have.deep.property('data.suscriber_id');
        expect(parsedResponse).to.have.deep.property('data.client_id');
        expect(parsedResponse).to.have.deep.property('data.app_name');
        expect(parsedResponse).to.have.deep.property('data.grant_types');
        expect(parsedResponse).to.have.deep.property('data.app_logo');
        expect(parsedResponse).to.have.deep.property('data.redirect_uri');
      },
      findAll: function(err,response,parsedResponse){
        expect(parsedResponse).to.have.deep.property('data.rows[0].suscriber_id');
        expect(parsedResponse).to.have.deep.property('data.rows[0].client_id');
        expect(parsedResponse).to.have.deep.property('data.rows[0].app_name');
        expect(parsedResponse).to.have.deep.property('data.rows[0].grant_types');
        expect(parsedResponse).to.have.deep.property('data.rows[0].app_logo');
        expect(parsedResponse).to.have.deep.property('data.rows[0].redirect_uri');
      },
      bulkCreate: function(err,response,parsedResponse){
        expect(parsedResponse).to.have.deep.property('data[0].suscriber_id');
        expect(parsedResponse).to.have.deep.property('data[0].client_id');
        expect(parsedResponse).to.have.deep.property('data[0].app_name');
        expect(parsedResponse).to.have.deep.property('data[0].grant_types');
        expect(parsedResponse).to.have.deep.property('data[0].app_logo');
        expect(parsedResponse).to.have.deep.property('data[0].redirect_uri');
      },
      create: function(err,response,parsedResponse) {

        expect(parsedResponse).to.have.deep.property('data.suscriber_id');
        expect(parsedResponse).to.have.deep.property('data.client_id');
        expect(parsedResponse).to.have.deep.property('data.app_name');
        expect(parsedResponse).to.have.deep.property('data.grant_types');
        expect(parsedResponse).to.have.deep.property('data.app_logo');
        expect(parsedResponse).to.have.deep.property('data.redirect_uri');
      },
      update: function(err,response,parsedResponse) {
        expect(parsedResponse).to.have.deep.property('data.suscriber_id');
        expect(parsedResponse).to.have.deep.property('data.client_id');
        expect(parsedResponse).to.have.deep.property('data.app_name');
        expect(parsedResponse).to.have.deep.property('data.grant_types');
        expect(parsedResponse).to.have.deep.property('data.app_logo');
        expect(parsedResponse).to.have.deep.property('data.redirect_uri');
        //Validating update :)
        expect(parsedResponse).to.have.deep.property('data.app_name',"Blithzer Android");
        expect(parsedResponse).to.have.deep.property('data.redirect_uri',"https://blithzher.com/android_auth");
      },
      destroy: function(err,response,parsedResponse){

      }
    }
  });

});
