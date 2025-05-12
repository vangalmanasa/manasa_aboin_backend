// routes/cities.js
const express = require("express");
const router = express.Router();

router.get("/service-cities", (req, res) => {
  const cities = ["Hyderabad"];
  res.json({ cities });
});

module.exports = router;
