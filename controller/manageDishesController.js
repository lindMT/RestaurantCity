const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const bcrypt = require("bcrypt");

const manageDishesController = {
    // for redirecting login and signup
    getManageDishes: function(req, res) {
        res.render('manageDishes');
    },

    // postManageDishes: function(req, res) {
    //     //TODO:
    //     // 1) Get dish names of selected(ticked checkbox) dishes 
    //     // 2) If "remove dish" is clicked, set "isActive" and "isAvailable" to false
    //     // 3) Views should check "isActive" status
    //         // If true: display
    //         // If false: remove from display
    // }

}

module.exports = manageDishesController;