const bcrypt = require('bcrypt')
const fs = require('fs');
const puppeteer = require('puppeteer');
const PuppeteerHTMLPDF = require('puppeteer-html-pdf');
const hbs = require('hbs')
const moment = require('moment');
const today = moment().format('DD-MM-YYYY');

const user = require('../helpers/userhelper')
const product = require('../helpers/producthelper')
const order = require('../helpers/ordershelper');
var df;
var dt;
var status;
module.exports = {
  alluser: async (req, res) => {
    const data = await user.finduser()
    res.render('admin/alluser', { data });
  },
  searchuser: async (req,res) => {
    const {query} = req.query;
    const data = await user.searchuser(query)
    res.render('admin/search', { data: data });
  },
  deleteuser: async (req, res) => {
    let proid = req.params.id;
    const result = await user.finduserid(proid)
    const datas = {
      role: result.role,
      name: result.name,
      username: result.username,
      email: result.email,
      phoneno: result.phoneno,
      gender: result.gender,
      address: result.address,
      password: result.password
    }
    await user.insertdelete(datas)
    await user.delete(proid)
    res.redirect('/admin/alluser')
  },
  adduserpage: function (req, res, next) {
    res.render('admin/adduser');
  },
  adduser: async (req, res) => {
    const datas = {
      role: req.body.role,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      phoneno: req.body.phoneno,
      gender: req.body.gender,
      address: req.body.address,
      password: req.body.password
    }
    const existuser = await user.findexistuser(req.body.username);
    if (existuser) {
      res.render('admin/adduser', { errorMessage: "UserID Already Exist" })
    }
    else {
      const saltRounds = 10;
      const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      datas.password = hashpassword
      const result = await user.insert(datas)
      res.redirect('/admin/alluser')
    }
  },
  edituser: async (req, res) => {
    const proid = req.params.id
    const data = await user.findedituserbyid(proid)
    if (data.gender == 'male') {
      flag = true
    } else {
      flag = false
    }
    res.render('admin/edituser', { data: data, flag: flag })
  },
  edituserpost: async (req, res) => {
    const proid = req.params.id
    const datas = {
      role: req.body.role,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      phoneno: req.body.phoneno,
      gender: req.body.gender,
      address: req.body.address,
      password: req.body.password
    }
    await user.edituser(datas, proid);
    res.redirect('/admin/alluser')
  },
  blockuser: async (req, res) => {
    const proid = req.params.id
    await user.blockuser(proid)
    res.redirect('/admin/alluser');
  },
  unblockuser: async (req, res) => {
    const proid = req.params.id
    await user.unblockuser(proid)
    res.redirect('/admin/alluser');
  },
  adminlogout: (req, res) => {
    req.session.destroy()
    res.redirect('/')
  },

  //***************    product add section    **********************
  addproductpage:async (req, res, next)=> {
    res.render('admin/addproduct');
  },
  addproduct: async (req, res) => {
    const image = req.files.image;
    const datas = {
      name: req.body.name,
      image: image.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      qty: req.body.qty,
    }
    const result = await product.insertdata(datas)
    image.mv('./public/products-images/' + image.name, (err) => {
      if (err)
        return res.status(500).send(err);
    });
    res.redirect('/admin/products');
  },
  allproducts: async (req, rse) => {
    const data = await product.allproducts()
      res.render('admin/allproduct', { data: data });
  },
  deleteproduct: async (req, res) => {
    const proid = req.params.id
    const data = await product.finddata(proid);
    const imagePath = './public/products-images/' + data.image;
    fs.unlink(imagePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting existing image:', unlinkErr);
      }
    });
    await product.deleteproduct(proid)
    res.redirect('/admin/products');
  },
  productdetails: async (req, res) => {
    const proid = req.params.id
    const orders = await order.findorderid(proid)
    res.render('admin/product-details', { orders });
  },
  editproduct: async (req, res) => {
    const proid = req.params.id
    const data = await product.finddata(proid)
    res.render('admin/editproduct', { data })
    
  },
  edit_product: async (req, res) => {
    const proid = req.params.id
    const data = await product.finddata(proid);
    var image = data.image
    if (req.files) {
      var file = req.files.image;
      var image = file.name;
      const imagePath = './public/products-images/' + image;
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting existing image:', unlinkErr);
        }
      });
      file.mv('./public/products-images/' + image, (err) => {
        if (err)
          return res.status(500).send(err);
      });
    }
    const datas = {
      name: req.body.name,
      image: image,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      qty: req.body.qty,
    }
    const result = await product.editproduct(datas, proid)
    res.redirect('/admin/products')
  },
  //************************  Orders ************************** */
  totalordercount: async (req, res) => {
    const result = await order.totalorderedcount()
    const resultmonth = await order.monthordercount()
    const TotalProductCount = await order.totalproductcount()
    const monthamount = await order.monthorderamount()
    const [totalQuantity, todayorder] = await order.todayorderdetails()
    const ordercount = result[0].totalOrderedQuantity
    const totalamount = result[0].totalamount
    res.render('admin/admin', { ordercount, totalamount, monthamount, TotalProductCount, resultmonth, totalQuantity, todayorder });
  },
  orders: async (req, res) => {
    const orders = await order.orders()
    res.render("admin/order", { orders })
  },
  confirm: async (req, res) => {
    const proid = req.params.id
    const result = await order.confirm(proid)
    res.redirect('/admin/orders')
  },
  shipped: async (req, res) => {
    const proid = req.params.id
    const result = await order.shipped(proid)
    res.redirect('/admin/orders')
  },
  delivered: async (req, res) => {
    const proid = req.params.id
    const result = await order.delivered(proid)
    res.redirect('/admin/orders')
  },
  cancelled: async (req, res) => {
    const proid = req.params.id
    await order.cancelled(proid)
    res.redirect('/admin/orders')
  },
  salereport: async (req, res) => {
    df = req.body.datefrom
    dt = req.body.dateto
    status = req.body.status
    const [orders, totalAmount, totalOrders, categorycount, categoryamount] = await order.salereport(df, dt, status)
    res.render('admin/salereport', { orders, totalAmount, totalOrders, df, dt, status, categorycount, categoryamount, today})
  },
  pdf: async (req, res) => {
    const [orders, totalAmount, totalOrders, categorycount, categoryamount] = await order.salereport(df, dt, status)
    const pdfData =
    {
      orders, totalAmount, totalOrders, categorycount, categoryamount,df,dt,today
    }
    const htmlPDF = new PuppeteerHTMLPDF();
    htmlPDF.setOptions({ format: 'A4' });
    try {
      const html = await htmlPDF.readFile('views/admin/salereportpdf.hbs', 'utf8');
      const cssContent = await htmlPDF.readFile('public/stylesheets/invoice.css', 'utf8');
      const imageContent = fs.readFileSync('public/images/lr.png', 'base64');
      const htmlWithStyles = `<style>${cssContent}${imageContent}</style>${html}`;
      const template = hbs.compile(htmlWithStyles);
      const content = template({ ...pdfData, imageContent });
      
      const pdfBuffer = await htmlPDF.create(content);
      res.attachment(df+'_'+dt+'.pdf')
      res.end(pdfBuffer);
    } catch (error) {
      console.log(error);
      res.send('Something went wrong.')
    }
  },
  gmail:async(req,res)=>{
    const email=req.params.id
    await user.gmail(email);
  }
}


