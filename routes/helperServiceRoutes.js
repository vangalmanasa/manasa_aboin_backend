const express = require("express");
const {
  createHelperServiceBookingWithRequest,
  updateHelperServiceBooking,
} = require("../controllers/helper_service/helperRequestController");

const router = express.Router();

router.post("/create-helper-service", createHelperServiceBookingWithRequest);

router.put("/update-helper-service/:id", updateHelperServiceBooking);

module.exports = router;
