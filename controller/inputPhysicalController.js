const User = require('../model/usersSchema.js');
const Ingredient = require("../model/ingredientsSchema.js");
const Unit = require("../model/unitsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const bcrypt = require("bcrypt");
const Mismatch = require("../model/mismatchSchema.js");

const inputPhysicalController = {
    getInputPhysCount: async(req, res) => {
        const foundIngredients = await Ingredient.find().sort({ name: 1 });
        const foundVariations = await IngreVariation.find()
        const foundUnits = await Unit.find()

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

        // TODO: add units

        await res.render('inputPhysicalCount', {
            ingredients: foundIngredients,
            ingredientVariations: ingredientVariationsWithDetails,
            units: foundUnits
        })
    },

    postInputPhysCount: async(req, res) => {
        const inputs = req.body;

        for (const key in inputs) {
            if (inputs.hasOwnProperty(key)) {
            const inputValue = inputs[key];
            console.log(key + ': ' + inputValue);
            }
        }

        res.send("Check console")
    }

    // postInputPhysCount1: async(req, res) => {
    //     const inputId = req.body.ingreId;

    //     // Ingredient selected
    //     const foundIngredient = await Ingredient.findById(inputId);

    //     // Find variations
    //     const ingredientVariations = await IngreVariation.find({ ingreID: inputId });

    //     // Retrieve foundIngredient unit + all units from the database
    //     const foundIngredientUnit = await Unit.findById(foundIngredient.unitID)
    //     const units = await Unit.find();

    //     const ingredientVariationsWithDetails = await Promise.all(
    //         ingredientVariations.map(async(variation) => {
    //             const unit = await Unit.findById(variation.unitID);
    //             const ingredient = await Ingredient.findById(variation.ingreID);

    //             const unitSymbol = unit ? unit.unitSymbol : '';
    //             const ingredientName = ingredient ? ingredient.name : '';

    //             return {
    //                 ...variation.toObject(),
    //                 unitSymbol,
    //                 ingredientName,
    //             };
    //         })
    //     );

    //     console.log(ingredientVariationsWithDetails);

    //     res.render('inputPhysicalCountP2', {
    //         ingredient: foundIngredient,
    //         ingredientVariations: ingredientVariationsWithDetails,
    //         ingredientUnit: foundIngredientUnit.unitSymbol,
    //         units: units
    //     })
    // },

    // postInputPhysCount2: async(req, res) => {
    //     try {
    //         // Retrieve the submitted physical count data from the request body
    //         const countData = req.body;

    //         // Retrieve the selected ingredient ID from the count data
    //         const ingredientId = countData.ingredientId;

    //         // Find the selected ingredient in the database
    //         const foundIngredient = await Ingredient.findById(ingredientId);

    //         // Calculate the total net weight based on the user-input quantity for each variation
    //         let totalNetWeight = 0;

    //         for (let i = 0; i < countData.variations.length; i++) {
    //             const variation = countData.variations[i];
    //             const variationId = variation.variationId;
    //             const quantity = variation.quantity;

    //             // Find the variation in the database
    //             const foundVariation = await IngreVariation.findById(variationId);

    //             // Calculate the net weight for the variation based on the user-input quantity
    //             const variationNetWeight = foundVariation.netWeight * quantity;
    //             totalNetWeight += variationNetWeight;
    //         }

    //         // Compare the total net weight with the current totalNetWeight of the ingredient
    //         if (totalNetWeight !== foundIngredient.totalNetWeight) {
    //             // If there is a mismatch, create a new mismatch record
    //             const mismatch = new Mismatch({
    //                 ingreID: foundIngredient._id,
    //                 date: new Date().toISOString(),
    //                 varID: null, // Specify the appropriate variation ID if necessary
    //                 difference: foundIngredient.totalNetWeight - totalNetWeight,
    //                 doneBy: req.session.userId,
    //             });

    //             await mismatch.save();
    //         }

    //         // Pass the ingredient and mismatch information to the next page
    //         res.render('physicalCountSuccess', {
    //             title: 'Physical Count',
    //             message: 'The physical count has been recorded successfully!',
    //             ingredient: foundIngredient,
    //             hasMismatch: totalNetWeight !== foundIngredient.totalNetWeight,
    //         });
    //     } catch (error) {
    //         // Handle error if any
    //         console.error(error);
    //         res.status(500).send('An error occurred while recording the physical count.');
    //     }
    // }
}

module.exports = inputPhysicalController;