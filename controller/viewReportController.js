const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const viewReportController = {
    getPeriodical: function(req, res) {
        res.render('viewPeriodical');
    },

    getCustom: function(req, res) {
        res.render('viewCustom');
    },

    getDetailed: function(req, res) {
        res.render('detailedReport');
    }
}

module.exports = viewReportController;