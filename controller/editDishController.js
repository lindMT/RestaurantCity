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
            var temp;
            const dish = await Dish.findById(dishID);
            var categories = await DishCategory.find({});
             const category = await DishCategory.findById(dish.categoryID);
            const receipe = await DishRecipe.find({dishID:dishID, isActive:true});
            console.log(category)
            // Pass dish data to editDish page
            if(dish && receipe){
                res.render('editDish', {dish: dish, categories, category});
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