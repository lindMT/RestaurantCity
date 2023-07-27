const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');


const revertDishesController = {

    getRevertDishes: async function(req, res) {
        res.render("revertDishes")
    }

}
module.exports = revertDishesController;