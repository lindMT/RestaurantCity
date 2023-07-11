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

/* Sample Data (chefUnitsConversion.json) order:
    - Cup to Gram 
    - Cup to Kilogram 
    - Cup to Liter
    - Cup to Milliliter
    - Tablespoon to Gram
    - Tablespoon to Kilogram
    - Tablesppon to Liter
    - Tablesppon to Milliliter
    - Teaspoon to Gram
    - Teaspoon to Kilogram
    - Teaspoon to Liter
    - Teaspoon to Milliliter
*/

module.exports = mongoose.model('chefUnitsConversion', chefUnitsConversionSchema);