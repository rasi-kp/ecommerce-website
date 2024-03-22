var express = require('express');
const multer=require('../config/multer')
var router = express.Router();
const verifyToken=require('../middleware/jwtauth')
const {
    fsignInUser,fhomepage,fsignUpUser,fvalidateotp,edituser,edituserpost,cart,cartid,
    wishlist,wishlists,
} = require('../controller/fusercontroller')

//   //*****************************FLUTTER APIS************************ */
router.post('/fuser_registration',fsignUpUser)
router.post('/validate-otp',fvalidateotp)
router.post('/fuser_signin',fsignInUser)
router.get('/fhome',verifyToken,fhomepage)
router.get('/profile',verifyToken,edituser)
router.post('/edituser',verifyToken,multer.single('image'),edituserpost)

// *************************** CART ********************************
router.get('/cart',verifyToken,cart)
router.get('/cart/:id',verifyToken,cartid)

//*****************************WISHLIST*************************** */
router.get('/wishlist/:id',verifyToken,wishlist)
router.get('/wishlist',verifyToken,wishlists)

module.exports = router;
