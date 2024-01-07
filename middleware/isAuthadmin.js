// Middleware to check admin access
const isAdmin = (req, res, next) => {
    if (req.session.loggedIn && req.session.admin) {
      next();
    } else {
        res.redirect('/users/login');
    }
  };

  module.exports = isAdmin