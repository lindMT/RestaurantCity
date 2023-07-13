const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Units = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");

const addUnitController = {
    getAddUnit: async(req, res) => {
        res.render('addUnit');
    }

}

module.exports = addUnitController;