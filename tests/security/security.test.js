/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require("fs");
const path = require("path");

const { app, request } = require("../helpers/request");

describe("security regressions", () => {
  test("removed demo crypto/JWT endpoints are not exposed", async () => {
    await request(app).post("/jwt/generate").send({ userId: 1 }).expect(404);
    await request(app)
      .post("/bcrypt/hash")
      .send({ password: "secret" })
      .expect(404);
    await request(app)
      .post("/bcrypt/compare")
      .send({ password: "secret" })
      .expect(404);
    await request(app).get("/decode").expect(404);
  });

  test("invalid tokens and invalid input do not leak stack traces", async () => {
    const authFailure = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token")
      .expect(401);
    expect(JSON.stringify(authFailure.body)).not.toMatch(
      /stack|sql|password_hash/i,
    );

    const validationFailure = await request(app)
      .get("/api/items/not-a-number")
      .expect(400);
    expect(JSON.stringify(validationFailure.body)).not.toMatch(
      /stack|SELECT|password_hash/i,
    );
  });

  test("frontend page scripts avoid unsafe HTML injection APIs", () => {
    const scriptRoots = [
      path.join(__dirname, "..", "..", "public", "js", "shared"),
      path.join(__dirname, "..", "..", "public", "js", "pages"),
    ];

    for (const root of scriptRoots) {
      for (const file of fs.readdirSync(root)) {
        const source = fs.readFileSync(path.join(root, file), "utf8");
        expect(source).not.toMatch(
          /innerHTML|outerHTML|document\.write|eval\(/,
        );
      }
    }
  });
});
