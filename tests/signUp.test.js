import * as chai from "chai";
import { default as chaiHttp, request } from "chai-http";
import app from "../index.js";
import pool from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

chai.use(chaiHttp);
const { expect } = chai;

describe("Signup API", () => {
  let dbConnection;

  before(async () => {
    dbConnection = await pool.connect();
  });

  after(() => {
    if (dbConnection) dbConnection.release();
  });

  afterEach(async () => {
    await pool.query("DELETE FROM users");
  });

  it("should signup successfully with valid data - Positive Test", async () => {
    const res = await request.execute(app).post("/api/register").send({
      username: "newuser",
      email: "newuser@example.com",
      password: "password123",
    });

    expect(res).to.have.status(201);
    expect(res.body)
      .to.have.property("message")
      .eql("User registered successfully");
  });

  it("should return an error if email is already taken - Negative Test", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      ["existinguser", "existinguser@example.com", hashedPassword]
    );

    const res = await request.execute(app).post("/api/register").send({
      username: "newuser",
      email: "existinguser@example.com",
      password: "password123",
    });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message").eql("User already exists");
  });
});
