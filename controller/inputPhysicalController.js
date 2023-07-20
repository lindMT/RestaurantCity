const User = require('../model/usersSchema.js');
const Ingredient = require("../model/ingredientsSchema.js");
const Unit = require("../model/unitsSchema.js");
const mongoose = require('mongoose');
const IngreVariation = require("../model/ingreVariationsSchema.js");
const bcrypt = require("bcrypt");
const Mismatch = require("../model/mismatchSchema.js");
const Conversion = require("../model/ingreConversionSchema.js");

const convertNetWeight = async(netWeight, unitId, targetUnitId) => {
    try {

        console.log('UNIT ID: ' + unitId)
        console.log('targetUnitId ID: ' + targetUnitId)
            // Check if conversion is needed
        if (unitId.toString() !== targetUnitId.toString()) {
            // Find the conversion factor for the main unit and target unit
            const conversion = await Conversion.findOne({
                initialUnitId: unitId,
                convertedUnitId: targetUnitId,
            });

            if (!conversion) {
                throw new Error('Conversion factor not found.');
            }

            const conversionFactor = conversion.conversionFactor;
            return netWeight * conversionFactor;
        }

        return netWeight;
    } catch (error) {
        console.error(error);
        throw new Error('Error converting net weight.');
    }
};


const inputPhysicalController = {
    getInputPhysCount: async(req, res) => {
        try {
            const foundIngredients = await Ingredient.find().sort({ name: 1 });
            const foundVariations = await IngreVariation.find();
            const foundUnits = await Unit.find();

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

            res.render('inputPhysicalCount', {
                ingredients: foundIngredients,
                ingredientVariations: ingredientVariationsWithDetails,
                units: foundUnits,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while fetching input physical count data.");
        }
    },

    postInputPhysCount: async(req, res) => {
        try {
            const inputs = req.body;

            // Calculate the sum of net weight for each ingredient variation
            const variationSum = {};
            for (const key in inputs) {
                if (inputs.hasOwnProperty(key)) {
                    console.log(inputs.hasOwnProperty(key));

                    // Split the key into type, prefix, and id
                    const [type, prefix, id] = key.split('_');

                    if (type === 'variant' && prefix === 'qty') {
                        // Handling variation quantities
                        const variation = await IngreVariation.findById(id);
                        const ingredientId = variation.ingreID.toString();

                        console.log('variant_qty ID:', ingredientId);
                        if (!variationSum[ingredientId]) {
                            variationSum[ingredientId] = {
                                totalNetWeight: Number(variation.netWeight) * Number(inputs[key]),
                                unitID: variation.unitID,
                            };
                        } else {
                            variationSum[ingredientId].totalNetWeight += Number(variation.netWeight) * Number(inputs[key]);
                            console.log('variant_qty ID:', ingredientId);
                        }
                    } else if (type === 'others' && prefix === 'netwt') {
                        // Handling ingredients with no packaging option
                        const ingredientId = id;
                        console.log('others_netwt:', ingredientId);
                        if (!variationSum[ingredientId]) {
                            variationSum[ingredientId] = {
                                totalNetWeight: Number(inputs[key]),
                                unitID: inputs[`others_unit_${ingredientId}`], // Get the unit ID for consumed/partials from corresponding input
                            };
                        } else {
                            variationSum[ingredientId].totalNetWeight += Number(inputs[key]);
                            console.log('others_netwt:', ingredientId);
                        }
                    }
                }
            }

            console.log('Variation Sum:', variationSum);

            // Compare the variation sum with the main ingredient's total net weight
            for (const ingredientId in variationSum) {
                if (variationSum.hasOwnProperty(ingredientId)) {
                    const variationTotalNetWeight = variationSum[ingredientId].totalNetWeight;
                    const ingredient = await Ingredient.findById(ingredientId);

                    if (ingredient) {
                        const mainIngredientTotalNetWeight = Number(ingredient.totalNetWeight);
                        const convertedTotalNetWeight = await convertNetWeight(
                            variationTotalNetWeight,
                            variationSum[ingredientId].unitID,
                            ingredient.unitID.toString() // Convert the unit ID to string for comparison
                        );

                        const difference = convertedTotalNetWeight - mainIngredientTotalNetWeight;

                        // Get the current date
                        const currentDate = new Date();

                        // Find the user by their username
                        const user = await User.findOne({ userName: req.session.userName });
                        // Get the user ID
                        const userId = user._id;

                        // Create a mismatch record in the audit
                        console.log('Mismatch Calculation:');
                        console.log('---------------------');
                        console.log('Ingredient ID:', ingredientId);
                        console.log('Ingredient Name:', ingredient.name);
                        console.log('Main Ingredient Total Net Weight:', mainIngredientTotalNetWeight);
                        console.log('Variation Total Net Weight:', variationTotalNetWeight);
                        console.log('Converted Total Net Weight:', convertedTotalNetWeight);
                        console.log('Difference:', difference);
                        console.log('Unit ID:', ingredient.unitID);

                        const mismatch = new Mismatch({
                            ingreID: ingredientId,
                            date: currentDate,
                            doneBy: userId,
                            difference,
                            unitID: ingredient.unitID,
                        });
                        await mismatch.save();
                    }
                }
            }

            res.send('Check console');
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred while processing the physical count.');
        }
    }


};

module.exports = inputPhysicalController;