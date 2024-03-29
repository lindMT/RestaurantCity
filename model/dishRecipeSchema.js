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
        
        chefWeight: {
                type: mongoose.Types.Decimal128,
                required: true
        },
        
        chefUnitID: {
                type: Schema.Types.ObjectId, ref: 'chefUnits', // change ref to conversion ???
                required: true
        }
    }],

    isActive: {
        type: Boolean,
        default: true,
        required: true
    },

    lastModified: {
        type: Date,
        required: true
    },

    addedBy: {
        type: Schema.Types.ObjectId, 
        ref: 'users',
        required: true
    },
    isApproved: {
        type: String,
        enum: ['for approval', 'approved', 'rejected'],
        required: true
    },

    approvedOn: {
        type: Date,
    },

});

module.exports = mongoose.model('dishRecipe', dishRecipeSchema);