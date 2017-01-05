"use strict";
/**
 * middleware wich verifies the current request scope
 * against the available scopes in the accessToken, if
 * no scope provided an error will be thrown if the scope
 * is the string * it means that every request is allowed.
 *
 * A scope is a string representing an individual resource, in
 * this case the scope is build from the endpoints using each portion
 * of the url as a scope fragment
 *
 * Examples:
 *
 * GET /users/lists scope: users.lists.get
 * POST /users/lists scope: users.lists.post
 * GET /users/feeds/:id([0-9]+) scope: users.feeds.id.get
 *
 * The formula is simple just replace any slash(/) with a dot(.),
 * any regex pattern used in the express route definition will
 * be trimmed and only the param name will be concatenated to
 * the resulting string. Finally add the http verb to the end
 * this will guarantee a safe scope engeenering
 *
 * @param  {Object} models [description]
 * @param  {Object} libs   [description]
 * @return {Function}        [description]
 */
module.exports = (models,libs)=> {
  const url = require("url");

  const extractScope = (req) => {
    let verb = req.method;
    let endPoint = url.parse(req.originalUrl).pathname;
    let baseScope = endPoint;

    if( (/\/$/).test(baseScope) ){
      let lastIndexOf = baseScope.lastIndexOf("/");
      baseScope = baseScope.substr(0,lastIndexOf);
    }
    baseScope = baseScope.replace(/\//i,"");//Se reemplaza el primer slash del endpoint
    baseScope = baseScope.replace(/\//g,".");//Cualquier slash subsecuente será reemplazado por punto(.)
    baseScope = baseScope.replace(/\:/g,"");//Cualquier slash subsecuente será reemplazado por punto(.)
    baseScope += "." + verb;//Se culmina el nombre del scope usando el verbo ejemplo (user.get user.post)
    baseScope = baseScope.replace(/\(\S+\)/g,"");

    return baseScope.toLowerCase();
  }

  const checkScope = (req,res,next) => {
    const requestScope = extractScope(req);

    if( req.tokenData.scopes ) {
      if (req.tokenData.scopes == "*") {
        return next();
      } else {
        let authorized = false;
        let scopes     = req.tokenData.scopes.split(",");
        for(let i = 0; i < scopes.length;i++){
          let aScope = scopes[i];
          if( aScope == requestScope ){
            authorized = true;
            break;
          }
        }
        if(!authorized) {
          return res.status(400).send({
            error : "invalid_scope",
            error_description: req.__("scope_denied",{scope: requestScope })
          });
        } else {
          req.scope = requestScope;
          return next();
        }
      }
    } else {
      return res.status(400).send({
        error : "invalid_scope",
        error_description: req.__("missing_scope")
      });
    }
  }
  return checkScope;
}
