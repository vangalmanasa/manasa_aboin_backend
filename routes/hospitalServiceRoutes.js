const express = require("express");
const multer = require("multer");
const {
  createHospitalServiceWithServiceRequest,
  getHospitalServiceById,
  updateHospitalService,
  deleteHospitalService,
} = require("../controllers/hospital_service/hospital_service_controller");

const router = express.Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

router.post(
  "/hospital-service",
  upload.array("images"),
  createHospitalServiceWithServiceRequest
);

router.get("/hospital-service/:id", getHospitalServiceById);

router.put(
  "/hospital-service/:id",
  upload.array("images"),
  updateHospitalService
);

router.delete("/hospital-service/:id", deleteHospitalService);

module.exports = router;
