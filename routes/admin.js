var express = require('express');
var router = express.Router();
const multer=require('../config/multer')
const isAuth = require('../middleware/isAuth')
const isAdmin=require('../middleware/isAuthadmin')
const {
  alluser, adduser, deleteuser, edituser, edituserpost, blockuser, unblockuser, addproduct, edit_product,searchuser,
  allproducts, deleteproduct, orders, confirm, shipped, delivered, productdetails, editproduct,totalordercount,
  cancelled,salereport,pdf,gmail,adminlogout,adduserpage,addproductpage,
} = require('../controller/admincontroller')

router.get('/',isAdmin,isAuth, totalordercount)
//********************************  manage Users **************************
router.get('/alluser',isAdmin, isAuth,alluser)
router.get('/adduser',isAdmin, isAuth,adduserpage)
router.post('/adduser',isAdmin,isAuth, adduser)
router.post('/edituser/:id',isAdmin,isAuth, edituserpost)
router.get('/edituser/:id',isAdmin, isAuth,edituser)
router.get('/deleteuser/:id',isAdmin, isAuth,deleteuser);
router.get('/edituserview',isAdmin,isAuth,alluser)
router.get('/blockuser/:id',isAdmin, isAuth,blockuser);
router.get('/unblockuser/:id',isAdmin, isAuth,unblockuser);
router.get('/search',isAdmin,isAuth,searchuser);//search user
router.get('/logout',adminlogout)

//******************************  Product Section  ********************** */
router.get('/products',isAdmin, isAuth,allproducts)
router.get('/products/add_product',isAdmin, isAuth,addproductpage)
router.post('/products/add_product',isAdmin, isAuth,multer.single('image'),addproduct)
router.get('/edit_product/:id',isAdmin, isAuth,editproduct)
router.post('/edit_product/:id',isAdmin, isAuth,multer.single('image'),edit_product)
router.get('/products/editproductview',isAdmin,isAuth,allproducts);
router.get('/products/deleteproduct/:id',isAdmin,isAuth,deleteproduct);

//*********************  Orders  ********************** */
router.get('/orders',isAdmin, isAuth,orders);
router.get('/orders/confirm/:id',isAdmin, isAuth,confirm);
router.get('/orders/shipped/:id',isAdmin,isAuth,shipped);
router.get('/orders/delivered/:id',isAdmin,isAuth,delivered);
router.get('/orders/cancelled/:id',isAuth,cancelled);
router.get('/ordersproduct/:id',isAuth,productdetails)
router.post('/salereport',salereport)
router.get('/pdfgenerator',isAdmin,isAuth,pdf);
router.get('/gmail/:id',gmail);
// Testing route
router.get('/test',async(req,res)=>{
  res.render('users/test')
})


module.exports = router;
