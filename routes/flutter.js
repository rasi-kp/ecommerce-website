var express = require('express');
const multer=require('../config/multer')
var router = express.Router();
const verifyToken=require('../middleware/jwtauth')
const {
    fsignInUser,fhomepage,fsignUpUser,fvalidateotp,edituser,edituserpost,cart,cartid,search,shop,orders,
    wishlist,wishlists,banner,deletecart,quantityadd,quantityminus,checkout,placeorder,paymentverify,invoice,
} = require('../controller/fusercontroller');
const { allproducts } = require('../helpers/producthelper');

//   //*****************************FLUTTER APIS************************ */
router.post('/fuser_registration',fsignUpUser)
router.post('/validate-otp',fvalidateotp)
router.post('/fuser_signin',fsignInUser)
router.get('/fhome',verifyToken,fhomepage)
router.get('/banner',verifyToken,banner)
router.get('/profile',verifyToken,edituser)
router.post('/edituser',verifyToken,multer.single('image'),edituserpost)

// *************************** CART ********************************
router.get('/cart',verifyToken,cart)
router.get('/cart/:id',verifyToken,cartid)
router.get('/cart/delete/:id',verifyToken,deletecart)
router.get('/cart/quantityadd/:id',verifyToken,quantityadd)
router.get('/cart/quantityminus/:id',verifyToken,quantityminus)

//*****************************WISHLIST*************************** */
router.get('/wishlist/:id',verifyToken,wishlist)
router.get('/wishlist',verifyToken,wishlists)

//*****************************Checkout*************************** */
router.get('/checkout',verifyToken,checkout)
router.post('/placeorder',verifyToken,placeorder);
router.post('/verifypayment',verifyToken,paymentverify)

//*****************************Search******************************* */
router.get('/products/search',verifyToken,search)

router.get('/allproducts/:page',verifyToken,shop) //pagination

router.get('/orders',verifyToken,orders)
router.get('/pdfController/:id',verifyToken,invoice)



module.exports = router;
