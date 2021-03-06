# oauth-server2

[logo]: https://github.com/mvillarrealb/oauth-server2/blob/master/docs/entity_relationship.jpg "oauth-server2 data model"

Standalone server wich implement OAuth 2.0 spec over express js, it supports the following grants:
* client_credentials
* refresh_token
* authorization_code(In development)

## General

This server contains the following features:

* Database entities(sequelize based) wich allow oauth 2 protocol execution in a transparent way
* Express's api to control the server main entities
* An authorization endpoint based on Oauth 2.0 RFC
* An authorization middleware to be implemented on your expressjs routers

# Data Model explained


![alt text][logo]


Entity | Description
--- | ---
oauth_suscriber| Represents a company or a mayor figure which is able to create clients in your oauth server, without a suscriber no client or token can be issued
oauth_client| Represents a single application wich can request access tokens to a grant type(grant types supported are inherited by the suscriber)
api_accounts| Represents a single account for a oauth client, it enables the client the ability to use a grant_type called client_credentials
refresh_token| Stores the information for temporary credential used to get tokens from grant_type refresh_token
access_token| Stores the credentials granted by the server with the corresponding client_id, it has a limited scope and life time, once expired a token is not usable anymore
authorization_code| Stores the information for temporary credential used to get token from grant type authorization_code


## Server Authorization flow

The authorizeResource middleware implemented by your resources will contain the following
validations:

* extractToken Validates the existence of an access token in the authorization header or in access_token query parameter

* checkToken: Validates the token, searches in the cache for the token if does not exists it will look for it in the persistence, if none exists an error will be thrown, otherwise it will be checked if the token expired, if expired an error will be thrown otherwise the validation will continue.

* checkScope: Validates if the scope of the current request is available in the token scopes if is not in the permissions an error will be thrown, otherwise the validation will be finished.

* sessionHandler: A middleware wich enable two methods on the req object:

  1. getSessionData: Gets the session data from the current access token
   given a key, if the property does not exists on the token data it will return null

  2. setSessionData: Sets and synchronizes data from the current token for a given key with a given value, it will sync the value in token data on booth sources(memcached & database persistence)


## OAuth2 Concepts

Here are some useful oauth2 concepts used in this module, some of them are concepts from the RFC itself and it will help you out as reference from now on.

* OAuth Client(OAuthClient): Represents a client application wich will request throught a grant type permissions to the server on the behalf of an authenticated user. OAuth clients represents an application that can be created by the service provider or by third party(like a facebook app for example, any facebook app represents an oauth client wich will request access to the server on the behalf of a certain profile owner).

* Authorization Grant( Grant type): An authorization grant is a credential wich represent the resource owner authorization(to access its protected resources), this credential is used by the oauth client to obtain an access token. There are serveral grant types, the rfc ackwoledges the following:

1. authorization_code: The authorization code is obtained using the authorization server as intermediary between the client and the resource owner(end user), the client redirect the resource owner using the browser requesting permission to access(this is known as authorization dialog). Granting the permission will result on a redirection from the dialog to the client's application with an authorization code.

2. password: In password grant the resource owner(end user) prompts its credentials(usually username and password) to obtain the access token, this is a common login flow. However this grant type is high level grant, that must be only be controlled by trusted applications(oauth clients controlled by the resource server developers). You can notice that no facebook app allow you to request email and password as authorization, instead a dialog is used as intermediary, this dialog is in facebook's control.

3. client_credentials: This grant is used as administrator credential in the resource, to request this grant you must specify a client_id and a client_secret, this credential will grant to the oauth client access to resources that are exclusive property of the resource server(for example I can grant you access to the trending hashtags but can't grant you access to read @foobar's twits)

* Access Token: Is a random text string generated or no by cryptography, it represents a credential granted by the authorization server to the client, this credential must be used in every protected resource request as a mechanism of identity. An access token represents a limited scope that can be accessed, how many time it will last and a refresh token to renew the credential when expired.

