
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
handlebars.registerHelper('isInWishlist', function(productId, wishlist) {
  return wishlist.some(item => item._id == productId);
});

