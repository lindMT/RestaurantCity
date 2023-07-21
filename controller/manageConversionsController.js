const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require('../model/unitsSchema.js');
const Conversion = require('../model/ingreConversionSchema.js');
const Ingredients = require('../model/ingredientsSchema.js')
const bcrypt = require("bcrypt");

const manageConversionsController = {
    getManageConversions: async(req, res) => {
        // const foundUnits = await Unit.find();
        const foundIngredients = await Ingredients.find();

        //TODO: Map units with ingredients
        await res.render('manageConversions', {
            ingredients: foundIngredients
        });
    },
    

    viewConversions: async(req, res) => {
        var ingreID = req.params.ingreID;
        console.log("IngreID in view conversions: " + ingreID);

        const ingredient = await Ingredients.findById(ingreID);
        console.log("ingredient JSON to pass" + ingredient)

        // TO ADD: Display base unit instead
        res.render('viewConversions', { ingredient: ingredient })

    },

    addConversion: async(req, res) => {
        var ingreID = req.params.ingreID;
        console.log("IngreID in add conversions: " + ingreID);

        const ingredient = await Ingredients.findById(ingreID);

        // TO ADD: Display FROM unit as base unit instead of drop down

        res.render('addConversion', {ingredient: ingredient})

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

        return res.redirect('/manageConversions');
    }

}

module.exports = manageConversionsController;