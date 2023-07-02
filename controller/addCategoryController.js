const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const addCategoryController = {
    // for redirecting login and signup
    getAddCategory: function(req, res) {
        res.render('addCategory');
    },

}

module.exports = addCategoryController;