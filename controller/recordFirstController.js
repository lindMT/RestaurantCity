var User = require('../model/usersSchema.js');
var Unit = require("../model/unitsSchema.js");
var Ingredient = require("../model/ingredientsSchema.js");
var IngreVariation = require("../model/ingreVariationsSchema.js");
var Conversion = require("../model/ingreConversionSchema.js");
var purchasedIngre = require("../model/purchasedSchema.js");
var bcrypt = require("bcrypt");

var convert = require('convert-units');


var recordFirstController = {
    getRecFirst: async(req, res) => {
        var foundIngredients = await Ingredient.find().sort({ name: 1 });

        await res.render('recordFirstP1', {
            ingredients: foundIngredients,
        })
    },

    postRecFirst1: async(req, res) => {
        var inputIngreId = req.body.ingreId

        // For passing to EJS file
        var foundIngredient = await Ingredient.findById(inputIngreId)
        var foundUnits = await Unit.find();

        await res.render('recordFirstP2', {
            ingredient: foundIngredient,
            units: foundUnits
        })
    },

    postRecFirst2: async(req, res) => {
        // User Inputs
        var inputId = req.body.ingreId;
        var inputVariantName = req.body.ingreVariantName;
        var inputNetWt = req.body.ingreNetWt;
        var inputUnit = req.body.ingreUnit;

        // Check if there is quantity later
        var inputQty = req.body.ingreQty;
        var newVariant;
        var addedMsg = 0;

        // For updating ingredient
        var foundIngredient = await Ingredient.findById(inputId)
        var foundIngredientUnit = await Unit.findById(foundIngredient.unitID)

        var foundUnit = await Unit.findOne({ unitSymbol: inputUnit });

        if (inputVariantName === "") {
            variationName = inputNetWt + " " + foundUnit.unitSymbol
        } else {
            variationName = inputVariantName;
        }

        if (inputQty !== undefined) {
            let totalNetWt = inputNetWt * inputQty

            // Check Unit if NOT same with ingredient default
            // if (inputUnit !== foundIngredientUnit.unitSymbol) {
            //     // ==================================
            //     // TODO: BOUND TO CHANGE AFTER CONVERSION TABLE IS DONE
            //     // ==================================
            //     totalNetWt = convert(totalNetWt).from(inputUnit).to(foundIngredientUnit.unitSymbol)
            // }

            // Update inventory
            foundIngredient.totalNetWeight = Number(foundIngredient.totalNetWeight) + Number(totalNetWt);
            addedMsg = Number(totalNetWt);
        } else {
            inputQty = 1;

            // Update inventory
            // if (inputUnit !== foundIngredientUnit.unitSymbol) {
            //     // ==================================
            //     // TODO: BOUND TO CHANGE AFTER CONVERSION TABLE IS DONE
            //     // ==================================
            //     inputNetWt = convert(inputNetWt).from(inputUnit).to(foundIngredientUnit.unitSymbol)
            // }

            foundIngredient.totalNetWeight = Number(foundIngredient.totalNetWeight) + Number(inputNetWt);
            addedMsg = Number(inputNetWt);
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
            message: 'New variant added to inventory',
            ingredient: foundIngredient,
            variant: newVariant,
            totalNetWt: addedMsg,
            ingredientUnit: foundIngredientUnit.unitSymbol
        });
    },

}

module.exports = recordFirstController;