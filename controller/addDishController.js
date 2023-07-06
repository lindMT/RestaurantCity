const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const bcrypt = require("bcrypt");

const addDishController = {
    // for redirecting login and signup
    getAddDish: function(req, res) {
        res.render('addDish');
    },

    postAddDish: async(req, res) => {
        // const category = await DishCategory.findOne({ category: req.body.inputCategory }); - to be coordinated
        const currentDate = Date();

        //Create Dish Instance
        const dish = new Dish({
            name: req.body.inputDishName,
            price: req.body.inputPrice,
            // categoryID: category._id, - to be coordinated
            lastModified: currentDate,
            // addedBy: - to be checked
            
        })
    }

}

module.exports = addDishController;