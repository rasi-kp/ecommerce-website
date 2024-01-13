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
const otp = require('../config/otp')
const razorpay = require('../config/razorpay')
const stripe = require('../config/stripe')

module.exports = {
  homepage: async (req, res) => {
    const currentuser = req.session.user;
    const loggedInUser = await user.findexistuser(currentuser.username);
    const count = await user.countmain(loggedInUser._id)
    const categorizedProducts = await home.mainpage()
    res.render('users/index', { categorizedProducts, username: loggedInUser.name, count })
  },
  login: async (req, res) => {
    if (req.session.loggedIn && req.session.admin) {
      return res.redirect('/admin')
    } else if (req.session.loggedIn) {
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
    var cartqty = 0
    const proid = req.params.id;
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const cart = await user.cartexist(userid._id)
    const productexist = await user.productexist(proid, userid._id)
    if (productexist) {
      var foundItem = productexist.items.find(item => item.product.toString() === proid);
      var cartqty = foundItem.quantity
    }
    const productqty = await product.finddata(proid)
    if (productqty.qty > cartqty) {
      const quantity = req.query.quantity || 1;
      const size = req.query.size || 'medium';
      const cartItem = {
        product: proid,
        quantity: quantity,
        size: size,
      };
      count = await user.countitems(userid._id)
      if (cart) {
        if (productexist) {
          await user.updatecart(userid._id, cartItem)
          res.json(count + 1);
        }
        else {
          await user.pushitems(userid._id, cartItem)
          res.json(count + 1);
        }
      }
      else {
        await user.insertcart(userid._id, proid, cartItem)
        res.json(count + 1);
      }
    } else {
      var count = false
      res.json(count);
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
  logout: (req, res) => {
    req.session.destroy()
    res.redirect('/')
  },
  edituserpost: async (req, res) => {
    let proid = req.params.id;
    const result = await user.edituser(req.body, proid)
    res.redirect('/users/home')
  },
  signUpUser: async (req, res) => {
    const generatedotp = await otp.generateOTP()
    const datas = {
      role: "user",
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      phoneno: req.body.number,
      gender: req.body.gender,
      address: req.body.address,
      password: req.body.password,
      verification: generatedotp,
    }
    const existuser = await user.findexistuser(datas.username)
    if (/\s/.test(datas.username)) {
      res.render('users/signup', { errorMessage: "Space not Alowed" })
    }
    else if (existuser) {
      res.render('users/signup', { errorMessage: "UserID Already Exist" })
    }
    else {
      const saltRounds = 10;
      const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      datas.password = hashpassword
      await otp.sendOTPEmail(datas.email, generatedotp);
      const result = await user.insert(datas)
      res.render('users/otp', { userid: result[0]._id })
    }
  },
  validateotp: async (req, res) => {
    const result = await user.findedituserbyid(req.body.id)
    if ((req.body.enteredOTP) && (result)) {
      if (result.verification == req.body.enteredOTP) {
        await user.verified(req.body.id)
        res.json({ success: true })
        await user.gmail(result.email, result.name) //welcome mail
        res.render('users/login')
      }
      else {
        await user.delete(req.body.id)
        res.json({ success: false });
      }
    }
    else {
      await user.delete(req.body.id)
      res.status(422).json({ error: "Field can't be empty!" })
    }
  },
  timeexeed: async (req, res) => {
    const proid = req.params.id
    await user.delete(proid)
    res.render('users/signup')
  },
  forgotpassword: async (req, res) => {
    res.render('users/forgotpassword')
  },
  sendotp: async (req, res) => {
    const result = await user.finduseremail(req.body.email)
    if (result) {
      const generatedotp = await otp.generateOTP()
      await otp.sendOTPEmail(req.body.email, generatedotp);
      res.json(generatedotp)
    }
    else {
      res.json({ error: "error" })
    }
  },
  resetpassword: async (req, res) => {
    const saltRounds = 10;
    const hashpassword = await bcrypt.hash(req.body.newPassword, saltRounds)
    await user.forgotpassword(req.body.email, hashpassword)
    res.json("success")
  },
  signInUser: async (req, res) => {
    const usercheck = await user.findexistuser(req.body.username)
    if (!usercheck) {
      res.render('users/login', { errorMessage: 'Invalied User ID' });
    }
    else if (usercheck.verification !== "true") {
      res.render('users/login', { errorMessage: 'Email id not verified' });
    }
    else {
      const passwordmatch = await bcrypt.compare(req.body.password, usercheck.password)
      if (passwordmatch) {
        req.session.loggedIn = true;
        req.session.user = req.body;
        if (usercheck.role == 'admin') {
          req.session.admin = true;
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
  moredetails: async (req, res) => {
    const proid = req.params.id;
    var data = await product.finddata(proid);
    const otherdata = await product.allproducts(req)
    res.render('users/moredetails', { data, otherdata })
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
    const productexist = await user.productexist(proid, userid._id)
    if (productexist) {
      var foundItem = productexist.items.find(item => item.product.toString() === proid);
      var cartqty = foundItem.quantity
    }
    const productqty = await product.finddata(proid)
    if (productqty.qty > cartqty) {
      const cart = await user.quantityadd(userid._id, proid)
      const response = {
        quantity: quantity,
        totalPrice: cart.totalPrice
      };
      res.json(response)
    } else {
      const response = false;
      res.json(response)
    }
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
  checkout: async (req, res) => {
    const orderID = req.query.orderID;
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const count = await user.count(userid._id)
    if (count) {
      const data = await user.getitemscart(userid._id);
      const address1 = await user.addresstake(userid._id)
      if (address1 != '') {
        var address = address1[0].addresses
      }
      total = data.totalPrice + 40
      res.render('users/checkout', { data, total, count, orderID, address })
    } else {
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
      if (req.body.paymentMethod === "razorpay") {
        var order = await razorpay.payment(orderID, orders.totalamount);
      }
      await user.orders(orders);
      const newAddress = {
        userID: userid._id,
        addresses: {
          name: req.body.name,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          phoneno: req.body.phoneno,
        }
      };
      const existingAddress = await user.existaddress(newAddress)
      if (!existingAddress) {
        await user.address(newAddress)
      }
      res.json(order);
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
      await user.deletecartoredered(userid._id)
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
  stripe: async (req, res) => {
    var order = await stripe.payment(req,res);
  },
  sucess: (req, res) => {
    const orderid = req.params.id
    res.render('users/sucess', { orderid })
  },
  changepassword: async (req, res) => {
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
  invoice: async (req, res) => {
    const orderID = req.params.id
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
    res.attachment(orderID + '.pdf')
    res.end(pdfBuffer);
  },
  subscribe: async (req, res) => {
    let email = {
      email: req.body.email,
    }
    await user.subscribe(email)
    res.json(email)
  },
  shop: async (req, res) => {
    if (req.session.loggedIn) {
      const currentuser = req.session.user;
      const loggedInUser = await user.findexistuser(currentuser.username);
      const count = await user.countitems(loggedInUser._id)
      const categorizedProducts = await home.allproductslimit()
      res.render('users/shop', { categorizedProducts, username: loggedInUser.name, count })
    }
    else {
      const categorizedProducts = await home.allproductslimit()
      res.render('users/shop', { categorizedProducts })
    }
  },
  shop2: async (req, res) => {
    const categorizedProducts = await home.allproducts1()
    res.render('users/shop', { categorizedProducts })
  },
  shop3: async (req, res) => {
    const categorizedProducts = await home.allproducts1()
    res.render('users/shop', { categorizedProducts })
  },
  search: async (req, res) => {
    const { query } = req.query;
    var categorizedProducts = await home.search(query);
    res.render('users/search', { categorizedProducts })
  },
  cat_fasion: async (req, res) => {
    var data = 'fasion';
    var categorizedProducts = await home.category(data);
    res.render('users/shop', { categorizedProducts })
  },
  cat_electronics: async (req, res) => {
    var data = 'electronics';
    var categorizedProducts = await home.category(data);
    res.render('users/shop', { categorizedProducts })
  },
  cat_jwellery: async (req, res) => {
    var data = 'jwellery';
    var categorizedProducts = await home.category(data);
    res.render('users/shop', { categorizedProducts })
  },
  cat_others: async (req, res) => {
    var data = 'jwellery';
    var categorizedProducts = await home.category(data);
    res.render('users/shop', { categorizedProducts })
  },

}