"use strict"
/**
 * Class GrantHandler serves as extended Grant factory which allows
 * you to define your own grant types, just by overriding the methods of this
 * class, GrantHandler life cicle is as follows:
 *
 * * (constructor)Initializes de grant handler(grantName is provided)
 * * (getSchema)Defines grant schema(must return a json schema with required parameters and validations)
 * * (authorise) Authorization is performed from the request body a promise must be returned
 * * (getScopes) After successful authorization identity provided from authorise is passed throught
 *    to the getScopes method, must return a promise that handles scopes lookup
 *  * (afterAuthorise) Any additional business logic after a successful authorization flow, at this point identity and accessToken are provided
 *  
 * @class GrantHandler
 * @author Marco Villarreal
 */
class GrantHandler {

  constructor(grantName) {
    this.grantName = grantName;
  }

  get grantName(){
    return this._grantName
  }

  set grantName(grantName){
    this._grantName = grantName;
  }

  getSchema() {
    return Error("You must implement getSchema method in your GrantHandler class");
  }

  authorise(req) {
    return this.rejectPromise("You must implement authorise method in your GrantHandler class");
  }

  getScopes(identity) {
    return this.rejectPromise("You must implement getScopes method in your GrantHandler class");
  }

  afterAuthorise(identity,accessToken) {}

  rejectPromise(errorMessage) {
    return new Promise((resolve,reject) => {
      return reject(errorMessage);
    })
  }
}

module.exports = GrantHandler;
