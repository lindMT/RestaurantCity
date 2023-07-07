const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const Conversion = require("../model/conversionSchema.js");
const purchasedIngre = require("../model/purchasedSchema.js");
const bcrypt = require("bcrypt");

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
            // For net weight accumulation
            let totalNetWeight = 0;

            // User Inputs
            const ingredientId = req.body.ingreId;
            const variantId = req.body.ingreNetUnit;
            const inputQty = req.body.ingreQty;

            // Other variables
            const foundIngredient = await Ingredient.findById(ingredientId);
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

                await newIngreVariation.save();
                foundVariant = newIngreVariation;
            } else {
                foundVariant = await IngreVariation.findById(variantId);
            }

            const foundUnit = await Unit.findById(foundVariant.unitID);

            if (!foundIngredient.unitID.equals(foundUnit._id)) {
                // Use conversion factor
                const conFactor = await Conversion.findOne({
                    initialUnitId: foundUnit._id,
                    convertedUnitId: foundIngredient.unitID,
                });

                totalNetWeight = inputQty * (foundVariant.netWeight * conFactor.conversionFactor);
                console.log("Conversion Factor:", conFactor.conversionFactor);
            } else {
                totalNetWeight = inputQty * foundVariant.netWeight;
                console.log(totalNetWeight + "=" + inputQty + "*" + foundVariant.netWeight);
            }

            foundIngredient.totalNetWeight = Number(foundIngredient.totalNetWeight) + Number(totalNetWeight);
            await foundIngredient.save();


            // Get the current date
            const currentDate = new Date();

            // Find the user by their username
            const user = await User.findOne({ userName: req.session.userName });

            // Get the user ID
            const userId = user._id;

            //Add ingredient to purchased audit.
            const auditIngredient = new purchasedIngre({
                ingreID: foundIngredient._id,
                date: currentDate,
                varID: foundVariant._id,
                qty: inputQty,
                doneBy: userId,
            });

            await auditIngredient.save();

            return res.render('recordAddtlSuccess', { title: "Record Addional Purchase", message: 'New ingredient variant added successfully!' });

        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while updating the ingredient's running total.");
        }
    }
}

module.exports = recordAddtlController;