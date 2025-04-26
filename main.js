const express = require("express");
const cors = require("cors");

require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const citiesRoutes = require("./routes/serviceCitiesRoutes");
const parentRoutes = require("./routes/parentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const hospitalServiceRoutes = require("./routes/hospitalServiceRoutes");
const specialRequestsServiceRoutes = require("./routes/specialRequestsRoutes");

const serviceRequestRoutes = require("./routes/serviceRequestsRoutes");
const propertyCareRoutes = require("./routes/propertyCareRoutes");
const helperServiceRoutes = require("./routes/helperServiceRoutes");
const helperRoutes = require("./routes/helperRoutes");
const driverRoutes = require("./routes/driverRoutes");
const personalAssistantRoutes = require("./routes/personalAssistantsRoutes");
const realestateAssistantRoutes = require("./routes/realstateAssistantsRoutes");

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/api", citiesRoutes);
app.use("/parent", parentRoutes);
app.use("/hospital_service", hospitalServiceRoutes);
app.use("/property_care", propertyCareRoutes);
app.use("/helper-service", helperServiceRoutes);
app.use("/service", serviceRequestRoutes);
app.use("/special-request-service", specialRequestsServiceRoutes);
app.use("/driver", driverRoutes);
app.use("/helper", helperRoutes);
app.use("/personal-assistant", personalAssistantRoutes);
app.use("/realstate-assistant", realestateAssistantRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
