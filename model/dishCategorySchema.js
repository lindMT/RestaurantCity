const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dishCategorySchema = new Schema ({
    category: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('dishCategory', dishCategorySchema);