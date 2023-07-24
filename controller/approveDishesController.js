const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const Units = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");


const approveDishesController = {
    // for redirecting login and signup
    getApproveDishes: async function(req, res) {
   

        // Redirect to the approveDishes view with the approved dishes data
        res.render('approveDishes');
    }
}
module.exports = approveDishesController;