const mysql = require("mysql2/promise");
const { env } = require("../config/env");

let pool;

function createPool(database = env.DB_DATABASE) {
  return mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database,
    connectionLimit: 10,
    namedPlaceholders: true,
    multipleStatements: false,
    dateStrings: true,
  });
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

async function query(sql, values = []) {
  const [rows] = await getPool().execute(sql, values);
  return rows;
}

async function transaction(work) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  closePool,
  createPool,
  getPool,
  query,
  transaction,
};
