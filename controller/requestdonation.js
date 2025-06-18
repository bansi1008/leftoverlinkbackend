require("dotenv").config();
const pool = require("../db");

const createrequestDonation = async (req, res) => {
  const client = await pool.connect();
  try {
    const ngoid = req.user.id;
    const itemid = req.params.id;

    const donationResult = await client.query(
      "SELECT * FROM donations WHERE id = $1",
      [itemid]
    );
    if (donationResult.rows.length === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const existingreq = await client.query(
      "SELECT * FROM requests  WHERE ngoid = $1 AND donationid = $2",
      [ngoid, itemid]
    );

    if (existingreq.rows.length > 0) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const result = await client.query(
      "INSERT INTO requests (donationid, ngoid, status) VALUES ($1, $2, 'pending') RETURNING *",
      [itemid, ngoid]
    );
    res.status(201).json({
      message: "Donation request sent successfully",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating donation request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const ngototalrequested = async (req, res) => {
  const client = await pool.connect();
  try {
    const ngoid = req.user.id;
    //console.log("NGO ID:", ngoid);
    const result = await client.query(
      `SELECT r.*, d.title, d.description, d.imageurl FROM requests r JOIN donations d ON r.donationid = d.id WHERE r.ngoid = $1 AND  r.status = 'pending'`,
      [ngoid]
    );

    res.status(200).json({ total_requested: result.rows });
  } catch (error) {
    console.error("Error fetching total requested donations:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const donarreceviedrequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const donarid = req.user.id;
    const result = await client.query(
      `SELECT r.id AS request_id, r.status, r.ngoid, d.title, d.imageurl, d.description
       FROM requests r
       JOIN donations d ON r.donationid = d.id
       WHERE d.user_id = $1`,
      [donarid]
    );
    res.status(200).json({ total_requested: result.rows });
  } catch (error) {
    console.error("Error fetching total requested donations:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const approveRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const requestId = req.params.id;
    const donorId = req.user.id;

    // Validate that the request belongs to a donation of this donor
    const result = await client.query(
      `UPDATE requests r
       SET status = 'approved'
       FROM donations d
       WHERE r.donationid = d.id AND d.user_id = $1 AND r.id = $2
       RETURNING r.*, d.id AS donationid`,
      [donorId, requestId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Request not found or not authorized" });
    }
    const donationId = result.rows[0].donationid;

    await client.query(
      `UPDATE donations
       SET status = 'claimed'
       WHERE id = $1`,
      [donationId]
    );

    await client.query(
      `UPDATE requests
       SET status = 'rejected'
       WHERE donationid = $1 AND status = 'pending' AND id != $2`,
      [donationId, requestId]
    );

    res.status(200).json({
      message: "Request approved and donation claimed",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Error approving request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const rejectRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const requestId = req.params.id;
    const donorId = req.user.id;

    const result = await client.query(
      `UPDATE requests r
       SET status = 'rejected'
       FROM donations d
       WHERE r.donationid = d.id AND d.user_id = $1 AND r.id = $2
       RETURNING r.*`,
      [donorId, requestId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Request not found or not authorized" });
    }

    res
      .status(200)
      .json({ message: "Request rejected", request: result.rows[0] });
  } catch (error) {
    console.error("Error rejecting request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  createrequestDonation,
  ngototalrequested,
  donarreceviedrequest,
  approveRequest,
  rejectRequest,
};
