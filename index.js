const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const client = require("prom-client");

const db = require("./db");
require("dotenv").config();
const userRoutes = require("./routing/user");
const donation = require("./routing/donation");
const request = require("./routing/request");

const app = express();

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(cookieParser());
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/api/v1", userRoutes);
app.use("/api/v1/", donation);
app.use("/api/v1/", request);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
