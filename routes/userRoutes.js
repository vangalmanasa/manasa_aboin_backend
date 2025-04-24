const express = require("express");
const multer = require("multer");
const upload = multer();
const {
  verifyUser,
  saveUserDetails,
  checkUserDetails,
  getAllUsers,
  getUserProfile,
} = require("../controllers/user/userControllers");

const router = express.Router();

router.post("/verify", verifyUser); // Verify user using idToken + phone number
router.post("/details", upload.single("user_image"), saveUserDetails);
router.post("/check-details", checkUserDetails);
router.post("/get-profile", getUserProfile);
router.get("/all", getAllUsers);

module.exports = router;
