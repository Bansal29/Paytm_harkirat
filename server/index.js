const express = require("express");
const rootRouter = require("./routes/index.js");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// const conn = mongoose.connect("mongodb://localhost:27017/paytm");
const conn = mongoose.connect(process.env.MONGO_URI);
if (conn) {
  console.log("Database connected successfully!");
} else {
  console.log("Database not connected");
}

//getting the port from env file
const port = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", rootRouter);

app.get("/", (req, res) => {
  res.send("Hello from Paytm project backend!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