* Scope: A scope is a unique string representing a resource's permission, for example in facebook the scope publish_actions represent a permission to publish actions so if you have an access token with publish_actions scope then you can only publish actions, an access token can have from one to many scopes depends on your implementation how many scopes are granted on a single access token request.

## The scope of your requests
The scope terminology is now defined and it was mentioned before in the authorization flow, so you must know how the scope of your requests is computed:

A scope is a string representing an individual resource, in this case the scope is build from the endpoints using each portion of the url as a scope fragment

 Examples:

 GET /users/lists scope: users.lists.get
 POST /users/lists scope: users.lists.post
 GET /users/feeds/:id([0-9]+) scope: users.feeds.id.get
 GET /users/notifications/:feed_id([a-zA-Z0-9]+)/:timestamp
 scope: users.notifications.feed_id.timestamp.get


The formula is simple just replace any slash(/) with a dot(.),
any regex pattern used in the express route definition will
be trimmed and only the param name will be concatenated to
the resulting string. Finally add the http verb to the end
this will guarantee a safe scope engeenering.

Consider this formula to know how to store your scopes, remember, this server does not determine how
the scopes are granted or stored, the server does not know wich scopes you have implemented.
___

## Internal Api Usage

Before making any test request you should know that there is an internal API wich supports clients, applications and accounts in the server, this API is convenientlly protected by the same server, so everytime you implment oauth-server2 this endpoints will be automatically bound to your express app

### Entitys

#### oauth_suscribers
Field | Type |Required|Description
--- | ---| ---| ---
suscriber_id|Numeric|false| Oauth suscriber unique id, it is auto generated
suscriber_name|String|true| Suscriber name, must be unique
suscriber_email|String|true| Suscriber email
suscriber_contact|String|false| Suscriber contact phone
suscriber_logo|Image|false| Suscriber image
suscriber_url|String|false| Suscriber web page or url

#### oauth_clients
Field | Type |Required|Description
--- | ---| ---| ---
client_id|String|false| Client id used to fetch tokens is auto an generated 256bytes crypto hash
client_secret|String|false| Client secret used to fetch token is an auto generated 512bytes crypto hash
suscriber_id|Numeric|true| Identifier of the suscriber
redirect_uri|String|true|Url to be redirected(used by authorization_code grant)
app_name|String|true| Name of the application to be registered
app_logo|Numeric|false| Logo of the application to be registered
grant_types|String|false| Grant types allowed for this client

#### api_accounts
Field | Type |Required|Description
--- | ---| ---| ---
account_id|Numeric|false| Account unique identifier, is an auto generated integer
client_id|String|true| Client id from(client_id)
account_name|String|true| Name of the account(used for administrative purposses)
account_details|JSON|false|Details of the account for your usage as key value stuff
scopes|String|false| Base scopes to be granted for client_credentials


### Endpoints

Endpoint | Verb |Description
--- | ---| ---
/oauth/oauth_suscribers|GET| Find all the oauth suscriber registered
/oauth/oauth_suscribers|POST| Creates a new oauth suscriber
/oauth/oauth_suscribers/:suscriber_id|GET| Find the oauth suscriber with the given id
/oauth/oauth_suscribers/:suscriber_id|PUT| Updates the oauth suscriber with the given id
/oauth/oauth_suscribers/:suscriber_id|DELETE| Deletes the oauth suscriber with the given id
/oauth/oauth_clients|GET| Find all the oauth clients registered
/oauth/oauth_clients|POST| Creates a new oauth client
/oauth/oauth_clients/:client_id|GET| Find the oauth client with the given id
/oauth/oauth_clients/:client_id|PUT| Updates the oauth client with the given id
/oauth/oauth_clients/:client_id|DELETE| Deletes the oauth client with the given id
/oauth/api_accounts|GET| Find all the api accounts registered
/oauth/api_accounts|POST| Creates a new  api account
/oauth/api_accounts/:client_id|GET| Find the  api account with the given id
/oauth/api_accounts/:client_id|PUT| Updates the  api account with the given id
/oauth/api_accounts/:client_id|DELETE| Deletes the  api account with the given id
/oauth/token|POST| Create a new access token, see */oauth/token endpoint docs*
/oauth/token/:access_token|GET| Fetch the information about the current token
/oauth/token/:access_token|DELETE| Revokes the access token

