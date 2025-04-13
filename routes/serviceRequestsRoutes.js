const express = require("express");
const {
  getAllServiceRequests,
  deleteServiceRequest,
} = require("../controllers/service_requests/serviceRequestController");

const router = express.Router();

router.get("/service-requests/:userId", getAllServiceRequests);

router.delete("/service-requests/:requestId", deleteServiceRequest);

module.exports = router;
