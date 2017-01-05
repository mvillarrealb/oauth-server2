"use strict"

const chalk   = require("chalk");
const expect  = require("chai").expect;
const should  = require("chai").should;
const request = require("superagent");
const uuid    = require('node-uuid');

describe("oauth-server2 authorization test suite",function() {
  let port    = 9000;
  let baseUrl = `http://localhost:${port}`;
  let app     = require("./testServer/testServer");
  let setupData = require("./config/testData");
  let testData = {};

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

  describe("Testing authorization framework",function() {
    it("Should be able to validate requests without token",function(done){
      request.get(`${baseUrl}/private`)
      .end(function(err,response) {
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        let parsedResponse = JSON.parse(response.text);
        expect(parsedResponse).to.have.property('error');
        expect(parsedResponse).to.have.property('error_description');
        done();
      });

    });

    it("Should validate invalid tokens",function(done) {
      request.get(`${baseUrl}/private?access_token=1`)
      .end(function(err,response) {
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        let parsedResponse = JSON.parse(response.text);
        expect(parsedResponse).to.have.property('error','invalid_grant');
        expect(parsedResponse).to.have.property('error_description','El access token especificado es invalido');
        done();
      });
    });

    it("[getToken][client_credentials] Should validate invalid form encoding",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/json")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "client_credentials"
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_request');
        expect(parsedResponse).to.have.property('error_description','El encabezado Content-Type de la peticion debe ser application/x-www-form-urlencoded');
        done();
      });

    });

    it("[getToken][client_credentials] Should validate basic parameters(grant_type)",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_grant');
        expect(parsedResponse).to.have.property('error_description','No se ha encontrado el parametro grant_type');
        done();
      });
    });

    it("[getToken][client_credentials] Should validate basic parameters(client_id)",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_secret: oauthClient.client_secret,
        grant_type: "client_credentials"
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_request');
        expect(parsedResponse).to.have.property('error_description','No se ha encontrado el parametro client_id');
        done();
      });
    });

    it("[getToken][client_credentials] Should validate basic parameters(client_secret)",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        grant_type: "client_credentials"
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_request');
        expect(parsedResponse).to.have.property('error_description','No se ha encontrado el parametro client_secret');
        done();
      });
    });

    it("[getToken][client_credentials] Should be able to determine invalid clients",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: "1291029810928",
        client_secret: oauthClient.client_secret,
        grant_type: "client_credentials"
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_client');
        expect(parsedResponse).to.have.property('error_description');
        done();
      });
    });

    it("[getToken][client_credentials] Should be able to validate grant of client",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "my_granti"
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_grant');
        expect(parsedResponse).to.have.property('error_description',"El grant_type my_granti no es soportado");
        done();
      });
    });

    it("[getToken][client_credentials] Should be able to fetch token",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "client_credentials"
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.not.be.ok;
        expect(response).to.have.property("status",200);
        expect(parsedResponse).to.have.property('token_type','Bearer');
        expect(parsedResponse).to.have.property('access_token');
        expect(parsedResponse).to.have.property('expires_in');
        expect(parsedResponse).to.have.property('refresh_token');
        expect(parsedResponse).to.have.property('token_data');
        testData["access_token"] = parsedResponse.access_token;
        testData["refresh_token"] = parsedResponse.refresh_token;
        done();
      });
    });

    it("[getToken][client_credentials] Should be able to request a protected resource",function(done) {
      request.get(`${baseUrl}/private?access_token=${testData.access_token}`)
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.not.be.ok;
        expect(response).to.have.property("status",200);
        expect(parsedResponse).to.have.property('message');
        expect(parsedResponse).to.have.property('tokenData');
        done();
      });
    });










    it("[getToken][refresh_token] Should be able to validate missing refresh_token",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "refresh_token"
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_grant');
        expect(parsedResponse).to.have.property('error_description',"No se ha encontrado el parametro refresh_token");
        done();
      });
    });

    it("[getToken][refresh_token] Shouldn't fetch a new token from invalid refresh token",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "refresh_token",
        refresh_token:"019-2019201"
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_grant');
        expect(parsedResponse).to.have.property('error_description',"El refresh token especificado es invalido");
        done();
      });
    });

    it("[getToken][refresh_token] Should be able to fetch a new token from refresh token",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "refresh_token",
        refresh_token: testData["refresh_token"]
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.not.be.ok;
        expect(response).to.have.property("status",200);
        expect(parsedResponse).to.have.property('token_type','Bearer');
        expect(parsedResponse).to.have.property('access_token');
        expect(parsedResponse).to.have.property('expires_in');
        expect(parsedResponse).to.have.property('refresh_token');
        expect(parsedResponse).to.have.property('token_data');
        testData["access_token"] = parsedResponse.access_token;
        done();

      });

    });

    it("[getToken][refresh_token] Shouldn't fetch a new token from used refresh token",function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "refresh_token",
        refresh_token: testData["refresh_token"]//this dude is already used at this moment
      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_grant');
        expect(parsedResponse).to.have.property('error_description',"El refresh token especificado ya fue utilizado");
        done();
      });
    });







    it("[getToken][password custom grant] Should be able to validate schema", function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "password"

      })
      .end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_request');
        expect(parsedResponse).to.have.property('error_description','La validación ha fallado');
        done();
      });
    });

    it("[getToken][password custom grant] Should be able to validate credentials", function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "password",
        username:"m",
        password:"v"

      }).end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.be.ok;
        expect(response).to.have.property("status",400);
        expect(parsedResponse).to.have.property('error','invalid_grant');
        expect(parsedResponse).to.have.property('error_description','Usuario y contraseña inválidos');
        done();
      });
    });

    it("[getToken][password custom grant] Should be able to grant token", function(done) {
      let oauthClient = testData.oauth_client;
      request.post(`${baseUrl}/oauth/token`)
      .set("Content-Type","application/x-www-form-urlencoded")
      .send({
        client_id: oauthClient.client_id,
        client_secret: oauthClient.client_secret,
        grant_type: "password",
        username: "marco",
        password: "casa1234"

      }).end(function(err,response) {
        let parsedResponse = JSON.parse(response.text);
        expect(err).to.not.be.ok;
        expect(response).to.have.property("status",200);
        expect(parsedResponse).to.have.property('token_type','Bearer');
        expect(parsedResponse).to.have.property('access_token');
        expect(parsedResponse).to.have.property('expires_in');
        expect(parsedResponse).to.have.property('refresh_token');
        expect(parsedResponse).to.have.property('token_data');
        done();
      });
    });

  });
});
