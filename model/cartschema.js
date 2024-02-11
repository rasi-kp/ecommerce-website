const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large']
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  },
  coupencode: {
    type: String,
    default: null
  },
  discount: {
    type: Number,
    default: null
  },
  discountprice: {
    type: Number,
    default: null
  }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
