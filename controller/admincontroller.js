const bcrypt = require('bcrypt')
const fs = require('fs');

const user = require('../helpers/userhelper')
const product = require('../helpers/producthelper')
const order = require('../helpers/ordershelper')

module.exports = {
  alluser: async (req, res) => {
    const data = await user.finduser()
    return data;
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
  adduser: async (req, res) => {
    console.log(req.body);
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
      console.log(existuser)
      res.render('admin/adduser', { errorMessage: "UserID Already Exist" })
    }
    else {
      const saltRounds = 10;
      const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      datas.password = hashpassword
      const result = await user.insert(datas)
      console.log('Data inserted successfully:' + result);
      res.redirect('/admin/alluser')
    }

  },
  edituser: async (req, res) => {
    const proid = req.params.id
    const data = await user.findedituserbyid(proid)
    if (data.gender == 'male') {
      flag = true
    }
    else {
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
  },
  unblockuser: async (req, res) => {
    const proid = req.params.id
    await user.unblockuser(proid)
  },

  //***************    product add section    **********************
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
  },
  allproducts: async (req, rse) => {
    const data = await product.allproducts()
    return data;
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
  productdetails: async (req, res) => {
    const proid = req.params.id
    const orders = await order.findorderid(proid)
    console.log(orders);
    res.render('admin/product-details', { orders });

  },
  editproduct: async (req, res) => {
    const proid = req.params.id
    const data = await product.finddata(proid)
    res.render('admin/editproduct', { data })
  },
  edit_product: async (req, res) => {
    const proid = req.params.id
    console.log(req.body);
    const data = await product.finddata(proid);
    var image = data.image
    console.log(req.files);
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
}