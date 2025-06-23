const express = require("express");
const parser = require("../Middleware/imgmiddleware");
const router = express.Router();
const {
  userregestration,
  loginUser,
  logout,
  verifyOtp,
  profileimage,
  profileupdate,
  getUserProfile,
} = require("../controller/user");
const authenticateUser = require("../Middleware/middleware");

router.post("/register", userregestration);

router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/verifyotp", verifyOtp);
router.patch(
  "/profileimage",
  authenticateUser,
  parser.single("profileImage"),
  profileimage
);

router.get("/dashboard", authenticateUser, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}!`, user: req.user });
});
router.get("/profile", authenticateUser, getUserProfile);

router.patch("/profileupdate", authenticateUser, profileupdate);
module.exports = router;
