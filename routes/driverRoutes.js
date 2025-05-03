const express = require("express");
const router = express.Router();

const {
  createDriver,
  getDriverById,
  updateDriver,
  getFreeDrivers,
  deleteDriver,
} = require("../controllers/driver/driverController");

router.post("/", createDriver);

router.get("/free-drivers", getFreeDrivers);

router.get("/get-driver-by-id/:id", getDriverById);

router.put("/:id", updateDriver);

router.delete("/:id", deleteDriver);

module.exports = router;
