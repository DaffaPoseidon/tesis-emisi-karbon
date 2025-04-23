const mongoose = require("../configuration/dbConfig"); // Mengimpor modul Mongoose untuk menghubungkan Node.js ke MongoDB

const userSchema = new mongoose.Schema({ // Mendefinisikan skema (struktur) untuk koleksi "User"
    firstName: String, // Mendefinisikan field "firstName" dengan tipe data String
    lastName: String, // Mendefinisikan field "lastName" dengan tipe data String
    email: {type: String, unique: true}, // Mendefinisikan field "email" dengan tipe data String, yang harus unik
    password: String, // Mendefinisikan field "password" dengan tipe data String
    role: {type: String, enum: ["superadmin", "admin"], default: "guest"}, // Mendefinisikan field "role" dengan nilai terbatas pada "superadmin", "admin", atau "guest" dan nilai default "guest"
    cases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Case" }] // Menyimpan banyak kasus yang dimiliki user
});


module.exports = mongoose.model("User", userSchema); // Membuat dan mengekspor model "User" berdasarkan skema userSchema
