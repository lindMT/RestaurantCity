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
            const dishes = await Dish.find({ isActive: true }).collation({ locale: 'en' }).sort({ name: 1 });
            
            // Retrieve categories from DishCatego
            const categories = await DishCategory.find();
            
            // Map dish id with dishCategory dishID
            const dishesWithCategory = await Promise.all(dishes.map(async dish => {
                const category = categories.find(category => category._id.equals(dish.categoryID));
                
                // Fetch the recipe for the dish
                const recipe = await DishRecipe.findOne({ dishID: dish._id, isActive:true}).lean();
                //console.log(recipe)
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
                    recipe: recipeWithIngredientNames,
                    dishRecipeID: recipe._id
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
            for (const selected of selectedDishes) {
                const { dishID, dishRecipeID } = selected;
                console.log(dishID)
                console.log(dishRecipeID)
                // Verify that both dishID and dishRecipeID are provided
                if (dishID && dishRecipeID) {
                  // Delete the 'Dish' with the given dishID
                  const dishResult = await Dish.updateOne(
                    { _id: dishID },
                    { isActive: false }
                  );
          
                  console.log('Dish removed:', dishResult.nModified);
          
                  // Delete the 'DishRecipe' with the given dishID and dishRecipeID
                  const dishRecipeResult = await DishRecipe.updateOne({
                    dishID: dishID,
                    _id: dishRecipeID
                  }, { isActive: false });
          
                  console.log('Dish Recipe removed:', dishRecipeResult.deletedCount);
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