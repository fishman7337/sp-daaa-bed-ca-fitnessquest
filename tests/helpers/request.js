const request = require("supertest");
const app = require("../../src/app");
const { closePool } = require("../../src/db/pool");

async function login(username = "John Doe", password = "password123") {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ username, password })
    .expect(200);
  return response.body;
}

async function authRequest(username = "John Doe") {
  const session = await login(username);
  return {
    session,
    agent: request(app),
    auth: (builder) => builder.set("Authorization", `Bearer ${session.token}`),
  };
}

afterAll(async () => {
  await closePool();
});

module.exports = {
  app,
  authRequest,
  login,
  request,
};
