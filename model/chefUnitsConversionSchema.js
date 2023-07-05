const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chefUnitsConversionSchema = new Schema({
    initialUnitId: {
        type: Schema.Types.ObjectId, 
        ref: 'chefUnits',
        required: true
    },
    convertedUnitId: {
        type: Schema.Types.ObjectId, 
        ref: 'units',
        required: true
    },
    conversionFactor: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('chefUnitsConversion', chefUnitsConversionSchema);