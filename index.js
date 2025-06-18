const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const db = require("./db");
require("dotenv").config();
const userRoutes = require("./routing/user");
const testingRoutes = require("./routing/testingroute");

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/v1", userRoutes);
app.use("/api/v1/", testingRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
