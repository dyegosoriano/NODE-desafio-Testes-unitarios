import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("AuthenticateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      email: "test@email.com",
      password: "test123",
      name: "User Test",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "test@email.com", password: "test123" });

    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate with wrong password", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "test@email.com", password: "incorrect_password" });

    expect(response.body).toEqual({ message: "Incorrect email or password" });
    expect(response.status).toEqual(401);
  });

  it("should not be able to authenticate with wrong email", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "incorrect@email.com", password: "test123" });

    expect(response.body).toEqual({ message: "Incorrect email or password" });
    expect(response.status).toEqual(401);
  });
});
