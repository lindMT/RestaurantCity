const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const bcrypt = require("bcrypt");
const Units = require('../model/unitsSchema.js');
const FixedConversion = require('../model/fixedConversionSchema.js');
const IngreConversion = require('../model/ingreConversionSchema.js');
const ObjectId = mongoose.Types.ObjectId;

const addDishController = {
    // for redirecting login and signup
    getAddDish: async function(req, res) {
        // Session position
        if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "chef")){
        var categories = await DishCategory.find({});
        var ingredients = await Ingredients.find({});
        var units = await Units.find({});
        res.render('addDish', {categories, ingredients, units});
    }   else{
        console.log("Unauthorized access.");
        req.session.destroy();
        return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        } // end of session position
    },

    postAddDish: async(req, res) => {
        
        const data = req.session.userName
        let user = await User.findOne({ userName: data });
        let admin = await User.findOne({ position: "admin" });

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
        let inputDish= await Dish.findOne({ name: req.body.inputDishName, isActive:true});
        // if(!category){
        //     console.log(data)
		// 	console.log('Category does not exist');
		// 	  return res.redirect('/addDish');
			 
		// }
        const currentDate = Date();
        var ingreTable = [];
        var approval;
        var activeStatus;
        
        // ingreTable = req.body.ingredient
        
        //Create Dish Instance
        
        if (inputDish){
            if (inputDish.isApproved == 'for approval'){
                // req.flash('error_msg', 'Dish already added for approval, Please input a different one')
                console.log("Dish already exists")
                console.log(user._id);
                console.log(admin._id);
                
                // return res.redirect('/addDish', {dishName: req.body.inputDishName});
                
                var categories = await DishCategory.find({});
                var ingredients = await Ingredients.find({});
                var units = await Units.find({});

                return res.render('addDish', {  categories, ingredients, units,
                                                error_msg: "Dish already added for approval, Please input a different one",
                                                dishNameInput: req.body.inputDishName,
                                                categoryInput: req.body.category,
                                                priceInput: req.body.Amount,
                                                ingredientList: req.body.ingredient,
                                                inputAmountList: req.body.inputAmount,
                                                selectUnitList: req.body.selectUnit
                                             });
                
            }else{
                // req.flash('error_msg', 'Dish already added, Please input a different one')
                console.log("Dish already exists")
                console.log(user._id);
                console.log(admin._id);
                console.log(req.body.ingredient);
                
                var categories = await DishCategory.find({});
                var ingredients = await Ingredients.find({});
                var units = await Units.find({});

                return res.render('addDish', {  categories, ingredients, units,
                                                error_msg: "Dish already added, Please input a different one",
                                                dishNameInput: req.body.inputDishName,
                                                categoryInput: req.body.category,
                                                priceInput: req.body.Amount,
                                                ingredientList: req.body.ingredient,
                                                inputAmountList: req.body.inputAmount,
                                                selectUnitList: req.body.selectUnit
                                             });
            }
            
        }else {
            // start /////////////////////////////////////////////////////////////////////////////////
            var ingredientIdList = req.body.ingredient;
            var selectUnitIdList = req.body.selectUnit;
            var lackingString = "Invalid unit chosen for: ";
            if(Array.isArray(ingredientIdList)){
                var ingreLength = ingredientIdList.length;
                var isValid = [];
                for(var i=0; i<ingreLength; i++){
                    /// START OF INNER ARRAY LOOP
                    var ingreInRow = await Ingredients.findById(ingredientIdList[i]);
                    var baseUnit = await Units.findById(ingreInRow.unitID);
                    var convertedUnit = await Units.findById(selectUnitIdList[i]);
                    if(ingreInRow.unitID.toString() != convertedUnit._id.toString()){

                        // FixedConversion / check if not null
                        var fixedConversionFound = await FixedConversion.findOne({  initialUnitId: baseUnit._id, 
                                                                                    convertedUnitId: convertedUnit._id });
                        var ingreUnitConvFound = false;

                        // Get conversions
                        var ingreUnitConversions = await IngreConversion.findOne({ ingredientId: ingredientIdList[i] });
                        console.log("infreUnitConversions ???????????????????????")
                        console.log(ingreUnitConversions)
                        // If in ingreConv
                        if(ingreUnitConversions != null || ingreUnitConversions != undefined) {
                            // find sub conversion in ingreConv
                            for (var z=0; z < ingreUnitConversions.subUnit.length; z++){
                                if(ingreUnitConversions.subUnit[z].convertedUnitId.toString() == convertedUnit._id.toString()){
                                    ingreUnitConvFound = true; // check if true
                                }
                            }
                            
                            if(!ingreUnitConvFound){
                                isValid.push(false);
                                var ingreUnitMismatch = await Ingredients.findById(ingredientIdList[i]);
                                if(lackingString != "Invalid unit chosen for: "){
                                    lackingString += ", ";
                                }
                                lackingString += ingreUnitMismatch.name + " (no "+ convertedUnit.unitName + " conversion)";
                            } else{
                                isValid.push(true);
                            }
                        }
                        // If in fixedConv
                        else if(fixedConversionFound != null || fixedConversionFound != undefined) {
                            isValid.push(true);
                        }    
                        /// END OF INNER ARRAY LOOP 
                    } else{
                        isValid.push(true);
                    }


                }

                if(isValid.includes(false)){ 
                
                    var categories = await DishCategory.find({});
                    var ingredients = await Ingredients.find({});
                    var units = await Units.find({});
    
                    return res.render('addDish', {  categories, ingredients, units,
                                                    error_msg: lackingString,
                                                    dishNameInput: req.body.inputDishName,
                                                    categoryInput: req.body.category,
                                                    priceInput: req.body.Amount,
                                                    ingredientList: req.body.ingredient,
                                                    inputAmountList: req.body.inputAmount,
                                                    selectUnitList: req.body.selectUnit
                                                 });
                }

            } else{
                var ingreInRow = await Ingredients.findById(ingredientIdList);
                var baseUnit = await Units.findById(ingreInRow.unitID);
                var convertedUnit = await Units.findById(selectUnitIdList);

                if(ingreInRow.unitID.toString() != convertedUnit._id.toString()){
                    // FixedConversion / check if not null
                    var fixedConversionFound = await FixedConversion.findOne({  initialUnitId: baseUnit._id, 
                                                                                convertedUnitId: convertedUnit._id });

                    var ingreUnitConvFound = false;

                    // Get conversions
                    var ingreUnitConversions = await IngreConversion.findOne({ ingredientId: ingredientIdList });
                    console.log("infreUnitConversions == = = = = = =")
                    console.log(ingreUnitConversions)
                    // find sub conversion in ingreConv
                    if(ingreUnitConversions != null || ingreUnitConversions != undefined){
                        for (var z=0; z < ingreUnitConversions.subUnit.length; z++){
                            if(ingreUnitConversions.subUnit[z].convertedUnitId.toString() == convertedUnit._id.toString()){
                                ingreUnitConvFound = true; // check if true
                            }
                        }
                    
                                          
                    } 
                    if(!ingreUnitConvFound){
                        var ingreUnitMismatch = await Ingredients.findById(ingredientIdList);
                        lackingString += ingreUnitMismatch.name;
                    }     
                } else{
                    fixedConversionFound = true;
                    ingreUnitConvFound = true; 
                }



                if((fixedConversionFound == null || fixedConversionFound == undefined) && !ingreUnitConvFound){ 
                
                    var categories = await DishCategory.find({});
                    var ingredients = await Ingredients.find({});
                    var units = await Units.find({});
    
                    return res.render('addDish', {  categories, ingredients, units,
                                                    error_msg: lackingString,
                                                    dishNameInput: req.body.inputDishName,
                                                    categoryInput: req.body.category,
                                                    priceInput: req.body.Amount,
                                                    ingredientList: req.body.ingredient,
                                                    inputAmountList: req.body.inputAmount,
                                                    selectUnitList: req.body.selectUnit
                                                 });
                }
            }
            

            // end /////////////////////////////////////////////////////////////////////////////////
            
            if(user._id.equals(admin._id)){
                approval = "approved"
                approvedDate = currentDate
            } else{
                approval = "for approval"
                approvedDate = null
            }
            
            const dish = new Dish({
                name: req.body.inputDishName,
                price: req.body.Amount,
                categoryID: category._id,
                lastModified: currentDate,
                isActive: true,
                addedBy: user._id,
                isApproved: approval,
                approvedOn: approvedDate,
            })

        var i 
        var temp = []
        temp = req.body.ingredient
        console.log(temp[0].length)

        if(temp[0].length == 1){
            let ingre = await Ingredients.findOne({ _id: req.body.ingredient});
            let unit = await Units.findOne({ _id: req.body.selectUnit});
            if(ingre && unit){
                ingreTable.push([ingre._id,req.body.inputAmount,unit._id]);
            }
        }else{
            for(i=0; i<req.body.ingredient.length; i++){
                // if (i >=1 && temp != req.body.ingredient){
                //     let ingre = await Ingredients.findOne({ name: req.body.ingredient});

                // }
                let ingre = await Ingredients.findOne({ _id: req.body.ingredient[i]});
                let unit = await Units.findOne({ _id: req.body.selectUnit[i]});
                for (let j = 0; j < i; j++) {
                    if (req.body.ingredient[i] == req.body.ingredient[j]) {
                        // req.flash('error_msg', 'Duplicate Ingredient Entry, Please input a different one')
                        console.log("Duplicate Entry")
                        // return res.redirect('/addDish');
                        
                        var categories = await DishCategory.find({});
                        var ingredients = await Ingredients.find({});
                        var units = await Units.find({});

                        return res.render('addDish', {  categories, ingredients, units,
                                                        error_msg: "Duplicate Ingredient Entry, Please input a different one",
                                                        dishNameInput: req.body.inputDishName,
                                                        categoryInput: req.body.category,
                                                        priceInput: req.body.Amount,
                                                        ingredientList: req.body.ingredient,
                                                        inputAmountList: req.body.inputAmount,
                                                        selectUnitList: req.body.selectUnit
                                                    });
                    }
                  }
                if(ingre && unit){
                    ingreTable.push([ingre._id,req.body.inputAmount[i],unit._id]);
                }
  
            }
        }
       
        if(await dish.save()){
            let dishID = await Dish.findOne({ name: req.body.inputDishName, isActive:true});
                
            const recipe = new DishRecipe({
                dishID : dishID._id,
                ingredients: ingreTable.map((ingredient) => ({
                    ingredient: ingredient[0], 
                    chefWeight: ingredient[1],
                    chefUnitID: ingredient[2]
                  })),
                isActive:true,
                lastModified:currentDate,
                addedBy:user._id,
                isApproved: approval,
                approvedOn: approvedDate,
            })

            if(await recipe.save()){
                console.log(ingreTable)
                return res.redirect('/manageDishes');
            }
        }
      }
    }

}

module.exports = addDishController;