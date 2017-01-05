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
    servers : [ "localhost:11211" ],
		options : {
			keyCompression : true,
			poolSize : 5,
      retries: 3,
      failures: 3,
			reconnect : 1000,
			retry: 1000
		}
  }
};
