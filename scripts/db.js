/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const mysqlBase = require("mysql2");

const { env } = require("../src/config/env");

const command = process.argv[2] || "reset";
const rootDir = path.join(__dirname, "..");

function readSql(fileName) {
  return fs.readFileSync(path.join(rootDir, "src", "db", fileName), "utf8");
}

function splitSql(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: false,
  });

  try {
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${mysqlBase.escapeId(env.DB_DATABASE)}
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await connection.end();
  }
}

async function executeFile(fileName) {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    multipleStatements: false,
  });

  try {
    for (const statement of splitSql(readSql(fileName))) {
      await connection.query(statement);
    }
  } finally {
    await connection.end();
  }
}

async function main() {
  if (!["create", "migrate", "seed", "reset"].includes(command)) {
    throw new Error(`Unknown DB command: ${command}`);
  }

  if (
    command === "create" ||
    command === "migrate" ||
    command === "seed" ||
    command === "reset"
  ) {
    await createDatabase();
  }

  if (command === "migrate" || command === "reset") {
    await executeFile("schema.sql");
  }

  if (command === "seed" || command === "reset") {
    await executeFile("seed.sql");
  }

  console.log(`Database ${command} completed for ${env.DB_DATABASE}`);
}

main().catch((error) => {
  if (Array.isArray(error.errors)) {
    for (const nested of error.errors) {
      console.error(nested.stack || nested.message || nested);
    }
  }
  console.error(error.stack || error.message || error);
  process.exit(1);
});
