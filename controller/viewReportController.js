const User = require('../model/usersSchema.js');

// ingredients
const Ingredients = require('../model/ingredientsSchema.js');
const Unit = require("../model/unitsSchema.js");
const fixedConversion = require("../model/fixedConversionSchema.js");
const ingreConversion = require("../model/ingreConversionSchema.js");
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
        const reportTypeLabels = ["Daily", "Weekly", "Monthly", "Yearly"];
        res.render('viewPeriodical', {reportTypeLabels});
    },

    postPeriodical: async function (req, res) {
        const foundIngredients = await Ingredients.find();
        
        // FOR DATE ARRAY //
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }

        function getDates(startDate, stopDate) {
            var dateArray = new Array();
            var currentDate = startDate;
            console.log("PPPPPPP getDates, startDate: " + startDate);
            console.log("PPPPPPP getDates, stopDate: " + stopDate);
            while (currentDate <= stopDate) {
                dateArray.push(new Date (currentDate));
                currentDate = currentDate.addDays(1);
                console.log("PPPPPPP getDates, currentDate: " + currentDate);
            }
            return dateArray;
        }

        // FOR EXTRACTING DATE //
        function getDay(input){
            // split the input string into month, day, and year components
            const [month, day, year] = input.split('/').map(Number);

            // create Date object using UTC
            const date = new Date(Date.UTC(year, month - 1, day));

            return date;
        }

        function getWeek(input){
            // split the input string based on the "-" character
            const dateRangeArray = input.split('-');

            // trim any extra white spaces from the resulting strings
            const startDateString = dateRangeArray[0].trim();
            const endDateString = dateRangeArray[1].trim();

            // extract the components of the dates
            const [startMonth, startDay, startYear] = startDateString.split('/').map(Number);
            const [endMonth, endDay, endYear] = endDateString.split('/').map(Number);

            // create Date objects using UTC
            const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
            const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));
            
            return {
                startDateObject: startDate,
                endDateObject: endDate
            };
        }

        function getMonth(input){
            // split the input string based on the "-" character
            const [month, year] = input.split('-').map(Number);

            // create a new Date object for the first day of the month
            const first = new Date(Date.UTC(year, month - 1, 1));

            // calculate the last day of the month
            const last = new Date(Date.UTC(year, month, 0));

            // return the first and last day as Date objects
            return {
                startDateObject: first,
                endDateObject: last,
            };
        }

        function getYear(input){
            // split the input string based on the "-" character
            const [month, year] = input.split('-').map(Number);

            // create a new Date object for the first day of the month
            const jan1 = new Date(Date.UTC(year, 0, 1));

            // calculate the last day of the month
            const dec31 = new Date(Date.UTC(year, 11, 31));

            // return the first and last day as Date objects
            return {
                startDateObject: jan1,
                endDateObject: dec31,
            };
        }

        // FOR FORMATTING DATE //
        function formatDayDate(dateObj){
            // get the month name using toLocaleString()
            const monthName = dateObj.toLocaleString('default', { month: 'short' });

            // extract the components from the Date object
            const year = dateObj.getFullYear();
            const day = dateObj.getDate();

            // create the final date string
            const formatted = `${monthName} ${day}, ${year}`;

            return formatted;
        }

        function formatMonthDate(dateObj){
            // get the month name using toLocaleString()
            const monthName = dateObj.toLocaleString('default', { month: 'long' });

            // extract the components from the Date object
            const year = dateObj.getFullYear();

            // create the final date string
            const formatted = `${monthName} ${year}`;

            return formatted;
        }

        try {
            var ingres = await Ingredients.find({});
            var ingreVars = await ingreVariations.find({});
            var units = await Unit.find({});
            var conversions = await fixedConversion.find({});

            console.log("---------- PERIODICAL REPORT ----------");

            // get date inputs
            var reportType = req.body.filterType;
            var selectedDate = req.body.selectedDate;
            var dateString = "Sample";
            const reportTypeLabels = ["Daily", "Weekly", "Monthly", "Yearly"];
            console.log(reportType);
            console.log(selectedDate);
            console.log(dateString);

            switch(reportType){
                case '1':
                    console.log("Entered 1 - Daily");
                    var startDateObject = getDay(selectedDate);
                    var endDateObject = getDay(selectedDate);
                    dateString = formatDayDate(startDateObject);
                    break;
                case '2':
                    console.log("Entered 2 - Weekly");
                    var { startDateObject, endDateObject } = getWeek(selectedDate);
                    var startDateString = formatDayDate(startDateObject);
                    var endDateString = formatDayDate(endDateObject);
                    dateString = `${startDateString} to ${endDateString}`
                    break;
                case '3':
                    console.log("Entered 3 - Monthly");
                    var { startDateObject, endDateObject } = getMonth(selectedDate);
                    dateString = formatMonthDate(startDateObject);
                    break;
                case '4':
                    console.log("Entered 4 - Yearly");
                    var { startDateObject, endDateObject } = getYear(selectedDate);
                    dateString = startDateObject.getFullYear();
                    break;
            }
            console.log("DATES:");
            console.log(startDateObject);
            console.log(endDateObject);
            
            // get dates between start and end
            var dateArray = getDates(startDateObject, endDateObject);

            // purchased values
            var totalPurchased = 0;
            var purchasesValues = [];

            // consumed values
            var totalConsumed = 0;
            var consumedValues = [];

            // lost values
            var totalLost = 0;
            var lostValues = [];

            // stock count values
            var totalStock = 0;
            var stockValues = [];

            // loop through all ingredients
            for(var i = 0; i < ingres.length; i++){
                console.log();
                console.log("CURRENT INGREDIENT: " + ingres[i].name);
                // loop through all dates
                for (var d = 0; d < dateArray.length; d++){
                    console.log();
                    console.log(dateArray[d]);
                    console.log(dateArray[d].toString());

                    // loop through all purchases
                    var purchases = await purchasedIngre.find({
                        ingreID: ingres[i]._id, 
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // purchases stores date as a String
                    console.log();
                    console.log(">>> CHECKING PURCHASES...");
                    for (var j = 0; j < purchases.length; j++){
                        console.log("----- Purchase Found");
                        // check if has variation or not
                        if (ingres[i].hasVariant == true){
                            console.log("hasVariant is TRUE");
                            // get variant
                            ingreVars = await ingreVariations.findOne({_id: purchases[j].varID});
                            // check if the variant's unit matches the ingredient's unit
                            if(ingres[i].unitID.toString() == ingreVars.unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for hasVariant is TRUE (did not convert)");
                                console.log("NetWeight: " + ingreVars.netWeight);
                                console.log("Qty: " + purchases[j].qty);
                                totalPurchased += +(ingreVars.netWeight*purchases[j].qty);
                                console.log("totalPurchased: "+ totalPurchased);
                            }else{
                                // if no, convert
                                console.log("Unit NOT Match for hasVariant is TRUE (need to convert)");
                                var fromID = ingreVars.unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;
                                
                                for (var l = 0; l < conversions.length; l++){
                                    // get conversion factor
                                    if (fromID == conversions[l].initialUnitId.toString() && toID == conversions[l].convertedUnitId.toString()){
                                        console.log("Conversion Factor Found (FIXED)");
                                        multiplier = conversions[l].conversionFactor;
                                        console.log("Multiplier: " + multiplier);
                                    }
                                }

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = +(ingreVars.netWeight*multiplier);
                                console.log("Converted NetWeight: " + convertedVal);
                                console.log("Qty: " + purchases[j].qty);

                                // add to totalPurchased
                                totalPurchased += +(convertedVal*purchases[j].qty);
                                console.log("totalPurchased: " + totalPurchased);
                            }
                        }else{ //hasVariant == false
                            console.log("hasVariant is FALSE");
                            // check if the unit indicated matches the ingredient's unit
                            if(purchases[j].unitID.toString() == ingres[i].unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for hasVariant is FALSE (did not convert)");
                                console.log("NetWeight: " + purchases[j].netWeight);
                                totalPurchased += +purchases[j].netWeight;
                                console.log("totalPurchased: "+ totalPurchased);
                            }else{
                                // if no, convert
                                console.log("Unit NOT Match for hasVariant is FALSE (need to convert)");
                                var fromID = purchases[j].unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;

                                for (var l = 0; l < conversions.length; l++){
                                    // get conversion factor
                                    if (fromID == conversions[l].initialUnitId.toString() && toID == conversions[l].convertedUnitId.toString()){
                                        console.log("Conversion Factor Found (FIXED)");
                                        multiplier = conversions[l].conversionFactor;
                                        console.log("Multiplier: " + multiplier);
                                    }
                                }

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = purchases[j].netWeight*multiplier;
                                console.log("Converted NetWeight: " + convertedVal);

                                // add to totalPurchased
                                totalPurchased += +convertedVal;
                                console.log("totalPurchased: "+ totalPurchased);
                            }
                        }
                    }

                    // loop through all discarded
                    var discardeds = await discardedIngre.find({
                        ingreID: ingres[i]._id, 
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // discardeds stores date as a String
                    console.log();
                    console.log(">>> CHECKING DISCARDEDS...");
                    for (var a = 0; a < discardeds.length; a++){
                        console.log("----- Discard Found");
                        // check if the discard is for a variant
                        if (discardeds[a].varID !== undefined){
                            // with variant
                            console.log("Using Variant");
                            // get variant
                            ingreVars = await ingreVariations.findOne({_id: discardeds[a].varID});
                            // check if unit matches
                            if(ingres[i].unitID.toString() == ingreVars.unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for Using Variant (did not convert)");
                                console.log("NetWeight: " + ingreVars.netWeight);
                                console.log("Qty: " + discardeds[a].qty);
                                totalLost += +(ingreVars.netWeight*discardeds[a].qty);
                                console.log("totalLost: " + totalLost);
                            }else{
                                //if no, convert
                                console.log("Unit NOT Match for Using Variant (need to convert)");
                                var fromID = ingreVars.unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;

                                for (var l = 0; l < conversions.length; l++){
                                    if (fromID == conversions[l].initialUnitId.toString() && toID == conversions[l].convertedUnitId.toString()){
                                        console.log("Conversion Factor Found (FIXED)");
                                        multiplier = conversions[l].conversionFactor;
                                        console.log("Multiplier: " + multiplier);
                                    }
                                }

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = +(ingreVars.netWeight*multiplier);
                                console.log("Converted NetWeight: " + convertedVal);
                                console.log("Qty: " + discardeds[a].qty);

                                // add to totalLost
                                totalLost += +(convertedVal*discardeds[a].qty);
                                console.log("totalLost: " + totalLost);
                            }
                        } else {
                            // no variant
                            console.log("NOT Using Variant");
                            // check if unit matches
                            if(discardeds[a].unitID.toString() == ingres[i].unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for NOT Using Variant (did not convert)");
                                console.log("NetWeight: " + discardeds[a].netWeight);
                                totalLost += +discardeds[a].netWeight;
                                console.log("totalLost: " + totalLost);
                            }else{
                                // if no, convert
                                console.log("Unit NOT Match for NOT Using Variant (need to convert)");
                                var fromID = discardeds[a].unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;

                                for (var l = 0; l < conversions.length; l++){
                                    if (fromID == conversions[l].initialUnitId.toString()){
                                        if (toID == conversions[l].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (FIXED)");
                                            multiplier = conversions[l].conversionFactor;
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                } 

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                    console.log("ingres[i]._id: " + ingres[i]._id);
                                    console.log("425: " + ingreConversions);
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = discardeds[a].netWeight*multiplier;
                                console.log("Converted NetWeight: " + convertedVal);

                                // add to totalLost
                                totalLost += +convertedVal;
                                console.log("totalLost: "+ totalLost);
                            }
                        }
                    }

                    // loop through all mismatches
                    var mismatches = await mismatch.find({
                        ingreID: ingres[i]._id, 
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // mismatches stores date as a String
                    // NOTE: ASSUMING THAT THE UNIT FOR DIFFERENCE WILL ALWAYS MATCH INGREDIENT BASE UNIT
                    console.log();
                    console.log(">>> CHECKING MISMATCHES...");
                    for (var b = 0; b < mismatches.length; b++){
                        console.log("----- Mismatch Found");
                        // check if the difference is negative or positive
                        if (mismatches[b].difference < 0){ 
                            // if negative, convert to positive then add to loss
                            totalLost += +(-(mismatches[b].difference));
                        }else if (mismatches[b].difference > 0){ 
                            // if positive, subtract from loss (NOTE: NOT SURE IF THIS IS CORRECT IMPLEMENTATION)
                            totalLost -= +(mismatches[b].difference);
                        }
                        console.log("totalLost: " + totalLost);
                    }

                    // loop through all orders
                    var orders = await Order.find({
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // orders stores date as a String
                    console.log();
                    console.log(">>> CHECKING ORDERS...");
                    for (var o = 0; o < orders.length; o++){
                        console.log("----- Order Found");
                        // get all order items associated with that order
                        var orderItems = await OrderItem.find({orderID: orders[o]._id});
                        for (var p = 0; p < orderItems.length; p++){
                            // get all dishes listed as an order item
                            var dishes = await Dish.find({_id: orderItems[p].dishID});
                            for (var q = 0; q < dishes.length; q++){
                                console.log("Dish: " + dishes[q].name);
                                // get the recipe that was used at the date/time the dish was ordered (CODE FROM BEST FRIEND)
                                var result = await DishRecipe.aggregate([
                                    { $match: {
                                        dishID: dishes[q]._id,
                                        approvedOn: { $lte: dateArray[d] } // get dates on or before chosen date
                                      }, },
                                    { $addFields: {
                                        dateDifference: {
                                          $abs: { $subtract: ["$approvedOn", dateArray[d]] } // get difference of dates
                                        },
                                      }, },
                                    { $sort: {
                                        dateDifference: 1, // sort in ascending order of dateDifference to get the closest date
                                        approvedOn: -1, // if there are multiple records with the same dateDifference, sort by date in descending order to get the most recent one
                                      }, },
                                    {
                                      $limit: 1, // get only the first record with the closest date
                                    },
                                ]);
                                //console.log(result);
                                var recipe = result[0];

                                for (var r = 0; r < recipe.ingredients.length; r++){
                                    // check if the current ingredient is used in the recipe
                                    if (recipe.ingredients[r].ingredient.toString() == ingres[i]._id.toString()){
                                        console.log("Ingredient Used in Dish");
                                        //check if unit matches
                                        if(recipe.ingredients[r].chefUnitID.toString() == ingres[i].unitID.toString()){
                                            // if yes, add value as is
                                            console.log("Unit Match for Recipe (did not convert)");
                                            console.log("NetWeight: " + discardeds[a].netWeight);
                                            totalConsumed += +(recipe.ingredients[r].chefWeight*orderItems[p].qty);
                                            console.log("totalConsumed: " + totalConsumed);
                                        }else{
                                            // if no, convert
                                            console.log("Unit NOT Match for Recipe (need to convert)");
                                            var fromID = recipe.ingredients[r].chefUnitID.toString();
                                            var toID = ingres[i].unitID.toString();
                                            var multiplier = 0;
                                            var convertedVal = 0;
            
                                            for (var l = 0; l < conversions.length; l++){
                                                if (fromID == conversions[l].initialUnitId.toString()){
                                                    if (toID == conversions[l].convertedUnitId.toString()){
                                                        console.log("Conversion Factor Found (FIXED)");
                                                        multiplier = conversions[l].conversionFactor;
                                                        console.log("Multiplier: " + multiplier);
                                                    }
                                                }
                                            } 
            
                                            // check if conversion factor not found
                                            if (multiplier == 0){
                                                var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                                for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                                    if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                                        console.log("Conversion Factor Found (UNIQUE)");
                                                        multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                                        console.log("Multiplier: " + multiplier);
                                                    }
                                                }
                                            }
            
                                            // convert netWeight
                                            convertedVal = +(recipe.ingredients[r].chefWeight*multiplier);
                                            console.log("Converted NetWeight: " + convertedVal);
            
                                            // add to totalConsumed
                                            totalConsumed += +convertedVal*orderItems[p].qty;
                                            console.log("totalConsumed: "+ totalConsumed);
                                        }
                                    }else{
                                        console.log("Ingredient NOT Used in Dish");
                                    }
                                }
                            }
                        }
                    }
                    
                    
                }
                purchasesValues[i] = totalPurchased.toFixed(2);
                consumedValues[i] = totalConsumed.toFixed(2);
                lostValues[i] = totalLost.toFixed(2);

                console.log();
                console.log("FINAL TOTAL PURCHASED: " + totalPurchased);
                console.log("FINAL TOTAL CONSUMED: " + totalConsumed);
                console.log("FINAL TOTAL LOST: " + totalLost);
                console.log("purchasesValues[" + i + "] = " + purchasesValues[i]);
                console.log("consumedValues[" + i + "] = " + consumedValues[i]);
                console.log("lostValues[" + i + "] = " + lostValues[i]);

                // compute total stock
                totalStock = totalPurchased - (totalConsumed + totalLost);
                stockValues[i] = totalStock.toFixed(2);

                console.log();
                console.log("FINAL TOTAL STOCK: " + totalStock);
                console.log("stockValues[" + i + "] = " + stockValues[i]);

                totalPurchased = 0;
                totalConsumed = 0;
                totalLost = 0;
                totalStock = 0;
            }

            res.render('postPeriodical', {reportTypeLabels, reportType, selectedDate, dateString, ingres, units, purchasesValues, consumedValues, lostValues, stockValues, startDateObject, endDateObject});
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred");
        }
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
            while (currentDate <= stopDate) {
                dateArray.push(new Date (currentDate));
                currentDate = currentDate.addDays(1);
            }
            return dateArray;
        }

        // FOR FORMATTING DATE //
        function formatDate(dateObj){
            // get the month name using toLocaleString()
            const monthName = dateObj.toLocaleString('default', { month: 'short' });

            // extract the components from the Date object
            const year = dateObj.getFullYear();
            const day = dateObj.getDate();

            // create the final date string
            const formatted = `${monthName} ${day}, ${year}`;

            return formatted;
        }

        try {
            var ingres = await Ingredients.find({});
            var ingreVars;
            var units = await Unit.find({});
            var conversions = await fixedConversion.find({});
            
            console.log("---------- CUSTOM REPORT ----------");

            // get date inputs
            var startDate = req.body.startDate;
            var endDate = req.body.endDate;
            console.log("START DATE: " + startDate);
            console.log("END DATE: " + endDate);

            // set string to Date type
            const startDateObject = new Date(startDate);
            const endDateObject = new Date(endDate);

            // get formatted String for dates
            const formattedStartDate = formatDate(startDateObject);
            const formattedEndDate = formatDate(endDateObject);

            // get dates between start and end
            var dateArray = getDates(startDateObject, endDateObject);

            // purchased values
            var totalPurchased = 0;
            var purchasesValues = [];

            // consumed values
            var totalConsumed = 0;
            var consumedValues = [];

            // lost values
            var totalLost = 0;
            var lostValues = [];

            // stock count values
            var totalStock = 0;
            var stockValues = [];

            // loop through all ingredients
            for(var i = 0; i < ingres.length; i++){
                console.log();
                console.log("CURRENT INGREDIENT: " + ingres[i].name);
                // loop through all dates
                for (var d = 0; d < dateArray.length; d++){
                    console.log();
                    console.log(dateArray[d]);
                    console.log(dateArray[d].toString());

                    // loop through all purchases
                    var purchases = await purchasedIngre.find({
                        ingreID: ingres[i]._id, 
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // purchases stores date as a String
                    console.log();
                    console.log(">>> CHECKING PURCHASES...");
                    for (var j = 0; j < purchases.length; j++){
                        console.log("----- Purchase Found");
                        // check if has variation or not
                        if (ingres[i].hasVariant == true){
                            console.log("hasVariant is TRUE");
                            // get variant
                            ingreVars = await ingreVariations.findOne({_id: purchases[j].varID});
                            // check if the variant's unit matches the ingredient's unit
                            if(ingres[i].unitID.toString() == ingreVars.unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for hasVariant is TRUE (did not convert)");
                                console.log("NetWeight: " + ingreVars.netWeight);
                                console.log("Qty: " + purchases[j].qty);
                                totalPurchased += +(ingreVars.netWeight*purchases[j].qty);
                                console.log("totalPurchased: "+ totalPurchased);
                            }else{
                                // if no, convert
                                console.log("Unit NOT Match for hasVariant is TRUE (need to convert)");
                                var fromID = ingreVars.unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;
                                
                                for (var l = 0; l < conversions.length; l++){
                                    // get conversion factor
                                    if (fromID == conversions[l].initialUnitId.toString() && toID == conversions[l].convertedUnitId.toString()){
                                        console.log("Conversion Factor Found (FIXED)");
                                        multiplier = conversions[l].conversionFactor;
                                        console.log("Multiplier: " + multiplier);
                                    }
                                }

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = +(ingreVars.netWeight*multiplier);
                                console.log("Converted NetWeight: " + convertedVal);
                                console.log("Qty: " + purchases[j].qty);

                                // add to totalPurchased
                                totalPurchased += +(convertedVal*purchases[j].qty);
                                console.log("totalPurchased: " + totalPurchased);
                            }
                        }else{ //hasVariant == false
                            console.log("hasVariant is FALSE");
                            // check if the unit indicated matches the ingredient's unit
                            if(purchases[j].unitID.toString() == ingres[i].unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for hasVariant is FALSE (did not convert)");
                                console.log("NetWeight: " + purchases[j].netWeight);
                                totalPurchased += +purchases[j].netWeight;
                                console.log("totalPurchased: "+ totalPurchased);
                            }else{
                                // if no, convert
                                console.log("Unit NOT Match for hasVariant is FALSE (need to convert)");
                                var fromID = purchases[j].unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;

                                for (var l = 0; l < conversions.length; l++){
                                    // get conversion factor
                                    if (fromID == conversions[l].initialUnitId.toString() && toID == conversions[l].convertedUnitId.toString()){
                                        console.log("Conversion Factor Found (FIXED)");
                                        multiplier = conversions[l].conversionFactor;
                                        console.log("Multiplier: " + multiplier);
                                    }
                                }

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = purchases[j].netWeight*multiplier;
                                console.log("Converted NetWeight: " + convertedVal);

                                // add to totalPurchased
                                totalPurchased += +convertedVal;
                                console.log("totalPurchased: "+ totalPurchased);
                            }
                        }
                    }

                    // loop through all discarded
                    var discardeds = await discardedIngre.find({
                        ingreID: ingres[i]._id, 
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // discardeds stores date as a String
                    console.log();
                    console.log(">>> CHECKING DISCARDEDS...");
                    for (var a = 0; a < discardeds.length; a++){
                        console.log("----- Discard Found");
                        // check if the discard is for a variant
                        if (discardeds[a].varID !== undefined){
                            // with variant
                            console.log("Using Variant");
                            // get variant
                            ingreVars = await ingreVariations.findOne({_id: discardeds[a].varID});
                            // check if unit matches
                            if(ingres[i].unitID.toString() == ingreVars.unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for Using Variant (did not convert)");
                                console.log("NetWeight: " + ingreVars.netWeight);
                                console.log("Qty: " + discardeds[a].qty);
                                totalLost += +(ingreVars.netWeight*discardeds[a].qty);
                                console.log("totalLost: " + totalLost);
                            }else{
                                //if no, convert
                                console.log("Unit NOT Match for Using Variant (need to convert)");
                                var fromID = ingreVars.unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;

                                for (var l = 0; l < conversions.length; l++){
                                    if (fromID == conversions[l].initialUnitId.toString() && toID == conversions[l].convertedUnitId.toString()){
                                        console.log("Conversion Factor Found (FIXED)");
                                        multiplier = conversions[l].conversionFactor;
                                        console.log("Multiplier: " + multiplier);
                                    }
                                }

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = +(ingreVars.netWeight*multiplier);
                                console.log("Converted NetWeight: " + convertedVal);
                                console.log("Qty: " + discardeds[a].qty);

                                // add to totalLost
                                totalLost += +(convertedVal*discardeds[a].qty);
                                console.log("totalLost: " + totalLost);
                            }
                        } else {
                            // no variant
                            console.log("NOT Using Variant");
                            // check if unit matches
                            if(discardeds[a].unitID.toString() == ingres[i].unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for NOT Using Variant (did not convert)");
                                console.log("NetWeight: " + discardeds[a].netWeight);
                                totalLost += +discardeds[a].netWeight;
                                console.log("totalLost: " + totalLost);
                            }else{
                                // if no, convert
                                console.log("Unit NOT Match for NOT Using Variant (need to convert)");
                                var fromID = discardeds[a].unitID.toString();
                                var toID = ingres[i].unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;

                                for (var l = 0; l < conversions.length; l++){
                                    if (fromID == conversions[l].initialUnitId.toString()){
                                        if (toID == conversions[l].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (FIXED)");
                                            multiplier = conversions[l].conversionFactor;
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                } 

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = discardeds[a].netWeight*multiplier;
                                console.log("Converted NetWeight: " + convertedVal);

                                // add to totalLost
                                totalLost += +convertedVal;
                                console.log("totalLost: "+ totalLost);
                            }
                        }
                    }

                    // loop through all mismatches
                    var mismatches = await mismatch.find({
                        ingreID: ingres[i]._id, 
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // mismatches stores date as a String
                    // NOTE: ASSUMING THAT THE UNIT FOR DIFFERENCE WILL ALWAYS MATCH INGREDIENT BASE UNIT
                    console.log();
                    console.log(">>> CHECKING MISMATCHES...");
                    for (var b = 0; b < mismatches.length; b++){
                        console.log("----- Mismatch Found");
                        // check if the difference is negative or positive
                        if (mismatches[b].difference < 0){ 
                            // if negative, convert to positive then add to loss
                            totalLost += +(-(mismatches[b].difference));
                        }else if (mismatches[b].difference > 0){ 
                            // if positive, subtract from loss (NOTE: NOT SURE IF THIS IS CORRECT IMPLEMENTATION)
                            totalLost -= +(mismatches[b].difference);
                        }
                        console.log("totalLost: " + totalLost);
                    }

                    // loop through all orders
                    var orders = await Order.find({
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // orders stores date as a String
                    console.log();
                    console.log(">>> CHECKING ORDERS...");
                    for (var o = 0; o < orders.length; o++){
                        console.log("----- Order Found");
                        // get all order items associated with that order
                        var orderItems = await OrderItem.find({orderID: orders[o]._id});
                        for (var p = 0; p < orderItems.length; p++){
                            // get all dishes listed as an order item
                            var dishes = await Dish.find({_id: orderItems[p].dishID});
                            for (var q = 0; q < dishes.length; q++){
                                console.log("Dish: " + dishes[q].name);
                                // get the recipe that was used at the date/time the dish was ordered (CODE FROM BEST FRIEND)
                                var result = await DishRecipe.aggregate([
                                    { $match: {
                                        dishID: dishes[q]._id,
                                        approvedOn: { $lte: dateArray[d] } // get dates on or before chosen date
                                      }, },
                                    { $addFields: {
                                        dateDifference: {
                                          $abs: { $subtract: ["$approvedOn", dateArray[d]] } // get difference of dates
                                        },
                                      }, },
                                    { $sort: {
                                        dateDifference: 1, // sort in ascending order of dateDifference to get the closest date
                                        approvedOn: -1, // if there are multiple records with the same dateDifference, sort by date in descending order to get the most recent one
                                      }, },
                                    {
                                      $limit: 1, // get only the first record with the closest date
                                    },
                                ]);
                                //console.log(result);
                                var recipe = result[0];

                                for (var r = 0; r < recipe.ingredients.length; r++){
                                    // check if the current ingredient is used in the recipe
                                    if (recipe.ingredients[r].ingredient.toString() == ingres[i]._id.toString()){
                                        console.log("Ingredient Used in Dish");
                                        //check if unit matches
                                        if(recipe.ingredients[r].chefUnitID.toString() == ingres[i].unitID.toString()){
                                            // if yes, add value as is
                                            console.log("Unit Match for Recipe (did not convert)");
                                            console.log("NetWeight: " + discardeds[a].netWeight);
                                            totalConsumed += +(recipe.ingredients[r].chefWeight*orderItems[p].qty);
                                            console.log("totalConsumed: " + totalConsumed);
                                        }else{
                                            // if no, convert
                                            console.log("Unit NOT Match for Recipe (need to convert)");
                                            var fromID = recipe.ingredients[r].chefUnitID.toString();
                                            var toID = ingres[i].unitID.toString();
                                            var multiplier = 0;
                                            var convertedVal = 0;
            
                                            for (var l = 0; l < conversions.length; l++){
                                                if (fromID == conversions[l].initialUnitId.toString()){
                                                    if (toID == conversions[l].convertedUnitId.toString()){
                                                        console.log("Conversion Factor Found (FIXED)");
                                                        multiplier = conversions[l].conversionFactor;
                                                        console.log("Multiplier: " + multiplier);
                                                    }
                                                }
                                            } 
            
                                            // check if conversion factor not found
                                            if (multiplier == 0){
                                                var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                                for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                                    if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                                        console.log("Conversion Factor Found (UNIQUE)");
                                                        multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                                        console.log("Multiplier: " + multiplier);
                                                    }
                                                }
                                            }
            
                                            // convert netWeight
                                            convertedVal = +(recipe.ingredients[r].chefWeight*multiplier);
                                            console.log("Converted NetWeight: " + convertedVal);
            
                                            // add to totalConsumed
                                            totalConsumed += +convertedVal*orderItems[p].qty;
                                            console.log("totalConsumed: "+ totalConsumed);
                                        }
                                    }else{
                                        console.log("Ingredient NOT Used in Dish");
                                    }
                                }
                            }
                        }
                    }
                    
                    
                }
                purchasesValues[i] = totalPurchased.toFixed(2);
                consumedValues[i] = totalConsumed.toFixed(2);
                lostValues[i] = totalLost.toFixed(2);

                console.log();
                console.log("FINAL TOTAL PURCHASED: " + totalPurchased);
                console.log("FINAL TOTAL CONSUMED: " + totalConsumed);
                console.log("FINAL TOTAL LOST: " + totalLost);
                console.log("purchasesValues[" + i + "] = " + purchasesValues[i]);
                console.log("consumedValues[" + i + "] = " + consumedValues[i]);
                console.log("lostValues[" + i + "] = " + lostValues[i]);

                // compute total stock
                totalStock = totalPurchased - (totalConsumed + totalLost);
                stockValues[i] = totalStock.toFixed(2);

                console.log();
                console.log("FINAL TOTAL STOCK: " + totalStock);
                console.log("stockValues[" + i + "] = " + stockValues[i]);

                totalPurchased = 0;
                totalConsumed = 0;
                totalLost = 0;
                totalStock = 0;
            }
            
            res.render('postCustom', {ingres, units, purchasesValues, consumedValues, lostValues, stockValues, startDate, endDate, formattedStartDate, formattedEndDate});
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred");
        }
    },

    getDetailed: async function(req, res) {
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }

        function getDates(startDate, stopDate) {
            console.log("getDates, startDate: " + startDate);
            console.log("getDates, stopDate: " + stopDate);

            var dateArray = new Array();
            var currentDate = startDate;
            while (currentDate <= stopDate) {
                dateArray.push(new Date (currentDate));
                currentDate = currentDate.addDays(1);

            }
            return dateArray;
        }
        
        try {
            var conversions = await fixedConversion.find({});
            var units = await Unit.find({});
            var purchaseIndex = 0;

            // Find ingre id       
            var ingreID = req.body.ingreID;
            const ingredient = await Ingredients.findById(ingreID);
            console.log("INGRE ID: " + ingreID);
            
            // 1: Periodical
            // 2: Custom
            var reportType = req.params['reportType'];
            console.log("REPORT TYPE: " + reportType);

            
            if(reportType == 1) {
                console.log("FROM PERIODICAL");

                var periodicalType = req.body.periodicalReportType;
                var periodicalDate = req.body.periodicalReportDate;
                var startDate = req.body.startDateObj;
                var endDate = req.body.endDateObj;
                var startDateObject = new Date(startDate);
                var endDateObject = new Date(endDate);
                var formattedStartDate = "";
                var formattedEndDate = "";
    
                console.log("PERIODICAL TYPE: " + periodicalType);
                console.log("PERIODICAL DATE: " + periodicalDate);
                console.log("sDateObj: " + startDateObject);
                console.log("eDateObj: " + endDateObject);


                // Display chosen reportTypeLabel
                var qtyPurchase = [];
                var unitPurchase = [];
                var datePurchase = [];
                var doneByPurchase = [];
                // var purchaseIndex = 0; // should add sa dulo (done)

                // get dates between start and end
                var dateArray = getDates(startDateObject, endDateObject);

                console.log("dateArray:" + dateArray);
                
                 // loop through all dates
                 for (var d = 0; d < dateArray.length; d++){
                    console.log();
                    console.log(dateArray[d]);
                    console.log(dateArray[d].toString());
                    
                    // ======= PURCHASES =======
                    // loop through all purchases
                    var purchases = await purchasedIngre.find({
                        ingreID: ingreID, 
                        date: {
                            $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                        }
                    }); // purchases stores date as a String
                    console.log();
                    console.log("!!! CHECKING PURCHASES...");
                    for (var j = 0; j < purchases.length; j++){
                        console.log("There are " + purchases.length + " purchases");
                        console.log("----- Purchase Found #"+j);
                        // check if has variation or not
                        if (ingredient.hasVariant == true){
                            console.log("hasVariant is TRUE");
                            // get variant
                            ingreVars = await ingreVariations.findOne({_id: purchases[j].varID});
                            // check if the variant's unit matches the ingredient's unit
                            if(ingredient.unitID.toString() == ingreVars.unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for hasVariant is TRUE (did not convert)");
                                console.log("NetWeight: " + ingreVars.netWeight);
                                console.log("Qty: " + purchases[j].qty);

                                // replace with array of qtyPurchase
                                qtyPurchase[j] = ingreVars.netWeight*purchases[j].qty;
                                units = Unit.findById({_id:ingredient.unitID});
                                unitPurchase[j] = units.unitSymbol;
                                datePurchase[j] = purchases[j].date;
                                doneByPurchase[j] = purchases[j].doneBy;
                                // totalPurchased += +(ingreVars.netWeight*purchases[j].qty);
                                // console.log("purchaseIndex: " + purchaseIndex);
                                console.log("qtyPurchase: "+ qtyPurchase[j]);
                            }else{
                                // if no, convert
                                console.log("Unit NOT Match for hasVariant is TRUE (need to convert)");
                                var fromID = ingreVars.unitID.toString();
                                var toID = ingredient.unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;
                                
                                for (var l = 0; l < conversions.length; l++){
                                    // get conversion factor
                                    if (fromID == conversions[l].initialUnitId.toString() && toID == conversions[l].convertedUnitId.toString()){
                                        console.log("Conversion Factor Found (FIXED)");
                                        multiplier = conversions[l].conversionFactor;
                                        console.log("Multiplier: " + multiplier);
                                    }
                                }

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingredient._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = +(ingreVars.netWeight*multiplier);
                                console.log("Converted NetWeight: " + convertedVal);
                                console.log("Qty: " + purchases[j].qty);

                                // add to qtyPurchase
                                qtyPurchase[j] = convertedVal*purchases[j].qty;
                                units = Unit.findById({_id:ingreVars.unitID});
                                unitPurchase[j] = units.unitSymbol;
                                datePurchase[j] = purchases[j].date;
                                doneByPurchase[j] = purchases[j].doneBy;
                                // console.log("purchaseIndex: " + purchaseIndex);
                                console.log("qtyPurchase: "+ qtyPurchase[j]);
                            }
                        }else{ //hasVariant == false
                            console.log("hasVariant is FALSE");
                            // check if the unit indicated matches the ingredient's unit
                            if(purchases[j].unitID.toString() == ingredient.unitID.toString()){
                                // if yes, add value as is
                                console.log("Unit Match for hasVariant is FALSE (did not convert)");
                                console.log("NetWeight: " + purchases[j].netWeight);

                                qtyPurchase[j] = purchases[j].netWeight;
                                units = Unit.findById({_id:ingredient.unitID});
                                unitPurchase[j] = units.unitSymbol;
                                datePurchase[j] = purchases[j].date;
                                doneByPurchase[j] = purchases[j].doneBy;
                                // console.log("purchaseIndex: " + purchaseIndex);
                                console.log("qtyPurchase: "+ qtyPurchase[j]);
                            }else{
                                // if no, convert
                                console.log("Unit NOT Match for hasVariant is FALSE (need to convert)");
                                var fromID = purchases[j].unitID.toString();
                                var toID = ingredient.unitID.toString();
                                var multiplier = 0;
                                var convertedVal = 0;

                                for (var l = 0; l < conversions.length; l++){
                                    // get conversion factor
                                    if (fromID == conversions[l].initialUnitId.toString() && toID == conversions[l].convertedUnitId.toString()){
                                        console.log("Conversion Factor Found (FIXED)");
                                        multiplier = conversions[l].conversionFactor;
                                        console.log("Multiplier: " + multiplier);
                                    }
                                }

                                // check if conversion factor not found
                                if (multiplier == 0){
                                    var ingreConversions = await ingreConversion.findOne({ingredientId: ingredient._id});
                                    for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                        if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                            console.log("Conversion Factor Found (UNIQUE)");
                                            multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            console.log("Multiplier: " + multiplier);
                                        }
                                    }
                                }

                                // convert netWeight
                                convertedVal = purchases[j].netWeight*multiplier;
                                console.log("Converted NetWeight: " + convertedVal);

                                // add to qtyPurchased
                                qtyPurchase[j] = convertedVal;
                                units = Unit.findById({_id:purchases[j].unitID});
                                unitPurchase[j] = units.unitSymbol;
                                datePurchase[j] = purchases[j].date;
                                doneByPurchase[j] = purchases[j].doneBy;
                            }
                        }
                        console.log("qtyPurchase[ind]: "+ qtyPurchase[j]);
                        console.log("unitPurchase[j]: "+  unitPurchase[j]);
                        console.log("datePurchase[j]: "+  datePurchase[j]);
                        console.log("doneByPurchase[j]: "+   doneByPurchase[j]);

                    }
                    
                    // ======= CONSUMED =======

                    // ======= DISCARDED =======
                 }

                await res.render('detailedReport', {ingredient, periodicalType, periodicalDate, formattedStartDate, formattedEndDate, qtyPurchase, unitPurchase, datePurchase, doneByPurchase});
            } else{
                console.log("FROM CUSTOM");

                var formattedStartDate = req.body.customStartDate;
                var formattedEndDate = req.body.customEndDate;
                var periodicalDate = "";
    
                await res.render('detailedReport', {ingredient, formattedStartDate, formattedEndDate, periodicalDate});

            }

            
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred");
        }
    }
}

module.exports = viewReportController;