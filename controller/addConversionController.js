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
        } else{
            // Saves the conversion inputted by the user
            const newConversion = new Conversion({
                initialUnitId: fromUnit._id,
                convertedUnitId: toUnit._id,
                conversionFactor: inputFactor
            });

            await newConversion.save();
        }
        
        // Checks all existing conversions where the "toUnit" is the "fromUnit"
        const findConversion = await Conversion.find({
            initialUnitId: toUnit._id
        });

        // TODO: Add for loop where it will create all conversions for the inputted "toUnit"
        // ---------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------

        return res.redirect('/addConversion');
    }

}

module.exports = addConversionController;