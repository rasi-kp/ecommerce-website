var express = require('express');
var router = express.Router();
const home=require('../homepage/home')
const googleauth=require('../config/googleauthendication')

router.get('/',home.main)  // GET home page.

router.get('/auth/google', googleauth.google) //google Authendication

router.get('/auth/google/callback', googleauth.googlecallback) //callback authendication


module.exports = router;
