const user = require('../helpers/userhelper')
const coupen=require('../model/coupenschema')

module.exports={
    addcoupen:async(data)=>{
        await coupen.insertMany(data)
    },
    showcoupen:async(userId)=>{
        const cart=await user.getitemscart(userId);
        const result = await coupen.find({
            isActive:true,
            minPriceRange: { $lte: cart.totalPrice },
            maxPriceRange: { $gte: cart.totalPrice },
        }).lean();
        return result
    },
    showcoupenadmin:async()=>{
        const result = await coupen.find({}).lean();
        return result
    },
}