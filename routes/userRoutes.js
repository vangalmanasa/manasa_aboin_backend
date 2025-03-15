const express = require("express");
const { verifyUser, saveUserDetails } = require("../controllers/user/userControllers");

const router = express.Router();

// Verify OTP and Store User
router.post("/verify", verifyUser);

// Store Additional User Details
router.post("/details", saveUserDetails);

module.exports = router;
