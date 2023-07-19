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

        let oldDish = await Dish.findOne({ name: req.body.dishName, isActive:true});
        const currentDate = Date();
        const trial = req.body.category
        let category = await DishCategory.findOne({ category: trial });
        const inputIngre= await DishRecipe.findOne({ dishID: oldDish._id , isActive:true});

        var ingreTable = [];

        var i 
        var temp = []
        var flag = 0
        temp = req.body.editIngredient
        console.log(temp[0].length)
        // console.log(inputIngre.ingredients[0].ingredient)

        // if(temp[0].length == 1){
        //     if(inputIngre.ingredients.length == 1){
        //         let ingre = await Ingredients.findOne({ name: req.body.editIngredient});
        //         let unit = await Units.findOne({ unitName: req.body.editUnit});
        //         if (inputIngre.ingredients[0].ingredient.toString() != ingre._id.toString() ||
        //         inputIngre.ingredients[0].chefWeight != req.body.editAmount || inputIngre.ingredients[0].chefUnitID.toString() != unit._id){
        //             ingreTable.push([ingre._id,req.body.editAmount,unit._id]);
        //         }
        //     }
        //     else{
        //         let ingre = await Ingredients.findOne({ name: req.body.editIngredient});
        //         let unit = await Units.findOne({ unitName: req.body.editUnit});
        //         if(ingre && unit){
        //             ingreTable.push([ingre._id,req.body.editAmount,unit._id]);
        //         }
        //     }
        // }
        
        // else{
        //     for(i=0; i<req.body.editIngredient.length; i++){

        //         let ingre = await Ingredients.findOne({ name: req.body.editIngredient[i]});
        //         let unit = await Units.findOne({ unitName: req.body.editUnit[i]});
        //         for (let j = 0; j < i; j++) {
        //             if (req.body.editIngredient[i] == req.body.editIngredient[j]) {
        //                 req.flash('error_msg', 'Duplicate Ingredient Entry, Please input a different one')
        //                 console.log("Duplicate Entry")
        //                 return res.redirect('/addDish');
        //             }
        //           }
        //         if(ingre && unit){
        //             ingreTable.push([ingre._id,req.body.editAmount[i],unit._id]);
        //         }
                    
        //         // console.log(ingre._id)
        //         // console.log(req.body.ingredient.length)
        //         // // console.log(unit._id)
        //         //  console.log(req.body.selectUnit)
        //         //  console.log(ingreTable)
        //     }
        // }

        if (oldDish.categoryID.equals(category._id) && oldDish.price == req.body.price){
            // console.log(oldDish.categoryID)
            // console.log(req.body.hiddenID)
            // console.log(inputIngre)
            // console.log(category._id)
            // console.log(oldDish.price)
            // console.log(req.body.price)
            

            if(temp[0].length == 1){
                if(inputIngre.ingredients.length == 1){
                    let ingre = await Ingredients.findOne({ name: req.body.editIngredient});
                    let unit = await Units.findOne({ unitName: req.body.editUnit});
                    if (inputIngre.ingredients[0].ingredient.toString() != ingre._id.toString() ||
                    inputIngre.ingredients[0].chefWeight != req.body.editAmount || inputIngre.ingredients[0].chefUnitID.toString() != unit._id){
                        ingreTable.push([ingre._id,req.body.editAmount,unit._id]);
                    } else{
                        req.flash('error_msg', 'No changes were made')
                        const urlWithQuery = '/editDish?id=' + oldDish._id.toString();
                        return res.redirect(urlWithQuery);
                    }
                }
                else{
                    let ingre = await Ingredients.findOne({ name: req.body.editIngredient});
                    let unit = await Units.findOne({ unitName: req.body.editUnit});
                    if(ingre && unit){
                        ingreTable.push([ingre._id,req.body.editAmount,unit._id]);
                    }
                }
            }else{
                for(i=0; i<req.body.editIngredient.length; i++){

                    let ingre = await Ingredients.findOne({ name: req.body.editIngredient[i]});
                    let unit = await Units.findOne({ unitName: req.body.editUnit[i]});
                    for (let j = 0; j < i; j++) {
                        if (req.body.editIngredient[i] == req.body.editIngredient[j]) {
                            req.flash('error_msg', 'Duplicate Ingredient Entry, Please input a different one')
                            console.log("Duplicate Entry")
                            const urlWithQuery = '/editDish?id=' + oldDish._id.toString();
                            return res.redirect(urlWithQuery);
                        }
                    }
                    if(inputIngre.ingredients.length == temp.length){
                        for (let j = 0; j < inputIngre.ingredients.length; j++) {
                            if (inputIngre.ingredients[j].ingredient.toString() == ingre._id.toString() &&
                                inputIngre.ingredients[j].chefWeight == req.body.editAmount[i] && 
                                inputIngre.ingredients[j].chefUnitID.toString() == unit._id){
                                    flag++
                            }
                            
                            
                        }

                        ingreTable.push([ingre._id,req.body.editAmount[i],unit._id]);

                    }else {
                        if(ingre && unit){
                            ingreTable.push([ingre._id,req.body.editAmount[i],unit._id]);
                        }
                    }   
                }
                if(flag == inputIngre.ingredients.length){
                    req.flash('error_msg', 'No changes were made')
                    const urlWithQuery = '/editDish?id=' + oldDish._id.toString();
                    return res.redirect(urlWithQuery);
                }
            }
            await DishRecipe.updateOne({dishID: oldDish._id, isActive:true},{$set: {lastModified:currentDate, isActive:false, addedBy:user._id}})

            const recipe = new DishRecipe({
                dishID : oldDish._id,
                ingredients: ingreTable.map((ingredient) => ({
                    ingredient: ingredient[0], 
                    chefWeight: ingredient[1],
                    chefUnitID: ingredient[2]
                  })),
                isActive:true,
                lastModified:currentDate,
                addedBy:user._id
            })

            if(await recipe.save()){
                await Dish.updateOne({name: req.body.dishName, isActive:true},{$set: {lastModified:currentDate, addedBy:user._id}})
                return res.redirect('/manageDishes');
            }
        }else{

            if(temp[0].length == 1){
                let ingre = await Ingredients.findOne({ name: req.body.editIngredient});
                let unit = await Units.findOne({ unitName: req.body.editUnit});
                if(ingre && unit){
                    ingreTable.push([ingre._id,req.body.editAmount,unit._id]);
                }
            }
            else{
            for(i=0; i<req.body.editIngredient.length; i++){

                let ingre = await Ingredients.findOne({ name: req.body.editIngredient[i]});
                let unit = await Units.findOne({ unitName: req.body.editUnit[i]});
                for (let j = 0; j < i; j++) {
                    if (req.body.editIngredient[i] == req.body.editIngredient[j]) {
                        req.flash('error_msg', 'Duplicate Ingredient Entry, Please input a different one')
                        console.log("Duplicate Entry")
                        const urlWithQuery = '/editDish?id=' + oldDish._id.toString();
                        return res.redirect(urlWithQuery);
                        // res.redirect('/editDish');
                    }
                  }
                if(ingre && unit){
                    ingreTable.push([ingre._id,req.body.editAmount[i],unit._id]);
                }
                    
            }
        }
        await Dish.updateOne({name: req.body.dishName, isActive:true},{$set: {lastModified:currentDate, isActive:false, addedBy:user._id}})
        await DishRecipe.updateOne({dishID: oldDish._id, isActive:true},{$set: {lastModified:currentDate, isActive:false, addedBy:user._id}})

        const dish = new Dish({
            name: req.body.dishName,
            price: req.body.price,
            categoryID: category._id,
            lastModified: currentDate,
            isActive: true,
            addedBy: user._id
    })

        if(await dish.save()){
            let newDishID = await Dish.findOne({ name: req.body.dishName, isActive:true});

            const recipe = new DishRecipe({
                dishID : newDishID._id,
                ingredients: ingreTable.map((ingredient) => ({
                    ingredient: ingredient[0], 
                    chefWeight: ingredient[1],
                    chefUnitID: ingredient[2]
                  })),
                isActive:true,
                lastModified:currentDate,
                addedBy:user._id
            })

            if(await recipe.save()){
                console.log(ingreTable)
                return res.redirect('/manageDishes');
            }
        }
    }

        
    }


};


module.exports = editDishController;