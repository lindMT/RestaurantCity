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
    getOrder: async function(req, res) {
        try {
            const dishes = await Dish.find({isApproved: "approved", isActive: true});
            const categories = await Category.find({});
            res.render('orderTerminal', { dishes: dishes, categories: categories });
        } catch (error) {
            console.log("Error fetching Dishes and Categories (getOrder): ");
            console.error(error);
            res.status(500).send("An error occurred while retrieving the dishes and categories.");
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
          var dishCount = dishIdArray[i];
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
              initialUnitId: ingredientInRecipe.chefUnitID,
              convertedUnitId: ingredientInInventory.unitID
            });
        
            // var ingreUnitConversion = await IngreConversion.findOne({
            //   initialUnitId: ingredientInInventory.unitID, // base unit of ingre
            //   convertedUnitId: ingredientInRecipe.chefUnitID // into recipe unit
            // });
            
            var ingreUnitConversions = await IngreConversion.find();
            
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

            // Set according to which is found
            if (iuConversionFactor == null || iuConversionFactor == undefined) {
              var conversionFactor = fixedUnitConversion.conversionFactor;
            } else {
              var conversionFactor = iuConversionFactor;
            }

            console.log("HERE IS THE CONVERSION FACTOR: " + conversionFactor);
            
            if (ingredientsToUse.length != 0) { // if ingre to use is not empty (not the first run)
              console.log("not empty")
              for (var j = 0; j < ingredientsToUse.length; j++) {
                if (ingredientInRecipe.ingredient.toString() == ingredientsToUse[j]) {
                  ingredientUnitTotal[j] += ingredientInRecipe.chefWeight * quantity * (1 / conversionFactor );
                  // console.log(ingredientInRecipe.chefWeight + " x " + quantity  + " x " +  (1 / conversionFactor));
                } else {
                  ingredientsToUse.push(ingredientInRecipe.ingredient.toString())
                  ingredientUnitTotal.push(ingredientInRecipe.chefWeight * quantity * (1 / conversionFactor ));
                  // console.log(ingredientInRecipe.chefWeight + " x " + quantity  + " x " +  (1 / conversionFactor));
                }
              }
            } else { // else add to it
              console.log("empty")
              ingredientsToUse.push(ingredientInRecipe.ingredient.toString())
              ingredientUnitTotal.push(ingredientInRecipe.chefWeight * quantity * (1 / conversionFactor ));
              // console.log(ingredientInRecipe.chefWeight + " x " + quantity  + " x " +  (1 / conversionFactor));
            }
        
            // if ((ingredientInRecipe.chefWeight * quantity * conversionFactor) < (ingredientUnitTotal[j])) {
            //   orderIsViable.push(true);
            //   console.log("viable");
            // } else {
            //   orderIsViable.push(false);
            //   // lackingIngredients.push(ingredientInInventory.name + "(for " + dish.name + ")");
            //   lackingIngredients.push(ingredientInInventory.name);
            //   console.log("not viable");
            // }
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
            lackingIngredientsID.push(ingredientsToUse[k])
          }
        }

        ///////////////////////////////////
      //Putting this here for sample code to insert data to db
      // var proceedWithOrder = true; // based on orderIsViable (do a loop maybe)
      // for (var i = 0; i < orderIsViable.length; i++){
      //   if (!orderIsViable[i])
      //     proceedWithOrder = false;
      //   }
        
      //   if (!proceedWithOrder){ //Provides Information for what is Lacking in the Ingredients for all orders
      //     for (let i = 0; i < lackingIngredients.length; i++){
      //       const ingredientId = lackingIngredients[i];
      //       const ingredientInRecipe = dishRecipe.ingredients.find((ingredient) => ingredient.ingredient.toString() === ingredientId);

      //       if(ingredientInRecipe){
      //         const ingredientInInventory = await Ingredient.findById(ingredientId);
      //         const ingredientName = ingredientInInventory.name;
      //         const availableStock = ingredientInInventory.totalNetWeight;
      //         const requiredForDish = ingredientInRecipe.chefWeight * quantity * conversionFactor;
      //         const neededAmount = ingredientUnitTotal[i] - requiredForDish;
      //       }

      //       lackingIngredientsDetails.push({
      //         name: ingredientName,
      //         availableIngre: availableStock,
      //         neededIngre: requiredForDish,
      //         neededForOtherDishes: neededAmount
      //       });
      //     }
      //         res.render('orderProcessingLanding', {  orderPrompt: orderFailMessage,
      //         lackingIngredients: lackingIngredientsDetails});
      //   }
        
      //   else{ ///////////// start of else
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
              console.log("CHECK ME OUTTTTTTTTTTTTTTTTTT " + newNetWeight);

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
              // TODO get ingre reqs
    
              for (var j = 0; j < ingredientsToUse.length; j++){
                if (ingredientsToUse[j] == lackingIngredientsID[i]){
                  lackingString += ", " + ingredientUnitTotal[j].toFixed(4) + " " + unit.unitName + " needed";
                }
              }
    
              lackingString += ")";
              lackingIngredientsDetails.push(lackingString);
            }
            
            res.render('orderProcessingLanding', {  orderPrompt: orderFailMessage,
                                                    lackingIngredients: lackingIngredientsDetails });
          }

        // }///////// end of else


              
      } // end of try

      
        catch(error){
          console.error(error);
      }
    },
};
module.exports = orderController;