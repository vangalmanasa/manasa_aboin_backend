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
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Fields expected from the frontend
const fileUploadFields = upload.fields([
  { name: "document_image", maxCount: 1 },
  { name: "proof_file_image", maxCount: 1 },
  { name: "images", maxCount: 1 },
]);

// Create
router.post(
  "/property-care-booking",
  fileUploadFields,
  createPropertyCareBookingWithServiceRequest
);

// Read
router.get("/property-care-booking/:id", getPropertyCareBookingById);
router.get(
  "/get-property-care-booking-by-userid/:id",
  getPropertyCareBookingByUserId
);

// Update
router.put(
  "/property-care-booking/:id",
  fileUploadFields,
  updatePropertyCareBooking
);

// Delete
router.delete("/property-care-booking/:id", deletePropertyCareBooking);

module.exports = router;
