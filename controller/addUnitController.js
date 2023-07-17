const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Unit = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");

const addUnitController = {
    getAddUnit: async(req, res) => {
        res.render('addUnit');
    },

    postAddUnit: async(req, res) => {
        const inputName = req.body;
        const inputSymbol = req.body;
        // const category = req.body;
        
        // Checks if unit already exists
        const unitExists = Unit.findOne({unitSymbol : inputName});

        if (unitExists){
            // Handle error
        } else {
            const newUnit = new Unit({
                unitName: inputName,
                unitSymbol: inputSymbol
            });
            
            await newUnit.save();
            return res.redirect('/addUnit'); // To be changed as page with "successfully added unit!" message
        }
    }

}

module.exports = addUnitController;