const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');


const revertDishesController = {

    getRevertDishes: async function(req, res) {
        try {
            // Retrieve all dishes available
            const dishes = await Dish.find({ isActive: false, isApproved: 'approved' }).collation({ locale: 'en' }).sort({ name: 1 });
           
            // Retrieve categories from DishCatego
            const categories = await DishCategory.find();
            
            // Map dish id with dishCategory dishID
            const dishesWithCategory = await Promise.all(dishes.map(async dish => {
                const category = categories.find(category => category._id.equals(dish.categoryID));
                
                // Fetch the recipe for the dish
                const recipes = await DishRecipe.find({ dishID: dish._id, isActive: false, isApproved: 'approved' }).lean();

                // Map ingredient names to the recipe items
                const recipesWithIngredients = await Promise.all(recipes.map(async recipe => {

                    const ingredientIds = recipe.ingredients.map(item => item.ingredient);
                    const ingredients = await Ingredients.find({ _id: { $in: ingredientIds } }, 'name').lean();

                    const recipeWithIngredientNames = await Promise.all(recipe.ingredients.map(async item => {
                        const ingredient = ingredients.find(ingredient => ingredient._id.equals(item.ingredient));
                        const chefUnit = await Units.findOne({ _id: item.chefUnitID }, 'unitSymbol').lean();
                        return {
                            ...item,
                            ingredientName: ingredient ? ingredient.name : '',
                            chefUnitSymbol: chefUnit ? chefUnit.unitSymbol : ''
                        };
                    }));
                    return {
                        ...recipe,
                        ingredients: recipeWithIngredientNames,
                    };
                }));
                return {
                    ...dish.toObject(),
                    category: category ? category.category : '',
                    recipe: recipesWithIngredients
                };
            }));
            console.log(dishesWithCategory)
            //Pass dishes to views
            res.render('revertDishes', { dishes: dishesWithCategory });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes.");
        }
    }

}
module.exports = revertDishesController;