const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");


// ================= HOME =================

router.get("/", async (req,res)=>{

    try{

        const products = await Product.find({
            featured:true
        });


        res.render("index",{
            products,
            cart:req.session.cart || []
        });


    }catch(err){

        res.send(err.message);

    }

});


// ================= ALL PRODUCTS =================

router.get("/products", async(req,res)=>{

    try{

        const category = req.query.category;

        let products;


        if(category){

            products = await Product.find({
                category
            });

        }
        else{

            products = await Product.find();

        }



        res.render("products",{

            title: category ? `${category} Collection` : "All Products",

            products,

            cart:req.session.cart || [],

            category:category || "All"

        });


    }catch(err){

        res.send(err.message);

    }

});


// ================= PRODUCT DETAILS =================

router.get("/product/:id", async(req,res)=>{

    try{

        const product = await Product.findById(req.params.id);


        if(!product){

            return res.send("Product Not Found");

        }


        res.render("product-details",{

            product,

            cart:req.session.cart || []

        });


    }catch(err){

        res.send(err.message);

    }

});


// ================= CHECKOUT =================

router.get("/checkout/:id", async(req,res)=>{

    try{

        const product = await Product.findById(req.params.id);


        res.render("checkout",{

            title:"Checkout",

            product,

            cart:req.session.cart || []

        });


    }catch(err){

        res.send("Product Not Found");

    }

});


// ================= CART PAGE =================

router.get("/cart",(req,res)=>{


    const cart = req.session.cart || [];


    const total = cart.reduce((sum,item)=>{

        return sum + (item.price * item.qty);

    },0);



    res.render("cart",{

        cart,

        total

    });


});


// ================= ADD TO CART =================

router.post("/add-to-cart",(req,res)=>{


    const {id,name,price,image}=req.body;



    if(!req.session.cart){

        req.session.cart=[];

    }



    const existing = req.session.cart.find(
        item=>item.id===id
    );



    if(existing){

        existing.qty++;

    }
    else{

        req.session.cart.push({

            id,

            name,

            price:Number(price),

            image,

            qty:1

        });

    }


    res.redirect("/cart");


});


// ================= UPDATE CART =================

router.post("/cart/update",(req,res)=>{


    const {id,action}=req.body;


    const item=req.session.cart.find(
        p=>p.id===id
    );


    if(item){

        if(action==="increase")
            item.qty++;


        if(action==="decrease" && item.qty>1)
            item.qty--;

    }


    res.redirect("/cart");


});


// ================= REMOVE CART =================

router.post("/cart/remove",(req,res)=>{


    const {id}=req.body;


    req.session.cart=req.session.cart.filter(
        p=>p.id!==id
    );


    res.redirect("/cart");


});



module.exports = router;