const User = require('../model/usersSchema.js');

// ingredients
const Ingredients = require('../model/ingredientsSchema.js');
const Unit = require("../model/unitsSchema.js");
const fixedConversion = require("../model/fixedConversionSchema.js");
const ingreVariations = require("../model/ingreVariationsSchema.js");

// consumed
const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');

// purchased
const purchasedIngre = require("../model/purchasedSchema.js");

// lost
const discardedIngre = require("../model/discardedSchema.js");
const mismatch = require("../model/mismatchSchema.js");

const bcrypt = require("bcrypt");

const viewReportController = {
    getPeriodical: function(req, res) {
        res.render('viewPeriodical');
    },

    getCustom: async function(req, res) {
        try {
            var ingres = await Ingredients.find({});
            var ingreVars = await ingreVariations.find({});
            var units = await Unit.find({});
            var conversions = await fixedConversion.find({});
            var dishes = await Dish.find({});
            var dishRecipes = await DishRecipe.find({});
            var orders = await Order.find({});
            var orderItems = await OrderItem.find({});
            var purchases = await purchasedIngre.find({});
            var discardeds = await discardedIngre.find({});
            var mismatches = await mismatch.find({});

            var totalPurchased = 0;
            var purchasesValues = [];

            for(var i = 0; i < ingres.length; i++){
                console.log("totalPurchased = " + totalPurchased);
                console.log("Current Ingre: " + ingres[i].name);
                for (var j = 0; j < purchases.length; j++){
                    // check if the purchase is for the ingredient
                    if (ingres[i]._id.toString() == purchases[j].ingreID.toString()){
                        // check if has variation or not
                        if (ingres[i].hasVariant == true){
                            // get variant
                            console.log("purchases.varID: " + purchases[j].varID.toString());
                            for (var k = 0; k < ingreVars.length; k++){
                                if (purchases[j].varID.toString() == ingreVars[k]._id.toString()) {
                                    console.log("ingreVars._ID: " + ingreVars[k]._id.toString());
                                    // check if the variant's unit matches the ingredient's unit
                                    if(ingres[i].unitID.toString() == ingreVars[k].unitID.toString()){
                                        // if yes, add value as is
                                        console.log("Unit Match For Has Variant");
                                        console.log("NetWeight: " + ingreVars[k].netWeight);
                                        console.log("Qty: " + purchases[j].qty);
                                        totalPurchased += +(ingreVars[k].netWeight*purchases[j].qty);
                                    }else{
                                        // if no, convert
                                        console.log("Unit Not Match For Has Variant");
                                        var fromID = ingreVars[k].unitID.toString();
                                        var toID = ingres[i].unitID.toString();
                                        var multiplier = 0;
                                        var convertedVal = 0;
                                        // console.log(fromID);
                                        // console.log(toID);
                                        for (var l = 0; l < conversions.length; l++){
                                            // get conversion factor
                                            console.log("InitUnitID: " + conversions[l].initialUnitId.toString());
                                            if (fromID == conversions[l].initialUnitId.toString()){
                                                console.log("FromID Match Found");
                                                console.log("ConvertedUnitID: " + conversions[l].convertedUnitId.toString());
                                                if (toID == conversions[l].convertedUnitId.toString()){
                                                    console.log("ToID Match Found");
                                                    multiplier = conversions[l].conversionFactor;
                                                    console.log("Multiplier: " + multiplier);
                                                }else{
                                                    console.log("ToID Match Not Found");
                                                }
                                            }else{
                                                console.log("FromID Match Not Found");
                                            }
                                        }
                                        // convert netWeight
                                        convertedVal = +(ingreVars[k].netWeight*multiplier);

                                        // add to totalPurchased
                                        totalPurchased += +(convertedVal*purchases[j].qty);
                                    }
                                }
                            }
                        }else{ //hasVariant == false
                            // check if the unit indicated matches the ingredient's unit
                            if(purchases[j].unitID.toString() == ingres[i].unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match For Has No Variant");
                                console.log("NetWeight: " + purchases[j].netWeight);
                                totalPurchased += +purchases[j].netWeight;
                            }else{
                                // if no, convert
                                console.log("Unit Not Match For Has No Variant");
                                var fromID = purchases[j].unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;
                                console.log("FromID: " + fromID);
                                console.log("ToID: " + toID);
                                for (var l = 0; l < conversions.length; l++){
                                    // get conversion factor
                                    console.log("InitUnitID: " + conversions[l].initialUnitId.toString());
                                    if (fromID == conversions[l].initialUnitId.toString()){
                                        console.log("FromID Match Found");
                                        console.log("ConvertedUnitID: " + conversions[l].convertedUnitId.toString());
                                        if (toID == conversions[l].convertedUnitId.toString()){
                                            console.log("ToID Match Found");
                                            multiplier = conversions[l].conversionFactor;
                                            console.log("Multiplier: " + multiplier);
                                        }else{
                                            console.log("ToID Match Not Found");
                                        }
                                    }else{
                                        console.log("FromID Match Not Found");
                                    }
                                } 
                                // convert netWeight
                                convertedVal = purchases[j].netWeight*multiplier;
                                console.log("Converted: " + convertedVal);

                                // add to totalPurchased
                                console.log("totalPurchased: "+ totalPurchased);
                                totalPurchased += +convertedVal;
                                console.log("totalPurchased: "+ totalPurchased);
                            }
                        }
                    }
                }
                purchasesValues[i] = totalPurchased;
                console.log("Purchased: " + totalPurchased);
                console.log("purchasesValues[" + i + "] = " + purchasesValues[i]);
                totalPurchased = 0;
            }
            
            // console.log("ingres.length = " + ingres.length);
            // console.log("purchasesValues length = " + purchasesValues.length);
            // console.log(ingres);
            res.render('viewCustom', {ingres, ingreVars, units, conversions, dishes, dishRecipes, orders, orderItems, purchases, discardeds, mismatches, purchasesValues});
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred");
        }
    },

    getDetailed: function(req, res) {
        res.render('detailedReport');
    }
}

module.exports = viewReportController;