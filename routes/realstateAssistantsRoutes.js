const express = require("express");
const multer = require("multer");
const upload = multer();

const {
  createRealEstateAgent,
  getRealEstateAgentById,
  updateRealEstateAgent,
  deleteRealEstateAgent,
} = require("../controllers/realestate_assistant/realstateAssistantController");

const router = express.Router();

router.post(
  "/real-estate-agent",
  upload.single("image"),
  createRealEstateAgent
);

router.get("/real-estate-agent/:id", getRealEstateAgentById);
router.put(
  "/real-estate-agent/:id",
  upload.single("image"),
  updateRealEstateAgent
);
router.delete("/real-estate-agent/:id", deleteRealEstateAgent);

module.exports = router;
