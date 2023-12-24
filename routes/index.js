var express = require('express');
var router = express.Router();
const user = require('../helpers/userhelper')
const home=require('../homepage/home')
require('dotenv').config();

const { OAuth2Client } = require('google-auth-library');
const session = require('express-session');

const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);
/* GET home page. */
router.get('/',async function(req, res, next) {
  const categorizedProducts=await home.mainpage(req,res)
  if (!req.session.user) {
  res.render('users/index', { categorizedProducts});
  } else{
    res.redirect('/users/home')
  }
});
router.get('/auth/google', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/plus.me', 'profile', 'email'],
  });
  // console.log("auth url     :"+ authUrl);
 res.redirect(authUrl);
});

router.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;

  // console.log("code   :" + code);

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
 
  // console.log("tokens     :"+ tokens);
  const ticket = await oAuth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.CLIENT_ID,
  });

  const payload = ticket.getPayload();
  // console.log(payload);

  const datas={
    login:"google",
    email : payload.email,
    username : payload.email,
    name : payload.given_name,
    image : payload.picture,
  }
  // console.log(datas);
  const userexist=await user.findexistuser(datas.username)
  if(!userexist){
    const result = await user.insert(datas)
  }
  req.session.user=datas
  req.session.loggedIn = true;

  console.log('Google authentication successful!');
  res.redirect('/users/home')
});


module.exports = router;
