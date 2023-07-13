const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Units = require('../model/unitsSchema.js');
const Conversion = require('../model/conversionSchema.js');
const bcrypt = require("bcrypt");

const addConversionController = {
    getAddConversion: async(req, res) => {
        res.render('addConversion');
    }

}

module.exports = addConversionController;