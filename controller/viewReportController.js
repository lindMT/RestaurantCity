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

    getCustom: function(req, res) {
        res.render('viewCustom');
    },

    postCustom: async function(req, res) {
        // FOR DATE ARRAY //
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }

        function getDates(startDate, stopDate) {
            var dateArray = new Array();
            var currentDate = startDate;
            console.log(typeof currentDate);
            while (currentDate <= stopDate) {
                dateArray.push(new Date (currentDate));
                currentDate = currentDate.addDays(1);
            }
            return dateArray;
        }

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

            // get date inputs
            var startDate = req.body.startDate;
            var endDate = req.body.endDate;
            console.log(startDate);
            console.log(endDate);

            // FOR FORMATTING DATE //
            // set string to Date type
            const startDateObject = new Date(startDate);
            const endDateObject = new Date(endDate);

            // get the month name using toLocaleString()
            const startMonthName = startDateObject.toLocaleString('default', { month: 'short' });
            const endMonthName = endDateObject.toLocaleString('default', { month: 'short' });

            // extract the components from the Date object
            const syear = startDateObject.getFullYear();
            const sday = startDateObject.getDate();
            const eyear = endDateObject.getFullYear();
            const eday = endDateObject.getDate();

            // create the final date string
            const formattedStartDate = `${startMonthName} ${sday}, ${syear}`;
            const formattedEndDate = `${endMonthName} ${eday}, ${eyear}`;
            console.log(formattedStartDate);
            console.log(formattedEndDate);

            // get dates between start and end
            var dateArray = getDates(startDateObject, endDateObject);
            console.log(dateArray);

            // purchased values
            var totalPurchased = 0;
            var purchasesValues = [];

            // lost values
            var totalLost = 0;
            var lostValues = [];

            // loop through all ingredients
            for(var i = 0; i < ingres.length; i++){
                console.log("totalPurchased = " + totalPurchased);
                console.log("Current Ingre: " + ingres[i].name);
                // loop through all dates
                for (var d = 0; d < dateArray.length; d++){
                    var date;

                    // loop through all purchases
                    for (var j = 0; j < purchases.length; j++){
                        // get date and convert string to Date type
                        date = new Date(purchases[j].date);
                        console.log(date);
                        // check if purchase date matches current date loop
                        if (date.getDate() === dateArray[d].getDate()){
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
                                                    // console.log("InitUnitID: " + conversions[l].initialUnitId.toString());
                                                    if (fromID == conversions[l].initialUnitId.toString()){
                                                        console.log("FromID Match Found");
                                                        // console.log("ConvertedUnitID: " + conversions[l].convertedUnitId.toString());
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
                                                console.log(convertedVal);

                                                // add to totalPurchased
                                                totalPurchased += +(convertedVal*purchases[j].qty);
                                                console.log(totalPurchased);
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
                                            // console.log("InitUnitID: " + conversions[l].initialUnitId.toString());
                                            if (fromID == conversions[l].initialUnitId.toString()){
                                                console.log("FromID Match Found");
                                                // console.log("ConvertedUnitID: " + conversions[l].convertedUnitId.toString());
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
                    }

                    // loop through all discarded
                    for (var a = 0; a < discardeds.length; a++){
                        // get date and convert string to Date type
                        date = new Date(discardeds[a].date);
                        console.log("DISCARDEDS " + date);
                        // check if discardeds date matches current date loop
                        if (date.getDate() === dateArray[d].getDate()){
                            // check if the discard is for the ingredient
                            if (ingres[i]._id.toString() == discardeds[a].ingreID.toString()){
                                console.log(discardeds[a]);
                                // check if the discard is for a variant
                                if (discardeds[a].varID !== undefined){
                                    // with variant
                                    console.log("WITH VARIANT");

                                    // get variant
                                    for (var k = 0; k < ingreVars.length; k++){
                                        if (discardeds[a].varID.toString() == ingreVars[k]._id.toString()) {
                                            // check if unit matches
                                            if(ingres[i].unitID.toString() == ingreVars[k].unitID.toString()){
                                                // if yes, add value as is
                                                console.log("Unit Match For Has Variant");
                                                console.log("NetWeight: " + ingreVars[k].netWeight);
                                                console.log("Qty: " + discardeds[a].qty);
                                                totalLost += +(ingreVars[k].netWeight*discardeds[a].qty);
                                            }else{
                                                //if no, convert
                                                console.log("Unit Not Match For Has Variant");
                                                var fromID = ingreVars[k].unitID.toString();
                                                var toID = ingres[i].unitID.toString();
                                                var multiplier = 0;
                                                var convertedVal = 0;
                                                // console.log(fromID);
                                                // console.log(toID);
                                                for (var l = 0; l < conversions.length; l++){
                                                    // get conversion factor
                                                    // console.log("InitUnitID: " + conversions[l].initialUnitId.toString());
                                                    if (fromID == conversions[l].initialUnitId.toString()){
                                                        // console.log("FromID Match Found");
                                                        // console.log("ConvertedUnitID: " + conversions[l].convertedUnitId.toString());
                                                        if (toID == conversions[l].convertedUnitId.toString()){
                                                            // console.log("ToID Match Found");
                                                            multiplier = conversions[l].conversionFactor;
                                                            console.log("Multiplier: " + multiplier);
                                                        }
                                                    }
                                                }
                                                // convert netWeight
                                                convertedVal = +(ingreVars[k].netWeight*multiplier);
                                                console.log(convertedVal);

                                                // add to totalPurchased
                                                totalLost += +(convertedVal*discardeds[a].qty);
                                                console.log(totalLost);
                                            }
                                        }
                                    }
                                } else {
                                    // no variant
                                    console.log("NO VARIANT");
                                    // check if unit matches
                                    if(discardeds[a].unitID.toString() == ingres[i].unitID.toString()){
                                        // if yes, add value as is
                                        console.log("Unit Match For Has No Variant");
                                        console.log("NetWeight: " + discardeds[a].netWeight);
                                        totalLost += +discardeds[a].netWeight;
                                    }else{
                                        // if no, convert
                                        console.log("Unit Not Match For Has No Variant");
                                        var fromID = discardeds[a].unitID.toString();
                                        var toID = ingres[i].unitID.toString();
                                        var multiplier = 0;
                                        var convertedVal = 0;
                                        // console.log("FromID: " + fromID);
                                        // console.log("ToID: " + toID);
                                        for (var l = 0; l < conversions.length; l++){
                                            // get conversion factor
                                            // console.log("InitUnitID: " + conversions[l].initialUnitId.toString());
                                            if (fromID == conversions[l].initialUnitId.toString()){
                                                // console.log("FromID Match Found");
                                                // console.log("ConvertedUnitID: " + conversions[l].convertedUnitId.toString());
                                                if (toID == conversions[l].convertedUnitId.toString()){
                                                    // console.log("ToID Match Found");
                                                    multiplier = conversions[l].conversionFactor;
                                                    console.log("Multiplier: " + multiplier);
                                                }
                                            }
                                        } 
                                        // convert netWeight
                                        convertedVal = discardeds[a].netWeight*multiplier;
                                        console.log("Converted: " + convertedVal);

                                        // add to totalPurchased
                                        // console.log("totalLost: "+ totalLost);
                                        totalLost += +convertedVal;
                                        console.log("totalLost: "+ totalLost);
                                    }
                                }
                            }
                        }
                    }

                    // loop through all mismatches
                    // NOTE: ASSUMING THAT THE UNIT FOR DIFFERENCE WILL ALWAYS MATCH INGREDIENT BASE UNIT
                    for (var b = 0; b < mismatches.length; b++){
                        // get date and convert string to Date type
                        date = new Date(mismatches[b].date);
                        console.log("MISMATCHES " + date);
                        // check if discardeds date matches current date loop
                        if (date.getDate() === dateArray[d].getDate()){
                            // check if the mismatch is for the ingredient
                            if (ingres[i]._id.toString() == mismatches[b].ingreID.toString()){
                                console.log(mismatches[b]);
                                totalLost += +(mismatches[b].difference);
                            }
                        }
                    }
                }
                purchasesValues[i] = totalPurchased;
                console.log("Purchased: " + totalPurchased);
                console.log("purchasesValues[" + i + "] = " + purchasesValues[i]);
                totalPurchased = 0;

                lostValues[i] = totalLost;
                console.log("Lost: " + totalLost);
                console.log("lostValues[" + i + "] = " + lostValues[i]);
                totalLost = 0;
            }
            
            // console.log("ingres.length = " + ingres.length);
            // console.log("purchasesValues length = " + purchasesValues.length);
            // console.log(ingres);
            res.render('postCustom', {ingres, ingreVars, units, conversions, dishes, dishRecipes, orders, orderItems, purchases, discardeds, mismatches, purchasesValues, lostValues, startDate, endDate, formattedStartDate, formattedEndDate});
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