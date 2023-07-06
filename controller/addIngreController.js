const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const purchasedIngre = require("../model/purchasedSchema.js");
const bcrypt = require("bcrypt");

const addIngreController = {
    getAddIngre: function(req, res) {
        res.render('addNewIngredient');
    },

    postAddIngredientAndVariation: async(req, res) => {
        const ingreQty = req.body.ingreQty;
        const ingreNetWt = req.body.ingreNetWt;
        const totalNetWeight = ingreQty * ingreNetWt;

        // Find the record of unit in the units collection based on the unit symbol (ingreUnit)
        const unit = await Unit.findOne({ unitSymbol: req.body.ingreUnit });

        // Check if the ingredient name already exists in the database
        const existingIngredient = await Ingredient.findOne({ name: req.body.ingreName });

        if (existingIngredient) {
            // Prompt the user to go to the "record additional purchase"
            return res.send("Ingredient name already exists. Please record additional purchase.");
        }

        // Create a new ingredient instance
        const ingredient = new Ingredient({
            name: req.body.ingreName,
            category: req.body.ingreCategory,
            unitID: unit._id,
            totalNetWeight: totalNetWeight,
            reorderPoint: 0
        });

        // Save the ingredient to the database
        await ingredient.save();

        // Find the ingredient by its name
        const savedIngredient = await Ingredient.findOne({ name: req.body.ingreName });

        // Create a new ingredient variation
        const ingreVariation = new IngreVariation({
            ingreID: savedIngredient._id,
            unitID: unit._id,
            netWeight: totalNetWeight,
        });

        // Save the ingredient variation to the database
        await ingreVariation.save();

        // Get the current date
        const currentDate = new Date();

        // Find the user by their username
        const user = await User.findOne({ userName: req.session.userName });

        // Get the user ID
        const userId = user._id;

        const auditIngredient = new purchasedIngre({
            ingreID: savedIngredient._id,
            date: currentDate,
            varID: ingreVariation._id,
            qty: ingreQty,
            doneBy: userId,
        });

        await auditIngredient.save();

        return res.send("Ingredient and variation added successfully!");
    },
};

module.exports = addIngreController;