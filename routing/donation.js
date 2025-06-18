const express = require("express");
const authenticate = require("../Middleware/middleware");
const authorize = require("../Middleware/authorize");
const {
  createDonation,
  getDonations,
  myDonations,
  deleteDonation,
  editDonation,
  getSingleDonation,
} = require("../controller/donation");

const router = express.Router();

router.post("/donation", authenticate, authorize("donor"), createDonation);
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

module.exports = router;
