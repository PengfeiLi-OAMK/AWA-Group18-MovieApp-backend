import * as chai from "chai";
import { default as chaiHttp, request } from "chai-http";
import app from "../index.js";
import pool from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

chai.use(chaiHttp);
const { expect } = chai;

describe("Delete Account API", () => {
  let dbConnection;
  let userId;
  let token;

  before(async () => {
    dbConnection = await pool.connect();
    const hashedPassword = await bcrypt.hash("password123", 10);
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`,
      ["testuser", "testuser@example.com", hashedPassword]
    );
    userId = userResult.rows[0].id;

    token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
  });

  after(() => {
    if (dbConnection) dbConnection.release();
  });

  afterEach(async () => {
    await pool.query("DELETE FROM users");
  });

  it("should delete a user account successfully - Positive Test", async () => {
    const res = await request
      .execute(app)
      .delete("/api/delete")
      .set("Authorization", `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("message")
      .eql("Account deleted successfully, including all related data");
  });

  it("should return an error if user does not exist - Negative Test", async () => {
    const nonExistentToken = jwt.sign(
      { userId: 999 },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const res = await request
      .execute(app)
      .delete("/api/delete")
      .set("Authorization", `Bearer ${nonExistentToken}`);

    expect(res).to.have.status(404);
    expect(res.body).to.have.property("message").eql("User not found");
  });
});
