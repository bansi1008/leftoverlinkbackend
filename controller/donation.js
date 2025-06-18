require("dotenv").config();
const pool = require("../db");

const createDonation = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const imageUrl = req.file?.path;
    const { title, description, category, location, quantity, expiry_date } =
      req.body;

    if (!title || !category || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await client.query(
      "INSERT INTO donations (user_id, title,description,category,imageurl,location,quantity,expiry_date) VALUES ($1, $2, $3, $4, $5,$6,$7,$8) RETURNING *",
      [
        userId,
        title,
        description,
        category,
        imageUrl,
        location,
        quantity,
        expiry_date,
      ]
    );

    const newDonation = result.rows[0];
    res.status(201).json({
      message: "it's creted successfully",
      donation: newDonation,
    });
  } catch (error) {
    console.error("Error creating donation:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const getDonations = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, title,description,category,imageUrl,location,quantity,expiry_date FROM donations"
    );

    const donations = result.rows;
    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const myDonations = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const result = await client.query(
      "SELECT title,description,category,imageUrl,location,quantity,expiry_date FROM donations WHERE user_id = $1",
      [userId]
    );

    const donations = result.rows;
    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching my donations:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const deleteDonation = async (req, res) => {
  const client = await pool.connect();
  try {
    const donationId = req.params.id;
    const userId = req.user.id;

    const result = await client.query(
      "DELETE FROM donations WHERE id = $1 AND user_id = $2 RETURNING *",
      [donationId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Error deleting donation:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const editDonation = async (req, res) => {
  const client = await pool.connect();
  try {
    const donationId = req.params.id;
    const userId = req.user.id;
    const { title, description, category, location, quantity, expiry_date } =
      req.body;

    if (!title || !category || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await client.query(
      "UPDATE donations SET title = $1, description = $2, category = $3, location = $4, quantity = $5, expiry_date = $6 WHERE id = $7 AND user_id = $8 RETURNING *",
      [
        title,
        description,
        category,
        location,
        quantity,
        expiry_date,
        donationId,
        userId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const updatedDonation = result.rows[0];
    res.status(200).json({
      message: "Donation updated successfully",
      donation: updatedDonation,
    });
  } catch (error) {
    console.error("Error updating donation:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const getSingleDonation = async (req, res) => {
  const client = await pool.connect();
  try {
    const donationId = req.params.id;

    const result = await client.query("SELECT * FROM donations WHERE id = $1", [
      donationId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching donation:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  createDonation,
  getDonations,
  myDonations,
  deleteDonation,
  editDonation,
  getSingleDonation,
};
