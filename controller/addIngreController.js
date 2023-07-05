const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const bcrypt = require("bcrypt");

const addIngreController = {
    getAddIngre: function(req, res) {
        res.render('addNewIngredient');
    },

    // TODO: Add POST (Wait till DB is finalized)
    // ============================ Adding of ingredient to database ============================
    postAddIngre: async(req, res) => {
        const ingreQty = req.body.ingreQty;
        const ingreNetWt = req.body.ingreNetWt;
        const totalNetWeight = ingreQty * ingreNetWt;

        //Find the record of unit in units collection based on the unit symbol (ingreUnit)
        const unit = await Unit.findOne({ unitSymbol: req.body.ingreUnit });

        const ingredient = new Ingredient({
            name: req.body.ingreName,
            // category: req.body.ingreCategory,
            unitID: unit._id,
            totalNetWeight: totalNetWeight,
            reorderPoint: 0
        });

        // Save the ingredient to the database
        await ingredient.save();

        res.send("Ingredient added successfully!");
    }
}

module.exports = addIngreController;