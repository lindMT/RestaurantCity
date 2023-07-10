const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const bcrypt = require("bcrypt");
const ChefUnits = require('../model/chefUnitsSchema.js');
const ObjectId = mongoose.Types.ObjectId;



const addDishController = {
    // for redirecting login and signup
    getAddDish: async function(req, res) {
        var categories = await DishCategory.find({});
        var ingredients = await Ingredients.find({});
        var units = await ChefUnits.find({});
        res.render('addDish', {categories, ingredients, units});
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
        var ingreTable = [];
        // ingreTable = req.body.ingredient

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
            let dishID = await Dish.findOne({ name: req.body.inputDishName});
            
            var i 
            var temp = req.body.ingredient
            for(i=0; i<req.body.ingredient.length; i++){
                // if (i >=1 && temp != req.body.ingredient){
                //     let ingre = await Ingredients.findOne({ name: req.body.ingredient});

                // }
                let ingre = await Ingredients.findOne({ name: req.body.ingredient[i]});
                let unit = await ChefUnits.findOne({ unitName: req.body.selectUnit[i]});
                if(ingre && unit){
                    ingreTable.push([ingre._id,req.body.inputAmount[i],unit._id]);
                }
                    
                // console.log(ingre._id)
                // //console.log(req.body.ingredient)
                // console.log(unit._id)
                // // console.log(req.body.selectUnit)
                // console.log(ingreTable)
            }
                
            const recipe = new DishRecipe({
                dishID : dishID._id,
                ingredients: ingreTable.map((ingredient) => ({
                    ingredient: ingredient[0], 
                    chefWeight: ingredient[1],
                    chefUnitID: ingredient[2]
                  }))
            })

            if(await recipe.save()){
                console.log(ingreTable)
                return res.redirect('/manageDishes');
            }
        }
       
    }

}

module.exports = addDishController;