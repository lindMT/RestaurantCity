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
        const toUnitSymbol = req.body;
        const inputFactor = req.body;

        const toUnit = await Unit.findOne({ unitSymbol: toUnitSymbol }); // Subject to change if symbol or name will be used
        const ingredient = await Ingredients.findOne({ name: inputIngredient });

        // Checks if conversion exists
        const existsConversion = await Conversion.findOne({
            ingredientId: ingredient._id,
            convertedUnitId: toUnit._id
        });

        if(existsConversion){
            // Handle error where the conversion already exists

        } else{
            // Saves the conversion inputted by the user
            const newSubUnit = [
                {
                    convertedUnitId: toUnit._id,
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