require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
(async () => {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT NOW()");
    console.log("Database connected successfully:", res.rows[0]);
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    client.release();
  }
})().catch((err) => {
  console.error("Error during database connection:", err);
});

module.exports = pool;
