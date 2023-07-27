const User = require('../model/usersSchema.js');

const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');

const bcrypt = require("bcrypt");

const viewOrderReportController = {
    getPeriodical: function(req, res) {
        const reportTypeLabels = ["Daily", "Weekly", "Monthly", "Yearly"];
        res.render('viewPeriodicalOR', {reportTypeLabels});
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

        try{
            console.log("---------- PERIODICAL ORDER REPORT ----------");

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

            res.render('postPeriodicalOR', {reportTypeLabels, selectedDate, dateString});
        }catch(error){
            console.error(error);
            res.status(500).send("An error occurred");
        }
    },

    getCustom: function(req, res) {
        res.render('viewCustomOR');
    },

    postCustom: async function (req, res) {
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

        try{
            console.log("---------- CUSTOM ORDER REPORT ----------");

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

            res.render('postCustomOR', {startDate, endDate, formattedStartDate, formattedEndDate});
        }catch(error){
            console.error(error);
            res.status(500).send("An error occurred");
        }
    },

    getDetailed: function (req, res) {
        res.render('detailedOrderReport');
    }
}

module.exports = viewOrderReportController;