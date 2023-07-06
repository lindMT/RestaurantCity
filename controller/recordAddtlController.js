const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
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
        const foundIngredient = await Ingredient.find({ingreID: req.body.ingreId});
        const foundUnits = await Unit.find();

        await res.render('recordAddtlP2', {
            variants: foundVariants,
            ingredient: foundIngredient, // for identifying dry/wet ingredients?
            units: foundUnits
        })
    },

    // TODO: Add POST (Wait till DB is finalized)

    // 1. Ingredient Variation
    // - FIRST -> Check for:
    // 	- ingreId = selected ingredient
    // 	- unit & netweight
    // - If already exists THEN
    // 	- When clicking submit, cockblock
    // - If does NOT exist THEN
    // 	- When clicking submit, continue and show that ingredient has been added to inventory

}

module.exports = recordAddtlController;