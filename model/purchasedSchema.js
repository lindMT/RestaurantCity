const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
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

    // NULL = if INGREDIENT has NO VARIANT / Otherwise, HAVE VALUE
    varID: {
        type: Schema.Types.ObjectId,
        ref: 'ingreVariations',
        required: false
    },

    // NULL = if INGREDIENT has VARIANT / Otherwise, HAVE VALUE
    qty: {
        type: Number,
        required: false
    },

    // NULL = if INGREDIENT has VARIANT / Otherwise, HAVE VALUE
    netWeight: {
        type: mongoose.Types.Decimal128,
        required: false,
    },

    // NULL = if INGREDIENT has VARIANT / Otherwise, HAVE VALUE
    unitID: {
        type: Schema.Types.ObjectId,
        ref: 'units',
        required: false
    }

});

module.exports = mongoose.model('purchase', purchaseSchema);