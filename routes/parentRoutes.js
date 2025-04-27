const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});
const {
  createFamilyMember,
  getParentsByUser,
  deleteParent,
  getAllParents,
  updateParent,
} = require("../controllers/parent/parentController");

router.post("/add-parent", upload.single("image"), createFamilyMember);
router.post("/get-parents", getParentsByUser);
router.delete("/delete-parent/:parent_id", deleteParent);

router.put("/update-parent/:parent_id", upload.single("image"), updateParent);
router.get("/all-parents", getAllParents);

module.exports = router;
