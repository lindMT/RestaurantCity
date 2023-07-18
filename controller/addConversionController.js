const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require('../model/unitsSchema.js');
const Conversion = require('../model/conversionSchema.js');
const Ingredients = require('../model/ingredientsSchema.js')
const bcrypt = require("bcrypt");

const addConversionController = {
    getAddConversion: async(req, res) => {
        const foundUnits = await Unit.find();
        const foundIngredients = await Ingredients.find();

        //TODO: Map units with ingredients
        await res.render('addConversion', {
            units: foundUnits, ingredients: foundIngredients
        });
    },
    
    postAddConversion: async(req, res) => {
        const inputIngredient = req.body;
        const subUnitSymbol = req.body;
        const inputFactor = req.body;

        const subUnit = await Unit.findOne({ unitSymbol: subUnitSymbol }); // Subject to change if symbol or name will be used
        const ingredient = await Ingredients.findOne({ name: inputIngredient });

        // Checks if ingredient exists in conversion table
        const existsConversion = await Conversion.findOne({
            ingredientId: ingredient._id
        });

        // Checks if it will duplicate the sub-unit
        const duplicateConversion = await Conversion.findOne({
            ingredientId: ingredient._id,
            convertedUnitId: subUnit._id
        });

        if(duplicateConversion){ 
            // Handle error that sub-unit will be duplicated

        } else if(existsConversion){ // If ingredient exists in conversion table, add sub-unit only
            const newSubUnit = {
                convertedUnitId: subUnit._id,
                conversionFactor: inputFactor,
            };
            existsConversion.subUnit.push(newSubUnit);
            existsConversion = await existsConversion.save();
            
        } else{
            // Creates new sub-unit
            const newSubUnit = [
                {
                    convertedUnitId: subUnit._id,
                    conversionFactor: inputFactor
                }
            ]
            const newConversion = new Conversion({
                ingredientId: ingredient._id,
                initialUnitId: ingredient.unitID,
                subUnit: newSubUnit
            });
            
            await newConversion.save();
        }

        return res.redirect('/addConversion');
    }

}

module.exports = addConversionController;