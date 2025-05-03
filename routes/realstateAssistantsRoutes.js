const express = require("express");
const multer = require("multer");
const upload = multer();

const {
  createRealEstateAgent,
  getRealEstateAgentById,
  updateRealEstateAgent,
  deleteRealEstateAgent,
  getAllRealEstateAgents,
} = require("../controllers/realestate_assistant/realstateAssistantController");

const router = express.Router();

router.post(
  "/real-estate-agent",
  upload.single("image"),
  createRealEstateAgent
);

router.get("/get-real-estate-agent/:id", getRealEstateAgentById);

router.get("/get-all-real-estate-agent", getAllRealEstateAgents);
router.put(
  "/real-estate-agent/:id",
  upload.single("image"),
  updateRealEstateAgent
);
router.delete("/real-estate-agent/:id", deleteRealEstateAgent);

module.exports = router;
