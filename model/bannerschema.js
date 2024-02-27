const mongoose=require('mongoose')

const BannerSchema = new mongoose.Schema({

    first: {
        type: String,
        required: true
    },
    second: {
        type: String,
    },
    image: String,
    description: String,
    isActive: {
        type: Boolean,
        default: true
    },
});

const bannerdata=new mongoose.model('banners',BannerSchema)

module.exports=bannerdata;