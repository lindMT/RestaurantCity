const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema( {
    orderID: { 
        type: Schema.Types.ObjectId,
        ref: "orderID",
        required: true,
    },

    dishID: { 
        type: Schema.Types.ObjectId,
        ref: "dishID", 
        required: true,
    }
});

module.exports = mongoose.model('orderItem', orderItemSchema);