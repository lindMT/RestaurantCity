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
        // const foundVariants = await IngreVariation.find({ingreID: req.body.ingreId});
        
        // await res.render('recordAddtlP2', {
        //     variants: foundVariants,
        // })

        console.log(req.body.ingreId)

        await IngreVariation.find({ingreID: req.body.ingreId})
            .then((foundVariants) =>{
                console.log(foundVariants)

                res.render('recordAddtlP2', {
                    variants: foundVariants,
                })
            })
            .catch((err) =>{
                console.log(err);
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