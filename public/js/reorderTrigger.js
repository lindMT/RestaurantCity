const { default: mongoose } = require('mongoose');
const Order = require('../../model/orderSchema.js');
const OrderItem = require('../../model/orderItemSchema.js');
const Dish = require('../../model/dishSchema.js');
const DishRecipe = require('../../model/dishRecipeSchema.js');
const Ingredient = require('../../model/ingredientsSchema.js');
const FixedConversion = require('../../model/fixedConversionSchema.js');
const IngreConversion = require('../../model/ingreConversionSchema.js');

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

// TRIGGER FUNCTION //
async function triggerFunction() {
    console.log('Trigger executed');    
    var ingres = await Ingredient.find();
    var conversions = await FixedConversion.find();

    // get start and end date
    var end = new Date();
    var start = new Date(end);
    start.setDate(end.getDate() - 14);
    console.log(end);
    console.log(start);

    // initialize sum
    var totalConsumed = 0;

    // get dates within specified range
    var dateArray = getDates(start, end);

    // loop through all ingredients
    for (var i = 0; i < ingres.length; i++){
        console.log("CURRENT INGREDIENT: " + ingres[i].name);
        // loop through all dates
        for (var d = 0; d < dateArray.length; d++){
            var orders = await Order.find({
                date: {
                    $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                }
            }); // orders stores date as a String
            // loop through all orders for the current date being checked
            for (var o = 0; o < orders.length; o++){
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
                        //console.log(result);
                        var recipe = result[0];

                        for (var r = 0; r < recipe.ingredients.length; r++){
                            // check if the current ingredient is used in the recipe
                            if (recipe.ingredients[r].ingredient.toString() == ingres[i]._id.toString()){
                                console.log("Ingredient Used in Dish");
                                console.log("Dish: " + dishes[q].name);
                                //check if unit matches
                                if(recipe.ingredients[r].chefUnitID.toString() == ingres[i].unitID.toString()){
                                    // if yes, add value as is
                                    console.log("Unit Match for Recipe (did not convert)");
                                    console.log("NetWeight: " + recipe.ingredients[r].chefWeight);
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
                                        var ingreConversions = await IngreConversion.findOne({ingredientId: ingres[i]._id});
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
                            }
                        }
                    }
                }
            }
        }

        console.log("Sum of Ingre Use in Ordered Dishes: " + totalConsumed);
        console.log("Number of Days: 14");
        var demand = totalConsumed / 14;
        console.log(demand);

        totalConsumed = 0;

        await Ingredient.updateOne({_id: ingres[i]._id}, {$set: {reorderPoint: demand}});
    }
}

// LOAD TRIGGER FUNCTION (For Setup) *code from best friend //
function loadTrigger() {
    console.log("Trigger set");

    // Trigger every 1 minute (FOR TESTING PURPOSES)
    setInterval(() => {
        console.log("Trigger loaded (every 1 minute)");
        triggerFunction();
    }, 60000); // 60000 milliseconds = 1 minute

    /*
    // Trigger every two weeks (14 days) (FOR IMPLEMENTATION PURPOSES)
    const twoWeeksInMilliseconds = 14 * 24 * 60 * 60 * 1000;
    setInterval(() => {
        console.log("Trigger loaded (every 14 days)");
        triggerFunction();
    }, twoWeeksInMilliseconds);
    */
}

module.exports = loadTrigger();
