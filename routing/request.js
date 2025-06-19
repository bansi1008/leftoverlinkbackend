const express = require("express");
const authenticate = require("../Middleware/middleware");
const authorize = require("../Middleware/authorize");
const router = express.Router();

const {
  createrequestDonation,
  ngototalrequested,
  donarreceviedrequest,
  approveRequest,
  rejectRequest,
  ngoclaimedrequests,
  cancelrequest,
} = require("../controller/requestdonation");

router.post(
  "/:id/requestdonation",
  authenticate,
  authorize("ngo"),
  createrequestDonation
);

router.get(
  "/ngototalrequested",
  authenticate,
  authorize("ngo"),
  ngototalrequested
);

router.get(
  "/donarreceviedrequest",
  authenticate,
  authorize("donor"),
  donarreceviedrequest
);

router.patch(
  "/:id/approverequest",
  authenticate,
  authorize("donor"),
  approveRequest
);

router.patch(
  "/:id/rejectrequest",
  authenticate,
  authorize("donor"),
  rejectRequest
);
router.get(
  "/ngoclaimedrequests",
  authenticate,
  authorize("ngo"),
  ngoclaimedrequests
);
router.patch(
  "/:id/cancelrequest",
  authenticate,
  authorize("ngo"),
  cancelrequest
);

module.exports = router;
