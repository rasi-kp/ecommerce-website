const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const payment= async(req,res)=>{
    try {
        // Create a SetupIntent to attach the PaymentMethod to the Customer
        const setupIntent = await stripe.setupIntents.create({
            payment_method: req.body.stripeToken,
            customer: null, 
            usage: 'off_session', 
        });
        // Create a Customer and attach the PaymentMethod using the SetupIntent
        const customer = await stripe.customers.create({
            email: req.body.stripeEmail,
            setup_future_usage: 'off_session',
            payment_method: setupIntent.payment_method,
            payment_method: req.body.stripeToken,
            confirmation_method: 'manual',
            confirm: true,
            description: req.body.productName,
        });
        await stripe.setupIntents.confirm(setupIntent.id);
        // Now you can use the Customer and PaymentMethod for future payments
        const charge = await stripe.charges.create({
            amount: req.body.amount * 100, 
            description: req.body.productName,
            currency: 'INR',
            customer: customer.id,
        });
        console.log(charge);
        res.redirect("/users/success");
    } catch (error) {
        console.error(error.message);
        res.send("<h1>Your Payment has been failed!</h1>")
    }
}
module.exports = {
  payment,
};
