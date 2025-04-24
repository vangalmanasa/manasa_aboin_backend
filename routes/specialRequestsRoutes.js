const express = require("express");

const {
  createSpecialRequestsServiceBookingWithRequest,
} = require("../controllers/special_request_service/special_requestsController");

const router = express.Router();

router.post(
  "/create-special-request-service",
  createSpecialRequestsServiceBookingWithRequest
);

module.exports = router;
