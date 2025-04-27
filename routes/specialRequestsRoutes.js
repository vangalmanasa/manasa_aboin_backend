const express = require("express");

const {
  updateSpecialRequestServiceBooking,
  createSpecialRequestsServiceBookingWithRequest,
} = require("../controllers/special_request_service/special_requestsController");

const router = express.Router();

router.post(
  "/create-special-request-service",
  createSpecialRequestsServiceBookingWithRequest
);

router.put(
  "/update-special-request-service/:id",
  updateSpecialRequestServiceBooking
);

module.exports = router;
