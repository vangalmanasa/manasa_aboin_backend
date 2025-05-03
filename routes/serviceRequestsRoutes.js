const express = require("express");
const {
  getAllServiceRequests,
  getAllPropertyCareServiceRequests,
  getAllhelperServiceRequests,
  getAllSpecialRequestServiceRequests,
  deleteServiceRequest,
  getAllCombinedServiceRequests,
  getAllHospitalServiceRequestsForAllUsers,
  getAllPropertyCareServiceRequestsForAllUsers,
  getAllHelperServiceRequestsForAllUsers,
  getAllSpecialRequestServiceRequestsForAllUsers,
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

router.get(
  "/get-all-service-requests-for-helper-service",
  getAllHelperServiceRequestsForAllUsers
);

router.get(
  "/get-all-service-requests-for-special-requests-service",
  getAllSpecialRequestServiceRequestsForAllUsers
);

router.get(
  "/all-requests-for-property-service",
  getAllPropertyCareServiceRequestsForAllUsers
);

router.get("/all-service-requests", getAllCombinedServiceRequests);

router.delete("/service-requests/:requestId", deleteServiceRequest);

module.exports = router;
