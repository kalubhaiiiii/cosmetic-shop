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
    id: req.body.id,  // naya add kiya
    name: req.body.name,
    price: req.body.price,
    image: req.body.image
  };
  if(!req.session.cart) req.session.cart = [];
  req.session.cart.push(product);
  res.redirect("/cart");
});

// Bangles Page - DB se data
app.get("/bangles", async (req, res) => {
    try {
        const products = await Product.find({ category: "Bangles" });
        res.render("products", {title: "Bangles Collection", products, cart: req.session.cart || []});
    } catch (err) {
        res.send(err.message);
    }
});

// Cosmetics Page - DB se data
app.get("/cosmetics", async (req, res) => {
    try {
        const products = await Product.find({ category: "Cosmetics" });
        res.render("products", {title: "Cosmetics Collection", products, cart: req.session.cart || []});
    } catch (err) {
        res.send(err.message);
    }
});

// About Page
app.get("/about", (req, res) => {
    res.render("about", {cart: req.session.cart || []});
});

// Contact Page
app.get("/contact", (req, res) => {
    res.render("contact", {cart: req.session.cart || []});
});

// Product Details Page
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render("product-details", {product, cart: req.session.cart || []});
  } catch (err) {
    res.send("Product not found");
  }
});

// Cart se item remove / qty update
app.post("/update-cart", (req, res) => {
  const {name, action} = req.body;
  let cart = req.session.cart || [];
  
  if(action === "remove"){
    cart = cart.filter(item => item.name !== name);
  }
  req.session.cart = cart;
  res.redirect("/cart");
});

// Category wise products page
app.get("/products", async (req, res) => {
  try {
    const category = req.query.category; // URL se Bangles ya Cosmetics lega
    const products = await Product.find({ category: category });
    
    res.render("products", { 
      products: products,
      title: category + " Products"  // ye products.ejs ko chahiye
    });
  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});