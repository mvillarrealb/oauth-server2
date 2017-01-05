# Implementing Custom grants in oauth-server2
In this example you will see how you can easily create custom grant types on oauth-server2
with just a few steps and one or two configurations.

## Anatomy of a Grant type

* Every grant type must inherit GrantHandler's class

* You must override getSchema method, this will return a valid json schema with the parameters required
by your custom grant type. More info on json schema on [json.schema.org]().

* Must override authorise method, wich receives as a param the req object from the express POST request, in this method you must define your authorization flow and must return a Promise wich resolves(on success) the user identity, or reject(on error) the invalid authorization message.

* Must override getScopes method, this method will receive as parameter the user identity(generated on authorise Promise), this method must return a Promise wich resolves the scopes for your identity(a list of comma separated strings with the permissions of your api).

* Optionally you can override afterAuthorize method wich receives as parameter the userIdentity and the accessToken generated for the userIdentity(useful for api login control).


## Creating PasswordGrantHandler class
In this example we will create PasswordGrantHandler class(custom grant), that will authenticate agains username and password, the values will be hardcoded, but you can authenticate against sequelize's models, mongoose models or any source of your preference. This class has the following traits

* Username and password are hardcoded, and synchronously verified, but you can implement any async operation for your authorization

* The json schema will request username and password values as required.

* getScopes method will return permission to access the /private endpoint with verb get

* After a successful authorization a log message will be written.

```javascript
"use strict";

module.exports = (GrantHandler) => {

  class PasswordGrantHandler extends GrantHandler {

    constructor(){
      //We should invoke parent constructor with grant type name
      super("password");
    }

    authorise(req) {
      return new Promise((resolve,reject) => {
        if(req.username == "marco" && req.password == "casa1234") {
          let userIdentity = {
            username: "marco",
            name: "Marco Antonio",
            lastname:"Villarreal Benites",
            fewSkills: [
              "Java","Scala","Javascript","Javascript(Node)","Polymer"
            ]
          };
          return resolve(userIdentity);
        } else {
          return reject({error:"Invalid username or password"});
        }
      })
    }

    getSchema() {
      return {
        "$async": true,
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        },
        "required": ["username", "password"]
      }
    }

    getScopes(identity) {
      return new Promise((resolve,reject) => {
        resolve(["private.get"].join())
      })
    }

    afterAuthorise(identity,accessToken) {
      console.log("A new user logged in with access token: "+accessToken);
    }
  }

  return PasswordGrantHandler;
}
```

## Instaling the custom grant
To add your recently created grant type to the server you must add a new instance of your class
to the server definition:

```javascript

const OAuthServer = require("oauth-server2");
//we are asuming that our class is stored on grants directory
//you must pass GrantHandler abstract class reference to your module(to be able to inherit it)
const PasswordGrantHandler = require("./grants/PasswordGrantHandler")(OAuthServer.GrantHandler);

OAuthServer.init(api,{
  db : config.db,
  memcached: config.memcached,
  grantHandlers: {//here you can add new grant handlers
    password: new PasswordGrantHandler()//grant_type request key: GrantHandler dispatcher class
  }
});

```
