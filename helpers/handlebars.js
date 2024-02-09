
const handlebars = require('handlebars');
const moment = require('moment');

handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('formatDate', function (date) {
  return moment(date).format('DD MMM YYYY');
});
handlebars.registerHelper('lte', function(a, b) {
  return a <= b;
});
handlebars.registerHelper('isEqual', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper('eq', function (a, b, options) {
  if (a === b) {
      return options.fn(this);
  } else {
      return options.inverse(this);
  }
});
// handlebars.registerHelper('isInWishlist', function(productId, wishlist) {
//   console.log("Wishlist:", wishlist);
//   console.log("productID:", productId);

//   // Check if the productId exists in the wishlist array
//   return wishlist.some(item => item._id == productId);
// });
handlebars.registerHelper('isInWishlist', function(productId, wishlist) {
  console.log("productID:", productId);
  console.log("Wishlist:", wishlist);
  if (wishlist && Array.isArray(wishlist)) {
      return wishlist.some(item => item.product && item.product._id === productId);
  } else {
      console.error("Wishlist or productId is undefined or not an array");
      return false;
  }
});
