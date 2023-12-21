const mongoose=require('mongoose')

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    image: String,
    description: String,
    price: {
        type: Number,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    category: String,
});

const productdata=new mongoose.model('products',productSchema)

module.exports=productdata;