const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema( {
    totalPrice: { 
        type: mongoose.Types.Decimal128, 
        required: true,
    },

    date: {
        type: String,
        required: true,
    },

    takenBy: {
        type: Schema.Types.ObjectId,
        ref: "userName",
        required: true
    }
});

module.exports = mongoose.model('order', orderSchema);