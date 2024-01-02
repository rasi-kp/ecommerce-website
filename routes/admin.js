var express = require('express');
var router = express.Router();
const isAuth = require('../middleware/isAuth')
const {
  alluser, adduser, deleteuser, edituser, edituserpost, blockuser, unblockuser, addproduct, edit_product,searchuser,
  allproducts, deleteproduct, orders, confirm, shipped, delivered, productdetails, editproduct,totalordercount,
  cancelled,salereport,pdf,gmail,adminlogout,adduserpage,addproductpage,
} = require('../controller/admincontroller')

router.get('/',isAuth, totalordercount)
//********************************  manage Users **************************
router.get('/alluser', isAuth,alluser)
router.get('/adduser', isAuth,adduserpage)
router.post('/adduser',isAuth, adduser)
router.post('/edituser/:id',isAuth, edituserpost)
router.get('/edituser/:id', isAuth,edituser)
router.get('/deleteuser/:id', isAuth,deleteuser);
router.get('/edituserview',isAuth,alluser)
router.get('/blockuser/:id', isAuth,blockuser);
router.get('/unblockuser/:id', isAuth,unblockuser);
router.get('/search',isAuth,searchuser);//search user
router.get('/logout',adminlogout)

//******************************  Product Section  ********************** */
router.get('/products', isAuth,allproducts)
router.get('/products/add_product', isAuth,addproductpage)
router.post('/products/add_product/:id',isAuth,addproduct)
router.get('/edit_product/:id', isAuth,editproduct)
router.post('/edit_product/:id', isAuth,edit_product)
router.get('/products/editproductview',isAuth,allproducts);
router.get('/products/deleteproduct/:id',isAuth,deleteproduct);

//*********************  Orders  ********************** */
router.get('/orders', isAuth,orders);
router.get('/orders/confirm/:id', isAuth,confirm);
router.get('/orders/shipped/:id',isAuth,shipped);
router.get('/orders/delivered/:id',isAuth,delivered);
router.get('/orders/cancelled/:id',isAuth,cancelled);
router.get('/ordersproduct/:id',isAuth,productdetails)
router.post('/salereport',isAuth,salereport)
router.get('/pdfgenerator',isAuth,pdf);
router.get('/gmail/:id',isAuth,gmail);
// Testing route
router.get('/test',async(req,res)=>{
  res.render('admin')
})



module.exports = router;
