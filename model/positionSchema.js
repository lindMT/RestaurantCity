const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const positionSchema = new Schema( {
    positionId: {
        type: Number,
        required: true
    },

    positionName: {
        type: String,
        required: true
    }
});

//name of the schema, positionSchema (the var)
module.exports = mongoose.model('positions', positionSchema);