const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const bcrypt = require("bcrypt");
const Units = require('../model/unitsSchema.js');
const ObjectId = mongoose.Types.ObjectId;


const editDishController = {
    // for redirecting login and signup
    getEditDish: async function(req, res) {
        const dishID = req.query.id;
1
        try {
            // Find dish in database

            const dish = await Dish.findById(dishID);
            var categories = await DishCategory.find({});
            const category = await DishCategory.findById(dish.categoryID);
            const recipe = await DishRecipe.find({dishID:dishID, isActive:true});
            var ingredients = await Ingredients.find({})
            var units = await Units.find({});

            // Pass dish data to editDish page
            if(dish && recipe){
                res.render('editDish', {dish, categories, category, recipe, ingredients, units});
            }
            

        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes.");
        }
    },

    postEditDish: async(req, res) => {
        // Get data from editDish form
        // Set old dish "isActive" to false
        // Creates new dish with same name

        const data = req.session.userName
        let user = await User.findOne({ userName: data });

        let oldDish = await Dish.findOne({ name: req.body.dishName });

        const trial = req.body.category
        let category = await DishCategory.findOne({ category: trial });
        let inputDish= await Dish.findOne({ name: req.body.inputDishName });

        if (oldDish){
            console.log(oldDish.categoryID)
            console.log(oldDish.price)
            return res.redirect('/manageDishes');
        }
        console.log(oldDish.categoryID)
        console.log(oldDish.price)
        const currentDate = Date();
        var ingreTable = [];


        const dish = new Dish({
            name: req.body.inputDishName,
            price: req.body.Amount,
            categoryID: category._id,
            lastModified: currentDate,
            isActive: true,
            addedBy: user._id
            
        })
        var i 
        var temp = []
        temp = req.body.ingredient
        console.log(temp[0].length)

        if(temp[0].length == 1){
            let ingre = await Ingredients.findOne({ name: req.body.ingredient});
            let unit = await Units.findOne({ unitName: req.body.selectUnit});
            if(ingre && unit){
                ingreTable.push([ingre._id,req.body.inputAmount,unit._id]);
            }
        }else{
            for(i=0; i<req.body.ingredient.length; i++){

                let ingre = await Ingredients.findOne({ name: req.body.ingredient[i]});
                let unit = await Units.findOne({ unitName: req.body.selectUnit[i]});
                for (let j = 0; j < i; j++) {
                    if (req.body.ingredient[i] == req.body.ingredient[j]) {
                        req.flash('error_msg', 'Duplicate Ingredient Entry, Please input a different one')
                        console.log("Duplicate Entry")
                        return res.redirect('/addDish');
                    }
                  }
                if(ingre && unit){
                    ingreTable.push([ingre._id,req.body.inputAmount[i],unit._id]);
                }
                    
                // console.log(ingre._id)
                // console.log(req.body.ingredient.length)
                // // console.log(unit._id)
                //  console.log(req.body.selectUnit)
                //  console.log(ingreTable)
            }
        }
    }


};







module.exports = editDishController;