const jwt = require('jsonwebtoken');

const verifyToken =async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.json({ error: 'Unauthorized: Token not provided' });
    }
    else{
        jwt.verify(token, 'rasi_secret_key', (err, decoded) => {
            if (err) {
                return res.json({ error: 'Unauthorized: Invalid token' });
            }
            req.user = decoded;
            next();
        });
    }
  };
  module.exports=verifyToken;