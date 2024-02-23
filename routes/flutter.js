var express = require('express');
var router = express.Router();
const verifyToken=require('../middleware/jwtauth')
const {
    fsignInUser,fhomepage,fsignUpUser,fvalidateotp,
} = require('../controller/fusercontroller')

//   //*****************************FLUTTER APIS************************ */
router.post('/fuser_registration',fsignUpUser)
router.post('/validate-otp',fvalidateotp)
router.post('/fuser_signin',fsignInUser)
router.get('/fhome',verifyToken,fhomepage)


module.exports = router;
