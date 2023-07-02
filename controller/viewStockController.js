const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const viewStockController = {
    getStock: function(req, res) {
        res.render('viewStockReport');
    }
}

module.exports = viewStockController;