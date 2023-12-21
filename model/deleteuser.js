const mongoose=require('mongoose')

const delete1 = new mongoose.Schema({
    role: String,
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
        type: Number,
        required: true
    },
    gender: String,
    address: String,
    password: {
        type: String,
        required: true
    }
})
const deletedata = new mongoose.model("delete", delete1)



module.exports=deletedata;
