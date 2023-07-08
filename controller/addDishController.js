const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const bcrypt = require("bcrypt");



const addDishController = {
    // for redirecting login and signup
    getAddDish: async function(req, res) {
        var categories = await DishCategory.find({});
        var ingredients = await Ingredients.find({});
        res.render('addDish', {categories, ingredients});
    },

    postAddDish: async(req, res) => {
        
        const data = req.session.userName
        let user = await User.findOne({ userName: data });

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

        // if(!category){
        //     console.log(data)
		// 	console.log('Category does not exist');
		// 	  return res.redirect('/addDish');
			 
		// }
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
       
        if(await dish.save()){
            //alert("Yes");
            console.log(data)
            return res.redirect('/manageDishes');
        }
       
    }

}

module.exports = addDishController;