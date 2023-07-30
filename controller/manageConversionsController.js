const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Units = require('../model/unitsSchema.js');
const Conversion = require('../model/ingreConversionSchema.js');
const FixedConversion = require('../model/fixedConversionSchema.js');
const Ingredients = require('../model/ingredientsSchema.js')
const bcrypt = require("bcrypt");

const manageConversionsController = {
    getManageConversions: async(req, res) => {
    // Session position
    if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "chef")){
        // const foundUnits = await Unit.find();
        const foundIngredients = await Ingredients.find();
        const foundUnits = await Units.find();
        
        await res.render('manageConversions', {
            ingredients: foundIngredients,
            units: foundUnits
        });
    }   else{
        console.log("Unauthorized access.");
        req.session.destroy();
        return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        } // end of session position
    },
    

    viewConversions: async function(req, res) {
    // Session position
    if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "chef")){
        var ingreID = req.params.ingreID;
        console.log("IngreID in view conversions: " + ingreID);

        try {
            const ingredients = await Ingredients.findById(ingreID);
            const conversions = await Conversion.find();
            
            // Map Ingredient ID with IngreConversion ID
            const ingreWithConversion = await Promise.all([ingredients].map(async ingre => {
                const conversion = conversions.find(conversion => conversion.ingredientId.equals(ingre._id));
                const baseUnit = await Units.findById(ingre.unitID);
                if (conversion) {
                    // Map Unit ID with IngreConversion Sub-Unit ID
                    const subUnitsWithConversions = await Promise.all(conversion.subUnit.map(async subUnit => {
                        const convertedUnit = await Units.findById(subUnit.convertedUnitId);
                        return {
                            convertedUnitName: convertedUnit.unitName,
                            conversionFactor: subUnit.conversionFactor
                        };
                    }));
                    return {
                        ingredientName: ingre.name,
                        baseUnitName: baseUnit.unitName,
                        conversions: subUnitsWithConversions
                    };
                } else {
                    return {
                        ingredientName: ingre.name,
                        baseUnitName: baseUnit.unitName,
                        conversions: []
                    };
                }
            }));

            // Get the fixed conversions where initialUnitId matches the baseUnit of the ingredient
            const fixedConversions = await FixedConversion.find({ initialUnitId: ingredients.unitID });
            const fixedConversionsWithUnits = await Promise.all(fixedConversions.map(async fixedConversion => {
                const initialUnit = await Units.findById(fixedConversion.initialUnitId);
                const convertedUnit = await Units.findById(fixedConversion.convertedUnitId);
                return {
                    initialUnitName: initialUnit.unitName,
                    convertedUnitName: convertedUnit.unitName,
                    conversionFactor: fixedConversion.conversionFactor
                };
            }));
    
            console.log("ingredient JSON to pass: ", ingreWithConversion);
            res.render('viewConversions', { 
                ingredients: ingreWithConversion,
                ingre: ingredients,
                fixed: fixedConversionsWithUnits
            });
        } catch (err) {
            console.error("Error in viewConversions: ", err);
            // Handle the error and send an appropriate response.
            res.status(500).send("Internal Server Error");
        }
    }   else{
        console.log("Unauthorized access.");
        req.session.destroy();
        return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        } // end of session position
    },

    addConversion: async(req, res) => {
     // Session position
     if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "chef")){
        var ingreID = req.params.ingreID;
        console.log("IngreID in add conversions: " + ingreID);
        const ingredient = await Ingredients.findById(ingreID);
        const ingreConversion = await Conversion.find({ ingredientId: ingreID });
        const unit = await Units.find();
        const initialUnitId = ingreConversion.map(conversion => conversion.initialUnitId);
        // const categoryOfUnits = await Units.find({ _id: { $in: initialUnitId } }).distinct('category');
        // Find all units with the same category as ingreConversion.initialUnitId
        // const unitsWithSameCategory = await Units.find({
        //     $or: [
        //         { category: { $in: categoryOfUnits } },
        //         { category: 'Both' }
        //     ]
        // });

        const baseUnitNames = await Units.find({ _id: { $in: initialUnitId } }).distinct('unitName');
        res.render('addConversion', {
            ingredient: ingredient,
            baseUnit: baseUnitNames,
            units: unit
        })
    }   else{
        console.log("Unauthorized access.");
        req.session.destroy();
        return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        } // end of session position
    },

    
    postAddConversion: async(req, res) => {
        const inputIngredient = req.params.ingreID;
        const subUnitSymbol = req.body.convertIntoUnit;
        const inputFactor = req.body.factor;
        console.log(subUnitSymbol);

        const subUnit = await Units.findOne({ unitSymbol: subUnitSymbol });
        const ingredient = await Ingredients.findById(inputIngredient);

        // Checks if ingredient exists in conversion table
        const existsConversion = await Conversion.findOne({
            ingredientId: ingredient._id
        });

        // Checks if it will duplicate the sub-unit
        const duplicateConversion = await Conversion.findOne({
            ingredientId: ingredient._id,
            convertedUnitId: subUnit._id
        });

        const duplicateFixedConversion = await FixedConversion.findOne({
            initialUnitId: ingredient._id,
            convertedUnitId: subUnit._id
        });

        if(duplicateConversion || duplicateFixedConversion){ 
            req.flash('error_msg', 'Conversion already exists, Please input a different one')
            console.log("Conversion already exists")

        } else if(existsConversion){ // If ingredient exists in conversion table, add sub-unit only
            const newSubUnit = {
                convertedUnitId: subUnit._id,
                conversionFactor: inputFactor,
            };
            existsConversion.subUnit.push(newSubUnit);
            await existsConversion.save();
            
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