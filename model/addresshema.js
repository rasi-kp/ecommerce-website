const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    addresses: [
        {
            name: {
                type: String,
            },
            address: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            pincode: {
                type: Number,
            },
            phoneno: {
                type: Number,
            },
        },
    ],

});

const address = mongoose.model('addresses', addressSchema);

module.exports = address;
