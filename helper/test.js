import pool from "../database/db.js";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const initializeTestDb = async () => {
  await pool.query("TRUNCATE TABLE users, reviews RESTART IDENTITY CASCADE");
  console.log("Test database initialized.");
};

const insertTestUser = async (email, password, username = "testuser") => {
  const hashedPassword = await hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, hashedPassword]
  );
  return result.rows[0];
};

const getToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
};

export { initializeTestDb, insertTestUser, getToken };
