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
    verification:String,
    dateCreated:{
        type:Date,
        default: Date.now()
    }
})
const signupdata = new mongoose.model("flutterusers", signup)

module.exports = signupdata;
