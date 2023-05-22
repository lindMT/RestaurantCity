const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const userController = {
    // for redirecting login and signup
    getUserLanding: function(req, res) {
        //render login (it will check the routes for the login step)
        res.render('userLanding');
    },
}

module.exports = userController;