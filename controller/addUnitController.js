const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");

const addUnitController = {
    getAddUnit: async(req, res) => {
        res.render('addUnit');
    },

    postAddUnit: async(req, res) => {
        const name = req.body.unitName;
        const symbol = req.body.unitSymbol;
        const category = req.body.unitCategory;
        
        // Checks if unit already exists
        var unitSymbolExists = await Unit.findOne({unitSymbol : {'$regex': symbol,$options:'i'}});
        var unitNameExists = await Unit.findOne({unitName : {'$regex': name,$options:'i'}});

        console.log("unitSymbolExists: " + unitSymbolExists)
        console.log("unitNameExists: " + unitNameExists)

        if (unitSymbolExists){
            req.flash('error_msg', 'Unit symbol already exists in the system, Please input a different one')
            console.log("Duplicate unit symbol entry")
            return res.redirect('/addUnit');
        } else if (unitNameExists){
            req.flash('error_msg', 'Unit name already exists in the system, Please input a different one')
            console.log("Duplicate unit name entry")
            return res.redirect('/addUnit');
        } else {
            const newUnit = new Unit({
                unitName: name,
                unitSymbol: symbol,
                category: category
            });
            
            await newUnit.save();
            
            req.flash('success_msg', 'Unit Added Successfully.')
            console.log("New unit entry")
            return res.redirect('/addUnit'); // To be changed as page with "successfully added unit!" message
        }
    }

}

module.exports = addUnitController;