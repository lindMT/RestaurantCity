const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const homeController = {
    // for redirecting login and signup
    getHome: function(req, res) {
        res.render('home');
    },

}

module.exports = homeController