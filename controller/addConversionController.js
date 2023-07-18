const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require('../model/unitsSchema.js');
const Conversion = require('../model/conversionSchema.js');
const bcrypt = require("bcrypt");

const addConversionController = {
    getAddConversion: async(req, res) => {
        const foundUnits = await Unit.find();

        await res.render('addConversion', {
            units: foundUnits
        });
    },
    
    postAddConversion: async(req, res) => {
        const fromUnitSymbol = req.body;
        const toUnitSymbol = req.body;
        const inputFactor = req.body;

        const fromUnit = await Unit.findOne({ unitSymbol: fromUnitSymbol}); // Subject to change if symbol or name will be used
        const toUnit = await Unit.findOne({ unitSymbol: toUnitSymbol}); // Subject to change if symbol or name will be used

        // Checks if conversion exists
        const existsConversion = await Conversion.findOne({
            initialUnitId: fromUnit._id,
            convertedUnitId: toUnit._id
        });

        if(existsConversion){
            // Handle error where the conversion already exists

        } else if(fromUnit.category !== toUnit.category && fromUnit.category !== 'Both' && toUnit.category !== 'Both'){
            // Handle error where units do not belong in the same category or neither of them are "Both"

        } else{
            // Saves the conversion inputted by the user
            const newConversion = new Conversion({
                initialUnitId: fromUnit._id,
                convertedUnitId: toUnit._id,
                conversionFactor: inputFactor
            });
            
            // Creates the reverse conversion inputted by the user
            const reverseNewConversion = new Conversion({
                initialUnitId: toUnit._id,
                convertedUnitId: fromUnit._id,
                conversionFactor: 1 / inputFactor
            });

            await newConversion.save();
            await reverseNewConversion.save();
        }
        
        // Checks all existing conversions where the "toUnit" is the "fromUnit"
        const findConversion = await Conversion.find({
            initialUnitId: toUnit._id
        });

        for (const foundConversion of findConversion) {
            if((foundConversion.convertedUnitId.toString() !== fromUnit._id.toString()) &&
            ((fromUnit.category === foundConversion.category) || (foundConversion.category === "Both") || (fromUnit.category === "Both"))){ // Checks if both units have the same category OR the convertedUnit is "Both"
                const newConversion = new Conversion({
                    initialUnitId: fromUnit._id,
                    convertedUnitId: foundConversion.convertedUnitId,
                    conversionFactor: foundConversion.conversionFactor * inputFactor
                });

                await newConversion.save();
            }
        }
        return res.redirect('/addConversion');
    }

}

module.exports = addConversionController;