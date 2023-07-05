const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingredientsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["wet", "dry"],
        // required: true
    },
    unitID: {
        type: Schema.Types.ObjectId,
        ref: 'units',
        required: true
    },
    totalNetWeight: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    reorderPoint: {
        type: Number,
        required: true
    }
});


// const Ingredient = mongoose.model('ingredients', ingredientsSchema);
module.exports = mongoose.model('ingredients', ingredientsSchema);