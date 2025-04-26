const express = require("express");
const {
  createHelper,
  getHelperById,
  updateHelper,
  deleteHelper,
} = require("../controllers/helper/helperController");

const router = express.Router();

router.post("/helper", createHelper);
router.get("/helper/:id", getHelperById);
router.put("/helper/:id", updateHelper);
router.delete("/helper/:id", deleteHelper);

module.exports = router;
