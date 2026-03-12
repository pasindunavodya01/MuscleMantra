const mongoose = require("mongoose");

async function connectMongo(mongoUri) {
  mongoose.set("strictQuery", true);
  const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':***@');
  console.log(`[DB] Attempting to connect to: ${maskedUri}`);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });
  return mongoose.connection;
}

module.exports = { connectMongo };

