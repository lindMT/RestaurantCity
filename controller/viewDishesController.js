const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const viewDishesController = {
    // for redirecting login and signup
    getViewDishes: function(req, res) {
        res.render('viewDishes');
    },

}

module.exports = viewDishesController;