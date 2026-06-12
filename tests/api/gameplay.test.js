const { app, authRequest, request } = require("../helpers/request");

describe("gameplay API", () => {
  test("challenge lifecycle and review flow enforce ownership", async () => {
    const john = await authRequest("John Doe");
    const jane = await authRequest("Jane Doe");

    const challenge = await john
      .auth(
        request(app)
          .post("/api/challenges")
          .send({ challenge: "Run a secure test mile", skillpoints: 30 }),
      )
      .expect(201);

    await jane
      .auth(
        request(app)
          .put(`/api/challenges/${challenge.body.challenge_id}`)
          .send({ challenge: "Tampered", skillpoints: 1 }),
      )
      .expect(403);

    await john
      .auth(
        request(app)
          .post(`/api/challenges/${challenge.body.challenge_id}`)
          .send({ completed: true, notes: "Done" }),
      )
      .expect(201);

    await john
      .auth(
        request(app)
          .post("/api/reviews")
          .send({ challenge_id: challenge.body.challenge_id, review_amt: 5 }),
      )
      .expect(201);

    const reviews = await request(app)
      .get(`/api/reviews/challenges/${challenge.body.challenge_id}`)
      .expect(200);
    expect(reviews.body[0].review_amt).toBe(5);
  });

  test("inventory, pets, and battles use the signed-in user only", async () => {
    const john = await authRequest("John Doe");
    const jane = await authRequest("Jane Doe");

    await john
      .auth(
        request(app)
          .post("/api/inventory/buy")
          .send({ item_id: 1, quantity: 1 }),
      )
      .expect(201);

    const pet = await john
      .auth(request(app).post("/api/pets").send({ name: "Security Cub" }))
      .expect(201);

    await jane
      .auth(
        request(app)
          .post("/api/battles/fight")
          .send({ pet_id: pet.body.pet_id, enemy_id: 1 }),
      )
      .expect(403);

    const battle = await john
      .auth(
        request(app)
          .post("/api/battles/fight")
          .send({ pet_id: pet.body.pet_id, enemy_id: 1 }),
      )
      .expect(201);
    expect(["Win", "Lose", "Draw"]).toContain(battle.body.result);
  });

  test("quest and achievement endpoints validate requirements", async () => {
    const john = await authRequest("John Doe");

    await john.auth(request(app).post("/api/quests/1/attempt")).expect(201);
    const claimed = await john
      .auth(request(app).post("/api/achievements/1/claim"))
      .expect(201);

    expect(claimed.body.achievement_id).toBe(1);
    await john.auth(request(app).post("/api/achievements/1/claim")).expect(409);
  });
});
