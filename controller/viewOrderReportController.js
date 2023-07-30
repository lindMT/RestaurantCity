const User = require('../model/usersSchema.js');

const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Dish = require('../model/dishSchema.js');

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
async function generateReport(distinctDishes, dateArray, qtyValues, priceValues) {
    var totalQty = 0;
    var totalPrice = 0;
    
    // loop through all dishes
    for (var i = 0; i < distinctDishes.length; i++){
        //console.log("CURRENT DISH: " + distinctDishes[i]);
        // loop through all dates
        for (var d = 0; d < dateArray.length; d++){
            // get orders that fall within the specified time frame
            var orders = await Order.find({
                date: {
                    $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                }
            }); // orders stores date as a String
            // loop through all orders
            for (var o = 0; o < orders.length; o++){
                // get all order items associated with that order
                var orderItems = await OrderItem.find({orderID: orders[o]._id});
                for (var p = 0; p < orderItems.length; p++){
                    // get all dishes listed as an order item
                    var dishes = await Dish.find({_id: orderItems[p].dishID});
                    // check if the dish in the order matches the current dish
                    for (var q = 0; q < dishes.length; q++){
                        if(distinctDishes[i] == dishes[q].name){
                            //console.log("----- Order Found");
                            // add quantity
                            totalQty += +(orderItems[p].qty);
                            //console.log("Qty: " + orderItems[p].qty);
                            //console.log("totalQty: " + totalQty);
                            // add total price
                            totalPrice += +(dishes[q].price*orderItems[p].qty);
                            //console.log("Price Each: " + dishes[q].price);
                            //console.log("Price*Qty: " + (dishes[q].price*orderItems[p].qty));
                            //console.log("totalPrice: " + totalPrice);
                        }
                    }
                }
            }
        }

        // populate array
        qtyValues[i] = totalQty;
        priceValues[i] = totalPrice.toFixed(2);

        // reset values
        totalQty = 0;
        totalPrice = 0;

        //console.log("FINAL QTY: " + qtyValues[i]);
        //console.log("FINAL TOTAL PRICE: " + priceValues[i]);
    }
}

