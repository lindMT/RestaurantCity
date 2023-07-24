const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const Conversion = require("../model/ingreConversionSchema.js");
const discardedIngre = require("../model/discardedSchema.js");
const bcrypt = require("bcrypt");

const convert = require('convert-units');

const viewInvController = {
    getViewInventory: async function(req, res) {
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

            // Pass the ingredients data to the view
            res.render('viewInventory', { ingredients: ingredientsWithUnitSymbols });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the ingredients.");
        }
    },

    getDiscard: async function(req, res) {
        const foundIngredients = await Ingredient.find().sort({ name: 1 });

        await res.render('discardIngredientP1', {
            ingredients: foundIngredients
        })
    },

    postDiscard1: async function(req, res) {
        const foundVariants = await IngreVariation.find({ ingreID: req.body.ingreId });
        const foundIngredient = await Ingredient.findById(req.body.ingreId);
        const foundUnits = await Unit.find();

        await res.render('discardIngredientP2', {
            variants: foundVariants,
            ingredient: foundIngredient,
            units: foundUnits
        })
    },

    postDiscard2: async function(req, res) {
        try {
            // For net weight accumulation
            let totalNetWeight = 0;

            // User Inputs
            const ingredientId = req.body.ingreId;
            const variantId = req.body.ingreNetUnit;
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

            if (variantId === "others") {
                const inputNetWt = req.body.ingreNetWt;
                const inputUnit = req.body.ingreUnit;
                const foundUnit = await Unit.findOne({ unitSymbol: inputUnit });

                const newIngreVariation = new IngreVariation({
                    ingreID: ingredientId,
                    unitID: foundUnit._id,
                    netWeight: inputNetWt,
                });

                foundVariant = newIngreVariation;
            } else {
                foundVariant = await IngreVariation.findById(variantId);
            }

            // For VARIANT UNIT
            const foundUnit = await Unit.findById(foundVariant.unitID);

            if (!foundIngredient.unitID.equals(foundUnit._id)) {
                // ==================================
                // TODO: BOUND TO CHANGE AFTER CONVERSION IMPLEMENTATION
                // ==================================
                totalNetWeight = convert(foundVariant.netWeight).from(foundUnit.unitSymbol).to(foundIngredientUnit.unitSymbol)

                totalNetWeight = inputQty * Number(totalNetWeight);
                // console.log("Conversion Factor:", conFactor.conversionFactor);
                console.log("NOT EQUAL: " + totalNetWeight)
            } else {
                totalNetWeight = inputQty * foundVariant.netWeight;
                console.log("EQUAL: " + totalNetWeight)
            }

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
    }
};

module.exports = viewInvController;