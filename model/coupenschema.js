const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    // cart: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'carts',
    // },
    code: {
        type: String,
        unique: true,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    minPriceRange: {
        type: Number,
        required: true
    },
    maxPriceRange: {
        type: Number,
        required: true
    }
});

// Create and export the Coupon model
const coupon = mongoose.model('Coupon', couponSchema);
module.exports = coupon;
