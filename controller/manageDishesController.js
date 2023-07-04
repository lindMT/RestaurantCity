const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const manageDishesController = {
    // for redirecting login and signup
    getManageDishes: function(req, res) {
        res.render('manageDishes');
    },

}

module.exports = manageDishesController;