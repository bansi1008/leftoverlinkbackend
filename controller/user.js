require("dotenv").config();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_HOST);
const nodemailer = require("nodemailer");
const hashPasswordWithWorker = require("../utils/hashWithWorker");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const userregestration = async (req, res) => {
  const client = await pool.connect();
  const { name, email, password, confirmpassword, role } = req.body;

  if (!name || !email || !password || !confirmpassword || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmpassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const normalizedEmail = email.toLowerCase();

    const exisitnguser = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (exisitnguser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await hashPasswordWithWorker(password);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:${email}`, generatedOtp, "EX", 300);
    await redis.set(
      `user:${email}`,
      JSON.stringify({ name, normalizedEmail, hashedPassword, role }),
      "EX",
      300
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Chhers for signup! Your OTP is ${generatedOtp}. Hurry, it expires in 5 minutes!`,
    });

    res.status(200).json({
      message:
        "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  const client = await pool.connect();
  try {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
      return res.status(400).json({ message: "OTP has expired or is invalid" });
    }
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const userData = await redis.get(`user:${email}`);
    if (!userData) {
      return res.status(400).json({ message: "User data not found" });
    }

    const { name, normalizedEmail, hashedPassword, role } =
      JSON.parse(userData);
    const newUser = await client.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, normalizedEmail, hashedPassword, role]
    );

    const user = newUser.rows[0];

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
    await redis.del(`otp:${email}`);
    await redis.del(`user:${email}`);
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const loginUser = async (req, res) => {
  const client = await pool.connect();
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const normalizedEmail = email.toLowerCase();
  try {
    const user = await client.query("SELECT * FROM users WHERE email = $1", [
      normalizedEmail,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.rows[0].id, name: user.rows[0].name, role: user.rows[0].role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logout successful" });
};

const profileimage = async (req, res) => {
  try {
    const client = await pool.connect();
    const userId = req.user.id;
    const imageUrl = req.file.path;
    await client.query("UPDATE users SET profileimageurl = $1 WHERE id = $2", [
      imageUrl,
      userId,
    ]);

    res.status(200).json({ message: "Profile image updated", imageUrl });
    client.release();
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  userregestration,
  loginUser,
  logout,
  verifyOtp,
  profileimage,
};
