const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const bcrypt = require("bcrypt");

const viewInvController = {
    getViewInventory: async function(req, res) {
        try {
            // Retrieve all ingredients from the database
            const ingredients = await Ingredient.find();

            // Retrieve all units from the database
            const units = await Unit.find();

            // Map the unit IDs to unit symbols in the ingredients array
            const ingredientsWithUnitSymbols = ingredients.map(ingredient => {
                const unit = units.find(unit => unit._id.equals(ingredient.unitID));
                return {
                    ...ingredient.toObject(),
                    unitSymbol: unit ? unit.unitSymbol : ''
                };
            });

            // Pass the ingredients data to the view
            res.render('viewInventory', { ingredients: ingredientsWithUnitSymbols });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the ingredients.");
        }
    }
};

module.exports = viewInvController;