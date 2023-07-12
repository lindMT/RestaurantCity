const User = require('../model/usersSchema.js');
const Ingredient = require("../model/ingredientsSchema.js");
const Unit = require("../model/unitsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const Conversion = require("../model/conversionSchema.js");
const bcrypt = require("bcrypt");

const inputPhysicalController = {
    getInputPhysCount: async(req, res) => {
        try {
            // Retrieve all ingredients from the database
            const ingredients = await Ingredient.find().sort({ name: 1 });

            // Retrieve all ingredient variations from the database
            const ingredientVariations = await IngreVariation.find();

            // Retrieve all units from the database
            const units = await Unit.find();

            // Map the unit IDs to unit symbols in the ingredients array
            const ingredientsWithUnitSymbols = ingredients.map((ingredient) => {
                const unit = units.find((unit) => unit._id.toString() === ingredient.unitID.toString());
                return {
                    ...ingredient.toObject(),
                    unitSymbol: unit ? unit.unitSymbol : '',
                };
            });

            console.log(ingredientsWithUnitSymbols);

            // Retrieve the unit symbols and ingredient names for ingredient variations
            const ingredientVariationsWithDetails = await Promise.all(
                ingredientVariations.map(async(variation) => {
                    const unit = await Unit.findById(variation.unitID);
                    const ingredient = await Ingredient.findById(variation.ingreID);

                    const unitSymbol = unit ? unit.unitSymbol : '';
                    const ingredientName = ingredient ? ingredient.name : '';

                    return {
                        ...variation.toObject(),
                        unitSymbol,
                        ingredientName,
                    };
                })
            );

            console.log(ingredientVariationsWithDetails);

            // Pass the ingredients data to the view
            res.render('inputPhysicalCount', { ingredients: ingredientsWithUnitSymbols, ingredientVariations: ingredientVariationsWithDetails });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the ingredients.");
        }
    }
}

module.exports = inputPhysicalController;