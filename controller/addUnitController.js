const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require('../model/unitsSchema.js');
const Ingredient = require('../model/ingredientsSchema.js');
const Conversion = require('../model/ingreConversionSchema.js');
const FixedConversion = require('../model/fixedConversionSchema.js');
const bcrypt = require("bcrypt");

const addUnitController = {
    getAddUnit: async(req, res) => {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "chef")){
            const ingredients = await Ingredient.find({});
            const units = await Unit.find({});

            const initialUnits = await FixedConversion.distinct('initialUnitId');
            const fixedUnits = await Unit.find({ _id: { $in: initialUnits } });

            res.render('addUnit', { ingredients, units, fixedUnits });
        } else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postAddUnit: async(req, res) => {
        const name = req.body.unitName;
        const symbol = req.body.unitSymbol;
        const unitType = req.body.unitType;
        
        // Checks if unit already exists
        var unitSymbolExists = await Unit.findOne({unitSymbol : {'$regex': symbol,$options:'i'}});
        var unitNameExists = await Unit.findOne({unitName : {'$regex': name,$options:'i'}});

        console.log("unitSymbolExists: " + unitSymbolExists)
        console.log("unitNameExists: " + unitNameExists)

        if (unitSymbolExists){
            req.flash('error_msg', 'Unit symbol already exists in the system, Please input a different one')
            console.log("Duplicate unit symbol entry")
            return res.redirect('/addUnit');
        } else if (unitNameExists){
            req.flash('error_msg', 'Unit name already exists in the system, Please input a different one')
            console.log("Duplicate unit name entry")
            return res.redirect('/addUnit');
        } else {
            let factor, unitUsed, ingreUsed;

            const newUnit = new Unit({
                unitName: name,
                unitSymbol: symbol
            });

            await newUnit.save();

            if (unitType === "fixed") { // If fixed is chosen
                const fixedUnit = req.body.fixedUnit;
                factor = req.body.fixedConversionFactor;
                unitUsed = await Unit.findById(fixedUnit);

                // Find newly created unit
                const findUnit = await Unit.findOne({unitSymbol: symbol});


                // Insert to fixedIngredients
                const newFixed = new FixedConversion({
                    initialUnitId: findUnit._id,
                    convertedUnitId: unitUsed._id,
                    conversionFactor: factor
                });

                await newFixed.save();

                // Reverse conversion
                const reverseNewFixed = new FixedConversion({
                    initialUnitId: unitUsed._id,
                    convertedUnitId: findUnit._id,
                    conversionFactor: 1 / factor
                });

                await reverseNewFixed.save();

                // Finds all conversion with chosen unit as initial unit
                const findConversion = await FixedConversion.find({ 
                    initialUnitId: unitUsed._id 
                });


                // Creates extra conversion
                for (const found of findConversion) {
                    if (found.convertedUnitId.toString() !== findUnit._id.toString()){
                        const unitID = await Unit.findById(found.convertedUnitId);
                        if (!unitID) {
                            continue;
                        }
                        const moreNewFixed = new FixedConversion({
                            initialUnitId: findUnit._id,
                            convertedUnitId: found.convertedUnitId,
                            conversionFactor: found.conversionFactor * factor
                        });

                        const reverseMoreFixed = new FixedConversion({
                            initialUnitId: found.convertedUnitId,
                            convertedUnitId: findUnit._id,
                            conversionFactor: 1 / (found.conversionFactor * factor)
                        });
                        await moreNewFixed.save();
                        await reverseMoreFixed.save();
                    }
                }

                
            } else if (unitType === "ingredient") { // If ingredient is chosen
                const ingredient = req.body.ingreRef;
                factor = req.body.ingredientConversionFactor
                ingreUsed = await Ingredient.findById(ingredient);
                converUnit = await Unit.findOne({ unitSymbol: symbol });

                const existsConversion = await Conversion.findOne({
                    ingredientId: ingreUsed._id
                });
    
                if(existsConversion){ // If ingredient exists in conversion table, add sub-unit only
                    const newSubUnit = {
                        convertedUnitId: converUnit._id,
                        conversionFactor: factor,
                    };
                    existsConversion.subUnit.push(newSubUnit);
                    await existsConversion.save();
                } else {
                    const newSubUnit = [
                        {
                            convertedUnitId: converUnit._id,
                            conversionFactor: factor
                        }
                    ]
                    const newConversion = new Conversion({
                        ingredientId: ingreUsed._id,
                        initialUnitId: ingreUsed.unitID,
                        subUnit: newSubUnit
                    });
        
                    await newConversion.save();
                }
            } else {
                req.flash('error_msg', 'Invalid unit type selection');
                console.log("Invalid unit type selection");
                return res.redirect('/addUnit');
            }

            req.flash('success_msg', 'Unit Added Successfully.')
            console.log("New unit entry")
            return res.redirect('/addUnit'); // To be changed as page with "successfully added unit!" message
        }
    }

}

module.exports = addUnitController;