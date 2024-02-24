const mongoose=require('mongoose')

const signup = new mongoose.Schema({
    role: String,
    login: String,
    image: String,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneno: {
        type: Number
    },
    password: {
        type: String,
        required: true
    },
    verification: {
        code: {
            type: String,
        },
        expiry: {
            type: Date,
        }
    },
    isverified:{
        type:Boolean,
        default:false
    },
    dateCreated:{
        type:Date,
        default: Date.now()
    },
    image:String
})
const signupdata = new mongoose.model("flutterusers", signup)

module.exports = signupdata;
