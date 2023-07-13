const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const bcrypt = require("bcrypt");
const ObjectId = mongoose.Types.ObjectId;


const editDishController = {
    // for redirecting login and signup
    getEditDish: async function(req, res) {
        const dishID = req.query.id;

        try {
            // Find dish in database
            const dish = await Dish.findById(dishID);

            // Pass dish data to editDish page
            res.render('editDish', {dish: dish});

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