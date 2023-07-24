const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const Mismatch = require("../model/mismatchSchema.js");
const FixedConversion = require("../model/fixedConversionSchema.js");
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
                    // Split the key into type, prefix, and id
                    const [type, prefix, id] = key.split('_');

                    if (type === 'variant' && prefix === 'qty') {
                        // Handling variation quantities
                        const variation = await IngreVariation.findById(id);
                        const ingredientId = variation.ingreID.toString();

                        if (!variationSum[ingredientId]) {
                            variationSum[ingredientId] = {
                                totalNetWeight: Number(variation.netWeight) * Number(inputs[key]),
                                unitID: variation.unitID,
                            };
                        } else {
                            variationSum[ingredientId].totalNetWeight += Number(variation.netWeight) * Number(inputs[key]);
                        }
                    } else if (type === 'others' && prefix === 'netwt') {
                        // Handling ingredients with no packaging option (partials)
                        const ingredientId = id;
                        const partialsUnitID = inputs[`others_unit_${ingredientId}`]; // Get the unit ID for partials from corresponding input
                        const ingredient = await Ingredient.findById(ingredientId);

                        // Convert the net weight based on partials' unit asynchronously
                        const convertedNetWeight = await convertNetWeight(Number(inputs[key]), partialsUnitID, ingredient.unitID.toString()); // Pass ingredientId as the third parameter

                        if (!variationSum[ingredientId]) {
                            variationSum[ingredientId] = {
                                totalNetWeight: convertedNetWeight,
                                unitID: partialsUnitID, // Use the correct unit ID for partials fetched from the database
                            };
                        } else {
                            variationSum[ingredientId].totalNetWeight += convertedNetWeight; // Convert the net weight based on partials' unit
                        }
                    }
                }
            }

            // Create an array to store mismatched data
            const mismatches = [];

            // Compare the variation sum with the main ingredient's total net weight
            for (const ingredientId in variationSum) {
                if (variationSum.hasOwnProperty(ingredientId)) {
                    const variationTotalNetWeight = variationSum[ingredientId].totalNetWeight;
                    const ingredient = await Ingredient.findById(ingredientId);

                    if (ingredient) {
                        const mainIngredientTotalNetWeight = Number(ingredient.totalNetWeight);

                        // Convert the variation's total net weight to the main ingredient's unit of measurement
                        const convertedTotalNetWeight = await convertNetWeight(
                            variationTotalNetWeight,
                            variationSum[ingredientId].unitID,
                            ingredient.unitID.toString() // Convert the unit ID to string for comparison
                        );

                        const difference = convertedTotalNetWeight - mainIngredientTotalNetWeight;

                        // Get the unit symbol of the main ingredient
                        const mainIngredientUnit = await Unit.findById(ingredient.unitID);
                        const unitSymbol = mainIngredientUnit.unitSymbol;

                        // Get the current date
                        const currentDate = new Date();

                        // Find the user by their username
                        const user = await User.findOne({ userName: req.session.userName });
                        // Get the user ID
                        const userId = user._id;

                        // Create a mismatch record in the audit
                        const mismatch = new Mismatch({
                            ingreID: ingredientId, // Use ingredientId obtained from the loop
                            date: currentDate,
                            doneBy: userId,
                            difference,
                            unitID: ingredient.unitID,
                        });

                        // Add the mismatched data to the array
                        mismatches.push({
                            ingredientName: ingredient.name,
                            mainIngredientTotalNetWeight,
                            difference,
                            unitSymbol,
                        });

                        await mismatch.save();

                        console.log(`Ingredient: ${ingredient.name}`);
                        console.log(`Total Net Weight of Ingredient: ${mainIngredientTotalNetWeight}`);
                        console.log(`Total Variant Net Weight (Converted to Main Ingredient's Unit): ${convertedTotalNetWeight}`);
                    }
                }
            }

            // Check if all mismatches have difference = 0
            const allMismatchesZero = mismatches.every((mismatch) => mismatch.difference === 0);

            // Pass the mismatches data to the template engine
            return res.render('inputPhysicalCountP2', {
                title: "Input Physical Count",
                message: allMismatchesZero ? 'No mismatches found.' : 'Ingredient with Mismatches',
                mismatches,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred while processing the physical count.');
        }
    }
};
module.exports = inputPhysicalController;