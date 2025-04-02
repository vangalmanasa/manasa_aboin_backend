const express = require("express");
const multer = require("multer");
const upload = multer();
const {
  verifyUser,
  saveUserDetails,
  checkUserDetails,
  getUserProfile,
} = require("../controllers/user/userControllers");

const router = express.Router();

router.post("/verify", verifyUser); // Verify user using idToken + phone number
router.post("/details", upload.single("user_image"), saveUserDetails);
router.post("/check-details", checkUserDetails);
router.post("/get-profile", getUserProfile);

module.exports = router;
