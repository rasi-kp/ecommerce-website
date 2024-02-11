const user = require('../helpers/userhelper')
const coupen=require('../model/coupenschema')

module.exports={
    addcoupen:async(data)=>{
        await coupen.insertMany(data)
    },
    showcoupen:async(userId)=>{
        const cart=await user.getitemscart(userId);
        const result = await coupen.findOne({
            minPriceRange: { $lte: cart.totalPrice },
            maxPriceRange: { $gte: cart.totalPrice },
        });
        console.log(result);
        return result
    },
}