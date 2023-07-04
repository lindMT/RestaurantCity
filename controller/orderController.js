const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const orderController = {
    getOrder: function(req, res) {
        res.render('orderTerminal');
    },

    processOrder: function(req, res){
        res.render('orderTerminal');
    }
}

module.exports = orderController;