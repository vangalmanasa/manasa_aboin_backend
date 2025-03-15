const admin = require("firebase-admin");
const serviceAccount = require('../aboin-b889b-firebase-adminsdk-fbsvc-509467f62a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
