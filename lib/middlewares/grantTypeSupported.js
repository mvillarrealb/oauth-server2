"use strict";

module.exports = (models,libs)=> {
  const grantTypeSupported = (req,res,next) => {
    if(libs.supportedGrants.indexOf(req.grant_type) > -1) {
      return next();
    } else {
      res.status(400).send({
        error : "invalid_grant",
        error_description: req.__("unsupported_grant",{grant:req.grant_type })
      })
    }
  };
  return grantTypeSupported;
};
