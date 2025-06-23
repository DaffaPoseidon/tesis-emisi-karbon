const express = require("express"); 
const mongoose = require("mongoose");
const signupValidator = require("./routes/SignupValidatorRoutes");
const signupUser = require("./routes/SignupUserRoutes");
const loginRoute = require("./routes/Login");
const authenticatedRoute = require("./routes/Authenticated");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createSuperAdminAccount } = require("./scripts/setup");
const caseRoutes = require("./routes/CaseRoutes");
const app = express();
const PORT = process.env.PORT; 
const MONGO_URL = process.env.MONGO_URL || "mongodb://192.168.1.3:27017/jwt_db";
require("dotenv").config();

app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json({ limit: "50mb" })); 
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); 

app.use("/validator", signupValidator);
app.use("/user", signupUser);
app.use("/auth", loginRoute);
app.use("/api", authenticatedRoute);
app.use("/api/cases", caseRoutes);

// KHUSUS BLOCKCHAIN
// 
// 
const { ethers } = require("ethers");

if (!process.env.BESU_RPC_URL) {
  throw new Error("Api Url is not defined in the environment variables.");
}
if (!process.env.PRIVATE_KEY_BLOCKCHAIN) {
  throw new Error("Private key is not defined in the environment variables.");
}
if (!process.env.CONTRACT_ADDRESS_SMARTCONTRACT) {
  throw new Error("Contract address is not defined in the environment variables.");
}

// const apiUrl: string = process.env.API_URL;
// const privateKey: string = process.env.PRIVATE_KEY;
// const contractAddress: string = process.env.CONTRACT_ADDRESS;

const apiUrl = process.BESU_RPC_URL
const privateKey = process.env.PRIVATE_KEY_BLOCKCHAIN;
const contractAddress = process.env.CONTRACT_ADDRESS_SMARTCONTRACT;

// 
// 
// KHUSUS BLOCKCHAIN

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected");

    createSuperAdminAccount();

    app.listen(PORT, () => {
      // console.log(`Server is running on: http://192.168.1.3:${PORT}`);
      console.log(`Server is running on: localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));