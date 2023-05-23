const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const orderController = {
    getOrders: function(req, res) {
        res.render('orderTerminal');
    }
}

module.exports = orderController;