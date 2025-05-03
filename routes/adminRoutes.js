const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  assignDriverAndAssistant,
  assignHelperToHelperService,
  assignHelperToSpecialService,
  assignAgentToPropertyBooking,
} = require("../controllers/admin/adminController");

router.post("/signup", signup);
router.post("/login", login);
router.put("/assign-driver-assistant/:id", assignDriverAndAssistant);
router.put("/assign-realstate-assistant/:id", assignAgentToPropertyBooking);
router.put("/assign-helper-to-helper-service", assignHelperToHelperService);
router.put("/assign-helper-to-special-request", assignHelperToSpecialService);

module.exports = router;
