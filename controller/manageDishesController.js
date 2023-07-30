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
    // Session position
    if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "chef")){
        try {
            // Retrieve all dishes available
            const dishes = await Dish.find({ isActive: true }).collation({ locale: 'en' }).sort({ name: 1 });
           
            // Retrieve categories from DishCatego
            const categories = await DishCategory.find();
            
            // Map dish id with dishCategory dishID
            const dishesWithCategory = await Promise.all(dishes.map(async dish => {
                const category = categories.find(category => category._id.equals(dish.categoryID));
                
                // Fetch the recipe for the dish
                const recipes = await DishRecipe.find({ dishID: dish._id, isActive: true }).lean();

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
            res.render('manageDishes', { dishes: dishesWithCategory });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes.");
        }
    }   else{
        console.log("Unauthorized access.");
        req.session.destroy();
        return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        } // end of session position security
    },

    postManageDishes: async(req, res) => {
        // Retrieves all selected dish with box checked
        let selectedDishes = req.body.selectedDishes;


        if (!Array.isArray(selectedDishes)) {
            // If only one dish is selected, convert it to an array
            selectedDishes = [selectedDishes];
        }
        
        try {
            for (const dishRecipeID of selectedDishes) {
                // Verify that dishRecipeID is provided
                if (dishRecipeID) {
                    // Find the 'DishRecipe' with the given dishRecipeID
                    const dishRecipe = await DishRecipe.findOne({ _id: dishRecipeID });
    
                    if (dishRecipe) {
                        // Get the dishID from the 'DishRecipe' document
                        const dishID = dishRecipe.dishID;

                        const dishRecipesForDish = await DishRecipe.find({ dishID: dishID });

                        if (dishRecipesForDish.length > 1) {
                            const dishRecipeResult = await DishRecipe.updateOne(
                                { _id: dishRecipeID, dishID: dishID },
                                { isActive: false }
                            );
    
                            console.log('Dish Recipe removed:', dishRecipeResult.nModified);
                        } else {
                            // If only one DishRecipe found, update both Dish and DishRecipe to false
                            const dishResult = await Dish.updateOne(
                                { _id: dishID },
                                { isActive: false }
                            );
    
                            console.log('Dish removed:', dishResult.nModified);
    
                            const dishRecipeResult = await DishRecipe.updateOne(
                                { _id: dishRecipeID, dishID: dishID },
                                { isActive: false }
                            );
    
                            console.log('Dish Recipe removed:', dishRecipeResult.nModified);
                        }
                    }
                }
            }
              
            res.redirect('/manageDishes');
        } catch (error) {
            console.error('Error removing dishes', error);
            res.send('Error removing dish');
        }
    }

}

module.exports = manageDishesController;