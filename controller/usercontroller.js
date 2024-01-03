var bcrypt = require('bcrypt')
const PuppeteerHTMLPDF = require('puppeteer-html-pdf');
var nodemailer = require('nodemailer');
const fs = require('fs');
const hbs = require('hbs')
const crypto = require('crypto')

const user = require('../helpers/userhelper')
const product = require('../helpers/producthelper')
const order = require('../helpers/ordershelper')
const home = require('../homepage/home')

module.exports = {
  homepage: async (req, res) => {
    const currentuser = req.session.user;
    const loggedInUser = await user.findexistuser(currentuser.username);
    const count = await user.countitems(loggedInUser._id)
    const categorizedProducts = await home.mainpage()
    res.render('users/index', { categorizedProducts, username: loggedInUser.name, count })
  },
  login: async (req, res) => {
    if (req.session.loggedIn) {
      return res.redirect('/users/home')
    } else {
      res.render('users/login')
    }
  },
  cart: async (req, res) => {
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const data = await user.getitemscart(userid._id);
    const count = await user.count(userid._id)
    if (data) {
      total = data.totalPrice + 40
      res.render('users/cart', { data, total, count })
    } else {
      res.render('users/cart')
    }
  },
  cartid: async (req, res) => {
    const proid = req.params.id;
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const cart = await user.cartexist(userid._id)
    const productexist = await user.productexist(proid)
    const quantity = req.query.quantity || 1;
    const size = req.query.size || 'medium';
    const cartItem = {
      product: proid,
      quantity: quantity,
      size: size,
    };
    const count = await user.countitems(userid._id)
    if (cart) {
      if (productexist) {
        const result = await user.updatecart(userid._id, cartItem)
        res.json({ count, result });
      }
      else {
        const result = await user.pushitems(userid._id, cartItem)
        res.json({ count, result });
      }
    }
    else {
      const result = await user.insertcart(userid._id, proid, cartItem)
      res.json({ count, result });
    }  
  },
  user_registration: async (req, res) => {
    res.render('users/signup')
  },
  alldata: async (req, res) => {
    const data = product.allproducts()
    return data;
  },
  edituser: async (req, res) => {
    const existuser = req.session.user
    const data = await user.findexistuser(existuser.username)
    if (data.gender == 'male') {
      flag = true
    }
    else {
      flag = false
    }
    res.render('users/profile', { data: data, flag: flag, username: existuser.name })
  },
  logout:(req, res) => {
    req.session.destroy()
    res.redirect('/')
  },
  edituserpost: async (req, res) => {
    let proid = req.params.id;
    const result = await user.edituser(req.body, proid)
    res.redirect('/users/home')
  },
  signUpUser: async (req, res) => {
    const datas = {
      role: "user",
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      phoneno: req.body.number,
      gender: req.body.gender,
      address: req.body.address,
      password: req.body.password
    }
    const existuser=await user.findexistuser(datas.username)
    if ( /\s/.test(datas.username)) {
      res.render('users/signup', { errorMessage: "Space not Alowed" })
    }
    else if(existuser) {
      res.render('users/signup', { errorMessage: "UserID Already Exist" })
    }
    else {
      const saltRounds = 10;
      const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      datas.password = hashpassword
      const result = await user.insert(datas)
      await user.gmail(datas.email, datas.name) //welcome mail 
      res.redirect('/users/login')
    }
  },

  signInUser: async (req, res) => {
    const usercheck = await user.findexistuser(req.body.username)
    if (!usercheck) {
      res.render('users/login', { errorMessage: 'Invalied User ID' });
    }
    else {
      const passwordmatch = await bcrypt.compare(req.body.password, usercheck.password)
      if (passwordmatch) {
        const currrentuser = usercheck.name;
        req.session.loggedIn = true;
        req.session.user = req.body;
        if (usercheck.role == 'admin') {
          res.redirect('/admin');
        } else if (usercheck.status == "block") {
          res.render('users/login', { errorMessage: 'Admin Blocked !!' });
        }
        else
          res.redirect('/users/home');
      }
      else {
        res.render('users/login', { errorMessage: "Invalied Password" });
      }
    }
  },
  moredetails:async(req,res)=>{
    const proid = req.params.id;
    var data = await product.finddata(proid);
    const otherdata=await product.allproducts(req)
    res.render('users/moredetails',{data,otherdata})
  },
  deletecart: async (req, res) => {
    const proid = req.params.id
    const currentuser = req.session.user
    const userid = await user.findexistuser(currentuser.username);
    await user.deletecart(userid._id, proid);
    res.redirect('/users/cart')
  },
  quantityadd: async (req, res) => {
    const proid = req.params.id;
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const quantity = await user.quantity(userid._id, proid)
    const cart = await user.quantityadd(userid._id, proid)
    const response = {
      quantity: quantity,
      totalPrice: cart.totalPrice
    };
    res.json(response)
  },
  quantityminus: async (req, res) => {
    const proid = req.params.id;
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const quantity = await user.quantity(userid._id, proid)
    if (quantity > 0) {
      const cart = await user.quantityminus(userid._id, proid)
      const response = {
        quantity: quantity,
        totalPrice: cart.totalPrice
      };
      res.json(response)
    }
  },
  checkout:async(req,res)=>{
    const orderID = req.query.orderID;
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const data = await user.getitemscart(userid._id);
    const count = await user.count(userid._id)
    if(count){
      total=data.totalPrice+40
      res.render('users/checkout',{data,total,count,orderID})
    }else{
      res.redirect('/users/home')
    }
  },
  placeorder: async (req, res) => {
    const currentuser = req.session.user
    const userid = await user.findexistuser(currentuser.username);
    const result = await user.getitemscart(userid._id)
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    orderID = `ORD-${timestamp}-${randomNum}`;
    if (result) {
      const orders = {
        orderID: orderID,
        orderdate: new Date(),
        username: userid.username,
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        phoneno: req.body.phoneno,
        items: result.items,
        total: result.totalPrice,
        totalamount: result.totalPrice + 40,
        status: "Pending",
        paymentId: "null",
      }
      const order = await user.payment(orderID, orders.totalamount);
      res.json(order);
      await user.orders(orders);
      await user.deletecartoredered(userid._id)
    }
    else {
      res.redirect('/users/home')
    }
  },
  paymentverify: async (req, res) => {
    const currentuser = req.session.user
    const userid = await user.findexistuser(currentuser.username);
    const paymentId = req.body['payment[razorpay_payment_id]'];
    const orderId = req.body['payment[razorpay_order_id]'];
    const signature = req.body['payment[razorpay_signature]'];
    const orderID = req.body.orderID
    const hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
    hmac.update(orderId + '|' + paymentId);
    hmachex = hmac.digest('hex')
    if (hmachex == signature) {
      await order.placed(orderID, paymentId)
      await order.updatequantity(orderID)
      //Create Invoice
      const result = await order.invoice(orderID)
      const pdfData = {
        invoiceItems: result,
      }
      const htmlPDF = new PuppeteerHTMLPDF();
      htmlPDF.setOptions({ format: 'A4' });

      const html = await htmlPDF.readFile('views/admin/invoice.hbs', 'utf8');
      const cssContent = await htmlPDF.readFile('public/stylesheets/invoice.css', 'utf8');
      const imageContent = fs.readFileSync('public/images/lr.png', 'base64');
      const htmlWithStyles = `<style>${cssContent}${imageContent}</style>${html}`;

      const template = hbs.compile(htmlWithStyles);
      const content = template({ ...pdfData, imageContent });
      const pdfBuffer = await htmlPDF.create(content);
      //Generate email
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS,
        }
      });
      var mailOptions = {
        from: 'rasir239@gmail.com',
        to: userid.email,
        subject: 'THANK YOU FOR SHOPPING "Ras Shopping"' + orderID,
        text: 'Thank you for Choosing Ras Shopping  !!! Attached is the invoice for your recent purchase.',
        attachments: [
          {
            filename: `${orderID}.pdf`,
            content: pdfBuffer,
          },
        ],
      };
      transporter.sendMail(mailOptions, function (error, info) {
      });
      res.json("sucess");
    }
    else {
      res.json("failure");
    }
  },
  sucess:(req,res)=>{
    const orderid=req.params.id
    res.render('users/sucess',{orderid})
  },
  changepassword:async(req,res)=>{
    res.render('users/changepassword')
  },
  quantityupdate: async (order1) => {
    const result = await order.updatequantity(order1)
  },

  orders: async (req, res) => {
    const currentuser = req.session.user
    const username = currentuser.username
    const orders = await user.ordersfind(username);
    res.render('users/orders', { data: orders })
  },
  password: async (req, res) => {
    const currentuser = req.session.user
    const username = currentuser.username
    if (req.body.password == req.body.confirmpassword) {
      const saltRounds = 10;
      const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      await user.updatepassword(username, hashpassword)
      res.render('users/changepassword', { message: "Sucessfully Updated Paswword" })
    } else {
      res.render('users/changepassword', { message: "Password is Not Match" })
    }
  },
  subscribe: async (req, res) => {
    let email = {
      email: req.body.email,
    }
    await user.subscribe(email)
    res.json(email)
  },
  shop:async(req,res)=>{
    if(req.session.loggedIn){
      const currentuser = req.session.user;
      const loggedInUser= await user.findexistuser(currentuser.username);
      const count = await user.countitems(loggedInUser._id)
      const categorizedProducts=await home.allproductslimit()
      res.render('users/shop',{categorizedProducts,username:loggedInUser.name,count})
    }
    else{
      const categorizedProducts=await home.allproductslimit()
      res.render('users/shop',{categorizedProducts})
    }
  },
  shop2:async(req,res)=>{
    const categorizedProducts=await home.allproducts1()
    res.render('users/shop',{categorizedProducts})
  },
  shop3:async(req,res)=>{
    const categorizedProducts=await home.allproducts1()
    res.render('users/shop',{categorizedProducts})
  },
  search:async (req, res) => {
    const {query} = req.query;
    var categorizedProducts=await home.search(query);
    res.render('users/search',{categorizedProducts})
  },
  cat_fasion: async (req, res) => {
    var data='fasion';
    var categorizedProducts=await home.category(data);
    res.render('users/shop',{categorizedProducts})
  },
  cat_electronics: async (req, res) => {
    var data='electronics';
    var categorizedProducts=await home.category(data);
    res.render('users/shop',{categorizedProducts})
  },
  cat_jwellery: async (req, res) => {
    var data='jwellery';
    var categorizedProducts=await home.category(data);
    res.render('users/shop',{categorizedProducts})
  },
  cat_others: async (req, res) => {
    var data='jwellery';
    var categorizedProducts=await home.category(data);
    res.render('users/shop',{categorizedProducts})
  },

}