// CONTROLLER //
const viewOrderReportController = {
    getPeriodical: async function(req, res) {
        if(req.session.isAuth && (req.session.position == 'admin')){
            const reportTypeLabels = ["Daily", "Weekly", "Monthly", "Yearly"];
            res.render('viewPeriodicalOR', {reportTypeLabels});
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postPeriodical: async function (req, res) {
        try{
            //console.log("---------- PERIODICAL ORDER REPORT ----------");

            // get date inputs
            var reportType = req.body.filterType;
            var selectedDate = req.body.selectedDate;
            var dateString = "Sample";
            const reportTypeLabels = ["Daily", "Weekly", "Monthly", "Yearly"];
            //console.log(reportType);
            //console.log(selectedDate);
            //console.log(dateString);

            switch(reportType){
                case '1':
                    //console.log("Entered 1 - Daily");
                    var startDateObject = getDay(selectedDate);
                    var endDateObject = getDay(selectedDate);
                    dateString = formatDayDate(startDateObject);
                    break;
                case '2':
                    //console.log("Entered 2 - Weekly");
                    var { startDateObject, endDateObject } = getWeek(selectedDate);
                    var startDateString = formatDayDate(startDateObject);
                    var endDateString = formatDayDate(endDateObject);
                    dateString = `${startDateString} to ${endDateString}`
                    break;
                case '3':
                    //console.log("Entered 3 - Monthly");
                    var { startDateObject, endDateObject } = getMonth(selectedDate);
                    dateString = formatMonthDate(startDateObject);
                    break;
                case '4':
                    //console.log("Entered 4 - Yearly");
                    var { startDateObject, endDateObject } = getYear(selectedDate);
                    dateString = startDateObject.getFullYear();
                    break;
            }
            //console.log("DATES:");
            //console.log(startDateObject);
            //console.log(endDateObject);
            
            // get dates between start and end
            var dateArray = getDates(startDateObject, endDateObject);

            // instantiate array for values
            var qtyValues = [];
            var priceValues = [];

            // get unique dish names
            var distinctDishes = await Dish.find({ isApproved: "approved" }).distinct('name').exec();

            await generateReport(distinctDishes, dateArray, qtyValues, priceValues);

            res.render('postPeriodicalOR', {reportTypeLabels, selectedDate, dateString, startDateObject, endDateObject, distinctDishes, qtyValues, priceValues});
        }catch(error){
            console.error(error);
            res.status(500).send("An error occurred");
        }
    },

    getCustom: async function(req, res) {
        if(req.session.isAuth && (req.session.position == 'admin')){
            res.render('viewCustomOR');
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postCustom: async function (req, res) {
        try{
            //console.log("---------- CUSTOM ORDER REPORT ----------");

            // get date inputs
            var startDate = req.body.startDate;
            var endDate = req.body.endDate;
            //console.log("START DATE: " + startDate);
            //console.log("END DATE: " + endDate);

            // set string to Date type
            const startDateObject = new Date(startDate);
            const endDateObject = new Date(endDate);

            // get formatted String for dates
            const formattedStartDate = formatDayDate(startDateObject);
            const formattedEndDate = formatDayDate(endDateObject);
            const dateString = `${formattedStartDate} to ${formattedEndDate}`;

            // get dates between start and end
            var dateArray = getDates(startDateObject, endDateObject);

            // instantiate array for values
            var qtyValues = [];
            var priceValues = [];

            // get unique dish names
            var distinctDishes = await Dish.find({ isApproved: "approved" }).distinct('name').exec();

            await generateReport(distinctDishes, dateArray, qtyValues, priceValues);

            res.render('postCustomOR', {startDate, startDateObject, endDate, endDateObject, dateString, distinctDishes, qtyValues, priceValues});
        }catch(error){
            console.error(error);
            res.status(500).send("An error occurred");
        }
    },

    getDetailed: async function (req, res) {
        try{
            //console.log("---------- DETAILED ORDER REPORT ----------");

            const dateString = req.body.dateString;
            const dishName = req.body.dishName;
            const startDateObject = new Date(req.body.startDateObj);
            const endDateObject = new Date(req.body.endDateObj);
            var dateArray = [];

            // get dates between start and end
            if (startDateObject != endDateObject){ // check if not daily report
                dateArray = getDates(startDateObject, endDateObject);
            }else{
                dateArray.push(startDateObject);
            }
            
            // instantiate columns
            var index = 0;
            var dateValues = [];
            var qtyValues = [];
            var priceValues = [];
            var userValues = [];

            // loop through all dates
            for (var d = 0; d < dateArray.length; d++){
                // get orders that fall within the specified time frame
                var orders = await Order.find({
                    date: {
                        $regex: new RegExp("^" + dateArray[d].toString().substr(0, 15))
                    }
                }); // orders stores date as a String
                // loop through all orders
                for (var o = 0; o < orders.length; o++){
                    // get all order items associated with that order
                    var orderItems = await OrderItem.find({orderID: orders[o]._id});
                    for (var p = 0; p < orderItems.length; p++){
                        // get all dishes listed as an order item
                        var dishes = await Dish.find({_id: orderItems[p].dishID});
                        // check if the dish in the order matches the current dish
                        for (var q = 0; q < dishes.length; q++){
                            if(dishName == dishes[q].name){
                                //console.log("----- Order Found (Index " + index + ")");
                                // add date (formatted)
                                var tempDate = new Date(orders[o].date);
                                dateValues[index] = formatDateTime(tempDate);
                                // console.log(tempDate.toString());

                                // add quantity
                                qtyValues[index] = +(orderItems[p].qty);
                                // console.log("Qty: " + orderItems[p].qty);

                                // add total price
                                priceValues[index] = +(dishes[q].price*orderItems[p].qty);
                                // console.log("Price Each: " + dishes[q].price);
                                // console.log("Price*Qty: " + (dishes[q].price*orderItems[p].qty));

                                // add user (username)
                                userValues[index] = orders[o].takenBy; // orders uses username by default
                                // console.log(orders[o].takenBy);
                                
                                //console.log("dateValues["+index+"]: "+ dateValues[index]);
                                //console.log("qtyValues[" + index + "]: " + qtyValues[index]);
                                //console.log("priceValues[" + index + "]: " + priceValues[index]);
                                //console.log("userValues["+index+"]: " + userValues[index]);

                                //increment index
                                index++;
                            }
                        }
                    }
                }
            }

            res.render('detailedOrderReport', {dateString, dishName, dateValues, qtyValues, priceValues, userValues});
        }catch(error){
            console.error(error);
            res.status(500).send("An error occurred");
        }
    }
}

module.exports = viewOrderReportController;