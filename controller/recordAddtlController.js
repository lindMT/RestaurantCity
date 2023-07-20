const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const Conversion = require("../model/ingreConversionSchema.js");
const purchasedIngre = require("../model/purchasedSchema.js");
const bcrypt = require("bcrypt");
const convert = require('convert-units');

const recordAddtlController = {

    getRecAddtl: async(req, res) => {
        const foundIngredients = await Ingredient.find().sort({ name: 1 });

        await res.render('recordAddtlP1', {
            ingredients: foundIngredients,
        })
    },

    postRecAddtl1: async(req, res) => {
        const foundVariants = await IngreVariation.find({ ingreID: req.body.ingreId });
        const foundIngredient = await Ingredient.findById(req.body.ingreId);
        const foundUnits = await Unit.find();

        await res.render('recordAddtlP2', {
            variants: foundVariants,
            ingredient: foundIngredient,
            units: foundUnits
        })
    },

    postRecAddtl2: async(req, res) => {
        try {
            // User Inputs
            const foundIngredient = await Ingredient.findById(req.body.ingreId);
            const foundIngredientUnit = await Unit.findById(foundIngredient.unitID)

            // For net weight accumulation
            let totalNetWeight = 0;

            // Get the current date
            const currentDate = new Date();

            // Find the user by their username
            const user = await User.findOne({ userName: req.session.userName });

            // Get the user ID
            const userId = user._id;

            // For saving audit
            var auditIngredient;

            if (foundIngredient.hasVariant) {
                // Ingredient has VARIANT
                const ingreVariation = await IngreVariation.findById(req.body.ingreVariant);
                const inputQty = req.body.ingreQty;

                const inputUnit = await Unit.findById(ingreVariation.unitID);

                var inputNetWt = ingreVariation.netWeight;

                if(!ingreVariation._id.equals(foundIngredientUnit._id)){
                    // ==================================
                    // TODO: BOUND TO CHANGE AFTER CONVERSION TABLE IS DONE
                    // ==================================
                    inputNetWt = convert(inputNetWt).from(inputUnit.unitSymbol).to(foundIngredientUnit.unitSymbol)
                }

                totalNetWeight = Number(inputNetWt * inputQty);

                // Add ingredient to purchased audit
                auditIngredient = new purchasedIngre({
                    ingreID: foundIngredient._id,
                    date: currentDate,
                    doneBy: userId,
                    varID: ingreVariation._id,
                    qty: inputQty,
                });

            } else {
                // Ingredient has NO VARIANT
                var inputNetWt = req.body.ingreNetWt;
                const inputUnit = req.body.ingreUnit;
                const matchedInputUnit = await Unit.findOne({ unitSymbol: inputUnit });

                if(!matchedInputUnit._id.equals(foundIngredientUnit._id)){
                    // ==================================
                    // TODO: BOUND TO CHANGE AFTER CONVERSION TABLE IS DONE
                    // ==================================
                    inputNetWt = convert(inputNetWt).from(matchedInputUnit.unitSymbol).to(foundIngredientUnit.unitSymbol)
                }

                totalNetWeight = Number(inputNetWt);

                // Add ingredient to purchased audit
                auditIngredient = new purchasedIngre({
                    ingreID: foundIngredient._id,
                    date: currentDate,
                    doneBy: userId,
                    netWeight: inputNetWt,
                    unitID: matchedInputUnit._id,
                });  
            }

            foundIngredient.totalNetWeight = Number(foundIngredient.totalNetWeight) + Number(totalNetWeight);

            await foundIngredient.save();
            await auditIngredient.save();

            return res.render('recordAddtlSuccess', {
                title: 'Record Purchase',
                message: 'Your purchase has been recorded!',
                ingredient: foundIngredient,
                unit: foundIngredientUnit,
                totalNet: totalNetWeight,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while updating the ingredient's running total.");
        }
    }
}

module.exports = recordAddtlController;

// if (!foundIngredient.unitID.equals(ingreVariation.unitID)) {
//     // Use conversion factor
//     const conversionFactor = convert(inputQty).from(foundUnitVariant.unitSymbol).to(foundUnitIngre.unitSymbol);
//     totalNetWeight = ingreVariation.netWeight * conversionFactor;
// } else {
//     totalNetWeight = inputQty * ingreVariation.netWeight;
// }

// return res.render('recordAddtlSuccess', {
//     title: "Record Purchase",
//     message: 'Your purchase has been recorded!',
//     ingredient: foundIngredient,
//     unit: msgUnit,
//     totalNet: totalNetWeight
// });