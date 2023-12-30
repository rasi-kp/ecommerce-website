const user = require('../model/userschema');
const product = require('../helpers/producthelper')
const Product = require('../model/productschema')
const deleteuser = require('../model/deleteuser')
const cart = require('../model/cartschema')
const order = require('../model/orderschema')
const subscription = require('../model/subscribeschema')
const Razorpay = require('razorpay')
const wishlist = require('../model/wishlistschema')
var nodemailer = require('nodemailer');

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});
module.exports = {
    //create payment instance
    payment: (orderID, amount) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: amount * 100,
                currency: "INR",
                receipt: orderID
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });
    },
    insert: async (data) => {
        const result = await user.insertMany(data);
        return result;
    },
    insertdelete: async (data) => {
        const result = await deleteuser.insertMany(data);
        return result;
    },
    delete: async (data) => {
        await user.deleteOne({ _id: data });
    },
    finduser: async (data) => {
        var result = await user.find({}).lean();
        return result;
    },
    searchuser: async (data) => {
        var result = await user.find({ name: new RegExp(`^${data}`, 'i') }).lean();
        return result;
    },
    findexistuser: async (data) => {
        var result = await user.findOne({ username: data }).lean()
        return result;
    },
    findedituserbyid: async (data) => {
        var result = await user.findOne({ _id: data }).lean()
        return result;
    },
    finduserid: async (data) => {
        var result = await user.findOne({ _id: data })
        return result;
    },
    blockuser: async (data) => {
        await user.updateOne({ _id: data }, { $set: { status: "block" } })
    },
    unblockuser: async (data) => {
        await user.updateOne({ _id: data }, { $unset: { status: 1 } })
    },
    edituser: async (data, proid) => {
        const result = await user.updateOne({ _id: proid }, {
            $set:
            {
                username: data.username,
                email: data.email,
                name: data.name,
                phoneno: data.phoneno,
                gender: data.gender,
                address: data.address,
            }
        });
        return result;
    },
    moredata: async (req, res) => {
        const proid = req.params.id;
    },
    cartexist: async (data) => {
        const result = await cart.findOne({ user: data })
        return result
    },
    countitems: async (userid) => {
        const result = await cart.findOne({ user: userid })
        if (result) {
            const count = result.items.reduce((total, item) => total + item.quantity, 0);
            return count;
        }
    },
    count: async (userid) => {
        const result = await cart.findOne({ user: userid })
        if (result) {
            const count = result.items.length
            return count;
        }
        else {
            return 0
        }

    },
    quantity: async (userid, data) => {
        const result = await Product.findOne({ _id: data });
        const currentCartItem = await cart.findOne(
            { user: userid, 'items.product': data },
            { items: { $elemMatch: { product: data } } }
        );
        const quantity = currentCartItem.items[0].quantity - 1;
        return quantity
    },
    productexist: async (data) => {
        const result = await cart.findOne({ 'items.product': data })
        return result
    },
    insertcart: async (userid, proid, cartItem) => {
        var price = await product.finddata(proid)
        if (price.qty > 0) {
            var totprice = cartItem.quantity * price.price
            datas = {
                user: userid,
                items: [cartItem],
                totalPrice: totprice,
            }
            await cart.insertMany(datas)
        } else {
            return false
        }

    },
    quantityadd: async (userid, data) => {
        const productPrice = await product.finddata(data);
        const newTotalPrice = 1 * productPrice.price;
        const updatedCart = await cart.findOneAndUpdate(
            { user: userid, 'items.product': data },
            {
                $inc: { 'items.$.quantity': 1, totalPrice: newTotalPrice },
            },
            { new: true }
        );
        return updatedCart
    },
    quantityminus: async (userid, data) => {
        const productPrice = await product.finddata(data);
        const newTotalPrice = 1 * productPrice.price;
        const updatedCart = await cart.findOneAndUpdate(
            { user: userid, 'items.product': data },
            {
                $inc: { 'items.$.quantity': -1, totalPrice: -newTotalPrice },
            },
            { new: true }
        );
        return updatedCart
    },
    pushitems: async (userid, data) => {
        var price = await product.finddata(data.product)
        if (price.qty > 0) {
            var totprice = data.quantity * price.price
            const updatedCart = await cart.findOneAndUpdate(
                { user: userid },
                {
                    $push: { items: data },
                    $inc: { totalPrice: totprice }
                },
                { new: true }
            );
        } else {
            return false
        }
    },
    updatecart: async (userid, data) => {
        const productPrice = await product.finddata(data.product);
        console.log("check   " + productPrice.qty);
        if (productPrice.qty > 0) {
            const newTotalPrice = 1 * productPrice.price;
            const updatedCart = await cart.findOneAndUpdate(
                { user: userid, 'items.product': data.product },
                {
                    $inc: { 'items.$.quantity': 1, totalPrice: newTotalPrice },
                },
                { new: true }
            );
        } else {
            return false
        }

    },
    getitemscart: async (data) => {
        const result = await cart.findOne({ user: data }).populate('items.product').lean();
        return result
    },
    deletecart: async (userid, data) => {
        const productPrice = await product.finddata(data);
        const currentCartItem = await cart.findOne(
            { user: userid, 'items.product': data },
            { items: { $elemMatch: { product: data } } }
        );
        const quantity = currentCartItem.items[0].quantity;
        const totprice = quantity * productPrice.price
        await cart.findOneAndUpdate(
            { user: userid },
            {
                $pull: { items: { product: data } },
                $inc: { totalPrice: -totprice }
            },
            { new: true }
        );
        const result = await cart.findOne({ user: userid })
        if (result.items.length == 0) {
            await cart.findOneAndDelete({ user: userid });
        }
    },
    orders: async (data) => {
        const result = await order.insertMany(data)
    },
    ordersfind: async (data) => {
        const result = await order.find({ username: data }).sort({ orderdate: -1 }).populate('items.product').lean();
        return result
    },
    deletecartoredered: async (userid) => {
        await cart.findOneAndDelete({ user: userid });
    },
    updatepassword: async (user1, data) => {
        await user.findOneAndUpdate({ username: user1 }, {
            $set: { password: data }
        })
    },
    subscribe: async (data) => {
        await subscription.insertMany(data)
    },
    gmail: async (email,name) => {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS,
            }
        });
        var mailOptions = {
            from: 'rasir239@gmail.com',
            to: email,
            subject: 'Welcome '+ name,
            text: 'Thank You for choosing "Ras shopping"!!!!! '
        };

        transporter.sendMail(mailOptions, function (error, info) {
        });
    },
};
