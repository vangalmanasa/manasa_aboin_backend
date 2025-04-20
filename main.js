const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const citiesRoutes = require("./routes/serviceCitiesRoutes");
const parentRoutes = require("./routes/parentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const hospitalServiceRoutes = require("./routes/hospitalServiceRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestsRoutes");
const propertyCareRoutes = require("./routes/propertyCareRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/api", citiesRoutes);
app.use("/parent", parentRoutes);
app.use("/hospital_service", hospitalServiceRoutes);
app.use("/property_care", propertyCareRoutes);
app.use("/service", serviceRequestRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
