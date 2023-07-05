const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversionSchema = new Schema({
    initialUnitId: {
        type: Schema.Types.ObjectId, 
        ref: 'units',
        required: true
    },
    convertedUnitId: {
        type: Schema.Types.ObjectId, 
        ref: 'units',
        required: true
    },
    conversionFactor: {
        type: Number, //can store Double also
        required: true,
    }
});

/* Sample Data (conversion.json) order:
    - Kilogram to Gram
    - Milligram to Gram
    - Ounce to Gram
    - Pound to Gram
    - Milliliter to Liter
*/

module.exports = mongoose.model('conversion', conversionSchema);