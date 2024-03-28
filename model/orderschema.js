const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderID: {
        type: String,
        required:true
    },
    orderdate: {
        type: Date,
        default:() => new Date().toLocaleString('en-US', { timeZone: 'UTC' })
    },
    username: {
        type: String,
    },
    name: {
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
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    phoneno: {
        type: String,
    },
    items: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products', // Reference to the Product model
            required: true,
          },
          quantity: {
            type: Number,
          },
          size: {
            type: String,
          },
        },
      ],
    total: {
        type: Number,
        required: true
    },
    totalamount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    paymentID: {
        type: String,
        default: 'null'
    }
});

const order = mongoose.model('orders', orderSchema);

module.exports = order;
