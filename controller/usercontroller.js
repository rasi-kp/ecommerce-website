var bcrypt = require('bcrypt')

const user = require('../helpers/userhelper')
const product = require('../helpers/producthelper')
const order = require('../helpers/ordershelper')
const crypto=require('crypto')

module.exports = {
  alldata: async (req, res) => {
    const data = product.allproducts()
    return data;
  },
  currentuser: async (req, res) => {
    const user = req.session.user;
    return user
  },
  edituser: async (req, res) => {
    const existuser = req
    const data = await user.findexistuser(existuser.username)
    if (data.gender == 'male') {
      flag = true
    }
    else {
      flag = false
    }
    res.render('users/profile', { data: data, flag: flag, username: existuser.username })
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
    const existuser = await user.findexistuser(req.body.username);
    if (existuser) {
      res.render('users/signup', { errorMessage: "UserID Already Exist" })
    }
    else {
      const saltRounds = 10;
      const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      datas.password = hashpassword
      const result = await user.insert(datas)
      res.redirect('/users/login')
    }
  },

  signInUser: async (req, res) => {
    const usercheck = await user.findexistuser(req.body.username)
    if (usercheck == '') {
      res.render('users/login', { errorMessage: 'Invalied User ID' });
    }
    else {
      const passwordmatch = await bcrypt.compare(req.body.password, usercheck.password)
      console.log(passwordmatch);
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
  countitems: async (req, res) => {
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const countitems = await user.countitems(userid._id)
    return countitems
  },
  moredata: async (req, res) => {
    const proid = req.params.id;
    var result = await product.finddata(proid);
    return result;
  },
  addcart: async (req, res) => {
    const proid = req.params.id;
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const cart = await user.cartexist(userid._id)
    const productexist = await user.productexist(proid)
    const cartItem = {
      product: proid,
      quantity: 1,
      size: 'medium',
    };
    if (cart) {
      if (productexist) {
        const result = await user.updatecart(userid._id, cartItem)
      }
      else {
        const result = await user.pushitems(userid._id, cartItem)
      }
    }
    else {
      const result = await user.insertcart(userid._id, proid, cartItem)
    }
  },

  cartitems: async (req, res) => {
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const items = await user.getitemscart(userid._id);
    const count = await user.count(userid._id)
    return items
  },
  count: async (req, res) => {
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const count = await user.count(userid._id)
    return count
  },
  deletecart: async (req, res) => {
    const proid = req.params.id
    const currentuser = req.session.user
    const userid = await user.findexistuser(currentuser.username);
    await user.deletecart(userid._id, proid);
  },
  quantityadd: async (req, res) => {
    const proid = req.params.id;
    const currentuser = req.session.user;
    const userid = await user.findexistuser(currentuser.username);
    const quantity = await user.quantity(userid._id, proid)
    const cart = await user.quantityadd(userid._id, proid)
    console.log(cart);
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
    
    // return quantity
  },
  placeorder: async (req, res) => {
    const currentuser = req.session.user
    const userid = await user.findexistuser(currentuser.username);
    const result = await user.getitemscart(userid._id)
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    orderID = `ORD-${timestamp}-${randomNum}`;
    if(result){
      const orders = {
        orderID: orderID,
        orderdate: new Date(),
        username: userid.username,
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        items: result.items,
        total: result.totalPrice,
        totalamount: result.totalPrice + 40,
        status: "Pending",
      }
      const order = await user.payment(orderID, orders.totalamount);
      res.json(order);
      await user.orders(orders);
      await user.deletecartoredered(userid._id)
    }
    else{
      res.redirect('/users/home')
    }
    
  },
  paymentverify: async(req,res) => {
    const paymentId = req.body['payment[razorpay_payment_id]'];
    const orderId = req.body['payment[razorpay_order_id]'];
    const signature = req.body['payment[razorpay_signature]'];

    const hmac=crypto.createHmac('sha256',process.env.KEY_SECRET)
    hmac.update(orderId+'|'+paymentId);
    hmachex=hmac.digest('hex')
    if(hmachex==signature){
      console.log(req.body.orderID);
      await order.placed(req.body.orderID)
      // await user.paymentstatus(req.body.orderID,paymentId,orderId,signature)
      res.json("sucess");
    }
    else{
      res.json("failure");
    }
  },
  orders: async (req, res) => {
    const currentuser = req.session.user
    const username = currentuser.username
    const orders = await user.ordersfind(username);
    res.render('users/orders', { data: orders })
  },
  password:async(req,res)=>{
    const currentuser = req.session.user
    const username = currentuser.username
    if(req.body.password==req.body.confirmpassword){
      const saltRounds = 10;
      const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      await user.updatepassword(username,hashpassword)
      res.render('users/changepassword',{message:"Sucessfully Updated Paswword"})
    }else{
      res.render('users/changepassword',{message:"Password is Not Match"})
    }
  }

}