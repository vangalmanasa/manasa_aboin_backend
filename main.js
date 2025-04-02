const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const citiesRoutes = require("./routes/serviceCitiesRoutes");

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/user", userRoutes);
app.use("/api", citiesRoutes);

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
