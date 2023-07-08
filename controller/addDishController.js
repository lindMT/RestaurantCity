const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const bcrypt = require("bcrypt");


const addDishController = {
    // for redirecting login and signup
    getAddDish: function(req, res) {
        res.render('addDish');
    },

    postAddDish: async(req, res) => {
        const user = await User.findOne({ user: req.session.username });

        //TODO
        // 1) Counter check if dish name is existing in table
            // If exists, *create pop up if user wants to change dish(???)*
                // If yes, set old dish's "isActive" to false
                // If no, close pop up
        // 2) If submit is clicked
            // Validate if all data are appropriate
                // If appropriate, store RECIPE in array of ingredients (recipe of dish) and DISH in dish table
                // If inappropriate, error handling
        // 3) Finalize categories

        // Fetch category in views, where data is from category table
       const trial = req.body.category
        let category = await DishCategory.findOne({ category: trial });

        if(!category){
            console.log(trial)
			console.log('Category does not exist');
			  return res.redirect('/addDish');
			 
		}
        const currentDate = Date();

        //Create Dish Instance
        const dish = new Dish({
            name: req.body.inputDishName,
            price: req.body.Amount,
            categoryID: category._id,
            lastModified: currentDate,
            isActive: true,
            addedBy: user._id
            
        })
        //const dishName = await Dish.findOne({ dishName: req.body.inputDishName });
        // const recipe = new DishRecipe({
        //     dishID: dishName._id

            
        // })
        await dish.save()
        return res.render('manageDishes');
    }

}

module.exports = addDishController;