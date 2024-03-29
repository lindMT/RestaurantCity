const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dishSchema = new Schema ( {
    name: {
        type: String,
        required: true
    },

    price: {
        type: mongoose.Types.Decimal128,
        required: true
    },

    categoryID: {
            type: Schema.Types.ObjectId, 
            ref: 'dishCategory',
            required: true
    },

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

module.exports = mongoose.model('dish', dishSchema);
