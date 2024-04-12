var bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const PuppeteerHTMLPDF = require('puppeteer-html-pdf');
var nodemailer = require('nodemailer');
const fs = require('fs');
const hbs = require('hbs')
const crypto = require('crypto')

const uhelper = require('../helpers/userhelper')
const user = require('../model/flutteruser')
const cart = require('../model/fluttercaerscema')
const banner = require("../model/bannerschema")
const product = require('../model/productschema')
const wishlist = require("../model/wishlistschema")
const order = require("../model/orderschema")
const razorpay = require('../config/razorpay')
const home = require('../homepage/home')
const otp = require('../config/otp')

module.exports = {
    //homepage only pass 
    fhomepage: async (req, res) => {
        try {

            const currentuser = req.user.email;
            const loggedInUser = await user.findOne({ email: currentuser });
            // const count = await user.countmain(loggedInUser._id);
            const categorizedProducts = await home.fmainpage();

            // const allwishlist = await user.wishlist(loggedInUser._id);
            // const wishlist = await allwishlist.items;
            res.status(200).json({
                success: "success",
                categorizedProducts: categorizedProducts,
                username: loggedInUser.name,
                count: 0,
                wishlist: "Empty"
            });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    },
    banner: async (req, res) => {
        const result = await banner.find({})
        return res.status(200).json({ banner: result });
    },
    //*************** FLUTTER API ******************* */
    fsignUpUser: async (req, res) => {
        const otpExpiryTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        const generatedotp = await otp.generateOTP();
        const otpExpiry = Date.now() + otpExpiryTime; // Calculate OTP expiry time
        const datas = {
            role: "user",
            email: req.body.email,
            name: req.body.name,
            phoneno: req.body.phoneno,
            password: req.body.password,
            verification: {
                code: generatedotp,
                expiry: otpExpiry
            },
        }
        const existuser = await user.findOne({ email: datas.email })
        if (existuser) {
            if (existuser.isverified == true) {
                return res.status(400).json({ error: "Email ID Already Exist" });
            }
            else {
                await user.deleteOne({ email: datas.email });
                const saltRounds = 10;
                const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
                datas.password = hashpassword
                await otp.sendOTPEmail(datas.email, generatedotp);
                const result = await user.create(datas)
                return res.status(200).json({ success: true, userid: result._id });
            }
        }
        else {
            const saltRounds = 10;
            const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
            datas.password = hashpassword
            await otp.sendOTPEmail(datas.email, generatedotp);
            const result = await user.create(datas)
            return res.status(200).json({ success: true, userid: result._id });
        }
    },
    //**************** Validation ************** */
    fvalidateotp: async (req, res) => {
        const result = await user.findOne({ _id: req.body.id })
        if ((req.body.otp) && (result)) {
            const storedOTP = result.verification;
            // Check if OTP is expired
            if (storedOTP.expiry < Date.now()) {
                return res.status(400).json({ error: "error", message: 'OTP has expired. Please request a new one.' });
            }
            else if (storedOTP.code == req.body.otp) {
                await user.updateOne({ _id: req.body.id }, { $set: { isverified: true } })
                await uhelper.gmail(result.email, result.name) //welcome mail
                return res.status(200).json({ success: "success", message: 'OTP verification successful.' });
            }
            else {
                return res.status(400).json({ error: "error", message: 'Invalid OTP. Please try again.' });
            }
        }
        else {
            res.status(422).json({ error: "Field can't be empty!" })
        }
    },
    //************************ FLUTTER API ******************* */
    fsignInUser: async (req, res) => {
        try {
            const usercheck = await user.findOne({ email: req.body.email })
            if (!usercheck) {
                return res.status(400).json({ error: "Invalid Email ID", login: false });
            }
            else if (usercheck.isverified != true) {
                return res.status(400).json({ error: "Email ID not verified,Again Signup", login: false });
            }
            else {
                const passwordmatch = await bcrypt.compare(req.body.password, usercheck.password)
                if (passwordmatch) {
                    const token = jwt.sign({ email: usercheck.email }, process.env.JWT_KEY_SECRET, { expiresIn: '30d' });
                    if (usercheck.role == 'admin')
                        return res.status(200).json({ token, success: "admin", login: true });
                    else
                        return res.status(200).json({ token, success: "success", login: true, user_name: usercheck.name });
                }
                else {
                    return res.status(400).json({ error: "Invalid password", login: false });
                }
            }
        } catch {
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    edituser: async (req, res) => {
        const currentuser = req.user.email;
        const result = await user.findOne({ email: currentuser });
        return res.status(200).json({ success: "success", data: result });
    },
    edituserpost: async (req, res) => {
        const currentuser = req.user.email;
        if (req.file) {
            req.body.image = req.file.filename;
        }
        try {
            const result = await user.updateOne({ email: currentuser }, { $set: req.body });
            return res.status(200).json({ success: "success", message: "successfully update profile" });
        } catch {
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    cartid: async (req, res) => {
        var cartqty = 0
        const proid = req.params.id;
        const currentuser = req.user.email;
        if (currentuser) {
            try {
                const userid = await user.findOne({ email: currentuser });
                const cart1 = await cart.findOne({ user: userid._id })
                const productexist = await cart.findOne({ user: userid._id, 'items.product': proid })
                if (productexist) {
                    var foundItem = productexist.items.find(item => item.product.toString() === proid);
                    var cartqty = foundItem.quantity
                }
                var productqty = await product.findOne({ _id: proid });
                if (productqty.qty > cartqty) {
                    const quantity = req.query.quantity || 1;
                    const size = req.query.size || 'medium';
                    const cartItem = {
                        product: proid,
                        quantity: quantity,
                        size: size,
                    };
                    var count = 0;
                    const result = await cart.findOne({ user: userid._id })
                    if (result) {
                        count = result.items.reduce((total, item) => total + item.quantity, 0);
                    }
                    if (cart1) {
                        if (productexist) {
                            var productPrice = await product.findOne({ _id: cartItem.product }).lean();
                            const newTotalPrice = 1 * productPrice.price;
                            await cart.findOneAndUpdate(
                                { user: userid._id, 'items.product': cartItem.product },
                                {
                                    $inc: { 'items.$.quantity': 1, totalPrice: newTotalPrice },
                                },
                                { new: true }
                            );
                            return res.status(200).json({ success: "success", count: count + 1 });
                        }
                        else {
                            var price = await product.findOne({ _id: cartItem.product }).lean();
                            var totprice = cartItem.quantity * price.price
                            await cart.findOneAndUpdate(
                                { user: userid._id },
                                {
                                    $push: { items: cartItem },
                                    $inc: { totalPrice: totprice }
                                },
                                { new: true }
                            );
                            return res.status(200).json({ success: "success", count: count + 1 });
                        }
                    }
                    else {
                        var price = await product.findOne({ _id: proid }).lean();
                        var totprice = cartItem.quantity * price.price
                        datas = {
                            user: userid._id,
                            items: [cartItem],
                            totalPrice: totprice,
                        }
                        await cart.insertMany(datas)
                        return res.status(200).json({ success: "success", count: count + 1 });
                    }
                } else {
                    var count = false
                    return res.status(200).json({ success: "success", count: "Out of Stock", value: count });
                }
            } catch {
                console.log("any error accoured");
            }

        } else {

        }
    },
    cart: async (req, res) => {
        const currentuser = req.user.email;
        const userid = await user.findOne({ email: currentuser });
        const data = await cart.findOne({ user: userid._id }).populate('items.product').lean()
        if (data) {
            var count = data.items.length
            total = data.totalPrice + 40
            return res.status(200).json({ success: "success", data, count, total });
        } else {
            return res.status(200).json({ success: "cart in Empty", });
        }
    },
    deletecart: async (req, res) => {
        const proid = req.params.id
        const currentuser = req.user.email;
        var userid = await user.findOne({ email: currentuser }).lean()
        // const cart = await user.deletecart(userid._id, proid);
        // const productPrice = await product.finddata(data);
        var productPrice = await product.findOne({ _id: proid }).lean();
        const currentCartItem = await cart.findOne(
            { user: userid._id, 'items.product': proid },
            { items: { $elemMatch: { product: proid } } }
        );
        const quantity = currentCartItem.items[0].quantity;
        const totprice = quantity * productPrice.price
        const cart1 = await cart.findOneAndUpdate(
            { user: userid._id },
            {
                $pull: { items: { product: proid } },
                $inc: { totalPrice: -totprice }
            },
            { new: true }
        );
        const result = await cart.findOne({ user: userid._id })
        if (result.items.length == 0) {
            await cart.findOneAndDelete({ user: userid._id });
        }
        // const count1 = await user.count(userid._id)
        var count2 = await cart.findOne({ user: userid._id })
        if (count2) {
            count1 = count2.items.length
        }
        const response = {
            count: count1 || 0,
            totalPrice: cart1.totalPrice
        };
        return res.status(200).json(response);
    },
    quantityadd: async (req, res) => {
        const proid = req.params.id;
        const currentuser = req.user.email;
        var userid = await user.findOne({ email: currentuser }).lean()
        const currentCartItem = await cart.findOne(
            { user: userid._id, 'items.product': proid },
            { items: { $elemMatch: { product: proid } } }
        );
        const quantity = currentCartItem.items[0].quantity - 1;
        const productexist = await cart.findOne({ user: userid._id, 'items.product': proid })
        if (productexist) {
            var foundItem = productexist.items.find(item => item.product.toString() === proid);
            var cartqty = foundItem.quantity
        }
        var productqty = await product.findOne({ _id: proid }).lean();
        if (productqty.qty > cartqty) {
            var productPrice = await product.findOne({ _id: proid }).lean();
            const newTotalPrice = 1 * productPrice.price;
            const cart1 = await cart.findOneAndUpdate(
                { user: userid._id, 'items.product': proid },
                {
                    $inc: { 'items.$.quantity': 1, totalPrice: newTotalPrice },
                },
                { new: true }
            );
            const response = {
                quantity: quantity + 2,
                totalPrice: cart1.totalPrice
            };
            return res.status(200).json(response);
        } else {
            return res.status(200).json({ message: "Out of stock" });
        }
    },
    quantityminus: async (req, res) => {
        const proid = req.params.id;
        const currentuser = req.user.email;
        var userid = await user.findOne({ email: currentuser }).lean()
        const currentCartItem = await cart.findOne(
            { user: userid, 'items.product': proid },
            { items: { $elemMatch: { product: proid } } }
        );
        const quantity = currentCartItem.items[0].quantity - 1;
        if (quantity > 0) {
            var productPrice = await product.findOne({ _id: proid }).lean();
            const newTotalPrice = 1 * productPrice.price;
            const updatedCart = await cart.findOneAndUpdate(
                { user: userid._id, 'items.product': proid },
                {
                    $inc: { 'items.$.quantity': -1, totalPrice: -newTotalPrice },
                },
                { new: true }
            );
            const response = {
                quantity: quantity,
                totalPrice: updatedCart.totalPrice
            };
            return res.status(200).json(response);
        } else {
            return res.status(200).json({ message: "quantity not less than 1" });
        }
    },
    wishlist: async (req, res) => {
        var proid = req.params.id
        const currentuser = req.user.email;
        var userid = await user.findOne({ email: currentuser }).lean()
        const existingWishlist = await wishlist.findOne({ user: userid._id });
        if (existingWishlist) {
            const productexist = await wishlist.findOne({ user: userid._id, 'items.product': proid });
            if (productexist) {
                result = await wishlist.findOneAndUpdate(
                    { user: userid._id },
                    { $pull: { items: { product: proid } } },
                    { new: true }
                );
                return res.status(200).json({ message: "remove" });
            } else {
                result = await wishlist.findOneAndUpdate(
                    { user: userid._id },
                    { $push: { items: { product: proid } } },
                    { new: true }
                );
                return res.status(200).json({ message: "add" });
            }
        }
        else {
            result = await wishlist.insertMany({
                user: userid._id,
                items: [{ product: proid }]
            });
            return res.status(200).json({ message: "add" });
        }
    },
    wishlists: async (req, res) => {
        const currentuser = req.user.email;
        var userid = await user.findOne({ email: currentuser })
        const allwishlist = await wishlist.findOne({ user: userid._id }).populate('items.product').lean();;
        if (allwishlist) {
            return res.status(200).json({ wishlist: allwishlist.items });
        }
        else {
            return res.status(200).json({ wishlist: "Empty" });
        }
    },
    checkout: async (req, res) => {
        const currentuser = req.user.email;
        var userid = await user.findOne({ email: currentuser })
        const count1 = await cart.findOne({ user: userid })
        if (count1) {
            var count = count1.items.length
        }
        if (count) {
            const data = await cart.findOne({ user: userid._id }).populate('items.product').lean();
            // const address1 = address.find({ userID: userid._id }).lean()
            // console.log(address1);
            // if (address1 != '') {
            //     var addresss = address1[0].addresses
            // }
            total = data.totalPrice + 40
            return res.status(200).json({ cart: data, totalamount: total, count: count });
        } else {
            return res.status(200).json({ error: "cart is empty", });
        }
    },
    placeorder: async (req, res) => {
        const currentuser = req.user.email;
        var userid = await user.findOne({ email: currentuser })
        const result = await cart.findOne({ user: userid._id }).populate('items.product').lean();
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        orderID = `ORD-${timestamp}-${randomNum}`;
        if (result) {
            const orders = {
                orderID: orderID,
                orderdate: new Date(),
                email: currentuser,
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
                var order1 = await razorpay.payment(orderID, orders.totalamount);
            }
            await order.insertMany(orders)
            return res.status(200).json({ success: "order creation success", });
        } else {
            return res.status(200).json({ error: "cart empty", });
        }
    },
    paymentverify: async (req, res) => {
        const currentuser = req.user.email;
        var userid = await user.findOne({ email: currentuser })
        if (req.body.paymentId && req.body.orderId && req.body.signature) {
            var paymentId = req.body.paymentId;
            var orderId = req.body.orderId;
            var signature = req.body.signature;
            var orderID = req.body.orderID
            var hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
            hmac.update(orderId + '|' + paymentId);
            hmachex = hmac.digest('hex')
        } else {
            return res.status(200).json({ error: "Field is Empty", });
        }
        if (hmachex == signature) {
            // await order.placed(orderID, paymentId)
            await order.findOneAndUpdate(
                { orderID: orderID },
                {
                    $set: { status: "placed", paymentID: paymentID }
                },
                { new: true }
            );
            // await order.updatequantity(orderID)
            const details = await order.findOne({ orderID: orderID }).populate('items.product').lean();
            const orderItems = details.items;
            for (const orderItem of orderItems) {
                const productId = orderItem.product._id;
                const orderedQuantity = orderItem.quantity;
                await Product.findOneAndUpdate(
                    { _id: productId },
                    {
                        $inc: { qty: -orderedQuantity }
                    },
                    { new: true }
                );
            }
            await cart.findOneAndDelete({ user: userid });
            //Create Invoice
            // const result = await order.invoice(orderID)
            const result = await order.findOne({ orderID: orderid }).populate('items.product').lean();
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
            return res.status(200).json({ success: "Payment Success", });
        }
        else {
            return res.status(400).json({ error: "Payment Failed", });
        }
    },
    search: async (req, res) => {
        const { query } = req.query;
        var searchitems = await home.search(query);
        return res.status(200).json({ searchitems: searchitems });
    },
    shop: async (req, res) => {
        const page = parseInt(req.params.page) || 1;
        const pageSize = 6;
        const skip = (page - 1) * pageSize;
        // const { categorizedProducts, totalPages } = await user.pagination(skip, pageSize);
        const pagination = await product.find().skip(skip).limit(pageSize).lean();
        const totalProducts = await product.countDocuments();
        const totalPages = Math.ceil(totalProducts / pageSize);
        // const currentuser = req.user.email;
        // if (currentuser) {
        //     const userid = await user.findOne({ email: currentuser });
        //     const result = await cart.findOne({ user: userid._id })
        //     if (result) {
        //         var count = result.items.reduce((total, item) => total + item.quantity, 0);
        //     }
        //     else count=0
        //     return res.status(200).json({ product: pagination,totalPages:totalPages,currentPage: page ,pages: Array.from({ length: totalPages }, (_, i) => i + 1), });
        // }
        return res.status(200).json({ product: pagination, totalPages: totalPages, currentPage: page, pages: Array.from({ length: totalPages }, (_, i) => i + 1), });
    },
    orders: async (req, res) => {
        const currentuser = req.user.email;
        const result = await order.find({ email: currentuser }).sort({ orderdate: -1 }).populate('items.product').lean();
        return res.status(200).json({ order: result });
    },
    invoice: async (req, res) => {
        const orderID = req.params.id
        const result = await order.findOne({ orderID: orderID }).populate('items.product').lean();
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
        // res.attachment(orderID + '.pdf')
        // res.end(pdfBuffer);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${orderID}.pdf`);
        res.send(pdfBuffer);
    },
}