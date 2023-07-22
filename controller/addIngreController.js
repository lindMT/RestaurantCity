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
        const foundUnits = await Unit.find();

        await res.render('addNewIngredient', {
            units: foundUnits
        });
    },

    postAddIngre: async(req, res) => {
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


        const fixedConversions = await FixedConversion.find({ initialUnitId: foundUnit._id });
        console.log("Fixed Conversions:", fixedConversions);


        const subUnits = [];


        for (const fixedConversion of fixedConversions) {
            subUnits.push({
                convertedUnitId: fixedConversion.convertedUnitId,
                conversionFactor: fixedConversion.conversionFactor
            });
        }

        console.log('Sub Units:', subUnits);

        const newIngreConverstion = new IngreConversion({
            ingredientId: newIngredient._id,
            initialUnitId: foundUnit._id,
            subUnit: subUnits,
        });

        await newIngreConverstion.save();

        // TODO: To be changed into a page
        return res.render('addNewIngredientSuccess', { title: "Add New Ingredient", message: 'New ingredient added successfully!', ingredient: newIngredient, unit: foundUnit });
    }
};

module.exports = addIngreController;