const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const Units = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");


const approveDishesController = {
    // for redirecting login and signup
    getApproveDishes: async function(req, res) {
        try {
            // Retrieve all dishes that are for approval
            const dishesForApproval = await Dish.find({
                isActive: true,
                isApproved: 'for approval'
              });
          
              // Retrieve approved dish recipes that have 'for approval' status
              const approvedDishRecipes = await DishRecipe.find({
                isActive: true,
                isApproved: 'for approval'
              });
          
              // Find the corresponding approved dishes using the dishID field from approvedDishRecipes
              const approvedDishes = await Dish.find({
                _id: { $in: approvedDishRecipes.map(recipe => recipe.dishID) },
                isActive: true,
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
    },

    postApproveDish: async function(req, res) {
        const approve = req.body.approve;
        const reject = req.body.reject;
        const currentDate = Date();

        //Approve Dishes
        if (req.body.approve){

            const dish = await Dish.find({_id:approve, isActive:true})
            const recipe = await DishRecipe.findOne({dishID:approve, isActive:true, isApproved:'for approval'})

            var i;
            for(i=0;i<dish.length;i++){
                if (dish[i].isApproved == 'for approval'){
                   
                    const approveDish = await Dish.findOne({name:dish[i].name, isActive:true, isApproved:'approved'})
                    if(approveDish){
                        await Dish.updateOne({name: dish[i].name, isActive:true, isApproved:'approved'},{$set: {lastModified:currentDate, isActive:false}})
                    
                        await DishRecipe.updateOne({dishID:approveDish._id, isActive:true, isApproved:'approved'},{$set: {lastModified:currentDate, isActive:false}})
                        await Dish.updateOne({_id:approve, isActive:true, isApproved:'for approval'},{$set: {lastModified:currentDate, isApproved:'approved', approvedOn:currentDate}})
                        await DishRecipe.updateOne({dishID: approve, isActive:true, isApproved:'for approval'},{$set: {lastModified:currentDate, isApproved:'approved', approvedOn:currentDate}})
                        req.flash('success_msg', 'Dish ' + dish[i].name + ' Successfully Approved')
                        return res.redirect('/approveDishes');
                    }
                    else{
                        await Dish.updateOne({_id:approve, isActive:true, isApproved:'for approval'},{$set: {lastModified:currentDate, isApproved:'approved', approvedOn:currentDate}})
                        await DishRecipe.updateOne({dishID: approve, isActive:true, isApproved:'for approval'},{$set: {lastModified:currentDate, isApproved:'approved', approvedOn:currentDate}})
                        req.flash('success_msg', 'Dish ' + dish[i].name + ' Successfully Approved')
                        return res.redirect('/approveDishes');
                    }
                } else if(dish[i].isApproved == 'approved' && recipe){
                    req.flash('success_msg', 'Dish ' + dish[i].name + ' Successfully Approved')
                    const approveDish = await Dish.findOne({name:dish[i].name, isActive:true, isApproved:'approved'})
                    await DishRecipe.updateOne({dishID:approveDish._id, isActive:true, isApproved:'approved'},{$set: {lastModified:currentDate, isActive:false}})
                    await DishRecipe.updateOne({dishID: approve, isActive:true, isApproved:'for approval'},{$set: {lastModified:currentDate, isApproved:'approved', approvedOn:currentDate}})
                    req.flash('success_msg', 'Dish ' + dish[i].name + ' Successfully Approved')
                    return res.redirect('/approveDishes');
                }
            }

        //Reject Dishes
        } else if (req.body.reject) {

            const dish = await Dish.find({_id:reject, isActive:true})
            const recipe = await DishRecipe.findOne({dishID:reject, isActive:true, isApproved:'for approval'})

            var i;
            for(i=0;i<dish.length;i++){
                if (dish[i].isApproved == 'for approval'){
                    req.flash('error_msg', 'Dish ' + dish[i].name + ' Successfully Rejected')
                   await Dish.updateOne({_id:reject, isActive:true, isApproved:'for approval'},{$set: {lastModified:currentDate, isApproved:'rejected'}})
                    await DishRecipe.updateOne({dishID: reject, isActive:true, isApproved:'for approval'},{$set: {lastModified:currentDate, isActive:false, isApproved:'rejected'}})
                    return res.redirect('/approveDishes');
                } else if(dish[i].isApproved == 'approved' && recipe){
                    req.flash('error_msg', 'Dish ' + dish[i].name + ' Successfully Rejected')
                    await DishRecipe.updateOne({dishID: reject, isActive:true, isApproved:'for approval'},{$set: {lastModified:currentDate, isActive:false, isApproved:'rejected'}})
                    return res.redirect('/approveDishes');
                }
            }
        }
        
        
    },

}

module.exports = approveDishesController;