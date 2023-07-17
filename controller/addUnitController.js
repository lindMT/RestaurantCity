const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");

const addUnitController = {
    getAddUnit: async(req, res) => {
        res.render('addUnit');
    },

    postAddUnit: async(req, res) => {
        const category = req.body.unitCategory;
        const name = req.body.unitName;
        const symbol = req.body.unitSymbol;
        
        // Checks if unit already exists
        const unitSymbolExists = Unit.findOne({unitSymbol : symbol});
        const unitNameExists = Unit.findOne({unitName : name});

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
                unitName: inputName,
                unitSymbol: inputSymbol
            });
            
            await newUnit.save();
            
            req.flash('success_msg', 'Unit Added Successfully.')
            console.log("New unit entry")
            return res.redirect('/addUnit'); // To be changed as page with "successfully added unit!" message
        }
    }

}

module.exports = addUnitController;