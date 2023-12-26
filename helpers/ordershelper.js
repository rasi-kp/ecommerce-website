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
            { orderID: data },
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
    },
    updatequantity: async (orderid) => {
        const details = await order.findOne({ orderID: orderid }).populate('items.product').lean();
        const orderItems = details.items; // Assuming 'items' is an array of { product: productId, quantity }
        for (const orderItem of orderItems) {
            const productId = orderItem.product._id;
            const orderedQuantity = orderItem.quantity;
            await Product.findOneAndUpdate(
                { _id: productId },
                {
                    $inc: { qty: -orderedQuantity }
                },
                { new: true }
            );
        }
    },
    totalorderedcount: async () => {
        const result = await order.aggregate([
            {
                $unwind: '$items' // Flatten the items array
            },
            {
                $match: {
                     status: { $ne: 'Pending' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrderedQuantity: { $sum: '$items.quantity' },
                    totalOrderedAverage: { $avg: '$items.quantity' },
                    totalamount: { $sum: '$total' },
                    totalamountAvg: { $avg: '$total' }
                }
            }
        ]);
        // console.log(result);
        return result
    },
    totalproductcount: async () => {
        const result = await Product.aggregate([
            {
                $group: {
                    _id: null, 
                    totalqty: { $sum: '$qty' },
                }
            }
        ]);
        return result[0].totalqty
    },
    monthordercount: async () => {
        const orders = await order.find({ status: { $ne: 'Pending' } }).populate('items.product').sort({ orderdate: 1 })
        const monthlyOrders = {};
        orders.forEach(order => {
            const orderDate = new Date(order.orderdate);
            const yearMonth = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;

            if (!monthlyOrders[yearMonth]) {
                monthlyOrders[yearMonth] = 0;
            }
            monthlyOrders[yearMonth] += order.items.reduce((total, item) => total + item.quantity, 0);
        });
        const valuesOnly = Object.values(monthlyOrders);
        return valuesOnly
    },
    monthorderamount: async () => {
        const orders = await order.find({ status: { $ne: 'Pending' } }).populate('items.product').sort({ orderdate: 1 })
        const monthlyamount = {};
        orders.forEach(order => {
            const orderDate = new Date(order.orderdate);
            const yearMonth = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;

            if (!monthlyamount[yearMonth]) {
                monthlyamount[yearMonth] = 0;
            }
            monthlyamount[yearMonth] += order.total;
        });
        const valuesOnly = Object.values(monthlyamount);
        return valuesOnly
    },
    // **************** Get today's product Details ********************
    todayorderdetails: async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysOrders = await order.find({
            orderdate: {
                $gte: today, // Greater than or equal to today
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Less than tomorrow
            },
        });
        let totalQuantity = 0;
        let todayorder = 0;
        todaysOrders.forEach(order => {
            order.items.forEach(item => {
                totalQuantity += item.quantity;
            });
            todayorder += order.total; // Assuming 'total' is the property representing the total for each order
        });
        const result = [totalQuantity, todayorder];
        return result;
    },
}