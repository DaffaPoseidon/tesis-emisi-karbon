const mongoose = require("mongoose"); // Mengimpor modul Mongoose untuk menghubungkan Node.js ke MongoDB

require('dotenv').config()

// mongoose.connect(process.env.DB_URL, {
mongoose.connect("mongodb://127.0.0.1:27017/jwt_db", {
// mongoose.connect("mongodb://192.168.1.3:27017/jwt_db", {
    serverSelectionTimeoutMS: 5000 // Menghubungkan ke MongoDB pada database "node_db" dengan batas waktu koneksi 5 detik
});

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB"); // Menampilkan pesan ketika berhasil terhubung ke MongoDB
});

mongoose.connection.on("error", (error) => {
    console.log("MongoDB connection error: ", error); // Menampilkan pesan error jika terjadi masalah saat menghubungkan ke MongoDB
});

module.exports = mongoose