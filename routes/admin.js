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
router.post('/products/add_product/:id',addproduct)
router.get('/edit_product/:id', isAuth,editproduct)
router.post('/edit_product/:id', isAuth,edit_product)
router.get('/products/editproductview',allproducts);
router.get('/products/deleteproduct/:id',deleteproduct);

//*********************  Orders  ********************** */

router.get('/orders', isAuth,orders);
router.get('/orders/confirm/:id', isAuth,confirm);
router.get('/orders/shipped/:id',shipped);
router.get('/orders/delivered/:id',delivered);
router.get('/orders/cancelled/:id', cancelled);
router.get('/ordersproduct/:id',productdetails)
router.post('/salereport',salereport)
router.get('/pdfgenerator',pdf);
router.get('/gmail/:id',gmail);
// Testing route
router.get('/test',async(req,res)=>{
  res.render('admin/invoice')
})



module.exports = router;
