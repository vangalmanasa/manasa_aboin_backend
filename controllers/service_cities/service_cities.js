// routes/cities.js
const express = require("express");
const router = express.Router();

router.get("/service-cities", (req, res) => {
  const cities = ["Hyderabad", "Mumbai", "Delhi", "Bangalore", "Chennai"];
  res.json({ cities });
});

module.exports = router;
