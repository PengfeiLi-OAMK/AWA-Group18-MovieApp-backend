import * as chai from "chai";
import { default as chaiHttp, request } from "chai-http";
import app from "../index.js";
import sinon from "sinon";
import axios from "axios";
import bcrypt from "bcrypt";
import pool from "../database/db.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("Browse Reviews API - Positive Tests", () => {
  let dbConnection;

  before(async () => {
    dbConnection = await pool.connect();
  });

  after(() => {
    if (dbConnection) dbConnection.release();
  });

  beforeEach(async () => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ('testuser', 'testuser@example.com', $1) RETURNING id`,
      [hashedPassword]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO reviews (film_id, user_id, rating, review_text) VALUES (1, $1, 5, 'Great movie!')`,
      [userId]
    );

    sinon.stub(axios, "get").callsFake((url) => {
      if (url.includes("/movie/1")) {
        return Promise.resolve({
          data: { title: "Great movie!" },
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  afterEach(async () => {
    await pool.query("DELETE FROM reviews");
    await pool.query("DELETE FROM users");
    sinon.restore();
  });

  it("should fetch all public reviews without filters", async () => {
    const res = await request.execute(app).get("/api/public-reviews");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body[0]).to.have.property("film_id");
    expect(res.body[0]).to.have.property("review_text");
    expect(res.body[0]).to.have.property("rating");
    expect(res.body[0]).to.have.property("user_email");
  });

  it("should fetch reviews filtered by title", async () => {
    const res = await request
      .execute(app)
      .get("/api/public-reviews?title=Great");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body[0].film_title).to.equal("Great movie!");
  });

  it("should fetch reviews filtered by rating", async () => {
    const res = await request.execute(app).get("/api/public-reviews?rating=5");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body[0].rating).to.equal(5);
  });
});

describe("Browse Reviews API - Negative Tests", () => {
  let dbConnection;

  before(async () => {
    dbConnection = await pool.connect();
  });

  after(() => {
    if (dbConnection) dbConnection.release();
  });

  beforeEach(async () => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ('testuser', 'testuser@example.com', $1) RETURNING id`,
      [hashedPassword]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO reviews (film_id, user_id, rating, review_text) VALUES (1, $1, 5, 'Great movie!')`,
      [userId]
    );

    sinon.stub(axios, "get").callsFake((url) => {
      if (url.includes("/movie/1")) {
        return Promise.resolve({
          data: { title: "Great movie!" },
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  afterEach(async () => {
    await pool.query("DELETE FROM reviews");
    await pool.query("DELETE FROM users");
    sinon.restore();
  });

  it("should return an empty array when no reviews match the title filter", async () => {
    const res = await request
      .execute(app)
      .get("/api/public-reviews?title=NonexistentMovie");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array").that.is.empty;
  });

  it("should return an empty array when no reviews match the rating filter", async () => {
    const res = await request
      .execute(app)
      .get("/api/public-reviews?rating=999");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array").that.is.empty;
  });

  it("should return empty array when there are no reviews in the database", async () => {
    await pool.query("DELETE FROM reviews");
    const res = await request.execute(app).get("/api/public-reviews");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array").that.is.empty;
  });
});
