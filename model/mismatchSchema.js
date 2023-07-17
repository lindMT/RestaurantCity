const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mismatchSchema = new Schema( {
    ingreID: {
        type: Schema.Types.ObjectId, 
        ref: 'ingredients',
        required: true
    },
    date: { 
        type: String, 
        required: true
    },
    doneBy: {
        type: Schema.Types.ObjectId, 
        ref: 'users',
        required: true
    },
    difference: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    unitID: {
        type: Schema.Types.ObjectId, 
        ref: 'units',
        required: true
    }
});

module.exports = mongoose.model('mismatch', mismatchSchema);