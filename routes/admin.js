var express = require('express');
var router = express.Router();
const isAuth=require('../middleware/isAuth')
const {
  alluser,adduser,deleteuser,edituser,edituserpost,blockuser,unblockuser,addproduct,edit_product,
  allproducts,deleteproduct,orders,confirm,shipped,delivered,productdetails,editproduct
} = require('../controller/admincontroller')

/* GET users listing. */
router.get('/',isAuth, function(req, res, next) {
  res.render('admin/admin');
});

router.get('/alluser',isAuth,async(req, res, next)=> {
  const data= await alluser(req,res)
  res.render('admin/alluser',{data:data});

});
router.get('/adduser',isAuth, function(req, res, next) {
    res.render('admin/adduser');
  });
router.post('/adduser',adduser)

router.post('/edituser/:id',edituserpost)
  router.get('/edituser/:id',isAuth,async(req, res, next)=> {
    await edituser(req,res)
    // res.render('admin/edituser');
  });
  router.get('/deleteuser/:id',isAuth, async(req, res, next)=> {
    await deleteuser(req,res);
  });

  router.get('/edituserview',isAuth,async(req, res, next)=> {
  const data=await alluser(req,res)
   res.render('admin/edituserview',{data:data});
  });

router.get('/logout',(req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/blockuser/:id',isAuth,async(req, res, next)=> {
  await blockuser(req);
  res.redirect('/admin/alluser');
});
router.get('/unblockuser/:id',isAuth, async(req, res, next)=> {
  await unblockuser(req);
  res.redirect('/admin/alluser');
});
//******************************  Product Section  ********************** */
router.get('/products',isAuth,async(req, res, next)=> {
  const data=await allproducts(req,res);
  res.render('admin/allproduct',{data:data});
});
router.get('/products/add_product',isAuth, function(req, res, next) {
  res.render('admin/addproduct');
});
router.post('/products/add_product/:id', async(req, res, next)=>{
  await addproduct(req,res)
  res.redirect('/admin/products');
});
router.get('/edit_product/:id',isAuth,async(req, res, next)=> {
  await editproduct(req,res)
  res.render('admin/editproduct');
});
router.post('/edit_product/:id',isAuth,async(req, res, next)=> {
  await edit_product(req,res)
  res.render('admin/editproduct');
});
router.get('/products/editproductview',async(req, res, next)=> {
  const data=await allproducts(req,res);
  res.render('admin/editproductview',{data});
});
router.get('/products/deleteproduct/:id',async(req, res, next)=>{
  await deleteproduct(req,res);
  res.redirect('/admin/products');
});

//*********************  Orders  ********************** */

router.get('/orders',isAuth, async(req, res, next)=> {
  await orders(req,res);
});
router.get('/orders/confirm/:id',isAuth, async(req, res, next)=> {
  await confirm(req,res);
});
router.get('/orders/shipped/:id', async(req, res, next)=> {
  await shipped(req,res);
});
router.get('/orders/delivered/:id', async(req, res, next)=> {
  await delivered(req,res);
});
router.get('/ordersproduct/:id', async(req, res, next)=> {
  await productdetails(req,res)
});
// router.get('/payment', function(req, res, next) {
//   res.render('admin/product-details');
// });
router.get('/orders/delete_orders', function(req, res, next) {
  res.render('admin/deleteproduct');
});
router.delete('/orders/delete_orders/:id', function(req, res, next) {
  res.render('admin/deleteproduct');
});
module.exports = router;
