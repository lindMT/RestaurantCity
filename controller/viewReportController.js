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
        const reportTypeLabels = ["Daily", "Weekly", "Monthly", "Yearly"];
        res.render('viewPeriodical', {reportTypeLabels});
    },

    postPeriodical: async function (req, res) {
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

        // FOR EXTRACTING DATE //
        function getDay(input){
            // split the input string into month, day, and year components
            const [month, day, year] = input.split('/').map(Number);

            // create Date object using UTC
            const date = new Date(year, month - 1, day);

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
            var dishes = await Dish.find({});
            var dishRecipes = await DishRecipe.find({});
            var orders = await Order.find({});
            var orderItems = await OrderItem.find({});
            var purchases = await purchasedIngre.find({});
            var discardeds = await discardedIngre.find({});
            var mismatches = await mismatch.find({});
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

            // !!!!!!!! place variables here (to copy from custom)

            // !!!!!!!! place logic for data here (to copy from custom)

            res.render('postPeriodical', {reportTypeLabels, reportType, selectedDate, dateString});
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

            // lost values
            var totalLost = 0;
            var lostValues = [];

            // loop through all ingredients
            for(var i = 0; i < ingres.length; i++){
                console.log();
                console.log("CURRENT INGREDIENT: " + ingres[i].name);
                // loop through all dates
                for (var d = 0; d < dateArray.length; d++){
                    var date;
                    console.log();
                    console.log(dateArray[d]);

                    // loop through all purchases
                    console.log();
                    console.log(">>> CHECKING PURCHASES...");
                    for (var j = 0; j < purchases.length; j++){
                        // get date and convert string to Date type
                        date = new Date(purchases[j].date);                        
                        // check if purchase date matches current date loop
                        if (date.getDate() === dateArray[d].getDate()){
                            // check if the purchase is for the ingredient
                            if (ingres[i]._id.toString() == purchases[j].ingreID.toString()){
                                console.log("----- Purchase Found");
                                // check if has variation or not
                                if (ingres[i].hasVariant == true){
                                    console.log("hasVariant is TRUE");
                                    // get variant
                                    for (var k = 0; k < ingreVars.length; k++){
                                        if (purchases[j].varID.toString() == ingreVars[k]._id.toString()) {
                                            // check if the variant's unit matches the ingredient's unit
                                            if(ingres[i].unitID.toString() == ingreVars[k].unitID.toString()){
                                                // if yes, add value as is
                                                console.log("Unit Match for hasVariant is TRUE (did not convert)");
                                                console.log("NetWeight: " + ingreVars[k].netWeight);
                                                console.log("Qty: " + purchases[j].qty);
                                                totalPurchased += +(ingreVars[k].netWeight*purchases[j].qty);
                                                console.log("totalPurchased: "+ totalPurchased);
                                            }else{
                                                // if no, convert
                                                console.log("Unit NOT Match for hasVariant is TRUE (need to convert)");
                                                var fromID = ingreVars[k].unitID.toString();
                                                var toID = ingres[i].unitID.toString();
                                                var multiplier = 0;
                                                var convertedVal = 0;

                                                for (var l = 0; l < conversions.length; l++){
                                                    // get conversion factor
                                                    if (fromID == conversions[l].initialUnitId.toString()){
                                                        if (toID == conversions[l].convertedUnitId.toString()){
                                                            console.log("Conversion Factor Found");
                                                            multiplier = conversions[l].conversionFactor;
                                                            console.log("Multiplier: " + multiplier);
                                                        }
                                                    }
                                                }
                                                // convert netWeight
                                                convertedVal = +(ingreVars[k].netWeight*multiplier);
                                                console.log("Converted NetWeight: " + convertedVal);
                                                console.log("Qty: " + purchases[j].qty);

                                                // add to totalPurchased
                                                totalPurchased += +(convertedVal*purchases[j].qty);
                                                console.log("totalPurchased: " + totalPurchased);
                                            }
                                        }
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
                                            if (fromID == conversions[l].initialUnitId.toString()){
                                                if (toID == conversions[l].convertedUnitId.toString()){
                                                    console.log("Conversion Factor Found");
                                                    multiplier = conversions[l].conversionFactor;
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
                        }
                    }

                    // loop through all discarded
                    console.log();
                    console.log(">>> CHECKING DISCARDEDS...");
                    for (var a = 0; a < discardeds.length; a++){
                        // get date and convert string to Date type
                        date = new Date(discardeds[a].date);
                        // check if discardeds date matches current date loop
                        if (date.getDate() === dateArray[d].getDate()){
                            // check if the discard is for the ingredient
                            if (ingres[i]._id.toString() == discardeds[a].ingreID.toString()){
                                console.log("----- Discard Found");
                                // check if the discard is for a variant
                                if (discardeds[a].varID !== undefined){
                                    // with variant
                                    console.log("Using Variant");
                                    // get variant
                                    for (var k = 0; k < ingreVars.length; k++){
                                        if (discardeds[a].varID.toString() == ingreVars[k]._id.toString()) {
                                            // check if unit matches
                                            if(ingres[i].unitID.toString() == ingreVars[k].unitID.toString()){
                                                // if yes, add value as is
                                                console.log("Unit Match for Using Variant (did not convert)");
                                                console.log("NetWeight: " + ingreVars[k].netWeight);
                                                console.log("Qty: " + discardeds[a].qty);
                                                totalLost += +(ingreVars[k].netWeight*discardeds[a].qty);
                                                console.log("totalLost: " + totalLost);
                                            }else{
                                                //if no, convert
                                                console.log("Unit NOT Match for Using Variant (need to convert)");
                                                var fromID = ingreVars[k].unitID.toString();
                                                var toID = ingres[i].unitID.toString();
                                                var multiplier = 0;
                                                var convertedVal = 0;

                                                for (var l = 0; l < conversions.length; l++){
                                                    if (fromID == conversions[l].initialUnitId.toString()){
                                                        if (toID == conversions[l].convertedUnitId.toString()){
                                                            console.log("Conversion Factor Found");
                                                            multiplier = conversions[l].conversionFactor;
                                                            console.log("Multiplier: " + multiplier);
                                                        }
                                                    }
                                                }
                                                // convert netWeight
                                                convertedVal = +(ingreVars[k].netWeight*multiplier);
                                                console.log("Converted NetWeight: " + convertedVal);
                                                console.log("Qty: " + discardeds[a].qty);

                                                // add to totalPurchased
                                                totalLost += +(convertedVal*discardeds[a].qty);
                                                console.log("totalLost: " + totalLost);
                                            }
                                        }
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
                                                    console.log("Conversion Factor Found");
                                                    multiplier = conversions[l].conversionFactor;
                                                    console.log("Multiplier: " + multiplier);
                                                }
                                            }
                                        } 
                                        // convert netWeight
                                        convertedVal = discardeds[a].netWeight*multiplier;
                                        console.log("Converted NetWeight: " + convertedVal);

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
                    console.log();
                    console.log(">>> CHECKING MISMATCHES...");
                    for (var b = 0; b < mismatches.length; b++){
                        // get date and convert string to Date type
                        date = new Date(mismatches[b].date);
                        // check if discardeds date matches current date loop
                        if (date.getDate() === dateArray[d].getDate()){
                            // check if the mismatch is for the ingredient
                            if (ingres[i]._id.toString() == mismatches[b].ingreID.toString()){
                                console.log("----- Mismatch Found");
                                totalLost += +(mismatches[b].difference);
                                console.log("totalLost: " + totalLost);
                            }
                        }
                    }
                }
                purchasesValues[i] = totalPurchased;
                lostValues[i] = totalLost;

                console.log();
                console.log("FINAL TOTAL PURCHASED: " + totalPurchased);
                console.log("FINAL TOTAL LOST: " + totalLost);
                console.log("purchasesValues[" + i + "] = " + purchasesValues[i]);
                console.log("lostValues[" + i + "] = " + lostValues[i]);

                totalPurchased = 0;
                totalLost = 0;
            }
            
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