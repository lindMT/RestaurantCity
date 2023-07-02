const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const addDishController = {
    // for redirecting login and signup
    getaddDish: function(req, res) {
        res.render('addDish');
    },

}

module.exports = addDishController;