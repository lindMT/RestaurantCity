const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const FixedConversion = require("../model/fixedConversionSchema.js");
const purchasedIngre = require("../model/purchasedSchema.js");
const bcrypt = require("bcrypt");

const convertNetWeight = async(netWeight, initialUnitId, convertedUnitId) => {
    try {
        // Check if the variationId and ingredientId are the same, then no conversion is needed
        if (initialUnitId.toString() === convertedUnitId.toString()) {
            return netWeight;
        }

        // Swap the ingredientId and variationUnitId here
        const fixedConversion = await FixedConversion.findOne({
            initialUnitId: initialUnitId,
            convertedUnitId: convertedUnitId,
        });

        if (!fixedConversion) {
            throw new Error('Ingredient conversion data not found.');
        }

        const conversionFactor = fixedConversion.conversionFactor;
        const convertedNetWeight = netWeight * conversionFactor; // Apply the correct conversion factor here
        
        return convertedNetWeight;
    } catch (error) {
        console.error('Error converting net weight:', error);
        throw error;
    }
};

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
            var convertedNetWeight;

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
                
                convertedNetWeight = await convertNetWeight(inputNetWt, inputUnit._id, foundIngredientUnit._id);

                totalNetWeight = Number(convertedNetWeight * inputQty);

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

                convertedNetWeight = await convertNetWeight(inputNetWt, matchedInputUnit._id, foundIngredientUnit._id);

                totalNetWeight = Number(convertedNetWeight);

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