const mongoose = require("mongoose");

async function connectMongo(mongoUri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000
  });
  return mongoose.connection;
}

module.exports = { connectMongo };

