const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const {
  createFamilyMember,
  getParentsByUser,
  deleteParent,
  updateParent,
} = require("../controllers/parent/parentController");

router.post("/add-parent", upload.single("image"), createFamilyMember);
router.post("/get-parents", getParentsByUser);
router.delete("/delete-parent/:parent_id", deleteParent);
router.put("/update-parent/:parent_id", upload.single("image"), updateParent);

module.exports = router;
