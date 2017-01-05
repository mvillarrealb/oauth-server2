const uuid    = require('node-uuid');
const generatedClientId = uuid.v4();
module.exports = {
    oauth_suscriber: {
      suscriber_id: "9999",
      suscriber_name: "LCA Company",
      suscriber_email: "lcacompany@gmail.com",
      suscriber_contact: "Foo Bar",
      suscriber_url:"https://localhost",
      suscriber_logo:""
    },
    oauth_client: {
      client_id: generatedClientId,
      suscriber_id: "9999",
      app_name: "Blithzer",
      grant_types: ["client_credentials","refresh_token","password"],
      app_logo:"",
      redirect_uri: "https://blithzher.com/app"
    },
    api_account: {
      client_id: generatedClientId,
      suscriber_id: "9999",
      account_name: "Admin account Blithzer",
      account_details: {

      },
      scopes: "*"
    }
};
