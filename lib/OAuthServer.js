"use strict";

let middlewares = {};
let models      = {};
let controllers = {};
let localize    = {};
let memcached   = {};
/**
 * DummyCache is a simple dummy object to mock
 * memcached module base behavior, this is convenient when
 * you want to use oauth-server2 without a memcached
 * server(wait....why woud you want that??...well if you want to do it you can :))
 *
 * @type {Object}
 */
const DummyCache = {
  get : function(key,cb){
    cb(null,null);
  },
  set : function(key,value,ttl,cb) {
    cb(null);
  }
}

const i18n         = require("i18n");
const path         = require("path");
const Memcached    = require("memcached");
const GrantServer  = require("./GrantServer");
const GrantHandler = require("./GrantHandler");

i18n.configure({
  defaultLocale: "es",
  directory: path.join(__dirname,'locales'),
  updateFiles: false,
  syncFiles: false,
  prefix: 'oauth-',
  register: localize
});

const OAuthServer = {
  supportedGrants: [
    "client_credentials",
    "refresh_token",
    "authorization_code"
  ],
  grantHandlers : {
    "client_credentials": "handleClientCredentials",
    "refresh_token": "handleRefreshToken",
    "authorization_code" : "handleAuthorizationCode"
  },
  GrantHandler: GrantHandler,
  /**
   * @method init
   * @param  {express} api     [description]
   * @param  {Object} options [description]
   */
  init: (app,options) => {
    if( options && options.grantHandlers ){
      for( let grant in options.grantHandlers ) {
        console.log(`Adding custom grant type ${grant}`);
        OAuthServer.supportedGrants.push(grant)
        let grantHandler = options.grantHandlers[grant];
        if(grantHandler instanceof GrantHandler){
          console.log("Registered custom grant type handler");
          OAuthServer.grantHandlers[grant] = grantHandler;
        } else {
          throw `Grant handler for type ${grant} is not instanceof OAuthServer.GrantHandler class`;
        }
      }
    }

    if( options && options.memcached && typeof options.memcached == "object" ) {
      memcached   = new Memcached(options.memcached.servers,options.memcached.options);
    } else {
      console.warn("You didn't specify memcached configuration this will not break your OAuth server but we discourage a database only implementation");
      memcached =  DummyCache;
    }

    if (! options && options.db) {
      throw Error("Property options.db must be defined to install oauth-server2 module")
    }

    models = require("./models")(options.db,{ memcached: memcached,localize: localize });

    const grantService = new GrantServer(models);

    middlewares = require("./middlewares")(models,{
      supportedGrants: OAuthServer.supportedGrants,
      grantHandlers: OAuthServer.grantHandlers,
      grantService: grantService
    });

    middlewares["authorizeResource"] = OAuthServer.authorizeResource();

    controllers = require("./controllers")(models,middlewares);

    OAuthServer.configureEndpoints(app);

  },
  /**
   * Configures the endpoints for the oauth server
   * /oauth/oauth_suscribers
   * /oauth/oauth_clients
   * /oauth/token
   *
   * @param  {express} app [description]
   */
  configureEndpoints: (app) => {
    const self = OAuthServer;
    app.use(i18n.init);
    app.use("/oauth/oauth_suscribers",controllers.OAuthSuscriberController);
    app.use("/oauth/oauth_clients",controllers.OAuthClientController);
    app.use("/oauth/api_accounts",controllers.ApiAccountController);
    app.use("/oauth/token",controllers.AccessTokenController);
  },
  /**
   * Returns database connection used by oauth-server2
   * @method getConnection
   * @return {[type]} [description]
   */
  getConnection: () => {
    return models.sequelize;
  },
  getDB: () => {
    return models;
  },
  synchronize: () => {
    return new Promise(function(resolve, reject) {
      models.sequelize.sync({force: true}).then(() => {
        return resolve("ok");
      }).catch((error) => {
        return reject(error);
      });
    });

  },
  /**
   * authorizeResource method will return the middleware
   * stack provided by OAuthServer to validate requests
   * agains the storage and the cache, the validation steps
   * are as follows:
   * extractToken: Validates the existence of an access token in the authorization header
   * or in access_token query parameter
   *
   * checkToken: Validates the token, searches in the cache for the token if does not exists
   * it will look for it in the cache, if none exists an error will be thrown, otherwise
   * it will be checked if the token expired, if expired an error will be thrown otherwise
   * the validation will continue.
   *
   * checkScope: Validates if the scope of the current request is available in the token
   * scopes if is not in the permissions an error will be thrown, otherwise the validation
   * will be finished.
   *
   * @return {[type]} [description]
   */
  authorizeResource: () => {
    return [
      middlewares.extractToken,
      middlewares.checkToken,
      middlewares.checkScope,
      middlewares.sessionHandler
    ];
  }
};

module.exports = OAuthServer;
