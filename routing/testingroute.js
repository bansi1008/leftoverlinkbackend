const express = require("express");
const authenticate = require("../Middleware/middleware");
const authorize = require("../Middleware/authorize");
const router = express.Router();

router.get("/both", authenticate, (req, res) => {
  res.json({ message: "Authentication successful", user: req.user });
});

router.get("/donor", authenticate, authorize("donor"), (req, res) => {
  res.json({ message: "Welcome donor!", user: req.user });
});
router.get("/ngo", authenticate, authorize("ngo"), (req, res) => {
  res.json({ message: "Welcome User!", user: req.user });
});

module.exports = router;
