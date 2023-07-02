const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const inputPhysicalController = {
    getInputPhysCount: function(req, res) {
        res.render('inputPhysicalCount');
    }
}

module.exports = inputPhysicalController;