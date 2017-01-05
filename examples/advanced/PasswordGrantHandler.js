"use strict";

module.exports = (GrantHandler) => {
  let sessions = [];
  /**
   * @class PasswordGrantHandler
   * @author Marco Villarreal
   */
  class PasswordGrantHandler extends GrantHandler {

    constructor(){
      //We should invoke parent constructor with grant type name
      super("password");
    }

    authorise(req) {
      return new Promise((resolve,reject)=>{
        if(req.username == "marco" && req.password == "casa1234") {
          return resolve({
            username:"marco",
            name:"Marco Antonio",
            lastname:"Villarreal Benites",
            fewSkills: [
              "Java","Scala","Javascript","Javascript(Node)","Polymer"
            ]
          })
        } else {
          return reject({error:"Usuario y contraseña inválidos"});
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
      console.log(identity);
      console.log(accessToken);
      console.log(this);
    }
  }

  return PasswordGrantHandler;
}
