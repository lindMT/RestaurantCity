const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const Units = require('../model/unitsSchema.js');


const revertDishesController = {

    getRevertDishes: async function(req, res) {
        try {
            // Retrieve all dishes that are for approval
            
              // Retrieve approved dish recipes that have 'for approval' status
              const approvedDishRecipes = await DishRecipe.find({
                isActive: false,
                isApproved: 'approved'
              });
              
              const approvedDishIds = approvedDishRecipes.map(recipe => recipe.dishID);
              
              // Find the corresponding approved dishes using the dishID field from approvedDishRecipes
              const dishes = await Dish.find({
                $or: [
                    { _id: { $in: approvedDishIds }, isActive: true },
                    { _id: { $in: approvedDishIds }, isActive: false }
                ],
                isApproved: 'approved'
              });

            
            // Retrieve categories from DishCatego
            const categories = await DishCategory.find();
            
            // Map dish id with dishCategory dishID
            const dishesWithCategory = await Promise.all(dishes.map(async dish => {
                const category = categories.find(category => category._id.equals(dish.categoryID));
                
                // Fetch the recipe for the dish
                const recipes = await DishRecipe.find({ dishID: dish._id, isActive: false }).lean();


                // Map ingredient names to the recipe items
                const recipeWithIngredients = await Promise.all(recipes.map(async recipe => {

                    const ingredientIds = recipe.ingredients.map(item => item.ingredient);
                    const ingredients = await Ingredients.find({ _id: { $in: ingredientIds } }, 'name').lean();

                    // Fetch the chefUnit with unitSymbol
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
                    recipe: recipeWithIngredients
                };
            }));

            //Pass dishes to views
            res.render('revertDishes', { dishes: dishesWithCategory });
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes.");
        }
    },
    postRevertDishes: async function(req, res) {
        const revert = req.body.revert;
        //const reject = req.body.reject;
        const currentDate = Date();

        if (revert){

            const recipe = await DishRecipe.findOne({_id:revert})
            const dish = await Dish.findOne({_id:recipe.dishID})

            const currentDish = await Dish.findOne({name:dish.name, isActive:true, isApproved:'approved'})

            if(currentDish){
                const currentRecipe = await DishRecipe.findOne({dishID:currentDish._id, isActive:true, isApproved:'approved'})
                await Dish.updateOne({_id:currentDish},{$set: {lastModified:currentDate, isActive:false}})
                    
                await DishRecipe.updateOne({_id:currentRecipe},{$set: {lastModified:currentDate, isActive:false}})
                await Dish.updateOne({_id:dish},{$set: {lastModified:currentDate, isActive:true}})
                await DishRecipe.updateOne({_id:recipe},{$set: {lastModified:currentDate, isActive:true}})
                req.flash('success_msg', 'Version of Dish ' + dish.name + ' Successfully Reverted')
    
                return res.redirect('/revertDishes');
            } else{
                await Dish.updateOne({_id:dish},{$set: {lastModified:currentDate, isActive:true}})
                await DishRecipe.updateOne({_id:recipe},{$set: {lastModified:currentDate, isActive:true}})
                req.flash('success_msg', 'Version of Dish ' + dish.name + ' Successfully Reverted')
                
                return res.redirect('/revertDishes');
            }

        }
        
    },

}
module.exports = revertDishesController;