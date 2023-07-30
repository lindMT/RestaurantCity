const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require("../model/unitsSchema.js");
const Ingredient = require("../model/ingredientsSchema.js");
const IngreVariation = require("../model/ingreVariationsSchema.js");
const IngreConversion = require("../model/ingreConversionSchema.js");
const FixedConversion = require("../model/fixedConversionSchema.js");
const Conversion = require("../model/ingreConversionSchema.js")
const purchasedIngre = require("../model/purchasedSchema.js");
const bcrypt = require("bcrypt");

const addIngreController = {
    getAddIngre: async(req, res) => {
        // req.flash('error_msg', 'Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in.');
        //     console.log("Unauthorized access.");
        //     return res.redirect('/login')

        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "chef")){
            const foundUnits = await Unit.find();

            await res.render('addNewIngredient', {
                units: foundUnits
            });
        } else {
            req.flash('error_msg', 'Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in.');
            console.log("Unauthorized access.");
            return res.redirect('/login')
        }
        
    },

    postAddIngre: async(req, res) => {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "chef")){
            const inputName = req.body.ingreName;
            const inputUnit = req.body.ingreUnit;
            const inputHasVariant = req.body.hasVariant;
            let hasVariant;
            
            const foundUnit = await Unit.findOne({ unitSymbol: inputUnit });
            
            if (inputHasVariant === "Yes") {
                hasVariant = true;
            } else {
                hasVariant = false;
            }
        
            const newIngredient = new Ingredient({
                name: inputName,
                unitID: foundUnit,
                totalNetWeight: 0,
                reorderPoint: 0,
                hasVariant: hasVariant
            });
        
            await newIngredient.save();
        
            // TODO: To be changed into a page
            return res.render('addNewIngredientSuccess', { title: "Add New Ingredient", message: 'New ingredient added successfully!', ingredient: newIngredient, unit: foundUnit });
        } else {
            req.flash('error_msg', 'Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in.');
            console.log("Unauthorized access.");
            return res.redirect('/login')
        }
    }
};

module.exports = addIngreController;