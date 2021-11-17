import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;
let token: string;

describe("GetBalanceController", () => {
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

  it("should be able to get balance", async () => {
    const statement1 = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Deposit test",
        amount: 100,
      })
      .set({ Authorization: `Bearer ${token}` });

    const statement2 = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        description: "Withdraw test",
        amount: 50,
      })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({ Authorization: `Bearer ${token}` });

    expect(response.body.statement[0].id).toBe(statement1.body.id);
    expect(response.body.statement[1].id).toBe(statement2.body.id);
    expect(response.body.balance).toEqual(50);
    expect(response.status).toBe(200);
  });
});
