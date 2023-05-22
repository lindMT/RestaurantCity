const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const salescontroller = {
    getSales: function(req, res) {
        res.render('viewsales');
    }
}

module.exports = salescontroller;