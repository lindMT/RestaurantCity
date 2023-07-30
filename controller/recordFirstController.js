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

const recordFirstController = {
    
    getRecFirst: async(req, res) => {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            var foundIngredients = await Ingredient.find().sort({ name: 1 });

            await res.render('recordFirstP1', {
                ingredients: foundIngredients,
            })
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postRecFirst1: async(req, res) => {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            var inputIngreId = req.body.ingreId

            // For passing to EJS file
            var foundIngredient = await Ingredient.findById(inputIngreId)
            var foundUnits = await Unit.find();

            await res.render('recordFirstP2', {
                ingredient: foundIngredient,
                units: foundUnits
            })
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postRecFirst2: async(req, res) => {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            // User Inputs
            var inputId = req.body.ingreId;
            var inputVariantName = req.body.ingreVariantName;
            var inputNetWt = req.body.ingreNetWt;
            var inputUnit = req.body.ingreUnit;

            // Check if there is quantity later
            var inputQty = req.body.ingreQty;
            var newVariant;

            // For updating ingredient
            var foundIngredient = await Ingredient.findById(inputId)
            var foundIngredientUnit = await Unit.findById(foundIngredient.unitID)

            var foundOldIngredientNet = foundIngredient.totalNetWeight;
            var foundUnit = await Unit.findOne({ unitSymbol: inputUnit });

            if (inputVariantName === "") {
                variationName = inputNetWt + " " + foundUnit.unitSymbol
            } else {
                variationName = inputVariantName;
            }

            if (inputQty !== undefined) {
                let totalNetWt = inputNetWt * inputQty

                // Update inventory
                foundIngredient.totalNetWeight = Number(foundIngredient.totalNetWeight) + Number(await convertNetWeight(totalNetWt, foundUnit._id, foundIngredientUnit._id));
            } else {
                inputQty = 1;

                foundIngredient.totalNetWeight = Number(foundIngredient.totalNetWeight) + Number(await convertNetWeight(inputNetWt, foundUnit._id, foundIngredientUnit._id));
            }

            await foundIngredient.save();
            console.log("UPDATED INGREDIENT: " + foundIngredient)

            newVariant = new IngreVariation({
                name: variationName,
                ingreID: inputId,
                unitID: foundUnit._id,
                netWeight: inputNetWt
            });

            await newVariant.save();
            console.log("NEW VARIANT: " + newVariant)

            // Get the current date
            var currentDate = new Date();

            // Find the user by their username
            var user = await User.findOne({ userName: req.session.userName });
            // Get the user ID
            var userId = user._id;

            //Add ingredient to purchased audit.
            var auditIngredient = new purchasedIngre({
                ingreID: foundIngredient._id,
                date: currentDate,
                varID: newVariant._id,
                qty: inputQty,
                doneBy: userId,
            });

            await auditIngredient.save()

            res.render('recordFirstSuccess', {
                title: "Record First Purchase",
                message: 'New variant added to inventory!',
                ingredient: foundIngredient,
                variant: newVariant,
                totalNetWt: foundIngredient.totalNetWeight - foundOldIngredientNet,
                ingredientUnit: foundIngredientUnit.unitSymbol
            });
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

}

module.exports = recordFirstController;