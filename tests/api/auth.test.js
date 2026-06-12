const { app, login, request } = require("../helpers/request");

describe("auth and users", () => {
  test("registers, logs in, and returns the current user without password hashes", async () => {
    const created = await request(app)
      .post("/api/auth/register")
      .send({
        username: "New Player",
        email: "new.player@example.com",
        password: "password123",
      })
      .expect(201);

    expect(created.body.token).toBeTruthy();
    expect(created.body.user.password_hash).toBeUndefined();

    const loggedIn = await login("New Player", "password123");
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loggedIn.token}`)
      .expect(200);

    expect(me.body.username).toBe("New Player");
    expect(me.body.password_hash).toBeUndefined();
  });

  test("rejects duplicate usernames and invalid passwords", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "John Doe",
        email: "john.duplicate@example.com",
        password: "password123",
      })
      .expect(409);

    await request(app)
      .post("/api/auth/login")
      .send({ username: "John Doe", password: "wrong-password" })
      .expect(401);
  });

  test("public users endpoint exposes safe profile data only", async () => {
    const response = await request(app).get("/api/users").expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].password_hash).toBeUndefined();
    expect(response.body[0].email).toBeUndefined();
  });
});
