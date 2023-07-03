const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const recordAddtlController = {
    getRecAddtl: function(req, res) {
        res.render('recordAddtl');
    },

    // TODO: Add POST (Wait till DB is finalized)
}

module.exports = recordAddtlController;