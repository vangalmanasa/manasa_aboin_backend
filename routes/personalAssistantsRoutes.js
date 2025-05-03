const express = require("express");
const upload = require("../middleware/upload"); // ✅ Add this line

const {
  getPersonalAssistantById,
  updatePersonalAssistant,
  createPersonalAssistant,
  deletePersonalAssistant,
  getFreePersonalAssistants,
} = require("../controllers/personal_assistant/personalAssistantController");

const router = express.Router();

router.post(
  "/personal-assistant",
  upload.single("photo"),
  createPersonalAssistant
);

router.get("/free-personal-assistants", getFreePersonalAssistants);

router.get("/get-personal-assistant-by-id/:id", getPersonalAssistantById);

router.put(
  "/personal-assistant/:id",
  upload.single("photo"),
  updatePersonalAssistant
);

router.delete("/personal-assistant/:id", deletePersonalAssistant);

module.exports = router;
