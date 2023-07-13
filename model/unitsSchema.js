const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const unitsSchema = new Schema({
    unitName: {
        type: String,
        required: true,
    },
    unitSymbol: {
        type: String,
        required: true,
        unique: true,
    }
});

const Unit = mongoose.model('units', unitsSchema);
module.exports = mongoose.model('units', unitsSchema);