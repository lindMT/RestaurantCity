const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const Conversion = require("../model/conversionSchema.js")
const bcrypt = require("bcrypt");

const recordAddtlController = {

    getRecAddtl: async (req, res) => {
        const foundIngredients = await Ingredient.find().sort({name: 1});
        
        await res.render('recordAddtlP1', {
                ingredients: foundIngredients,
            })
    },

    postRecAddtl1: async (req, res) => {
        // TODO: Search for INGREDIENT
        // TODO: Search for UNITS
        const foundVariants = await IngreVariation.find({ingreID: req.body.ingreId});
        const foundIngredient = await Ingredient.findById(req.body.ingreId);
        const foundUnits = await Unit.find();

        await res.render('recordAddtlP2', {
            variants: foundVariants,
            ingredient: foundIngredient,
            units: foundUnits
        })
    },

    postRecAddtl2: async (req, res) => {
        // For net weight accummulation
        var totalNetWeight = 0;

        // User Inputs
        const ingredientId = req.body.ingreId
        const variantId = req.body.ingreNetUnit;
        const inputQty = req.body.ingreQty;

        // Other variables
        const foundIngredient = await Ingredient.findById(ingredientId);
        var foundVariant;

        if(variantId == "others") {
            const inputNetWt = req.body.ingreNetWt;
            const inputUnit = req.body.ingreUnit;
            const foundUnit = await Unit.findOne({unitSymbol: inputUnit});

            const newIngreVariation = new IngreVariation({
                ingreID: ingredientId,
                unitID: foundUnit._id,
                netWeight: inputNetWt,
            }); 

            await newIngreVariation.save();

            foundVariant = await IngreVariation.findById(newIngreVariation._id);

            // console.log("test: " + foundVariant._id)
        } else {
            foundVariant = await IngreVariation.findById(variantId);
        }  

        const foundUnit = await Unit.findById(foundVariant.unitID);

        if(!foundIngredient.unitID.equals(foundUnit._id)){
            // Use conversion factor
            const conFactor = await Conversion.findOne({initialUnitId: foundUnit._id, convertedUnitId: foundIngredient.unitID});
            // console.log("Confactor id: " + conFactor._id)
            
            totalNetWeight = inputQty * (foundVariant.netWeight * conFactor.conversionFactor);
        }else{
            totalNetWeight = inputQty * foundVariant.netWeight;
        }

        // TODO:
        //  [x] - Compute total net weight
        //  [ ] - update Ingredient Object's running total
        //  [ ] - Success Page
    }
}

module.exports = recordAddtlController;