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


function formatDateTime(date) {
    // get date components
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // construct the formatted string
    const formattedDate = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

// MAIN FUNCTION FOR SUMMARY REPORTS //
async function generateReport(ingres, dateArray, purchasesValues, consumedValues, lostValues){
    var totalPurchased = 0;
    var totalConsumed = 0;
    var totalLost = 0;
    
    // loop through all ingredients
    for(var i = 0; i < ingres.length; i++){
        // loop through all dates
        for (var d = 0; d < dateArray.length; d++){
            // loop through all purchases
            var purchases = await purchasedIngre.find({
                ingreID: ingres[i]._id, 
                date: {
                    $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                }
            }); // purchases stores date as a String
            for (var j = 0; j < purchases.length; j++){
                // check if has variation or not
                if (ingres[i].hasVariant == true){
                    // get variant
                    var ingreVars = await ingreVariations.findOne({_id: purchases[j].varID});
                    // check if the variant's unit matches the ingredient's unit
                    if(ingres[i].unitID.toString() == ingreVars.unitID.toString()){
                        // if yes, add value as is
                        totalPurchased += +(ingreVars.netWeight*purchases[j].qty);
                    }else{
                        // if no, convert
                        var fromID = ingreVars.unitID;
                        var toID = ingres[i].unitID;
                        var multiplier = 0;
                        var convertedVal = 0;
                        
                        // get conversion factors
                        var conversions = await fixedConversion.findOne({initialUnitId: fromID, convertedUnitId: toID});
                        if (conversions) {
                            multiplier = conversions.conversionFactor;
                        }

                        // check if conversion factor not found
                        if (multiplier == 0){
                            var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                            for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                    multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                }
                            }
                        }

                        // convert netWeight
                        convertedVal = +(ingreVars.netWeight*multiplier);

                        // add to totalPurchased
                        totalPurchased += +(convertedVal*purchases[j].qty);
                    }
                }else{ //hasVariant == false
                    // check if the unit indicated matches the ingredient's unit
                    if(purchases[j].unitID.toString() == ingres[i].unitID.toString()){
                        // if yes, add value as is
                        totalPurchased += +purchases[j].netWeight;
                    }else{
                        // if no, convert
                        var fromID = purchases[j].unitID;
                        var toID = ingres[i].unitID;
                        var multiplier = 0;
                        var convertedVal = 0;

                        // get conversion factors
                        var conversions = await fixedConversion.findOne({initialUnitId: fromID, convertedUnitId: toID});
                        if (conversions) {
                            multiplier = conversions.conversionFactor;
                        }

                        // check if conversion factor not found
                        if (multiplier == 0){
                            var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                            for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                    multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                }
                            }
                        }

                        // convert netWeight
                        convertedVal = purchases[j].netWeight*multiplier;

                        // add to totalPurchased
                        totalPurchased += +convertedVal;
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
            for (var a = 0; a < discardeds.length; a++){
                // check if the discard is for a variant
                if (discardeds[a].varID !== undefined){
                    // with variant
                    // get variant
                    var ingreVars = await ingreVariations.findOne({_id: discardeds[a].varID});
                    // check if unit matches
                    if(ingres[i].unitID.toString() == ingreVars.unitID.toString()){
                        // if yes, add value as is
                        totalLost += +(ingreVars.netWeight*discardeds[a].qty);
                    }else{
                        //if no, convert
                        var fromID = ingreVars.unitID;
                        var toID = ingres[i].unitID;
                        var multiplier = 0;
                        var convertedVal = 0;

                        // get conversion factors
                        var conversions = await fixedConversion.findOne({initialUnitId: fromID, convertedUnitId: toID});
                        if (conversions) {
                            multiplier = conversions.conversionFactor;
                        }

                        // check if conversion factor not found
                        if (multiplier == 0){
                            var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                            for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                    multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                }
                            }
                        }

                        // convert netWeight
                        convertedVal = +(ingreVars.netWeight*multiplier);

                        // add to totalLost
                        totalLost += +(convertedVal*discardeds[a].qty);
                    }
                } else {
                    // no variant
                    // check if unit matches
                    if(discardeds[a].unitID.toString() == ingres[i].unitID.toString()){
                        // if yes, add value as is
                        totalLost += +discardeds[a].netWeight;
                    }else{
                        // if no, convert
                        var fromID = discardeds[a].unitID;
                        var toID = ingres[i].unitID;
                        var multiplier = 0;
                        var convertedVal = 0;

                        // get conversion factors
                        var conversions = await fixedConversion.findOne({initialUnitId: fromID, convertedUnitId: toID});
                        if (conversions) {
                            multiplier = conversions.conversionFactor;
                        }

                        // check if conversion factor not found
                        if (multiplier == 0){
                            var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                            for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                    multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                }
                            }
                        }

                        // convert netWeight
                        convertedVal = discardeds[a].netWeight*multiplier;

                        // add to totalLost
                        totalLost += +convertedVal;
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
            for (var b = 0; b < mismatches.length; b++){
                // check if the difference is negative or positive
                if (mismatches[b].difference < 0){ 
                    // if negative, convert to positive then add to loss
                    totalLost += +(-(mismatches[b].difference));
                }else if (mismatches[b].difference > 0){ 
                    // if positive, subtract from loss (NOTE: NOT SURE IF THIS IS CORRECT IMPLEMENTATION)
                    totalLost -= +(mismatches[b].difference);
                }
            }

            // loop through all orders
            var orders = await Order.find({
                date: {
                    $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                }
            }); // orders stores date as a String
            for (var o = 0; o < orders.length; o++){
                // get all order items associated with that order
                var orderItems = await OrderItem.find({orderID: orders[o]._id});
                for (var p = 0; p < orderItems.length; p++){
                    // get all dishes listed as an order item
                    var dishes = await Dish.find({_id: orderItems[p].dishID});
                    for (var q = 0; q < dishes.length; q++){
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
                        var recipe = result[0];

                        for (var r = 0; r < recipe.ingredients.length; r++){
                            // check if the current ingredient is used in the recipe
                            if (recipe.ingredients[r].ingredient.toString() == ingres[i]._id.toString()){
                                //check if unit matches
                                if(recipe.ingredients[r].chefUnitID.toString() == ingres[i].unitID.toString()){
                                    // if yes, add value as is
                                    totalConsumed += +(recipe.ingredients[r].chefWeight*orderItems[p].qty);
                                }else{
                                    // if no, convert
                                    var fromID = recipe.ingredients[r].chefUnitID;
                                    var toID = ingres[i].unitID;
                                    var multiplier = 0;
                                    var convertedVal = 0;
    
                                    // get conversion factors
                                    var conversions = await fixedConversion.findOne({initialUnitId: fromID, convertedUnitId: toID});
                                    if (conversions) {
                                        multiplier = conversions.conversionFactor;
                                    }
    
                                    // check if conversion factor not found
                                    if (multiplier == 0){
                                        var ingreConversions = await ingreConversion.findOne({ingredientId: ingres[i]._id});
                                        for (var k = 0; k < ingreConversions.subUnit.length; k++){
                                            if(fromID == ingreConversions.subUnit[k].convertedUnitId.toString()){
                                                multiplier = 1/(ingreConversions.subUnit[k].conversionFactor);
                                            }
                                        }
                                    }
    
                                    // convert netWeight
                                    convertedVal = +(recipe.ingredients[r].chefWeight*multiplier);
    
                                    // add to totalConsumed
                                    totalConsumed += +convertedVal*orderItems[p].qty;
                                }
                            }
                        }
                    }
                }
            }
            
            
        }
        purchasesValues[i] = totalPurchased.toFixed(2);
        consumedValues[i] = totalConsumed.toFixed(2);
        lostValues[i] = totalLost.toFixed(2);

        totalPurchased = 0;
        totalConsumed = 0;
        totalLost = 0;
    }
}

