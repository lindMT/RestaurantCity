const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");

const addUnitController = {
    getAddUnit: async(req, res) => {
        res.render('addUnit', { addUnitPrompt: "1234" });
        
    },

    postAddUnit: async(req, res) => {
        const category = req.body.unitCategory;
        const name = req.body.unitName;
        const symbol = req.body.unitSymbol;
        
        // Checks if unit already exists
        const unitExists = Unit.findOne({unitSymbol : symbol});

        // if (unitExists){
        if (1 === 4){
            req.flash('error_msg', 'Unit already exists in the system, Please input a different one')
            console.log("Duplicate Unit Entry")
            return res.redirect('/addUnit');
        } else {
            // const newUnit = new Unit({
            //     unitName: inputName,
            //     unitSymbol: inputSymbol
            // });
            
            // await newUnit.save();
            
            req.flash('success_msg', 'Unit Added Successfully.')
            console.log("New Unit Entry")
            return res.redirect('/addUnit'); // To be changed as page with "successfully added unit!" message
        }
    }

}

module.exports = addUnitController;