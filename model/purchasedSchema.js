const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchasedSchema = new Schema( {
    ingreID: [
        {
            type: Schema.Types.ObjectId, ref: 'ingredients',
            required: true,
        }
      ],

    date: { 
        type: String, 
        required: true,
    },

    varID: [
        {
            type: Schema.Types.ObjectId, ref: 'ingreVariations',
            required: true,
        }
      ],

    qty: {
        type: Number,
        required: true
    },

    doneBy: [
        {
            type: Schema.Types.ObjectId, ref: 'users',
            required: true,
        }
      ],

});

module.exports = mongoose.model('purchased', purchasedSchema);