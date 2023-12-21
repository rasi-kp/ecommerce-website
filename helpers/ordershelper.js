const user = require('../model/userschema');
const Product = require('../model/productschema')
const cart = require('../model/cartschema')
const order = require('../model/orderschema')
module.exports = {

    orders: async (req, res) => {
        const result = await order.find({}).sort({ orderdate: -1 }).lean()
        return result
    },
    findorderid: async (data) => {
        // const result = await order.findOne({ _id: data }).lean()
        // return result
        try {
            const result = await order.findOne({ _id: data }).populate('items.product').lean();
            return result;
        } catch (error) {
            console.error('Error in findOrderId:');
          
        }
    },
    placed: async (data) => {
        await order.findOneAndUpdate(
            { orderID:data },
            {
                $set: { status: "placed" }
            },
            { new: true }
        );
    },
    confirm: async (data) => {
        await order.findOneAndUpdate(
            { _id: data },
            {
                $set: { status: "confirm" }
            },
            { new: true }
        );
    },
    shipped: async (data) => {
        await order.findOneAndUpdate(
            { _id: data },
            {
                $set: { status: "Shipped" }
            },
            { new: true }
        );
    },
    delivered: async (data) => {
        await order.findOneAndUpdate(
            { _id: data },
            {
                $set: { status: "Delivered" }
            },
            { new: true }
        );
    }
}