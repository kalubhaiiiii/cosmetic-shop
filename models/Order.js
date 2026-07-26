const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    productName: {
        type: String
    },

    image: {
        type: String
    },

    price: {
        type: Number
    },

    customerName: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    pincode: {
        type: String,
        required: true
    },

    paymentMethod: {
        type: String,
        default: "COD"
    },

    paymentStatus: {
        type: String,
        default: "Pending"
    },

    orderStatus: {
        type: String,
        default: "Order Placed"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Order", orderSchema);