const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingreConversionSchema = new Schema({
    ingredientId: {
        type: Schema.Types.ObjectId,
        ref: 'ingredients',
        required: true
    },
    initialUnitId: {
        type: Schema.Types.ObjectId, 
        ref: 'ingredients',
        required: true
    },
    subUnit: [{
        convertedUnitId: {
            type: Schema.Types.ObjectId, 
            ref: 'units',
            required: true
        },
        conversionFactor: {
            type: Number, //can store Double also
            required: true,
        }
    }]
});

/* Sample Data (conversion.json) order:
    *** DRY INGREDIENTS ***
    ADDED:
    - Gram to Kilogram
        - 0.001
    - Gram to Ounce
        - 0.035
    - Gram to Pound
        - 0.0022
    - Kilogram  to Gram
        - 1000

    NOT YET ADDED:
    - Kilogram  to Ounce
        - 35.27
    - Kilogram  to Pound
        - 2.20
    - Ounce to Kilogram
        - 0.028
    - Ounce to Gram
        - 28.35
    - Ounce to Pound
        - 0.062
    - Pound to Kilogram
        - 0.45
    - Pound to Gram
        - 453.59
    - Pound to Ounce
        - 16

    *** WET INGREDIENTS ***
    ADDED:
    - None

    NOT YET ADDED:
    - Milliliter to Liter
        - 0.001
    - Milliliter to Fluid Ounce
        - 0.0034

    - Liter to Milliliter
        - 1000
    - Liter to Fluid Ounce
        - 33.81

    - Fluid Ounce to Milliliter
        - 29.57
    - Fluid Ounce to Liter
        - 0.030
*/

/* Sample Data from chefUnitsConversion.json order (added to bottom):
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

module.exports = mongoose.model('ingreConversion', ingreConversionSchema);