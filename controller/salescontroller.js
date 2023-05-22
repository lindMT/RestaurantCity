const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const salesController = {
    getSales: function(req, res) {
        res.render('viewsales');
    }
}

module.exports = salesController;