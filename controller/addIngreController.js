const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const addIngreController = {
    getAddIngre: function(req, res) {
        res.render('addNewIngredient');
    },

    // TODO: Add POST (Wait till DB is finalized)
}

module.exports = addIngreController;