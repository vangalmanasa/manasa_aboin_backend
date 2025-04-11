const express = require("express");
const multer = require("multer");
const {
  createHospitalService,
  getHospitalServiceById,
  updateHospitalService,
  deleteHospitalService,
} = require("../controllers/hospital_service/hospital_service_controller");

const router = express.Router();
const upload = multer();

router.post("/hospital-service", upload.array("images"), createHospitalService);

router.get("/hospital-service/:id", getHospitalServiceById);

router.put(
  "/hospital-service/:id",
  upload.array("images"),
  updateHospitalService
);

router.delete("/hospital-service/:id", deleteHospitalService);

module.exports = router;
