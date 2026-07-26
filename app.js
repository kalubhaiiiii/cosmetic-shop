const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Admin = require("./models/Admin");
const userRoutes = require("./routes/userRoutes");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ================= DB CONNECT =================
mongoose.connect("mongodb://127.0.0.1:27017/cosmeticshop")
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log("❌ DB Error:", err));

// ================= MIDDLEWARE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true
}));

// ================= MULTER =================

const uploadPath = path.join(__dirname, "public", "uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({
    storage: storage
});

// ================= ADMIN MIDDLEWARE =================

function isAdmin(req, res, next) {

    if (req.session.isAdmin) {
        return next();
    }

    res.redirect("/admin");
}

// ================= HOME =================
app.get("/", async (req, res) => {
    try {
        const products = await Product.find({ featured: true });

        res.render("index", {
            products,
            cart: req.session.cart || []
        });

    } catch (err) {
        res.send(err.message);
    }
});

// ================= CART =================

// Cart Page
app.get("/cart", (req, res) => {

    const cart = req.session.cart || [];

    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.qty);
    }, 0);

    res.render("cart", {
        cart,
        total
    });

});

// Add To Cart
app.post("/add-to-cart", (req, res) => {

    const { id, name, price, image } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const existing = req.session.cart.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        req.session.cart.push({
            id,
            name,
            price: Number(price),
            image,
            qty: 1
        });
    }

    res.redirect("/cart");

});

// Increase / Decrease Qty
app.post("/cart/update", (req, res) => {

    const { id, action } = req.body;

    const item = req.session.cart.find(p => p.id === id);

    if (item) {

        if (action === "increase") item.qty++;

        if (action === "decrease" && item.qty > 1) item.qty--;

    }

    res.redirect("/cart");

});

// Remove Product
app.post("/cart/remove", (req, res) => {

    const { id } = req.body;

    req.session.cart = req.session.cart.filter(p => p.id !== id);

    res.redirect("/cart");

});

// ================= CATEGORY =================

app.get("/bangles", async (req, res) => {

    const products = await Product.find({
        category: "Bangles"
    });

    res.render("products", {
        title: "Bangles Collection",
        products,
        cart: req.session.cart || [],
        category: "Bangles"
    });

});

app.get("/cosmetics", async (req, res) => {

    const products = await Product.find({
        category: "Cosmetics"
    });

    res.render("products", {
        title: "Cosmetics Collection",
        products,
        cart: req.session.cart || [],
        category: "Cosmetics"
    });

});

// ================= ALL PRODUCTS =================

app.get("/products", async (req, res) => {

    try {

        const category = req.query.category;

        let products;

        if (category) {
            products = await Product.find({ category });
        } else {
            products = await Product.find();
        }

        res.render("products", {
            title: category ? `${category} Collection` : "All Products",
            products,
            cart: req.session.cart || [],
            category: category || "All"
        });

    } catch (err) {

        res.send(err.message);

    }

});

// ================= PRODUCT DETAILS =================

app.get("/product/:id", async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).send("Product Not Found");
        }

        res.render("product-details", {
            product,
            cart: req.session.cart || []
        });

    } catch (err) {

        res.send(err.message);

    }

});

// ================= CHECKOUT =================

app.get("/checkout/:id", async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        res.render("checkout", {
            title: "Checkout",
            product,
            cart: req.session.cart || []
        });

    } catch (err) {

        res.send("Product Not Found");

    }

});

// ================= STATIC PAGES =================

app.get("/about", (req, res) => {

    res.render("about", {
        cart: req.session.cart || []
    });

});

app.get("/contact", (req, res) => {

    res.render("contact", {
        cart: req.session.cart || []
    });

});

// ================= ADMIN =================

// Admin Form
app.get("/admin", (req, res) => {
    res.render("login", {
        cart: req.session.cart || []
    });
});

