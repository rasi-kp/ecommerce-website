const Razorpay = require('razorpay')

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

module.exports={
    //create payment instance
    payment: (orderID, amount) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: amount * 100,
                currency: "INR",
                receipt: orderID
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });
    },
}