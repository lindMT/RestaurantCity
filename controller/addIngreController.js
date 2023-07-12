const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const purchasedIngre = require("../model/purchasedSchema.js");
const bcrypt = require("bcrypt");

const addIngreController = {
    getAddIngre: async(req, res) => {
        const foundIngredients = await Ingredient.find().sort({ name: 1 });

        await res.render('addNewIngredientP1', {
            ingredients: foundIngredients
        })
    },

    postAddIngre1: async(req, res) => {
        if (req.body.ingreId === "others") {
            let newIngredientName = req.body.ingreName

            return res.render('addNewIngredientP2', {
                ingredient: newIngredientName
            })
        } else {
            // TODO: Found Ingredient must have UNIT SYMBOLS (Map)
            let foundIngredient = await Ingredient.findById(req.body.ingreId);
            let ingredientVariations = await IngreVariation.find({ ingreID: req.body.ingreId });
            // console.log(ingredientVariations);

            // Retrieve the unit for the found ingredient
            let unit = await Unit.findById(foundIngredient.unitID);

            // Retrieve the unit symbols for ingredient variations
            const ingredientVariationsWithUnitSymbols = await Promise.all(
                ingredientVariations.map(async(variation) => {
                    const unit = await Unit.findById(variation.unitID);
                    const unitSymbol = unit ? unit.unitSymbol : '';
                    return {
                        ...variation.toObject(),
                        unitSymbol,
                    };
                })
            );

            // console.log(ingredientVariationsWithUnitSymbols);

            return res.render('addNewIngredientP3', {
                ingredient: foundIngredient,
                ingredientVariants: ingredientVariationsWithUnitSymbols
            });
        }
    },

    postAddIngre2a: async(req, res) => {
        // Access the ingredient and ingredient variations from the request body
        const newIngredientName = req.body.ingredientName


        // Check if the ingredient name already exists in the database
        const existingIngredient = await Ingredient.findOne({ name: newIngredientName });

        const unit = await Unit.findOne({ unitSymbol: req.body.ingreUnit });


        if (!existingIngredient) { //if ingredient does not exist
            const totalNetWeight = req.body.ingreNetWt * req.body.ingreQty
            const newIngredient = new Ingredient({
                name: newIngredientName,
                category: req.body.ingreCategory,
                unitID: unit._id,
                totalNetWeight: totalNetWeight,
                reorderPoint: 0
            });

            // Save the new ingredient to the database
            await newIngredient.save();


            let variationName;
            if (req.body.ingreVariantName === "") {
                variationName = req.body.ingreNetWt + " " + unit.unitSymbol
            } else {
                variationName = req.body.ingreVariantName;
            }

            const newVariant = new IngreVariation({
                name: variationName,
                ingreID: newIngredient._id,
                unitID: newIngredient.unitID,
                netWeight: req.body.ingreNetWt
            });

            await newVariant.save();


            //TO-DO:
            // 1. add audit
            // 2. error checking
            res.send("Added ingre");
        }
    },


    postAddIngre2b: async(req, res) => {
        // Access the ingredient and ingredient variations from the request body
        const foundIngredient = req.body.ingredient

        const ingredientVariants = req.body.ingredientVariants

        console.log(foundIngredient)

        const unit = await Unit.findOne({ unitSymbol: req.body.ingreUnit });
        console.log(unit)
        if (foundIngredient) {
            let variationName;
            if (req.body.ingreVariantName === "") {
                variationName = req.body.ingreQty + unit.unitSymbol
            } else {
                variationName = req.body.ingreVariantName;
            }

            let ingreQty = req.body.ingreQty

            const newVariant = new IngreVariation({
                name: variationName,
                ingreID: foundIngredient._id,
                unitID: foundIngredient.unitID,
                netWeight: req.body.ingreNetWt
            });

            // console.log(variationName)
        }

    }
};



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// --
// TODO: create post separately P2 & P3
// --
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



// <<<<<<< Updated upstream
//     postAddIngredientAndVariation: async(req, res) => {
//         const ingreQty = req.body.ingreQty;
//         const ingreNetWt = req.body.ingreNetWt;
//         const totalNetWeight = ingreQty * ingreNetWt;

