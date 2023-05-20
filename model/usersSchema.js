const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema( {
    firstName: { 
        type: String, 
        required: true,
    },

    lastName: { 
        type: String, 
        required: true,
    },

    userName: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    position: {
        type: String,
        required: true
    }
});

//name of the schema, usersSchema (the var)
module.exports = mongoose.model('users', usersSchema);