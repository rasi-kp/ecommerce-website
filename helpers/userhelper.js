const user = require('../model/userschema');
const product = require('../helpers/producthelper')
const Product = require('../model/productschema')
const deleteuser = require('../model/deleteuser')
const cart = require('../model/cartschema')
const order = require('../model/orderschema')
const address = require('../model/addresshema')
const subscription = require('../model/subscribeschema')
const wishlist = require('../model/wishlistschema')
var nodemailer = require('nodemailer');


module.exports = {
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
    finduseremail: async (data) => {
        var result = await user.findOne({ email: data })
        return result;
    },
    blockuser: async (data) => {
        await user.updateOne({ _id: data }, { $set: { status: "block" } })
    },
    forgotpassword: async (email1, password1) => {
        await user.updateOne({ email: email1 }, { $set: { password: password1 } })
    },
    unblockuser: async (data) => {
        await user.updateOne({ _id: data }, { $unset: { status: 1 } })
    },
    verified: async (data) => {
        await user.updateOne({ _id: data }, { $set: { verification: true } })
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
    wishlist:async (user1) => {
        const result = await wishlist.findOne({ user: user1 }).populate('items.product').lean();;
        return result
    },
    addwishlist: async (id,user1) => {
        const existingWishlist = await wishlist.findOne({ user: user1 });
        if (existingWishlist) {
            const productexist = await wishlist.findOne({ user: user1,'items.product': id });
            if (productexist) {
                result = await wishlist.findOneAndUpdate(
                    { user: user1 },
                    { $pull: { items: { product: id } } },
                    { new: true }
                );
                return "remove"
            } else {
                result = await wishlist.findOneAndUpdate(
                    { user: user1 },
                    { $push: { items: { product: id } } },
                    { new: true }
                );
                return "add"
            }
        }
        else{
            result = await wishlist.insertMany({
                user: user1,
                items: [{ product: id }]
            });
            return "create";
        }
    },
    cartexist: async (data) => {
        const result = await cart.findOne({ user: data })
        return result
    },
    countmain: async (userid) => {
        const result = await cart.findOne({ user: userid })
        if (result) {
            const count = result.items.reduce((total, item) => total + item.quantity, 0);
            return count;
        }
    },
    countitems: async (userid) => {
        const result = await cart.findOne({ user: userid })
        if (result) {
            const count = result.items.reduce((total, item) => total + item.quantity, 0);
            return count;
        }
        else return 0
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
    productexist: async (data, userid) => {
        const result = await cart.findOne({ user: userid, 'items.product': data })
        return result
    },
    insertcart: async (userid, proid, cartItem) => {
        var price = await product.finddata(proid)

        var totprice = cartItem.quantity * price.price
        datas = {
            user: userid,
            items: [cartItem],
            totalPrice: totprice,
        }
        await cart.insertMany(datas)
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
        var totprice = data.quantity * price.price
        await cart.findOneAndUpdate(
            { user: userid },
            {
                $push: { items: data },
                $inc: { totalPrice: totprice }
            },
            { new: true }
        );
    },
    updatecart: async (userid, data) => {
        const productPrice = await product.finddata(data.product);

        const newTotalPrice = 1 * productPrice.price;
        const updatedCart = await cart.findOneAndUpdate(
            { user: userid, 'items.product': data.product },
            {
                $inc: { 'items.$.quantity': 1, totalPrice: newTotalPrice },
            },
            { new: true }
        );
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
        const updatecart = await cart.findOneAndUpdate(
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
        return updatecart
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
    gmail: async (email, name) => {
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
            subject: 'Welcome ' + name,
            text: 'Thank You for choosing "Ras shopping"!!!!! '
        };
        transporter.sendMail(mailOptions, function (error, info) {
        });
    },
    address: async (data) => {
        await address.insertMany(data)
        //add
    },
    existaddress: async (data) => {
        const existingAddress = await address.findOne({
            userID: data.userID,
            'addresses.name': data.addresses.name,
            'addresses.city': data.addresses.city,
            'addresses.pincode': data.addresses.pincode,
        });
        return existingAddress
    },
    addresstake: async (id) => {
        const result = address.find({ userID: id }).lean()
        return result
    },
    pagination: async (skip, pageSize) => {
        const categorizedProducts = await Product.find().skip(skip).limit(pageSize).lean();
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / pageSize);
        return {
            categorizedProducts,
            totalPages
        };
    }
};
