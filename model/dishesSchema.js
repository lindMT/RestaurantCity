const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dishesSchema = new Schema ( {
    dishName: {
        type: String,
        required: true
    },

    price: {
        type: mongoose.Types.Decimal128,
        required: true
    },

    categoryID: [
        {
            type: Schema.Types.ObjectId, ref: 'dishCategory',
            required: true
        }
    ],

    isActive: {
        type: Boolean,
        default: true,
        required: true
    },

    isAvailable: {
        type: Boolean, 
        default: true,
        required: true
    },

    lastModified: {
        type: String,
        required: true
    },

    addedBy: [
        {
            type: Schema.Types.ObjectId, ref: 'users',
            required: true
        }
    ]
});

module.exports = mongoose.model('dishes', dishesSchema);
