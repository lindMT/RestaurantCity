const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chefUnitsSchema = new Schema({
    unitName: {
        type: String,
        required: true,
    },
    unitSymbol: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        enum: ["wet", "dry", "both"], //added a "both" option since some units can be used for either type
        required: true,
    }
});

module.exports = mongoose.model('chefUnits', chefUnitsSchema);