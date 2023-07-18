const User = require('../model/usersSchema.js');
const Ingredient = require("../model/ingredientsSchema.js");
const Unit = require("../model/unitsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const bcrypt = require("bcrypt");
const Mismatch = require("../model/mismatchSchema.js");

const inputPhysicalController = {
    getInputPhysCount: async(req, res) => {
        const foundIngredients = await Ingredient.find().sort({ name: 1 });
        const foundVariations = await IngreVariation.find()
        const foundUnits = await Unit.find()

        const ingredientVariationsWithDetails = await Promise.all(
            foundVariations.map(async(variation) => {
                const unit = await Unit.findById(variation.unitID);
                const ingredient = await Ingredient.findById(variation.ingreID);

                const unitName = unit ? unit.unitName : '';
                const unitSymbol = unit ? unit.unitSymbol : '';
                const ingredientName = ingredient ? ingredient.name : '';

                return {
                    ...variation.toObject(),
                    unitName,
                    unitSymbol,
                    ingredientName,
                };
            })
        );

        // TODO: add units

        await res.render('inputPhysicalCount', {
            ingredients: foundIngredients,
            ingredientVariations: ingredientVariationsWithDetails,
            units: foundUnits
        })
    },

    postInputPhysCount: async(req, res) => {
        const inputs = req.body;

        for (const key in inputs) {
            if (inputs.hasOwnProperty(key)) {
                const inputValue = inputs[key];
                console.log(key + ': ' + inputValue);
            }
        }

        res.send("Check console")
    }
}

module.exports = inputPhysicalController;