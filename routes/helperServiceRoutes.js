const express = require("express");
const multer = require("multer");
const {
  createHelperServiceBookingWithRequest,
  //   getHospitalServiceById,
} = require("../controllers/helper_service/helperRequestController");

const router = express.Router();

router.post("/create-helper-service", createHelperServiceBookingWithRequest);

// router.get("/hospital-service/:id", getHospitalServiceById);

// router.put(
//   "/hospital-service/:id",
//   upload.array("images"),
//   updateHospitalService
// );

// router.delete("/hospital-service/:id", deleteHospitalService);

module.exports = router;
