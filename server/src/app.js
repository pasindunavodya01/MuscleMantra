const express = require("express");
const cors = require("cors");

const api = require("./api");

function createApp({ clientOrigin, jwtSecret, repo }) {
  const app = express();

  app.locals.jwtSecret = jwtSecret;
  app.locals.repo = repo;

  app.use(
    cors({
      origin: clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => res.json({ ok: true }));
  app.use("/api", api);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // Basic fallback; keep response stable for the client
    return res.status(500).json({ message: "Server error" });
  });

  return app;
}

module.exports = { createApp };

