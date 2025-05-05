const express = require("express");
const multer = require("multer");
const upload = multer();
const {
  verifyUser,
  saveUserDetails,
  checkUserDetails,
  getAllUsers,
  getUserProfile,
  checkParentPhoneNumber,
} = require("../controllers/user/userControllers");

const router = express.Router();

router.post("/verify", verifyUser);
router.post("/check-if-parent-number", checkParentPhoneNumber);
router.post("/details", upload.single("user_image"), saveUserDetails);
router.post("/check-details", checkUserDetails);
router.post("/get-profile", getUserProfile);
router.get("/all", getAllUsers);

module.exports = router;
