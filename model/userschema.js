const mongoose=require('mongoose')

const signup = new mongoose.Schema({
    role: String,
    login: String,
    image: String,
    name: {
        type: String,
        required: true
    },
    username: {
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
    gender: String,
    address: String,
    password: {
        type: String,
    },
    verification:String,
})
const signupdata = new mongoose.model("users", signup)


module.exports = signupdata;
