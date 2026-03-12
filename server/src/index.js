const { env } = require("./config/env");
const { connectMongo } = require("./loaders/mongoose");
const { createApp } = require("./app");
const { createMongoRepo } = require("./repositories/mongoRepo");
const { createMemoryRepo } = require("./repositories/memoryRepo");

async function main() {
  let repo;
  let dbMode = "mongo";
  try {
    await connectMongo(env.mongoUri);
    repo = createMongoRepo();
  } catch (err) {
    dbMode = "memory";
    repo = createMemoryRepo();
    console.warn("MongoDB not reachable; falling back to in-memory demo data.");
    console.warn("To use MongoDB, start MongoDB locally and restart the server.");
    console.warn(err?.message || err);
  }

  const app = createApp({ clientOrigin: env.clientOrigin, jwtSecret: env.jwtSecret, repo });
  app.listen(env.port, () => {
    // Intentionally simple startup log
    console.log(`Server listening on :${env.port} (db=${dbMode})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

