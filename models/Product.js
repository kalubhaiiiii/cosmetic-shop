const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // Bangles, Cosmetics
  image: { type: String, required: true }, // /images/lipstick.jpg
  description: { type: String },
  featured: { type: Boolean, default: false } // home pe dikhane ke liye
});

module.exports = mongoose.model("Product", productSchema);