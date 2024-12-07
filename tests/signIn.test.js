import * as chai from "chai";
import { default as chaiHttp, request } from "chai-http";
import app from "../index.js";
import pool from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

chai.use(chaiHttp);
const { expect } = chai;

describe("Login API", () => {
  let dbConnection;
  let token;

  before(async () => {
    dbConnection = await pool.connect();
    const hashedPassword = await bcrypt.hash("password123", 10);
    await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
      ["testuser", "testuser@example.com", hashedPassword]
    );
  });

  after(() => {
    if (dbConnection) dbConnection.release();
  });

  afterEach(async () => {
    await pool.query("DELETE FROM users");
  });

  it("should login successfully with valid credentials - Positive Test", async () => {
    const res = await request
      .execute(app)
      .post("/api/login")
      .send({ email: "testuser@example.com", password: "password123" });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("message").eql("Login successful");
    expect(res.body).to.have.property("token");
  });

  it("should return an error with invalid credentials - Negative Test", async () => {
    const res = await request
      .execute(app)
      .post("/api/login")
      .send({ email: "testuser@example.com", password: "wrongpassword" });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message").eql("Invalid credentials");
  });

  it("should return an error for non-existent user - Negative Test", async () => {
    const res = await request
      .execute(app)
      .post("/api/login")
      .send({ email: "nonexistent@example.com", password: "password123" });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message").eql("Invalid credentials");
  });
});
