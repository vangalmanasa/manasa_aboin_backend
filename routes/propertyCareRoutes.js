const express = require("express");
const multer = require("multer");
const {
  createPropertyCareBookingWithServiceRequest,
  getPropertyCareBookingById,
  getPropertyCareBookingByUserId,
  updatePropertyCareBooking,
  deletePropertyCareBooking,
} = require("../controllers/property_care/property_care_booking");

const router = express.Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

router.post(
  "/property-care-booking",
  upload.array("proofFile"), // Assuming proofFile is uploaded as an array (you can adjust according to your use case)
  createPropertyCareBookingWithServiceRequest
);

router.get("/property-care-booking/:id", getPropertyCareBookingById);

router.get(
  "/get-property-care-booking-by-userid/:id",
  getPropertyCareBookingByUserId
);

router.put(
  "/property-care-booking/:id",
  upload.array("proofFile"), // If you're updating proof files, else remove
  updatePropertyCareBooking
);

router.delete("/property-care-booking/:id", deletePropertyCareBooking);

module.exports = router;
