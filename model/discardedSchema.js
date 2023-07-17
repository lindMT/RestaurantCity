const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const discardedSchema = new Schema( {
    ingreID: {
        type: Schema.Types.ObjectId, 
        ref: 'ingredients',
        required: true,
    },

    date: { 
        type: String, 
        required: true,
    },

    doneBy: {
        type: Schema.Types.ObjectId, 
        ref: 'users',
        required: true,
    },

    varID: {
        type: Schema.Types.ObjectId, 
        ref: 'ingreVariations',
        required: false,
    },

    qty: {
        type: Number,
        required: false
    },

    netWeight: {
        type: mongoose.Types.Decimal128,
        required: false,
    },

    unitID: {
        type: Schema.Types.ObjectId,
        ref: 'units',
        required: false
    }

});

module.exports = mongoose.model('discarded', discardedSchema);