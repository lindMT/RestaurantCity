const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const viewInvController = {
    getViewInventory: function(req, res) {
        res.render('viewInventory');
    }
}

module.exports = viewInvController;