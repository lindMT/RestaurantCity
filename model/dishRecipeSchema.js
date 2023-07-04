const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dishRecipeSchema = new Schema ({
    dishID: [
        {
            type: Schema.Types.ObjectId, ref: 'dish',
            required: true
        }
    ],

    ingreID: [
        {
            type: Schema.Types.ObjectId, ref: 'ingredients',
            required: true
        }
    ],

    metricWeight: {
        type: mongoose.Types.Decimal128,
        required: true
    },

    metricUnitID: [
        {
            type: Schema.Types.ObjectId, ref: 'metricUnit',
            required: true
        }
    ],

    chefWeight: {
        type: mongoose.Types.Decimal128,
        required: true
    },

    chefUnitID: [
        {
            type: Schema.Types.ObjectId, ref: 'chefUnit',
            required: true
        }
    ]

});

module.exports = mongoose.model('dishRecipe', dishRecipeSchema);