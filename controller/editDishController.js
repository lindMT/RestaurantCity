const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const bcrypt = require("bcrypt");
const Units = require('../model/unitsSchema.js');
const ObjectId = mongoose.Types.ObjectId;


const editDishController = {
    // for redirecting login and signup
    getEditDish: async function(req, res) {
        const dishID = req.query.id;
1
        try {
            // Find dish in database

            const dish = await Dish.findById(dishID);
            var categories = await DishCategory.find({});
            const category = await DishCategory.findById(dish.categoryID);
            const recipe = await DishRecipe.find({dishID:dishID, isActive:true});
            var ingredients = await Ingredients.find({})
            var units = await Units.find({});

            // Pass dish data to editDish page
            if(dish && recipe){
                res.render('editDish', {dish, categories, category, recipe, ingredients, units});
            }
            

        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes.");
        }
    },

    postEditDish: async(req, res) => {
        // Get data from editDish form
        // Set old dish "isActive" to false
        // Creates new dish with same name
    }


};







module.exports = editDishController;