// CONTROLLER //
const viewReportController = {  
    getPeriodical: function(req, res) {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            const reportTypeLabels = ["Daily", "Weekly", "Monthly", "Yearly"];
            res.render('viewPeriodical', {reportTypeLabels});
        }else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postPeriodical: async function (req, res) {
        try {
            var ingres = await Ingredients.find({});
            var units = await Unit.find({});

            // get date inputs
            var reportType = req.body.filterType;
            var selectedDate = req.body.selectedDate;
            var dateString = "Sample";
            const reportTypeLabels = ["Daily", "Weekly", "Monthly", "Yearly"];

            switch(reportType){
                case '1':
                    var startDateObject = getDay(selectedDate);
                    var endDateObject = getDay(selectedDate);
                    dateString = formatDayDate(startDateObject);
                    break;
                case '2':
                    var { startDateObject, endDateObject } = getWeek(selectedDate);
                    var startDateString = formatDayDate(startDateObject);
                    var endDateString = formatDayDate(endDateObject);
                    dateString = `${startDateString} to ${endDateString}`
                    break;
                case '3':
                    var { startDateObject, endDateObject } = getMonth(selectedDate);
                    dateString = formatMonthDate(startDateObject);
                    break;
                case '4':
                    var { startDateObject, endDateObject } = getYear(selectedDate);
                    dateString = startDateObject.getFullYear();
                    break;
            }
            
            // get dates between start and end
            var dateArray = getDates(startDateObject, endDateObject);

            // instantiate array of values
            var purchasesValues = [];
            var consumedValues = [];
            var lostValues = [];

            await generateReport(ingres, dateArray, purchasesValues, consumedValues, lostValues);

            res.render('postPeriodical', {reportTypeLabels, reportType, selectedDate, dateString, ingres, units, purchasesValues, consumedValues, lostValues, startDateObject, endDateObject});
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred");
        }
    },

    getCustom: function(req, res) {
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "stockController")){
            res.render('viewCustom');
        }else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postCustom: async function(req, res) {
        try {
            var ingres = await Ingredients.find({});
            var units = await Unit.find({});

            // get date inputs
            var startDate = req.body.startDate;
            var endDate = req.body.endDate;

            // set string to Date type
            const startDateObject = new Date(startDate);
            const endDateObject = new Date(endDate);

            // get formatted String for dates
            const formattedStartDate = formatDayDate(startDateObject);
            const formattedEndDate = formatDayDate(endDateObject);
            const dateString = `${formattedStartDate} to ${formattedEndDate}`;

            // get dates between start and end
            var dateArray = getDates(startDateObject, endDateObject);

            // instantiate array of values
            var purchasesValues = [];
            var consumedValues = [];
            var lostValues = [];

            await generateReport(ingres, dateArray, purchasesValues, consumedValues, lostValues);

            res.render('postCustom', {ingres, units, purchasesValues, consumedValues, lostValues, startDate, endDate, startDateObject, endDateObject, dateString});
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred");
        }
    },

    getDetailed: async function(req, res) {
        try {
            // Find ingre id       
            var ingreID = req.body.ingreID;
            const ingredient = await Ingredients.findById(ingreID);

            var startDate = req.body.startDateObj;
            var endDate = req.body.endDateObj;
            var startDateObject = new Date(startDate);
            var endDateObject = new Date(endDate);
            var dateString = req.body.dateString;

            // Display chosen reportTypeLabel
            var variantPurchase = [];
            var qtyPurchase = [];
            var unitPurchase = [];
            var datePurchase = [];
            var doneByPurchase = [];

            var variantDiscard = [];
            var qtyDiscard = [];
            var unitDiscard = [];
            var dateDiscard = [];
            var doneByDiscard = [];

            var qtyMismatch = [];
            var unitMismatch = [];
            var dateMismatch = [];
            var doneByMismatch = [];

            var qtyConsumed = [];
            var unitConsumed = [];
            var dateConsumed = [];
            var doneByConsumed = [];
            var indexConsumed = 0;

            // get dates between start and end
            var dateArray = getDates(startDateObject, endDateObject);
            
            // loop through all dates
            for (var d = 0; d < dateArray.length; d++){
                
                // ======= PURCHASES =======
                // loop through all purchases
                var purchases = await purchasedIngre.find({
                    ingreID: ingreID, 
                    date: {
                        $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                    }
                }); // purchases stores date as a String
                for (var j = 0; j < purchases.length; j++){
                    // check if has variation or not
                    if (ingredient.hasVariant == true){
                        // get variant
                        var ingreVars = await ingreVariations.findOne({_id: purchases[j].varID});
                        variantPurchase[j] = ingreVars.name;
                        
                        qtyPurchase[j] = ingreVars.netWeight*purchases[j].qty;

                        var tempUnit = await Unit.findOne({_id:ingreVars.unitID});
                        unitPurchase[j] = tempUnit.unitSymbol;

                        var tempDate = new Date(purchases[j].date)
                        datePurchase[j] = formatDateTime(tempDate);

                        var doneBy = await User.findOne({_id:purchases[j].doneBy});
                        doneByPurchase[j] = doneBy.userName;
                    }else{ //hasVariant == false
                        variantPurchase[j] = "N/A";
                        qtyPurchase[j] = purchases[j].netWeight;
                        var tempUnit = await Unit.findOne({_id:purchases[j].unitID});
                        unitPurchase[j] = tempUnit.unitSymbol;
                        var tempDate = new Date(purchases[j].date)
                        datePurchase[j] = formatDateTime(tempDate);
                        var doneBy = await User.findOne({_id:purchases[j].doneBy});
                        doneByPurchase[j] = doneBy.userName;
                    }
                }
                
                // ======= CONSUMED =======
                // loop through all orders
                var orders = await Order.find({
                    date: {
                        $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                    }
                }); // orders stores date as a String
                for (var o = 0; o < orders.length; o++){
                    // get all order items associated with that order
                    var orderItems = await OrderItem.find({orderID: orders[o]._id});
                    for (var p = 0; p < orderItems.length; p++){
                        // get all dishes listed as an order item
                        var dishes = await Dish.find({_id: orderItems[p].dishID});
                        for (var q = 0; q < dishes.length; q++){
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
                            var recipe = result[0];

                            for (var r = 0; r < recipe.ingredients.length; r++){
                                // check if the current ingredient is used in the recipe
                                if (recipe.ingredients[r].ingredient.toString() == ingreID){                        
                                    qtyConsumed[indexConsumed] = +(recipe.ingredients[r].chefWeight*orderItems[p].qty);
                                    
                                    var tempUnit = await Unit.findOne({_id:recipe.ingredients[r].chefUnitID});
                                    unitConsumed[indexConsumed] = tempUnit.unitSymbol;
                                    
                                    var tempDate = new Date(orders[o].date)
                                    dateConsumed[indexConsumed] = formatDateTime(tempDate);
                                    doneByConsumed[indexConsumed] = orders[o].takenBy;
                                    
                                    indexConsumed++;
                                }
                            }
                        }
                    }
                }

                // ======= DISCARDED =======
                var discardeds = await discardedIngre.find({
                    ingreID: ingreID, 
                    date: {
                        $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                    }
                }); // discarded stores date as a String
                for (var k = 0; k < discardeds.length; k++){
                    if (discardeds[k].varID !== undefined){
                        // with variant
                        // get variant
                        var ingreVars = await ingreVariations.findOne({_id: discardeds[k].varID});
                        variantDiscard[k] = ingreVars.name;
                        
                        qtyDiscard[k] = ingreVars.netWeight*discardeds[k].qty;

                        var tempUnit = await Unit.findOne({_id:ingreVars.unitID});
                        unitDiscard[k] = tempUnit.unitSymbol;

                        var tempDate = new Date(discardeds[k].date)
                        dateDiscard[k] = formatDateTime(tempDate);

                        var doneBy = await User.findOne({_id:discardeds[k].doneBy});         
                        doneByDiscard[k] = doneBy.userName;                   
                    } else {
                        variantDiscard[k] = "N/A";
                        qtyDiscard[k] = discardeds[k].netWeight;

                        var tempUnit = await Unit.findOne({_id:discardeds[k].unitID});
                        unitDiscard[k] = tempUnit.unitSymbol;

                        var tempDate = new Date(discardeds[k].date)
                        dateDiscard[k] = formatDateTime(tempDate);

                        var doneBy = await User.findOne({_id:discardeds[k].doneBy});  
                        doneByDiscard[k] = doneBy.userName;
                    }
                }

                // ======= MISMATCHES =======
                var mismatches = await mismatch.find({
                    ingreID: ingreID, 
                    date: {
                        $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                    }
                }); // mismatches stores date as a String
                // NOTE: ASSUMING THAT THE UNIT FOR DIFFERENCE WILL ALWAYS MATCH INGREDIENT BASE UNIT
                for (var b = 0; b < mismatches.length; b++){
                    // check if the difference is negative or positive
                    if (mismatches[b].difference < 0){ 
                        // if negative
                        qtyMismatch.push(+(mismatches[b].difference));

                        var tempUnit = await Unit.findOne({_id:mismatches[b].unitID});
                        unitMismatch[b] = tempUnit.unitSymbol;

                        var tempDate = new Date(mismatches[b].date)
                        dateMismatch[b] = formatDateTime(tempDate);

                        var doneBy = await User.findOne({_id:mismatches[b].doneBy});  
                        doneByMismatch[b] = doneBy.userName;
                    }else if (mismatches[b].difference > 0){ 
                        // if positive
                        qtyMismatch.push("+" + +(mismatches[b].difference));

                        var tempUnit = await Unit.findOne({_id:mismatches[b].unitID});
                        unitMismatch[b] = tempUnit.unitSymbol;

                        var tempDate = new Date(mismatches[b].date)
                        dateMismatch[b] = formatDateTime(tempDate);

                        var doneBy = await User.findOne({_id:mismatches[b].doneBy});  
                        doneByMismatch[b] = doneBy.userName;
                    }
                }
            }

            await res.render('detailedReport', {ingredient, dateString, variantPurchase, qtyPurchase, unitPurchase, datePurchase, doneByPurchase, variantDiscard, qtyDiscard, unitDiscard, dateDiscard, doneByDiscard, qtyMismatch, unitMismatch, dateMismatch, doneByMismatch, qtyConsumed, unitConsumed, dateConsumed, doneByConsumed});
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred");
        }
    }
}

module.exports = viewReportController;