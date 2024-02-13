//Authendication purpose
const fisAuth = (req, res, next) => {
    if (req.session.loggedIn) {
      next();
    } else {
        res.status(401).json({ error: "Unauthorized", message: "User not logged in" });
    }
  };

  module.exports = fisAuth