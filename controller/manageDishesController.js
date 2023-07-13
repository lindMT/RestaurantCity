const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const Units = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");

const manageDishesController = {
    // for redirecting login and signup
    getManageDishes: async function(req, res) {
        try {
            // Retrieve all dishes available
            const dishes = await Dish.find({ isActive: true});
            
            // Retrieve categories from DishCatego
            const categories = await DishCategory.find();
            
            // Map dish id with dishCategory dishID
            const dishesWithCategory = await Promise.all(dishes.map(async dish => {
                const category = categories.find(category => category._id.equals(dish.categoryID));
                
                // Fetch the recipe for the dish
                const recipe = await DishRecipe.findOne({ dishID: dish._id }).lean();

                // Retrieve ingredient names for the recipe
                const ingredientIds = recipe ? recipe.ingredients.map(item => item.ingredient) : [];
                const ingredients = await Ingredients.find({ _id: { $in: ingredientIds } }, 'name').lean();

                // Map ingredient names to the recipe items
                const recipeWithIngredientNames = recipe ? await Promise.all(recipe.ingredients.map(async item => {
                    const ingredient = ingredients.find(ingredient => ingredient._id.equals(item.ingredient));

                    // Fetch the chefUnit with unitSymbol
                    const chefUnit = await ChefUnits.findOne({ _id: item.chefUnitID }, 'unitSymbol').lean();

                    return {
                        ...item,
                        ingredientName: ingredient ? ingredient.name : '',
                        chefUnitSymbol: chefUnit ? chefUnit.unitSymbol : ''
                    };
                })) : [];

                return {
                    ...dish.toObject(),
                    category: category ? category.category : '',
                    recipe: recipeWithIngredientNames
                };
            }));

            //Pass dishes to views
            res.render('manageDishes', { dishes: dishesWithCategory });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes.");
        }
    },

    postManageDishes: async(req, res) => {
        // Retrieves all selected dish with box checked
        let selectedDishes = req.body.selectedDishes;


        if (!Array.isArray(selectedDishes)) {
            // If only one dish is selected, convert it to an array
            selectedDishes = [selectedDishes];
        }
        
        try {
            // Sets "isActive" for all selected dishes to "false"
            const result = await Dish.updateMany({ name: { $in: selectedDishes } }, { isActive: false });
            console.log('Dishes removed:', result.nModified);
            res.redirect('/manageDishes');
        } catch (error) {
            console.error('Error removing dishes', error);
            res.send('Error removing dish');
        }
    }

}

module.exports = manageDishesController;