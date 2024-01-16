var express = require('express');
var router = express.Router();
const isAuth=require('../middleware/isAuth')
const back=require('../middleware/back')
const {
  signUpUser,signInUser,edituser,edituserpost,orders,paymentverify,homepage,login,forgotpassword,
  deletecart,quantityadd,quantityminus,search,placeorder,password,subscribe,invoice,sendotp,stripe,
  user_registration,cart,cartid,checkout,sucess,moredetails,logout,changepassword,resetpassword,
  timeexeed,validateotp,shop,shop2,shop3,cat_fasion,cat_jwellery,cat_electronics,cat_others,stripepage,
} = require('../controller/usercontroller')

// *************************** USERS MANAGE *************************
router.get('/home',isAuth,homepage)
router.get('/login',back,login)
router.get('/user_registration',user_registration)
router.post('/user_signin',signInUser)
router.post('/user_registration',signUpUser)
router.post('/validate-otp',validateotp)
router.get('/timeexceed/:id',timeexeed)
router.get('/profile',isAuth,edituser)
router.post('/edit/:id',isAuth,edituserpost)
router.get('/changepassword',isAuth,changepassword)
router.post('/password',isAuth,password)
router.get('/forgotpassword',forgotpassword)
router.post('/send-otp',sendotp)
router.post('/reset-password',resetpassword)

// *************************** CART ********************************
router.get('/cart',isAuth,cart)
router.get('/cart/:id',isAuth,cartid)
router.get('/cart/delete/:id',isAuth,deletecart)
router.get('/cart/quantityadd/:id',isAuth,quantityadd)
router.get('/cart/quantityminus/:id',isAuth,quantityminus)
router.get('/checkout',isAuth,checkout)
router.post('/placeorder',isAuth,placeorder);
router.post('/stripe',stripe);
router.get('/stripepage',stripepage);
router.post('/verifypayment',isAuth,paymentverify)
router.get('/logout',isAuth,logout)
router.get('/orders',isAuth,orders)
router.get('/pdfController/:id',isAuth,invoice)

router.get('/sucess/:id',sucess)
router.get('/moredetails/:id',moredetails)
router.post('/subscribe',subscribe)//last subscribe
router.get('/products/search',search)//Products Search

//show all products with pagination
router.get('/shop/:page',shop)
router.get('/shop2',shop2)
router.get('/shop3',shop3)

//categorized Products APIs
router.get('/products-cat-fasion',cat_fasion)
router.get('/products-cat-electronics',cat_electronics)
router.get('/products-cat-jwellery',cat_jwellery)
router.get('/products-cat-other',cat_others)

// router.get('/payment',isAuth,payment)

module.exports = router;
