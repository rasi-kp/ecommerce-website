const jwt = require('jsonwebtoken');

const verifyToken =async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(400).json({ error: 'Unauthorized: Token not provided' });
    }
    else{
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_KEY_SECRET, (err, user) => {
            if (err) {
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }
            req.user = user;
            next();
        });
    }
  };
  module.exports=verifyToken;