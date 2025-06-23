const express = require("express");
const authenticate = require("../Middleware/middleware");
const authorize = require("../Middleware/authorize");
const donationParser = require("../Middleware/uploadDonationImage");
const {
  createDonation,
  getDonations,
  myDonations,
  deleteDonation,
  editDonation,
  getSingleDonation,
  state,
} = require("../controller/donation");

const router = express.Router();

router.post(
  "/donation",
  authenticate,
  authorize("donor"),
  donationParser.single("image"),
  createDonation
);
router.get("/donation", authenticate, getDonations);
router.get("/mydonation", authenticate, authorize("donor"), myDonations);
router.delete(
  "/donation/:id",
  authenticate,
  authorize("donor"),
  deleteDonation
);
router.patch("/donation/:id", authenticate, authorize("donor"), editDonation);
router.get(
  "/donation/:id",
  authenticate,
  authorize("donor"),
  getSingleDonation
);
router.get("/state", authenticate, authorize("donor"), state);

module.exports = router;
