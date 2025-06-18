const express = require("express");
const parser = require("../Middleware/imgmiddleware");
const router = express.Router();
const {
  userregestration,
  loginUser,
  logout,
  verifyOtp,
  profileimage,
} = require("../controller/user");
const authenticateUser = require("../Middleware/middleware");

router.post("/register", userregestration);
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/verifyotp", verifyOtp);
router.patch(
  "/profileimage",
  authenticateUser,
  parser.single("image"),
  profileimage
);

router.get("/dashboard", authenticateUser, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}!`, user: req.user });
});

module.exports = router;
