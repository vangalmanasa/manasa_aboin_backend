const express = require("express");
const router = express.Router();

const {
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver,
} = require("../controllers/driver/driverController");

router.post("/", createDriver);

router.get("/:id", getDriverById);

router.put("/:id", updateDriver);

router.delete("/:id", deleteDriver);

module.exports = router;
