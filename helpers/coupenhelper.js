const coupen=require('../model/coupenschema')

module.exports={
    addcoupen:async(data)=>{
        await coupen.insertMany(data)
    },
    showcoupen:async()=>{
        const result=await coupen.find({}).lean()
        return result
    },
}