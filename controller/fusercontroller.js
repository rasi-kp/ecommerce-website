var bcrypt = require('bcrypt')
const PuppeteerHTMLPDF = require('puppeteer-html-pdf');
var nodemailer = require('nodemailer');
const fs = require('fs');
const hbs = require('hbs')
const crypto = require('crypto')

const uhelper = require('../helpers/userhelper')
const user = require('../model/flutteruser')
const product = require('../helpers/producthelper')
const order = require('../helpers/ordershelper')
const home = require('../homepage/home')
const otp = require('../config/otp')
const razorpay = require('../config/razorpay')
const stripe = require('../config/stripe');
const coupen = require('../helpers/coupenhelper');

module.exports = {
    fhomepage: async (req, res) => {
        try {
            const currentuser = req.session.user;
            const loggedInUser = await user.findexistuser(currentuser.username);
            const count = await user.countmain(loggedInUser._id);
            const categorizedProducts = await home.mainpage();
            const allwishlist = await user.wishlist(loggedInUser._id);
            const wishlist = await allwishlist.items;

            res.status(200).json({
                categorizedProducts: categorizedProducts,
                username: loggedInUser.name,
                count: count,
                wishlist: wishlist
            });
        } catch (error) {
            console.error("Error in fhomepage:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    //*************** FLUTTER API ******************* */
    fsignUpUser: async (req, res) => {
        const generatedotp = await otp.generateOTP()
        const datas = {
            role: "user",
            email: req.body.email,
            name: req.body.name,
            phoneno: req.body.phoneno,
            password: req.body.password,
            verification: generatedotp,
        }
        const existuser = await user.findOne({ email: datas.email })
        if (existuser) {
            if (existuser.verification == "true") {
                return res.status(400).json({ error: "Email ID Already Exist" });
            }
            else {
                await user.deleteOne({ email: datas.email });
                const saltRounds = 10;
                const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
                datas.password = hashpassword
                await otp.sendOTPEmail(datas.email, generatedotp);
                const result = await user.create(datas)
                return res.status(200).json({ userid: result._id });
            }
        }
        else {
            const saltRounds = 10;
            const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
            datas.password = hashpassword
            await otp.sendOTPEmail(datas.email, generatedotp);
            const result = await user.create(datas)
            return res.status(200).json({ userid: result._id });
        }
    },
    //**************** Validation ************** */
    fvalidateotp: async (req, res) => {
        const result = await user.findOne({ _id: req.body.id })
        if ((req.body.otp) && (result)) {
            if (result.verification == req.body.otp) {
                await user.updateOne({ _id: req.body.id }, { $set: { verification: true } })
                await uhelper.gmail(result.email, result.name) //welcome mail
                return res.status(200).json({ message: 'OTP verification successful.' });
            }
            else {
                // await user.deleteOne({ _id: data });
                return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
            }
        }
        else {
            //   await user.deleteOne({ _id: data });
            res.status(422).json({ error: "Field can't be empty!" })
        }
    },
    //************************ FLUTTER API ******************* */
    fsignInUser: async (req, res) => {
        try {
            const usercheck = await user.findOne({ email: req.body.email })
            if (!usercheck) {
                return res.status(400).json({ error: "Invalid Email ID" });
            }
            else if (usercheck.verification !== "true") {

                return res.status(400).json({ error: "Email ID not verified" });
            }
            else {
                const passwordmatch = await bcrypt.compare(req.body.password, usercheck.password)
                if (passwordmatch) {
                    req.session.loggedIn = true;
                    req.session.user = req.body;
                    if (usercheck.role == 'admin') {
                        req.session.admin = true;
                        return res.json({ success: "admin" });
                    } else if (usercheck.status == "block") {
                        return res.status(400).json({ error: "Admin blocked" });
                    }
                    else
                        return res.json({ success: "success" });
                }
                else {
                    return res.status(400).json({ error: "Invalid password" });
                }
            }
        } catch {
            return res.status(500).json({ error: "Internal server error" });
        }
    },
}