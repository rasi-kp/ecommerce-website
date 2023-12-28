const bcrypt = require('bcrypt')
const fs = require('fs');
const puppeteer = require('puppeteer');
const PuppeteerHTMLPDF = require('puppeteer-html-pdf');
const hbs=require('hbs')

const user = require('../helpers/userhelper')
const product = require('../helpers/producthelper')
const order = require('../helpers/ordershelper');
var df;
var dt;
var status;
module.exports = {
  alluser: async (req, res) => {
    const data = await user.finduser()
    return data;
  },
  searchuser: async (search) => {
    const data = await user.searchuser(search)
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
    const [orders, totalAmount, totalOrders, categorycount,categoryamount] = await order.salereport(df, dt, status)
    res.render('admin/salereport', { orders, totalAmount, totalOrders, df, dt, status ,categorycount,categoryamount})
  },
  pdf: async (req, res) => {
    try {
      const [orders, totalAmount, totalOrders] = await order.salereport(df, dt, status);

      const dateRange = `${df} to ${dt}`;
  
      if (orders.length > 0) {
        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
  
        // Add your header, logo, and styling here
        const headerContent = `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="/images/lr.png" alt="Ras shopping" style="max-width: 200px;">
            <h1 style="margin: 10px 0;">Ras Shopping</h1><br>
          </div>
          <div>
            <p class="text-align: right;">Date Range: ${dateRange}</p><br><br>
          </div>
        `;
  
        const tableHeader = `
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Order ID</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Customer Name</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Total Price</th>
            </tr>
        `;
  
        const getTotalQuantity = (items) => items.reduce((total, item) => total + item.quantity, 0);
        const tableRows = orders.map(order => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.orderID}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${getTotalQuantity(order.items)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.status}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.totalamount}</td>
          </tr>
        `).join('');
  
        const tableFooter = '</table>';
  
        await page.setContent(`
          <html>
          <head>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          </head>
          <body>
            <div style="margin: 20px;">
              ${headerContent}      
              ${tableHeader}
              ${tableRows}
              ${tableFooter}
            </div>
          </body>
          </html>
        `);
  
        await page.pdf({ path: df + '_salereport.pdf', format: 'A4' });
  
        await browser.close();
        res.json({ message: 'Success!' });
        res.redirect('/admin')
      } else {
        console.log('No orders found within the specified criteria.');
      }
    } catch (error) {
      console.error(error);
      // Handle the error and send an appropriate response
    }
  },
  pdfController:async(req,res)=>{
     const [orders, totalAmount, totalOrders] = await order.salereport(df, dt, status);
     console.log(orders);
    const pdfData = 
    {
      invoiceItems: [
          { item: 'Website Design', amount: 5000 },
          { item: 'Hosting (3 months)', amount: 2000 },
          { item: 'Domain (1 year)', amount: 1000 },
      ],
      invoiceData: {
          invoice_id: 123,
          transaction_id: 1234567,
          payment_method: 'Paypal',
          creation_date: orders.orderdate,
          total_amount: totalAmount,
      },
  }

  const htmlPDF = new PuppeteerHTMLPDF();
  htmlPDF.setOptions({ format: 'A4' }); 

  try {
      const html = await htmlPDF.readFile('views/admin/invoice.hbs', 'utf8');  
      const cssContent = await htmlPDF.readFile('public/stylesheets/invoice.css', 'utf8');
      const htmlWithStyles = `
      <style>
        ${cssContent}
      </style>
      ${html}
    `;
      const template = hbs.compile(htmlWithStyles);
      const content = template(pdfData);

      const pdfBuffer = await htmlPDF.create(content); 
      res.attachment('invoice.pdf')
      res.end(pdfBuffer);
  } catch (error) {
      console.log(error);
      res.send('Something went wrong.')
  }
  }
}


