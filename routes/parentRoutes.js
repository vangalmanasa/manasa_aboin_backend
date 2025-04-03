const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const {
  createFamilyMember,
  getParentsByUser,
} = require("../controllers/parent/parentController");

router.post("/add-parent", upload.single("image"), createFamilyMember);
router.post("/get-parents", getParentsByUser);

module.exports = router;
