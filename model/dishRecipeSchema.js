const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dishRecipeSchema = new Schema ({
    dishID: {
        type: Schema.Types.ObjectId, ref: 'dish',
        required: true
    },

    ingredients: [{
        ingredient: {
                type: Schema.Types.ObjectId, ref: 'ingredients', 
                required: true
        },
        
        // metricWeight: {
        //         type: mongoose.Types.Decimal128,
        //         required: true
        // },
        
        // metricUnitID: {
        //         type: Schema.Types.ObjectId, ref: 'units',
        //         required: true
        // },
        
        chefWeight: {
                type: mongoose.Types.Decimal128,
                required: true
        },
        
        chefUnitID: {
                type: Schema.Types.ObjectId, ref: 'chefUnits',
                required: true
        }
    }],

    isActive: {
        type: Boolean,
        default: true,
        required: true
    },

});

module.exports = mongoose.model('dishRecipe', dishRecipeSchema);