import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../database/db.js";

const AuthController = {
  async register(req, res) {
    const { username, email, password } = req.body;

    try {
      const existingUser = await UserModel.findUserByEmail(email);
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });

      const user = await UserModel.createUser(username, email, password);
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async login(req, res) {
    //console.log("Incoming login request:", req.body);
    const { email, password } = req.body;

    try {
      const user = await UserModel.findUserByEmail(email);
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "12h",
      });
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      // console.error('Login error:', error);  // Log the error to the console
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async deleteAccount(req, res) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded.userId;
      // Start a transaction to ensure all deletions are consistent
      await pool.query("BEGIN");

      // Delete related data from reviews, favorites, and shared_favorites
      await pool.query("DELETE FROM reviews WHERE user_id = $1", [userId]);

      await pool.query("DELETE FROM shared_favorites WHERE user_id = $1", [
        userId,
      ]);

      // Delete the user
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [userId]
      );
      if (result.rowCount === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ message: "User not found" });
      }

      // Commit the transaction
      await pool.query("COMMIT");

      res.status(200).json({
        message: "Account deleted successfully, including all related data",
      });
    } catch (error) {
      await pool.query("ROLLBACK"); // Rollback the transaction on error
      console.error("Error during account deletion:", error);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  },

  async logout(req, res) {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(404).json({ message: "No token provided" });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(404).json({ message: "Invalid or expired token" });
    }
  },
};

export default AuthController;