_____

## Using the /oauth/token endpoint

In the above chart you saw the available endpoints on the internal API, however there is an specific endpoint
to fetch access tokens wich has an unique way to do stuff, and all depends on the grant type but general rules are:

* Is required a post request with Content-Type application/x-www-form-urlencoded
* Is required to send: client_id, client_secret, and grant_type initially
* Depending on the grant type any additional parameter can be required

After a successful request you will get a json access token like:

```json
   {
     "token_type": "Bearer",
     "access_token": "1b4c05bd89ccc18d6a49e006bca5a52b7af403fbcd96aaa9ccb454a62303bc72",
     "expires_in": 3600,
     "refresh_token": "0fe535b59894e5bf5c8ac98b79a2feb855cad3764a494f0a4f9db00fc934f2af",
     "token_data": {
       "account_id": "1",
       "clientId": "client_id_here",
       "account_name": "SIGIS API Manager",
       "account_details": {
         "name": "Soluciones Integrales GIS SIGIS C.A",
         "description": "default Tenant",
         "phone": "+58(212) 954.11.93",
         "email": "buzon@sigis.com.ve",
         "uri": "http://www.sigis.com.ve/"
       },
       "scopes": "*",
       "creation_stamp": "2016-10-24T10:56:02.338Z"
     },
     "scope": "*"
   }
```
Where the following fields are of interest for you:

* access_token: The token itself that must be issued for your protected requests
* expires_in: Time in seconds after the token has been created to expire, in this case 3600 seconds(an hour)
* refresh_token: A token used to change your current access token for a new one(useful to change a token after it expired)
___

# Installing The module

After some yadayada and theorical stuff is time to rock

```bash
  npm install oauth-server2
```

#Configuration

oauth-server2 requires the following configurations:

Configuration | Description
--- | ---
db|Main sequelize's configurations this will determine the main database of the server
memcached| Memcached configurations required to start memcached connection
grantHandlers(optional)|List of custom grant types supported by the server(you will se an example later)

___

# Usage
In this example you will se an step by step installation example of oauth-server2

## Step zero(0): Config file
Before we begin I recommend you to create a config.js file with sequelize's ORM connection and memecached credentials

```javascript

module.exports = {
  db : {
    database : "librerias_sigis",
    username : "postgres",
    password :"18911662",
    logging: false,
    host: "localhost",
    dialect: "postgres"
  },
  memcached: {
    servers : [ "127.0.0.1:11211" ],
		options : {
			keyCompression : true,
			poolSize : 5,
			reconnect : 3500,
			retry: 3500
		}
  }
};
```
## Step one(1): Download and install oauth-server2

```shell
  npm install --save oauth-server2

```

## Step two(2): Download your project dependencies

```shell
  npm install --save express body-parser
```

## Step three(3): Setup a basic express server

```javascript
"use strict"

  const express = require("express");
  const bodyParser = require("body-parser");
  const api = express();
  const config = require("./config");

```
## Step four(4): Include and initialize oauth-server2

```javascript

  const OAuthServer = require("oauth-server2");

  OAuthServer.init(api,{
    db : config.db,
    memcached: config.memcached
  });
```
## Step five(5): Create an express router and protect it
To protect a router you must use oauth-server2 middleware obtained by the method
**authorizeResource**, this will return an array of middleware used to protect your resource
vía oauth.


```javascript

let router = express.Router();
//Protecting the resource using the middleware
router.route("/private").get(OAuthServer.authorizeResource(),(req,res,next)=> {
  res.send({
    message : "access to the private stuff",
    other: req.accessToken
  });
});
//public resource
router.route("/public",(req,res,next)=> {
    res.send({
      message: "This is public junk"
    })
});

api.use("/",router);

api.listen(9000,() => {
  console.log("Listening on port 9000");
});

```

_____

# Testing the server

To test the server just make requests to the route you just added(/private)

```bash
curl -X GET -H "Cache-Control: no-cache"  "http://localhost:9000/private"
```

