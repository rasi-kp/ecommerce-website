var bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const uhelper = require('../helpers/userhelper')
const user = require('../model/flutteruser')
const product = require('../helpers/producthelper')
const home = require('../homepage/home')
const otp = require('../config/otp')

module.exports = {
    fhomepage: async (req, res) => {
        try {
            const currentuser = req.user.email;
            const loggedInUser = await user.findOne({ email: currentuser });
            // const count = await user.countmain(loggedInUser._id);
            const categorizedProducts = await home.mainpage();
            // const allwishlist = await user.wishlist(loggedInUser._id);
            // const wishlist = await allwishlist.items;
            res.status(200).json({
                success:"success",
                categorizedProducts: categorizedProducts,
                username: loggedInUser.name,
                count: 0,
                wishlist: "Empty"
            });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
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
                return res.status(200).json({ userid: result._id });
            }
        }
        else {
            const saltRounds = 10;
            const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
            datas.password = hashpassword
            await otp.sendOTPEmail(datas.email, generatedotp);
            const result = await user.create(datas)
            return res.status(200).json({success:true, userid: result._id });
        }
    },
    //**************** Validation ************** */
    fvalidateotp: async (req, res) => {
        const result = await user.findOne({ _id: req.body.id })
        if ((req.body.otp) && (result)) {
            const storedOTP = result.verification;
            // Check if OTP is expired
            if (storedOTP.expiry < Date.now()) {
                return res.status(400).json({error:"error", message: 'OTP has expired. Please request a new one.' });
            }
            else if (storedOTP.code == req.body.otp) {
                await user.updateOne({ _id: req.body.id }, { $set: { isverified: true } })
                await uhelper.gmail(result.email, result.name) //welcome mail
                return res.status(200).json({success:"success", message: 'OTP verification successful.' });
            }
            else {
                return res.status(400).json({error:"error", message: 'Invalid OTP. Please try again.' });
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
                return res.status(400).json({ error: "Invalid Email ID" ,login:false});
            }
            else if (usercheck.isverified != true) {
                return res.status(400).json({ error: "Email ID not verified,Again Signup",login:false});
            }
            else {
                const passwordmatch = await bcrypt.compare(req.body.password, usercheck.password)
                if (passwordmatch) {
                    const token = jwt.sign({ email: usercheck.email}, process.env.JWT_KEY_SECRET , { expiresIn: '30d' });
                    if (usercheck.role == 'admin')
                        return res.status(200).json({ token, success: "admin",login:true});
                    else
                        return res.status(200).json({ token, success: "success", login:true, user_name:usercheck.name});
                }
                else {
                    return res.status(400).json({ error: "Invalid password",login:false});
                }
            }
        } catch {
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    edituser:async(req,res)=>{
        const currentuser = req.user.email;
        const result = await user.findOne({ email: currentuser });
        return res.status(200).json({success:"success", data: result });
    },
    edituserpost:async(req,res)=>{
        const currentuser = req.user.email;
        if(req.file){
            req.body.image=req.file.filename;
        }
        try{
            const result=await user.updateOne({ email: currentuser }, { $set: req.body});
            return res.status(200).json({success:"success", message:"successfully update profile" });
        }catch{
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}