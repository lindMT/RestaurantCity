const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const bcrypt = require("bcrypt");

const homeController = {
    // for redirecting login and signup
    getHome: async function(req, res) {

        var dishes = await Dish.find({isActive:true, isApproved:'for approval'});
        var counter = dishes.length
        var i;

         console.log(counter);
        res.render('home', {dishes, counter});
    },

}

module.exports = homeController