The result you will get is:

```json
{
  "error": "invalid_request",
  "error_description": "No ha especificado un access token"
}
```

If you request an access token on the endpoint **/oauth/token**

```bash

curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'grant_type=client_credentials&client_id=client_id_here&client_secret=secret_small_secret' "http://localhost:9000/oauth/token"

```

Se le otorgara un access token con la información de su grant:

```json
   {
     "token_type": "Bearer",
     "access_token": "1b4c05bd89ccc18d6a49e006bca5a52b7af403fbcd96aaa9ccb454a62303bc72",
     "expires_in": 3600,
     "refresh_token": "0fe535b59894e5bf5c8ac98b79a2feb855cad3764a494f0a4f9db00fc934f2af",
     "token_data": {
       "account_id": "1",
       "clientId": "client_id_here",
       "account_name": "SIGIS API Manager",
       "account_details": {
         "name": "Soluciones Integrales GIS SIGIS C.A",
         "description": "default Tenant",
         "phone": "+58(212) 954.11.93",
         "email": "buzon@sigis.com.ve",
         "uri": "http://www.sigis.com.ve/"
       },
       "scopes": "*",
       "creation_stamp": "2016-10-24T10:56:02.338Z",
       "client": {
         "appLogo": "/app_logo",
         "clientId": "client_id_here",
         "clientSecret": "secret",
         "suscriberId": "1",
         "redirectUrl": "http://webserver2a-local:5760",
         "appName": "ApiConsole",
         "grantTypes": "client_credentials,auth_code,password,refresh_token",
         "creationStamp": "2016-10-24T10:56:02.338Z"
       }
     },
     "scope": "*"
   }
```

The access_token property found on the json response will be your authorization triumph card

```bash
curl -X GET -H "Authorization: Bearer 1b4c05bd89ccc18d6a49e006bca5a52b7af403fbcd96aaa9ccb454a62303bc72" -H "Cache-Control: no-cache"  "http://webserver2a-local:9000/private"
```

This call will grant us access to the private stuff

```json
{
  "message": "access to the private stuff",
  "other": {
    "accessToken": "1b4c05bd89ccc18d6a49e006bca5a52b7af403fbcd96aaa9ccb454a62303bc72",
    "clientId": "WSKFIWRUMWORWWBNKUBV648913546103199900321419350531",
    "expires": "2016-10-24T16:47:55.460Z",
    "scopes": "*",
    "tokenData": {
      "account_id": "1",
      "clientId": "client_id",
      "account_name": "SIGIS API Manager",
      "account_details": {
        "name": "Soluciones Integrales GIS SIGIS C.A",
        "description": "default Tenant",
        "phone": "+58(212) 954.11.93",
        "email": "buzon@sigis.com.ve",
        "uri": "http://www.sigis.com.ve/"
      },
      "scopes": "*",
      "creation_stamp": "2016-10-24T10:56:02.338Z",
      "client": {
        "appLogo": "/app_logo",
        "clientId": "client_id",
        "clientSecret": "secret",
        "suscriberId": "1",
        "redirectUrl": "http://webserver2a-local:5760",
        "appName": "ApiConsole",
        "grantTypes": "client_credentials,auth_code,password,refresh_token",
        "creationStamp": "2016-10-24T10:56:02.338Z"
      }
    },
    "creation_stamp": "2016-10-24T11:06:32.120Z",
    "is_active": true
  }
}
```
As you could see is really easy to get started with oauth-server2 in just few steps,
some of the tedious stuff of developing oauth servers is under the control of this server.



## Implementing custom Grant types

oauth-server2 allow you to create custom grant types, by default password grant is not implemented,
howerver is really easy to add it following the example:

## [Custom Grant Type example](https://github.com/mvillarrealb/oauth-server2/blob/master/examples/advanced/README.md)

# Tests

This module was developed using a TDD based approach with mocha, chai and superagent a basic suite is implemented with two basic aspects:

* internal api setup: It is checked that every internal api endpoint is usable
* authorization framework tests

```shell
  npm test
```
