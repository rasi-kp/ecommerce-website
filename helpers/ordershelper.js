const user = require('../model/userschema');
const Product = require('../model/productschema')
const cart = require('../model/cartschema')
const order = require('../model/orderschema')
module.exports = {

    orders: async (req, res) => {
        const result = await order.find({ name: { $ne: null } }).sort({ orderdate: -1 }).lean()
        return result
    },
    findorderid: async (data) => {
        try {
            const result = await order.findOne({ _id: data }).populate('items.product').lean();
            return result;
        } catch (error) {
            console.error('Error in findOrderId:');
        }
    },
    placed: async (data, payment) => {
        await order.findOneAndUpdate(
            { orderID: data },
            {
                $set: { status: "placed", paymentID: payment }
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
    cancelled: async (data) => {
        await order.findOneAndUpdate(
            { _id: data },
            {
                $set: { status: "Cancelled" }
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
    invoice: async (orderid) => {
        const details = await order.findOne({ orderID: orderid }).populate('items.product').lean();
        return details
    },
    totalorderedcount: async () => {
        const result = await order.aggregate([
            {
                $match: {
                    status: { $ne: ['Pending', 'Cancelled'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrderedQuantity: { $sum: { $sum: '$items.quantity' } },
                    totalOrderedAverage: { $avg: { $sum: '$items.quantity' } },
                    totalamount: { $sum: '$total' },
                    totalamountAvg: { $avg: '$total' }
                }
            }
        ]);
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
        const orders = await order.find({ status: { $nin: ['Pending', 'Cancelled'] } }).populate('items.product').sort({ orderdate: 1 })
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
        const orders = await order.find({ status: { $nin: ['Pending', 'Cancelled'] } }).populate('items.product').sort({ orderdate: 1 })
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
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Less than tomorrow
            },
        });
        let totalQuantity = 0;
        let todayorder = 0;
        todaysOrders.forEach(order => {
            order.items.forEach(item => {
                totalQuantity += item.quantity;
            });
            todayorder += order.total;
        });
        const result = [totalQuantity, todayorder];
        return result;
    },
    salereport: async (df, dt, status) => {
        const fromdate = new Date(`${df}T00:00:00.000Z`);
        const todate = new Date(`${dt}T23:59:59.999Z`);

        const orders = await order.find({
            orderdate: { $gte: fromdate, $lte: todate },
            status: { $in: status }
        }).populate('items.product').lean();
        const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const categoryCount = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const categoryName = item.product.category;
                categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
            });
        });
        const categorycount = Object.values(categoryCount);
        const categoryTotalAmount = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const categoryName = item.product.category;
                const itemTotal = item.quantity * item.product.price;
                categoryTotalAmount[categoryName] = (categoryTotalAmount[categoryName] || 0) + itemTotal;
            });
        });
        const categoryamount = Object.values(categoryTotalAmount);
        const result = [orders, totalAmount, totalOrders, categorycount, categoryamount];
        return result
    }
}