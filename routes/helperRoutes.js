const express = require("express");
const {
  createHelper,
  getHelperById,
  updateHelper,
  deleteHelper,
  getFreeHelpers,
} = require("../controllers/helper/helperController");

const router = express.Router();

router.post("/helper", createHelper);
router.get("/get-helper-by-id/:id", getHelperById);
router.get("/get-all-helper", getFreeHelpers);
router.put("/helper/:id", updateHelper);
router.delete("/helper/:id", deleteHelper);

module.exports = router;
