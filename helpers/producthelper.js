const Product = require('../model/productschema')
const cart = require('../model/cartschema')
const banner=require('../model/bannerschema')
module.exports = {

    finddata: async (data) => {
        var result = await Product.findOne({ _id: data }).lean();
        return result
    },
    insertdata: async (data) => {
        var result = await Product.insertMany(data);
        return result;
    },
    allproducts: async (data) => {
        var result = await Product.find({}).lean();
        return result
    },
    allproductspagination: async (data) => {
        var result = await Product.find({}).limit(9).lean();
        return result
    },
    allproducts2: async (data) => {
        var result = await Product.find({}).skip(9).limit(9).lean();
        return result
    },
    allproducts3: async (data) => {
        var result = await Product.find({}).skip(18).limit(9);
        return result
    },
    deleteproduct: async (data) => {
        await Product.deleteOne({ _id: data });
    },
    addcart: async (req, res) => {
        await cart.insertOne()
    },
    search: async (search) => {
        const data = await Product.find({ name: new RegExp(`^${search}`, 'i') }).lean()
        return data
    },
    editproduct: async (data, proid) => {
        const result = await Product.updateOne({ _id: proid }, {
            $set:
            {
                name: data.name,
                image: data.image,
                description: data.description,
                price: data.price,
                category: data.category,
                qty: data.qty,
            }
        });
    },
    category:async(data)=>{
        const category=await Product.find({category:data}).lean()
        return category
    },
    showbanner:async(data)=>{
        const result=await banner.find({}).lean()
        return result
    },
}