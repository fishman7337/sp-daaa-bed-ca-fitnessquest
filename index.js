const app = require("./src/app");
const { env } = require("./src/config/env");
const { closePool } = require("./src/db/pool");

const server = app.listen(env.PORT, () => {
  console.log(`FitnessQuest listening on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
