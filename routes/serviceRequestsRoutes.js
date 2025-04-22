const express = require("express");
const {
  getAllServiceRequests,
  getAllPropertyCareServiceRequests,
  deleteServiceRequest,
} = require("../controllers/service_requests/serviceRequestController");

const router = express.Router();

router.get(
  "/service-requests-for-hospital-service/:userId",
  getAllServiceRequests
);
router.get(
  "/service-requests-for-property-care/:userId",
  getAllPropertyCareServiceRequests
);

router.delete("/service-requests/:requestId", deleteServiceRequest);

module.exports = router;
