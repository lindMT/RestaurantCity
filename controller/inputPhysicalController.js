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
        if (isNaN(conversionFactor)) {
            throw new Error('Invalid conversion factor.');
        }

        const convertedNetWeight = netWeight * conversionFactor; // Apply the correct conversion factor here
        console.log('Net weight:', netWeight);
        console.log('Initial unit ID:', initialUnitId);
        console.log('Converted unit ID:', convertedUnitId);
        console.log('Conversion factor:', conversionFactor);
        console.log('Converted net weight:', convertedNetWeight);

        return convertedNetWeight;
    } catch (error) {
        console.error('Error converting net weight:', error);
        throw error;
    }
};

const inputPhysicalController = {
    getInputPhysCount: async(req, res) => {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
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
        }else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postInputPhysCount: async(req, res) => {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            try {
                const inputs = req.body;
                const netWeightSum = {}; // To store the net weight sum for each main ingredient
    
                // Handle ingredients with no packaging options (e.g., Beef)
                for (const key in inputs) {
                    if (inputs.hasOwnProperty(key)) {
                        const [type, prefix, id] = key.split('_');
    
                        if (type === 'others' && prefix === 'netwt') {
                            // Handling ingredients with no packaging option (partials)
                            const ingredientId = id;
                            const partialsNetWeight = Number(inputs[key]) || 0; // Use the actual net weight of the partials in grams (default to 0 if null)
                            if (partialsNetWeight !== 0) {
                                // Only perform conversion if the net weight is provided
                                const partialsUnitID = inputs[`others_unit_${ingredientId}`]; // Get the unit ID for partials from corresponding input
                                const ingredient = await Ingredient.findById(ingredientId);
    
                                // Convert the net weight based on partials' unit asynchronously
                                const convertedNetWeight = await convertNetWeight(
                                    partialsNetWeight,
                                    partialsUnitID,
                                    ingredient.unitID.toString()
                                );
    
                                if (!netWeightSum[ingredientId]) {
                                    netWeightSum[ingredientId] = {
                                        totalNetWeight: convertedNetWeight,
                                        unitID: partialsUnitID, // Use the correct unit ID for partials fetched from the database
                                    };
                                } else {
                                    netWeightSum[ingredientId].totalNetWeight += convertedNetWeight; // Convert the net weight based on partials' unit
                                }
                            } else {
                                // If net weight and unit are not provided, set net weight to 0 and the unit to the main ingredient unit
                                const ingredient = await Ingredient.findById(ingredientId);
    
                                if (ingredient) {
                                    netWeightSum[ingredientId] = netWeightSum[ingredientId] || {
                                        totalNetWeight: 0,
                                        unitID: ingredient.unitID,
    
                                    }
                                }
                            }
                        }
                    }
                }
    
                // Loop through the input fields to handle ingredient variations and partials
                for (const key in inputs) {
                    if (inputs.hasOwnProperty(key)) {
                        const [type, prefix, id] = key.split('_');
    
                        if (type === 'variant' && prefix === 'qty') {
                            // Handling variation quantities
                            const variation = await IngreVariation.findById(id);
                            const ingredientId = variation.ingreID.toString();
    
                            // Find the main ingredient related to this variation
                            const ingredient = await Ingredient.findById(ingredientId);
    
                            // Call convertNetWeight to convert the net weight of the variation
                            const convertedNetWeight = await convertNetWeight(
                                Number(variation.netWeight) * Number(inputs[key]), // Net weight of the variation * Quantity Left
                                variation.unitID.toString(), // Initial unit ID of the variation
                                ingredient.unitID.toString() // Converted unit ID of the main ingredient
                            );
    
                            // Add the net weight of the opened/partials, if provided, to the converted net weight
                            const partialsNetWeight = Number(inputs[`partials_${id}`]) || 0; // Get the net weight of the partials (default to 0 if null)
                            const partialsUnitID = variation.unitID.toString(); // Use the same unit ID as the variation
                            const convertedPartialsNetWeight = await convertNetWeight(
                                partialsNetWeight,
                                partialsUnitID,
                                ingredient.unitID.toString()
                            );
    
                            netWeightSum[ingredientId] = netWeightSum[ingredientId] || {
                                totalNetWeight: 0,
                                unitID: variation.unitID, // Use the correct unit ID for the variation
                            };
    
                            netWeightSum[ingredientId].totalNetWeight += convertedNetWeight + convertedPartialsNetWeight;
                        }
                    }
                }
    
                // Create an array to store mismatched data
                const mismatches = [];
    
                // Compare the variation sum with the main ingredient's total net weight
                for (const ingredientId in netWeightSum) {
                    if (netWeightSum.hasOwnProperty(ingredientId)) {
                        const variationTotalNetWeight = netWeightSum[ingredientId].totalNetWeight;
                        const ingredient = await Ingredient.findById(ingredientId);
    
                        if (ingredient) {
                            const mainIngredientTotalNetWeight = Number(ingredient.totalNetWeight);
    
                            const difference = variationTotalNetWeight - mainIngredientTotalNetWeight;
    
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
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    }

        
};
module.exports = inputPhysicalController;