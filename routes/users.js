var express = require('express');
var router = express.Router();
const product = require('../helpers/producthelper')
const user = require('../helpers/userhelper')
const isAuth=require('../middleware/isAuth')
const home=require('../homepage/home')
const {
  signUpUser,signInUser,edituser,alldata,edituserpost,moredata,orders,payment,paymentverify,currentuser,
  addcart,cartitems,deletecart,countitems,quantityadd,quantityminus,count,placeorder,password,subscribe,
} = require('../controller/usercontroller')

/* GET users listing. */

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/home',isAuth,async(req,res)=>{
  // const data=await alldata();
  const loggedInUser=await currentuser(req);
  console.log(loggedInUser);
  const count=await countitems(req);
  const categorizedProducts=await home.mainpage()
  res.render('users/index',{categorizedProducts,username:loggedInUser,count})
})
router.get('/shop',async(req,res)=>{
  console.log(req.session.loggedIn);
  if(req.session.loggedIn){
    const loggedInUser=await currentuser(req);
    const count=await countitems(req);
    const categorizedProducts=await home.allproductslimit()
    res.render('users/shop',{categorizedProducts,username:loggedInUser,count})
  }
  const categorizedProducts=await home.allproductslimit()
  res.render('users/shop',{categorizedProducts})
  
})
router.get('/shop2',async(req,res)=>{
  const categorizedProducts=await home.allproducts1()
  res.render('users/shop',{categorizedProducts})
})
router.get('/shop/3',async(req,res)=>{
  const categorizedProducts=await home.allproducts2()
  res.render('users/shop',{categorizedProducts})
})
router.get('/products/search', async (req, res) => {
  const {query} = req.query;
  var categorizedProducts=await home.search(query);
  res.render('users/search',{categorizedProducts})
})
router.get('/products-cat-fasion', async (req, res) => {
  var data='fasion';
  var categorizedProducts=await home.category(data);
  res.render('users/shop',{categorizedProducts})
})
router.get('/products-cat-electronics', async (req, res) => {
  var data='electronics';
  var categorizedProducts=await home.category(data);
  res.render('users/shop',{categorizedProducts})
})
router.get('/products-cat-jwellery', async (req, res) => {
  var data='jwellery';
  var categorizedProducts=await home.category(data);
  res.render('users/shop',{categorizedProducts})
})
router.get('/products-cat-other', async (req, res) => {
  var data='other';
  var categorizedProducts=await home.category(data);
  res.render('users/shop',{categorizedProducts})
})
router.get('/login',(req,res)=>{
  res.render('users/login') 
})

router.post('/user_signin',signInUser)

router.get('/user_registration',(req,res)=>{
  res.render('users/signup')
})

router.post('/user_registration',signUpUser)

router.get('/profile',isAuth,(req, res) => {
   edituser(req.session.user,res)
})
router.post('/edit/:id',isAuth,(req, res) => {
  edituserpost(req,res)
})
router.get('/cart',isAuth,async(req,res)=>{
  const data=await cartitems(req)
  const count1=await count(req)
  if(data){
    total=data.totalPrice+40
    res.render('users/cart',{data,total,count:count1})
  }
  res.render('users/cart')
})
router.get('/cart/:id',isAuth,async(req,res)=>{
  console.log(req.params.id);
  const data=await addcart(req,res)
  const count=await countitems(req);
  console.log(count);
  res.json(count)

  //  res.redirect('/users/home')
})
router.get('/cart/delete/:id',isAuth,async(req,res)=>{
  await deletecart(req,res)
  res.redirect('/users/cart')
})
router.get('/cart/quantityadd/:id',isAuth,async(req,res)=>{
  await quantityadd(req,res)
})
router.get('/cart/quantityminus/:id',isAuth,async(req,res)=>{
  await quantityminus(req,res)
})
router.get('/checkout',isAuth,async(req,res)=>{
  const orderID = req.query.orderID;
  console.log(orderID);
  const data=await cartitems(req)
  const count1=await count(req)
  if(count1){
    total=data.totalPrice+40
    res.render('users/checkout',{data,total,count:count1,orderID})
  }
  else{
    res.redirect('/users/home')
  }
})
router.post('/placeorder',isAuth,placeorder);

router.post('/verifypayment',isAuth,async(req,res)=>{
  await paymentverify(req,res)
})
router.get('/sucess',(req,res)=>{
  res.render('users/sucess')
})

router.get('/moredetails/:id',async(req,res)=>{
  const data=await moredata(req)
  const otherdata=await product.allproducts(req)
  res.render('users/moredetails',{data,otherdata})
})
router.get('/logout',(req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/orders',isAuth,async(req,res)=>{
  await orders(req,res)
})
router.get('/changepassword',isAuth,async(req,res)=>{
  res.render('users/changepassword')
})
router.post('/password',isAuth,async(req,res)=>{
  await password(req,res)
})
router.get('/payment',isAuth,async(req,res)=>{
  await payment(req,res)
})
router.post('/subscribe',async(req,res)=>{
  await subscribe(req,res)
})

module.exports = router;
