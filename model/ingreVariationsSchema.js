const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingreVariationsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ingreID: {
        type: Schema.Types.ObjectId,
        ref: 'ingredients',
        required: true
    },
    unitID: {
        type: Schema.Types.ObjectId,
        ref: 'units'
    },
    netWeight: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
});

module.exports = mongoose.model('ingreVariations', ingreVariationsSchema);