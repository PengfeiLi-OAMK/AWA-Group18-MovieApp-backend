import * as chai from "chai";
import { default as chaiHttp, request } from "chai-http";
import app from "../index.js";
import pool from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

chai.use(chaiHttp);
const { expect } = chai;

describe("Logout API", () => {
  let token;

  before(async () => {
    token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
  });

  it("should logout successfully with valid token - Positive Test", async () => {
    const res = await request
      .execute(app)
      .post("/api/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("message").eql("Logout successful");
  });

  it("should return an error if no token is provided - Negative Test", async () => {
    const res = await request.execute(app).post("/api/logout");

    expect(res).to.have.status(404);
  });
});
