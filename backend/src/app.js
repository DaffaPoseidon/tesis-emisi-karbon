const express = require("express"); // Mengimpor modul Express untuk membuat aplikasi server Node.js
const mongoose = require("mongoose");
const signupValidator = require("./routes/SignupValidatorRoutes");
const signupBuyer = require("./routes/SignupBuyerRoutes");
const signupSeller = require("./routes/SignupSellerRoutes");
const loginRoute = require("./routes/Login");
const authenticatedRoute = require("./routes/Authenticated");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createSuperAdminAccount } = require("./scripts/setup");
require("dotenv").config(); // Load .env file

// Baru
const caseRoutes = require("./routes/CaseRoutes");
//

const app = express(); // Membuat instance aplikasi Express
const PORT = process.env.PORT; // Menentukan port untuk server
const MONGO_URL = process.env.MONGO_URL || "mongodb://192.168.1.3:27017/jwt_db";

app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json({ limit: "50mb" })); // Tingkatkan batas JSON payload
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Tingkatkan batas URL-encoded

app.use("/validator", signupValidator);
app.use("/buyer", signupBuyer);
app.use("/seller", signupSeller);
app.use("/auth", loginRoute);
app.use("/api", authenticatedRoute);

// Daftarkan rute untuk kasus
app.use("/api/cases", caseRoutes);
//

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected");

    // Buat SuperAdmin setelah database terhubung
    createSuperAdminAccount();

    // Start server setelah koneksi berhasil
    app.listen(PORT, () => {
      // console.log(`Server is running on: http://192.168.1.3:${PORT}`);
      console.log(`Server is running on: localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// app.listen(PORT, () => {
//     console.log(`Server is running on: http://192.168.18.56:${PORT}`); // Menjalankan server dan menampilkan URL server ke konsol
// });
