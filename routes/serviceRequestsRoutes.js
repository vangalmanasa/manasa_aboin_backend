const express = require("express");
const {
  getAllServiceRequests,
  getAllPropertyCareServiceRequests,
  getAllhelperServiceRequests,
  getAllSpecialRequestServiceRequests,
  deleteServiceRequest,
  getAllCombinedServiceRequests,
  getAllHospitalServiceRequestsForAllUsers,
} = require("../controllers/service_requests/serviceRequestController");

const router = express.Router();

router.get(
  "/service-requests-for-hospital-service/:userId",
  getAllServiceRequests
);

router.get(
  "/all-service-requests-for-hospital-service",
  getAllHospitalServiceRequestsForAllUsers
);

router.get(
  "/service-requests-for-property-care/:userId",
  getAllPropertyCareServiceRequests
);

router.get(
  "/service-requests-for-helper-service/:userId",
  getAllhelperServiceRequests
);

router.get(
  "/service-requests-for-special-requests-service/:userId",
  getAllSpecialRequestServiceRequests
);

router.get("/all-service-requests", getAllCombinedServiceRequests);

router.delete("/service-requests/:requestId", deleteServiceRequest);

module.exports = router;
