const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');


const revertDishesController = {

    getRevertDishes: async function(req, res) {
        try {
            // Retrieve all dishes that are for approval
            const dishesForApproval = await Dish.find({
                isActive: false,
                isApproved: 'approved'
              });
          
              // Retrieve approved dish recipes that have 'for approval' status
              const approvedDishRecipes = await DishRecipe.find({
                isActive: false,
                isApproved: 'approved'
              });
          
              // Find the corresponding approved dishes using the dishID field from approvedDishRecipes
              const approvedDishes = await Dish.find({
                _id: { $in: approvedDishRecipes.map(recipe => recipe.dishID) },
                isActive: false,
                isApproved: 'approved'
              });

              const dishes = [...dishesForApproval, ...approvedDishes];
            
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
                    const chefUnit = await Units.findOne({ _id: item.chefUnitID }, 'unitSymbol').lean();

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
            res.render('approveDishes', { dishes: dishesWithCategory });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes.");
        }
    }

}
module.exports = revertDishesController;