import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DB_NAME
      : process.env.DB_NAME,
  ssl: process.env.SSL === "true" ? { rejectUnauthorized: false } : false,
});

// pool.on("connect", () => {
//   console.log(
//     `Connected to the ${
//       process.env.NODE_ENV === "test" ? "test" : "production"
//     } database`
//   );
// });

export default pool;
