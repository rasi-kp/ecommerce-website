const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products'
  },
});

const wishlistItem = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  items: [wishlistItemSchema],
});

const wishlist = mongoose.model('Wishlists', wishlistItem);

module.exports = wishlist;
