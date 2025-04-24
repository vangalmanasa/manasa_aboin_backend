const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const citiesRoutes = require("./routes/serviceCitiesRoutes");
const parentRoutes = require("./routes/parentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const hospitalServiceRoutes = require("./routes/hospitalServiceRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestsRoutes");
const propertyCareRoutes = require("./routes/propertyCareRoutes");
const helperServiceRoutes = require("./routes/helperServiceRoutes");
const specialRequestsServiceRoutes = require("./routes/specialRequestsRoutes");
const app = express();

// Middleware setup
app.use(cors());

// Increase the size limit for JSON and URL-encoded requests
app.use(express.json({ limit: "10mb" })); // Increase JSON body limit to 10MB
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Increase URL-encoded body limit to 10MB

// Routes
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/api", citiesRoutes);
app.use("/parent", parentRoutes);
app.use("/hospital_service", hospitalServiceRoutes);
app.use("/property_care", propertyCareRoutes);
app.use("/helper-service", helperServiceRoutes);
app.use("/special-request-service", specialRequestsServiceRoutes);
app.use("/service", serviceRequestRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
