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
            const ingredients = await Ingredient.find().sort({name: 1});

            // Retrieve all ingredient variations from the database
            const ingredientVariations = await IngreVariation.find();

            // Retrieve all units from the database
            const units = await Unit.find();

            // Map the unit IDs to unit symbols in the ingredients array
            const ingredientsWithUnitSymbols = ingredients.map(ingredient => {
                const unit = units.find(unit => unit._id === ingredient.unitID);
                return {
                    ...ingredient,
                    unitSymbol: unit ? unit.unitSymbol : ''
                };
            });

            // Map ingredient variations with ingredients and units
            const ingredientVariationsWithDetails = ingredientVariations.map(variation => {
                const ingredient = ingredientsWithUnitSymbols.find(ingredient => ingredient._id === variation.ingreID);
                const unit = units.find(unit => unit._id === variation.unitID);

                return {
                    ...variation,
                    ingredientName: ingredient ? ingredient.name : '',
                    unitSymbol: unit ? unit.unitSymbol : ''
                };
            });

            console.log(ingredientsWithUnitSymbols)




            // TODO: YUNG MAPPING SHIT.. DI GUMAGANA BRO
            //      1. FIX/ADD - Ingredient With Unit Symbols
            //      2. FIX/ADD - Ingredient With Variations




            // Pass the ingredients data to the view
            // res.render('inputPhysicalCount', { ingredients: ingredientsWithUnitSymbols, ingredientVariations: ingredientVariationsWithDetails });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the ingredients.");
        }
    }
}

module.exports = inputPhysicalController;