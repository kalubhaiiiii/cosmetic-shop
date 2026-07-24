const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const session = require("express-session");

const app = express();
const PORT = 3000;

// DB Connect
mongoose.connect("mongodb://127.0.0.1:27017/cosmeticshop")
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.log("DB Error:", err));

// View Engine + Static Files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Session + Form data ke liye
app.use(session({secret: 'secretkey', resave: false, saveUninitialized: true}));
app.use(express.urlencoded({extended: true}));

// Home Route
app.get("/", async (req, res) => {
    try {

        const products = await Product.find({ featured: true });

        console.log("Products Found:", products);

        res.render("index", {
            products,
            cart: req.session.cart || []
        });

    } catch (err) {
        console.log("ERROR:", err);
        res.send(err.message);
    }
});

// Cart Page Route
app.get("/cart", (req, res) => {
  res.render("cart", {cart: req.session.cart || []});
});

// Add to Cart Route
app.post("/add-to-cart", (req, res) => {
  const product = {
    name: req.body.name,
    price: req.body.price,
    image: req.body.image
  };
  if(!req.session.cart) req.session.cart = [];
  req.session.cart.push(product);
  res.redirect("/cart");
});

// Bangles Page
app.get("/bangles", (req, res) => {
    const bangles = [
        {name: "Designer Bangles", price: 299, image: "/images/product1.jpg"},
        {name: "Glass Bangles", price: 199, image: "/images/product1.jpg"},
        {name: "Kundan Bangles", price: 499, image: "/images/product1.jpg"}
    ];
    res.render("products", {title: "Bangles Collection", products: bangles, cart: req.session.cart || []});
});

// Cosmetics Page
app.get("/cosmetics", (req, res) => {
    const cosmetics = [
        {name: "Matte Lipstick", price: 499, image: "/images/product2.jpg"},
        {name: "Luxury Perfume", price: 899, image: "/images/product3.jpg"},
        {name: "Foundation", price: 699, image: "/images/product2.jpg"}
    ];
    res.render("products", {title: "Cosmetics Collection", products: cosmetics, cart: req.session.cart || []});
});

// About Page
app.get("/about", (req, res) => {
    res.render("about", {cart: req.session.cart || []});
});

// Contact Page
app.get("/contact", (req, res) => {
    res.render("contact", {cart: req.session.cart || []});
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});