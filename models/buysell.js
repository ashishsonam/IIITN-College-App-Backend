const mongoose = require("mongoose");
const buysellSchema = mongoose.Schema(
    {
        itemName: {
            type: String,
            trim: true,
        },
        itemPrice:{
            type: String,
            trim: true,
        },
        itemImageUri:{
            type: String,
            trim: true,
        },
        sellerName: {
            type: String,
            trim: true,
        },
        sellerRoom: {
            type: String,
            trim: true,
        },
        sellerContact: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);
const buysell =   mongoose.model('buysell', buysellSchema,'College-Olx');
module.exports = buysell;
