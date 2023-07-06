const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const bcrypt = require("bcrypt");

const addIngreController = {
    getAddIngre: function(req, res) {
        res.render('addNewIngredient');
    },

    postAddIngredient: async(req, res) => {
        const ingreQty = req.body.ingreQty;
        const ingreNetWt = req.body.ingreNetWt;
        const totalNetWeight = ingreQty * ingreNetWt;

        // Find the record of unit in the units collection based on the unit symbol (ingreUnit)
        const unit = await Unit.findOne({ unitSymbol: req.body.ingreUnit });

        // Create a new ingredient instance
        const ingredient = new Ingredient({
            name: req.body.ingreName,
            // category: req.body.ingreCategory,
            unitID: unit._id,
            totalNetWeight: totalNetWeight,
            reorderPoint: 0
        });

        // Save the ingredient to the database
        await ingredient.save();

        // res.send("Ingredient added successfully!");
    },


    postAddIngreVariation: async(req, res) => {
        const ingreQty = req.body.ingreQty;
        const ingreNetWt = req.body.ingreNetWt;
        const totalNetWeight = ingreQty * ingreNetWt;

        // Find the ingredient by its name
        const ingredient = await Ingredient.findOne({ name: req.body.ingreName });

        // if (!ingredient) {
        //     // Handle the case where the ingredient is not found
        //     return res.status(400).send("Invalid ingredient");
        // }

        // Find the record of unit in the units collection based on the unit symbol (ingreUnit)
        const unit = await Unit.findOne({ unitSymbol: req.body.ingreUnit });

        // Create a new ingredient variation
        const ingreVariation = new IngreVariation({
            ingreID: ingredient._id,
            unitID: unit._id,
            netWeight: totalNetWeight,
        });

        // Save the ingredient variation to the database
        await ingreVariation.save();

    },



    postAddIngredientsAndVariation: async(req, res) => {
        // Add the ingredient to the ingredients table
        await addIngreController.postAddIngredient(req, res);

        // Add the ingredient variation to the ingreVariations table
        await addIngreController.postAddIngreVariation(req, res);
    },
};

module.exports = addIngreController;