const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const FixedConversion = require("../model/fixedConversionSchema.js");
const discardedIngre = require("../model/discardedSchema.js");
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

const formatNetWeight = async(ingredients) => {
    return ingredients.map((ingredient) => ({
        ...ingredient,
        totalNetWeight: Number(ingredient.totalNetWeight).toFixed(2),
    }));
}

const formatReorder = async(ingredients) => {
    return ingredients.map((ingredient) => ({
        ...ingredient,
        reorderPoint: Number(ingredient.reorderPoint).toFixed(2),
    }));
}

const viewInvController = {
    getViewInventory: async function(req, res) {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            try {
                // Retrieve all ingredients from the database
                const ingredients = await Ingredient.find().sort({name: 1});

                // Retrieve all units from the database
                const units = await Unit.find();

                // Map the unit IDs to unit symbols in the ingredients array
                const ingredientsWithUnitSymbols = ingredients.map(ingredient => {
                    const unit = units.find(unit => unit._id.equals(ingredient.unitID));
                    return {
                        ...ingredient.toObject(),
                        unitSymbol: unit ? unit.unitSymbol : ''
                    };
                });

                console.log(ingredientsWithUnitSymbols)

                const netWeightsFormatted = await formatNetWeight(ingredientsWithUnitSymbols);
                const reorderFormatted = await formatReorder(ingredientsWithUnitSymbols);

                console.log(netWeightsFormatted)

                // Pass the ingredients data to the view
                res.render('viewInventory', { 
                    ingredients: ingredientsWithUnitSymbols,
                    netWeights: netWeightsFormatted,
                    reorderPoints: reorderFormatted
                });
            } catch (error) {
                console.error(error);
                res.status(500).send("An error occurred while retrieving the ingredients.");
            }
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    getDiscard: async function(req, res) {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            const foundIngredients = await Ingredient.find().sort({ name: 1 });

            await res.render('discardIngredientP1', {
                ingredients: foundIngredients
            })
        }else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        } 
    },

    postDiscard1: async function(req, res) {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            const foundVariants = await IngreVariation.find({ ingreID: req.body.ingreId });
            const foundIngredient = await Ingredient.findById(req.body.ingreId);
            const foundUnits = await Unit.find();

            await res.render('discardIngredientP2', {
                variants: foundVariants,
                ingredient: foundIngredient,
                units: foundUnits
            })
        }else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postDiscard2: async function(req, res) {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            try {
                // For net weight accumulation
                let totalNetWeight = 0;
    
                // User Inputs
                const ingredientId = req.body.ingreId;
                var variantId = req.body.ingreNetUnit;
                var inputQty = req.body.ingreQty;
    
                // For auditing
                var auditDiscard;
                // For checking: Did user use a variant?
                var hasUsedVariant;
    
                console.log("inputQty: " + inputQty)
    
                if(inputQty === undefined){
                    inputQty = 1;
                    hasUsedVariant = false;
                }else{
                    hasUsedVariant = true;
                }
    
                // Other variables
                const foundIngredient = await Ingredient.findById(ingredientId);
                const foundIngredientUnit = await Unit.findById(foundIngredient.unitID);
                let foundVariant;
    
                if (!(foundIngredient.hasVariant) || variantId === "others") {
                    const inputNetWt = req.body.ingreNetWt;
                    const inputUnit = req.body.ingreUnit;
                    const foundUnit = await Unit.findOne({ unitSymbol: inputUnit });
    
                    const newIngreVariation = new IngreVariation({
                        ingreID: ingredientId,
                        unitID: foundUnit._id,
                        netWeight: inputNetWt,
                    });
    
                    foundVariant = newIngreVariation;
                } else if (variantId !== undefined) {
                    foundVariant = await IngreVariation.findById(variantId);
                }
    
                // For VARIANT UNIT
                const foundUnit = await Unit.findById(foundVariant.unitID);
    
                totalNetWeight = await convertNetWeight(foundVariant.netWeight, foundUnit._id, foundIngredientUnit._id);
                totalNetWeight = inputQty * Number(totalNetWeight);
    
                if (totalNetWeight <= foundIngredient.totalNetWeight) {
                    foundIngredient.totalNetWeight -= totalNetWeight;
    
                    // For prompt
                    let msgUnit = await Unit.findById(foundIngredient.unitID)
    
                    await foundIngredient.save();
    
                    // Get the current date
                    const currentDate = new Date();
    
                    // Find the user by their username
                    const user = await User.findOne({ userName: req.session.userName });
    
                    // Get the user ID
                    const userId = user._id;
    
                    // Add ingredient to discarded audit
                    if(hasUsedVariant){
                        auditDiscard = new discardedIngre({
                            ingreID: foundIngredient._id,
                            date: currentDate,
                            doneBy: userId,
                            varID: foundVariant._id,
                            qty: inputQty
                        });
                    }else{
                        auditDiscard = new discardedIngre({
                            ingreID: foundIngredient._id,
                            date: currentDate,
                            doneBy: userId,
                            netWeight: foundVariant.netWeight,
                            unitID: foundUnit._id
                        });
                    }
    
                    await auditDiscard.save();
    
                    return res.render('discardIngredientSuccess', { title: "Discard Ingredient", 
                                                                    message: 'Successfully discarded ingredient!',
                                                                    ingredient: foundIngredient,
                                                                    unit: msgUnit,
                                                                    totalNet: totalNetWeight});
                } else {
                    return res.render('discardIngredientError', { message: 'The quantity and net weight to be discarded exceeds the available quantity and net weight of the ingredient.' });
                }
    
            } catch (error) {
                console.error(error);
                res.status(500).send("An error occurred while updating the ingredient's running total.");
            }
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        } 
    }
};

module.exports = viewInvController;