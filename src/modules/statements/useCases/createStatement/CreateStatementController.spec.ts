import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;
let token: string;

describe("CreateStatementController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      email: "test@email.com",
      password: "test123",
      name: "User Test",
    });

    const { body: response } = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "test@email.com", password: "test123" });

    token = response.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(100);
    expect(response.status).toBe(201);
  });

  it("should be able to create withdraw statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(50);
    expect(response.status).toBe(201);
  });

  it("should not be able to create withdraw statement without funds", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