//             return res.render('addNewIngredientP2', {
//                 ingredient: newIngredientName
//             })
//         }else{
//             let foundIngredient = await Ingredient.findById(req.body.ingreId);
//             console.log(foundIngredient)

//             return res.render('addNewIngredientP3', {
//                 ingredient: foundIngredient
//             })
//         }
// <<<<<<< Updated upstream

//         // Create a new ingredient instance
//         const ingredient = new Ingredient({
//             name: req.body.ingreName,
//             category: req.body.ingreCategory,
//             unitID: unit._id,
//             totalNetWeight: totalNetWeight,
//             reorderPoint: 0
//         });

//         // Save the ingredient to the database
//         await ingredient.save();

//         // Find the ingredient by its name
//         const savedIngredient = await Ingredient.findOne({ name: req.body.ingreName });

//         // Create a new ingredient variation
//         const ingreVariation = new IngreVariation({
//             ingreID: savedIngredient._id,
//             unitID: unit._id,
//             netWeight: ingreNetWt,
//         });

//         // Save the ingredient variation to the database
//         await ingreVariation.save();

//         // Get the current date
//         const currentDate = new Date();

//         // Find the user by their username
//         const user = await User.findOne({ userName: req.session.userName });

//         // Get the user ID
//         const userId = user._id;

//         const auditIngredient = new purchasedIngre({
//             ingreID: savedIngredient._id,
//             date: currentDate,
//             varID: ingreVariation._id,
//             qty: ingreQty,
//             doneBy: userId,
//         });

//         await auditIngredient.save();

//         return res.render('addNewIngredientSuccess', { title: "Add New Ingredient", message: 'New ingredient added successfully!', ingredient: ingredient, unit: unit });
// =======
// >>>>>>> Stashed changes
//     },

// postAddIngredientAndVariation: async(req, res) => {
//     const ingreQty = req.body.ingreQty;
//     const ingreNetWt = req.body.ingreNetWt;
//     const totalNetWeight = ingreQty * ingreNetWt;

//     // Find the record of unit in the units collection based on the unit symbol (ingreUnit)
//     const unit = await Unit.findOne({ unitSymbol: req.body.ingreUnit });

//     // Check if the ingredient name already exists in the database
//     const existingIngredient = await Ingredient.findOne({ name: req.body.ingreName });

//     if (existingIngredient) {
//         // Prompt the user to go to the "record additional purchase"
//         return res.render('addNewIngredientError', { message: 'The ingredient you added ALREADY EXISTS in the inventory. Please use the Record Additional Purchase module.' });
//     }

//     // Create a new ingredient instance
//     const ingredient = new Ingredient({
//         name: req.body.ingreName,
//         category: req.body.ingreCategory,
//         unitID: unit._id,
//         totalNetWeight: totalNetWeight,
//         reorderPoint: 0
//     });

//     // Save the ingredient to the database
//     await ingredient.save();

//     // Find the ingredient by its name
//     const savedIngredient = await Ingredient.findOne({ name: req.body.ingreName });

//     // Create a new ingredient variation
//     const ingreVariation = new IngreVariation({
//         ingreID: savedIngredient._id,
//         unitID: unit._id,
//         netWeight: ingreNetWt,
//     });

//     // Save the ingredient variation to the database
//     await ingreVariation.save();

//     // Get the current date
//     const currentDate = new Date();

//     // Find the user by their username
//     const user = await User.findOne({ userName: req.session.userName });

//     // Get the user ID
//     const userId = user._id;

//     const auditIngredient = new purchasedIngre({
//         ingreID: savedIngredient._id,
//         date: currentDate,
//         varID: ingreVariation._id,
//         qty: ingreQty,
//         doneBy: userId,
//     });

//     await auditIngredient.save();

//     return res.render('addNewIngredientSuccess', { title: "Add New Ingredient", message: 'New ingredient added successfully!', ingredient: ingredient, unit: unit });
// },


module.exports = addIngreController;