app.post("/admin/login", async (req, res) => {

    const admin = await Admin.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if(admin){

        req.session.isAdmin = true;

        return res.redirect("/admin/dashboard");

    }

    res.send("Invalid Username or Password");

});

// Add Product Page
app.get("/admin/add-product", (req, res) => {

    if (!req.session.isAdmin) {
        return res.redirect("/admin");
    }

    res.render("admin", {
        cart: req.session.cart || []
    });

});

// Dashboard
app.get("/admin/dashboard", isAdmin, async (req, res) => {

    const products = await Product.find();

    res.render("dashboard", {
        products,
        cart: req.session.cart || []
    });

});

// ================= VIEW ORDERS =================

app.get("/admin/orders", isAdmin, async (req, res) => {

    try {

        const orders = await Order.find().sort({ createdAt: -1 });

        res.render("orders", {
            orders,
            cart: req.session.cart || []
        });

    } catch (err) {

        res.send(err.message);

    }

});

// ================= ORDERS =================

app.get("/admin/orders", isAdmin, async (req, res) => {

    const orders = await Order.find()
        .populate("productId")
        .sort({ createdAt: -1 });

    res.render("orders", {
        orders,
        cart: req.session.cart || []
    });

});

// Add Product
app.post("/admin/add-product", upload.single("image"), async (req, res) => {

    try {

        await Product.create({

            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            image: "/uploads/" + req.file.filename,
            description: req.body.description,
            featured: req.body.featured ? true : false

        });

        res.redirect("/admin/dashboard");

    } catch (err) {

        res.send(err.message);

    }

});

// Delete Product
app.post("/admin/delete/:id", isAdmin, async (req, res) => {

    await Product.findByIdAndDelete(req.params.id);

    res.redirect("/admin/dashboard");

});

// Edit Product Page
app.get("/admin/edit/:id", isAdmin, async (req, res) => {

    const product = await Product.findById(req.params.id);

    res.render("edit-product", {
        product,
        cart: req.session.cart || []
    });

});

// Update Product
app.post("/admin/update/:id", isAdmin, upload.single("image"), async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        let imagePath = product.image;

        // Agar nayi image upload hui hai
        if (req.file) {
            imagePath = "/uploads/" + req.file.filename;
        }

        await Product.findByIdAndUpdate(req.params.id, {

            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            image: imagePath,
            description: req.body.description,
            featured: req.body.featured ? true : false

        });

        res.redirect("/admin/dashboard");

    } catch (err) {

        res.send(err.message);

    }

});

// ================= PLACE ORDER =================

app.post("/place-order", async (req, res) => {

    try {

        // Product database se product nikalo
        const product = await Product.findById(req.body.productId);


        if (!product) {
            return res.send("Product Not Found");
        }


        const order = new Order({

            productId: product._id,

            productName: product.name,

            image: product.image,

            price: product.price,


            customerName: req.body.name,

            phone: req.body.phone,

            address: req.body.address,

            city: req.body.city,

            pincode: req.body.pincode,


            paymentMethod: req.body.payment,


            paymentStatus: "Pending",


            orderStatus: "Order Placed"

        });



        await order.save();



     res.render("order-success", {
         order
    });



    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

});

// ================= MY ORDERS =================

app.get("/my-orders", async (req, res) => {

    try {

        const orders = await Order.find()
        .sort({createdAt:-1});


        res.render("my-orders", {
            orders
        });


    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

});

// ================= UPDATE ORDER STATUS =================

app.post("/admin/update-order-status/:id", isAdmin, async (req, res) => {

    console.log("Order ID:", req.params.id);
    console.log("Status:", req.body.status);

    try {

        await Order.findByIdAndUpdate(req.params.id, {
            orderStatus: req.body.status
        });

        console.log("Status Updated Successfully");

        res.redirect("/admin/orders");

    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

});

// ================= LOGOUT =================

app.get("/admin/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/admin");
    });

});

// ================= SERVER =================

app.listen(PORT, () => {

    console.log(`🚀 Server running at http://localhost:${PORT}`);

});