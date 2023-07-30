const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Ingredient = require('../model/ingredientsSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Category = require('../model/dishCategorySchema.js');
const Unit = require('../model/unitsSchema.js');
const FixedConversion = require('../model/fixedConversionSchema.js');
const IngreConversion = require('../model/ingreConversionSchema.js');
var Convert = require('convert-units')

const orderController = {
    //For Security Login and Signup
    getOrder: async function(req, res) {
      if(req.session.isAuth && (req.session.position == "admin" || req.session.position == "cashier")){
        try {
            const dishes = await Dish.find({isApproved: "approved", isActive: true});
            const categories = await Category.find({});
            res.render('orderTerminal', { dishes: dishes, categories: categories });
        } catch (error) {
            console.log("Error fetching Dishes and Categories (getOrder): ");
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes and categories.");
        }
      } else {
          console.log("Unauthorized access.");
          req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
      }
    },
    
    processOrder: async function(req, res){
      try{
        // toggle this to true/false to test
        let orderIsViable = true;
        let ingredientsToUse = []; // from Ingredients._id
        let ingredientUnitTotal = []; // totalWeight of ingredients to be USED // UNIT HERE IS BASE UNIT OF INGRE

        const lackingIngredientsID = [];
        const lackingIngredientsDetails = []; 
        const orderSuccessMessage = "Order fulfilled. Please go back to the order terminal to input more orders.";
        const orderFailMessage = "Order unfulfilled. Please find below the list of insufficient ingredients required for the dishes you requested.";
        var quantityArray = req.body.quantity;
        var dishIdArray = req.body.dishId;

        // ASSIGN DISH COUNT
        if (Array.isArray(dishIdArray)) {
          var dishCount = dishIdArray.length;
        } else {
          var dishCount = 1;
        }

        // LOOP THRU SELECTED DISHES
        for(var i = 0; i < dishCount; i++){
          console.log("=======================================================")
          console.log("Main Loop (Dish)")
          if (Array.isArray(dishIdArray)) {
            var quantity = quantityArray[i];
            var dishId = dishIdArray[i];
          } else {
            var quantity = quantityArray;
            var dishId = dishIdArray;
          }

          var dishRecipe = await DishRecipe.findOne({ dishID: dishId });

          for (var ingredientInRecipe of dishRecipe.ingredients) {
            console.log("Check Ingredient in Recipe loop")
            var ingredientInInventory = await Ingredient.findById(ingredientInRecipe.ingredient);
        
            var fixedUnitConversion = await FixedConversion.findOne({
              initialUnitId: ingredientInInventory.unitID,
              convertedUnitId: ingredientInRecipe.chefUnitID
            });
                    
            var ingreUnitConversions = await IngreConversion.find();
            
            if(ingredientInRecipe.chefUnitID.toString() != ingredientInInventory.unitID.toString()){
              for(var iuc of ingreUnitConversions){
                // find ingredient in ingreConv
                if(iuc.ingredientId.toString() == ingredientInRecipe.ingredient.toString()){
                  for (var z=0; z < iuc.subUnit.length; z++){
                    if(iuc.subUnit[z].convertedUnitId.toString() == ingredientInRecipe.chefUnitID.toString()){
                        var iuConversionFactor = iuc.subUnit[z].conversionFactor;
                    }
                  }
                }
              }
            } else{
              var iuConversionFactor = 1; // converting same units
            }
            

            // Set according to which is found
            if (iuConversionFactor == null || iuConversionFactor == undefined) {
              var conversionFactor = fixedUnitConversion.conversionFactor;
            } else {
              var conversionFactor = iuConversionFactor;
            }

            console.log("HERE IS THE CONVERSION FACTOR: " + conversionFactor);
            
            var found = false;
            for (var j = 0; j < ingredientsToUse.length; j++) {
              if (ingredientInRecipe.ingredient.toString() == ingredientsToUse[j]) {
                ingredientUnitTotal[j] += ingredientInRecipe.chefWeight * quantity * (1 / conversionFactor);
                found = true;
                break;
              }
            }
          
            if (!found) {
              ingredientsToUse.push(ingredientInRecipe.ingredient.toString());
              ingredientUnitTotal.push(ingredientInRecipe.chefWeight * quantity * (1 / conversionFactor));
            }

          }
        } // END OF MAIN LOOP
        
        console.log("-------------------")
        console.log("ingredientsToUse: " + ingredientsToUse);
        console.log("ingredientUnitTotal: " + ingredientUnitTotal);

        // CHECK IF VIABLE
        for(var k=0; k<ingredientsToUse.length; k++){
          var ingreToUse = await Ingredient.findById(ingredientsToUse[k]);
          if(ingreToUse.totalNetWeight < ingredientUnitTotal[k]){ // if not enough ingre
            orderIsViable = false;
            
              lackingIngredientsID.push(ingredientsToUse[k]);
            
          }
        }

          // Calculate Total Price
          if(orderIsViable){ // viable
            var totalPrice = 0; 

            for (var i = 0; i < quantityArray.length; i++) {
              if (Array.isArray(dishIdArray)) {
                var dishId = dishIdArray[i];
              } else {
                var dishId = dishIdArray;
              }
              var dish = await Dish.findById(dishId);
              totalPrice += dish.price * quantityArray[i];
            }
            
            console.log("Total Price: " + totalPrice);
            
            //Create New Order
            var newOrder = new Order({
                totalPrice: totalPrice,
                date: new Date(),
                takenBy: req.session.userName
            });

            newOrder.save().then(async (docs) => {
              if (Array.isArray(dishIdArray)) {
                for (var m = 0; m < dishIdArray.length; m++){
                  // console.log("Index:", i);
                  // console.log("dishIdArray:", dishIdArray[i]);
                  // console.log("quantityArray:", quantityArray[i]);
                  var newOrderItem = new OrderItem({
                      orderID: newOrder._id,
                      dishID: dishIdArray[m],
                      qty: quantityArray[m]
                  });
                  await newOrderItem.save();
                }
            } else {
                  console.log("dishIdArray:", dishIdArray);
                  console.log("quantityArray:", quantityArray);
                  var newOrderItem = new OrderItem({
                      orderID: newOrder._id,
                      dishID: dishIdArray,
                      qty: quantityArray
                  });
                  await newOrderItem.save();
              }
            });

            // TODO subtract stocks

            for(var i=0; i< ingredientsToUse.length; i++){
              var ingreToSubtract = await Ingredient.findById(ingredientsToUse[i]);
              console.log("ingreToSubtractnetWeight " + ingreToSubtract.totalNetWeight);
              console.log("ingredientUnitTotal " + ingredientUnitTotal[i]);
              var newNetWeight = ingreToSubtract.totalNetWeight - ingredientUnitTotal[i];
              console.log("newNetWeight " + newNetWeight);

              await Ingredient.updateOne( { _id: ingredientsToUse[i] },
                                          { $set: { totalNetWeight: newNetWeight } }
                                        );
            }



            res.render('orderProcessingLanding',  { orderPrompt: orderSuccessMessage,
                                                    lackingIngredients: []
                                                  });
          } else{ // not viable

            console.log("lackingIngredientsID: " + lackingIngredientsID)

            for(var i=0; i<lackingIngredientsID.length; i++){
              var lackingIngre = await Ingredient.findById(lackingIngredientsID[i]);
              var lackingString = "";
              lackingString += lackingIngre.name + " (" + lackingIngre.totalNetWeight;
              var unit = await Unit.findById(lackingIngre.unitID);
              lackingString += " " + unit.unitName + " in stock";
              
              // START OF LOOP 
              
              for(var k = 0; k < dishCount; k++){
                console.log("=======================================================");
                if (Array.isArray(dishIdArray)) {
                  var quantity = quantityArray[k];
                  var dishId = dishIdArray[k];
                } else {
                  var quantity = quantityArray;
                  var dishId = dishIdArray;
                }
              
                var dishFromMainLoop = await Dish.findById(dishId);
                var dishRecipe = await DishRecipe.findOne({ dishID: dishId });
              
                for (var ingredientInRecipe of dishRecipe.ingredients) {
                  console.log("Check Ingredient in Recipe loop")
                  var ingredientInInventory = await Ingredient.findById(ingredientInRecipe.ingredient);
              
                  var fixedUnitConversion = await FixedConversion.findOne({
                    initialUnitId: ingredientInInventory.unitID,
                    convertedUnitId: ingredientInRecipe.chefUnitID
                  });
              
                  var ingreUnitConversions = await IngreConversion.find();
                  
                  if(ingredientInRecipe.chefUnitID.toString() != ingredientInInventory.unitID.toString()){
                    for(var iuc of ingreUnitConversions){
                      // find ingredient in ingreConv
                      if(iuc.ingredientId.toString() == ingredientInRecipe.ingredient.toString()){
                        for (var z=0; z < iuc.subUnit.length; z++){
                          if(iuc.subUnit[z].convertedUnitId.toString() == ingredientInRecipe.chefUnitID.toString()){
                              var iuConversionFactor = iuc.subUnit[z].conversionFactor;
                          }
                        }
                      }
                    }
                  } else{
                    var iuConversionFactor = 1; // converting same units
                  }
                  
              
                  // Set according to which is found
                  if (iuConversionFactor == null || iuConversionFactor == undefined) {
                    var conversionFactor = fixedUnitConversion.conversionFactor;
                  } else {
                    var conversionFactor = iuConversionFactor;
                  }
              
                  console.log("HERE IS THE CONVERSION FACTOR: " + conversionFactor);
                  if(ingredientInRecipe.ingredient.toString() == lackingIngredientsID[i]){
                    lackingString += ", " + (ingredientInRecipe.chefWeight * quantity * (1 / conversionFactor )) + " " 
                        + unit.unitName + " needed for " + quantity + " x " + dishFromMainLoop.name ; // add dish name after demo  
                  }
              
                }
              }
              
              // END OF LOOP
              lackingString += ")";
              lackingIngredientsDetails.push(lackingString);
            }
            
            res.render('orderProcessingLanding', {  orderPrompt: orderFailMessage,
                                                    lackingIngredients: lackingIngredientsDetails });
          }
      } 
        catch(error){
          console.error(error);
      }
    },
};
module.exports = orderController;