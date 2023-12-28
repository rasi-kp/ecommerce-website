var express = require('express');
var router = express.Router();
const isAuth = require('../middleware/isAuth')
const {
  alluser, adduser, deleteuser, edituser, edituserpost, blockuser, unblockuser, addproduct, edit_product,searchuser,
  allproducts, deleteproduct, orders, confirm, shipped, delivered, productdetails, editproduct,totalordercount,
  cancelled,salereport,pdf,pdfController
} = require('../controller/admincontroller')

router.get('/', async(req, res, next)=> {
  await totalordercount(req,res)
});
//manage Users
router.get('/alluser', isAuth, async (req, res, next) => {
  const data = await alluser(req, res)
  res.render('admin/alluser', { data: data });
});
router.get('/adduser', isAuth, function (req, res, next) {
  res.render('admin/adduser');
});
router.post('/adduser', adduser)

router.post('/edituser/:id', edituserpost)
router.get('/edituser/:id', isAuth, async (req, res, next) => {
  await edituser(req, res)
});
router.get('/deleteuser/:id', isAuth, async (req, res, next) => {
  await deleteuser(req, res);
});
router.get('/edituserview', isAuth, async (req, res, next) => {
  const data = await alluser(req, res)
  res.render('admin/edituserview', { data: data });
});
router.get('/blockuser/:id', isAuth, async (req, res, next) => {
  await blockuser(req);
  res.redirect('/admin/alluser');
});
router.get('/unblockuser/:id', isAuth, async (req, res, next) => {
  await unblockuser(req);
  res.redirect('/admin/alluser');
});
//search user
router.get('/search',isAuth, async (req, res) => {
  const {query} = req.query;
  var data=await searchuser(query);
  res.render('admin/search', { data: data });
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
//******************************  Product Section  ********************** */
router.get('/products', isAuth, async (req, res, next) => {
  const data = await allproducts(req, res);
  res.render('admin/allproduct', { data: data });
});
router.get('/products/add_product', isAuth,async (req, res, next)=> {
  res.render('admin/addproduct');
});
router.post('/products/add_product/:id', async (req, res, next) => {
  await addproduct(req, res)
  res.redirect('/admin/products');
});
router.get('/edit_product/:id', isAuth, async (req, res, next) => {
  await editproduct(req, res)
  res.render('admin/editproduct');
});
router.post('/edit_product/:id', isAuth, async (req, res, next) => {
  await edit_product(req, res)
  res.render('admin/editproduct');
});
router.get('/products/editproductview', async (req, res, next) => {
  const data = await allproducts(req, res);
  res.render('admin/editproductview', { data });
});
router.get('/products/deleteproduct/:id', async (req, res, next) => {
  await deleteproduct(req, res);
  res.redirect('/admin/products');
});

//*********************  Orders  ********************** */

router.get('/orders', isAuth, async (req, res, next) => {
  await orders(req, res);
});
router.get('/orders/confirm/:id', isAuth, async (req, res, next) => {
  await confirm(req, res);
});
router.get('/orders/shipped/:id', async (req, res, next) => {
  await shipped(req, res);
});
router.get('/orders/delivered/:id', async (req, res, next) => {
  await delivered(req, res);
});
router.get('/orders/cancelled/:id', async (req, res, next) => {
  await cancelled(req, res);
});
router.get('/ordersproduct/:id', async (req, res, next) => {
  await productdetails(req, res)
});

router.post('/salereport',async(req,res)=>{
  await salereport(req,res);
})
router.get('/pdfgenerator',async(req,res)=>{
  await pdf(req,res);
})
router.get('/pdfController',async(req,res)=>{
  await pdfController(req,res);
}); 
router.get('/test',async(req,res)=>{
  res.render('admin/invoice')
})

module.exports = router;
