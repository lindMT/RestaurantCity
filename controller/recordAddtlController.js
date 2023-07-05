const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const bcrypt = require("bcrypt");

const recordAddtlController = {
    getRecAddtl: function(req, res) {
        res.render('recordAddtl');
    },

    // TODO: Add POST (Wait till DB is finalized)

    // 1. Ingredient Variation
    // - FIRST -> Check for:
    // 	- ingreId = selected ingredient
    // 	- unit & netweight
    // - If already exists THEN
    // 	- When clicking submit, cockblock
    // - If does NOT exist THEN
    // 	- When clicking submit, continue and show that ingredient has been added to inventory


}

module.exports = recordAddtlController;