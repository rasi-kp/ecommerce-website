var express = require('express');
var router = express.Router();
const home=require('../homepage/home')
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);
/* GET home page. */
router.get('/',async function(req, res, next) {
  const categorizedProducts=await home.mainpage(req,res)
  res.render('users/index', { categorizedProducts });
});
router.get('/auth/google', (req, res) => {
  console.log("auth");
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/plus.me'],
  });
  console.log("auth url     :"+ authUrl);
 res.redirect(authUrl);
});

// router.get('/auth/google/callback', async (req, res) => {
//   const code = req.query.code;

//   console.log("code   :" + code);

//   const { tokens } = await oAuth2Client.getToken(code);
//   oAuth2Client.setCredentials(tokens);
 
//   console.log("tokens     :"+ tokens);
//   const ticket = await oAuth2Client.verifyIdToken({
//     idToken: tokens.id_token,
//     audience: process.env.CLIENT_ID,
//   });
//   console.log(ticket);

//   const payload = ticket.getPayload();
//   const { sub, name } = payload;

//   console.log("payload"  + payload);
//   console.log("name  "  +   name);
//   console.log("sub   "  +  sub);

//   // let user = await User.findOne({ googleId: sub });

//   // if (!user) {
//   //   user = new User({
//   //     googleId: sub,
//   //     displayName: name,
//   //     // Add other fields you want to store
//   //   });
//   //   await user.save();
//   // }

//   // req.session.user = user._id; // Store user ID in the session for future requests
//   res.redirect('/users/home');
// });


module.exports = router;
