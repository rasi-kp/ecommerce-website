const mongoose=require('mongoose')

const email = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
})
const emaildata = new mongoose.model("emails", email)



module.exports=emaildata;
