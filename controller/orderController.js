const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Ingredient = require('../model/ingredientsSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Category = require('../model/dishCategorySchema.js');
const Conversion = require('../model/conversionSchema.js');
const ChefUnitsConversion = require('../model/chefUnitsConversionSchema.js');

const bcrypt = require("bcrypt");
const { Types } = mongoose;

const orderController = {
    getOrder: async function(req, res) {
        try {
            const dishes = await Dish.find({});
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
        let orderIsViable = [];

        const lackingIngredients = []; //Removed default value
        const orderSuccessMessage = "Order fulfilled. Please go back to the order terminal to input more orders.";
        const orderFailMessage = "Order unfulfilled. Please find below the list of insufficient ingredients required for the dishes you requested.";
        var quantityArray = req.body.quantity;
        var dishIdArray = req.body.dishId;

        for(var i = 0; i < quantityArray.length; i++){
          console.log("loop1")
          if (Array.isArray(dishIdArray)) {
            var quantity = quantityArray[i];
            var dishId = dishIdArray[i];
          } else {
            var quantity = quantityArray;
            var dishId = dishIdArray;
          }
          var dishRecipe = await DishRecipe.findOne({ dishID:  dishId });
          console.log(dishRecipe)

          for (var ingredientInRecipe of dishRecipe.ingredients) {
            console.log("inner loop1")
            var ingredientInInventory = await Ingredient.findById(ingredientInRecipe.ingredient);

            var conversion = await ChefUnitsConversion.findOne({ 
                                                  initialUnitId: ingredientInRecipe.chefUnitID,
                                                  convertedUnitId: ingredientInInventory.unitID
                                                }); //ForDishInInv
            var conversionFactor = conversion.conversionFactor;
            var dish = await Dish.findById(dishId);
            console.log("Ingredient in Recipe: " + (ingredientInRecipe.chefWeight * quantity * conversionFactor))
            console.log("Ingredient in Inventory: " + (ingredientInInventory.totalNetWeight))
            console.log("ingredientInInventory.unitID: " + ingredientInInventory.unitID)
            if((ingredientInRecipe.chefWeight * quantity * conversionFactor) < (ingredientInInventory.totalNetWeight)){
                orderIsViable.push(true);
                console.log("viable");
            } else{
                orderIsViable.push(false);
                lackingIngredients.push(ingredientInInventory.name + "(for " + dish.name + ")");
                console.log("not viable");
            }
          }
        }
      
        console.log("FINAL CHECK (viable)")
        console.log(orderIsViable)

        console.log("FINAL CHECK (lackingIngredients)")
        console.log(lackingIngredients)
        
            var proceedWithOrder = true; // based on orderIsViable (do a loop maybe)
            for (var i = 0; i < orderIsViable.length; i++){
              if (!orderIsViable[i])
                proceedWithOrder = false;
            }

            if (proceedWithOrder){ 
              // Calculate Total Price
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
              
              // TODO:
                  // INSERT into order table
                  // INSERT into order item table
                  // UPDATE ingredients/stock

              //Create New Order
              var newOrder = new Order({
                  totalPrice: totalPrice,
                  date: new Date(),
                  takenBy: req.session.userName
              });
  
              newOrder.save().then(async (docs) => {
                if (Array.isArray(dishIdArray) && Array.isArray(quantityArray)) {
                  for (var i = 0; i < dishIdArray.length; i++){
                    console.log("Index:", i);
                    console.log("dishIdArray[i]:", dishIdArray);
                    console.log("quantityArray[i]:", quantityArray);
                    var newOrderItem = new OrderItem({
                        orderID: newOrder._id,
                        dishID: dishIdArray[i],
                        qty: quantityArray[i]
                    });
                  }
               } else {
                  for (var i = 0; i < dishIdArray.length; i++){
                    console.log("Index:", i);
                    console.log("dishIdArray[i]:", dishIdArray);
                    console.log("quantityArray[i]:", quantityArray);
                    var newOrderItem = new OrderItem({
                        orderID: newOrder._id,
                        dishID: dishIdArray,
                        qty: quantityArray
                    });
                }
              }

  
                  await newOrderItem.save();
              });

              res.render('orderProcessingLanding', {  orderPrompt: orderSuccessMessage,
                                                      lackingIngredients: []
              });

          } else{
              res.render('orderProcessingLanding', {  orderPrompt: orderFailMessage,
                                                      lackingIngredients: lackingIngredients
              });
          }
      }
      catch(error){
          console.error(error);
      }
    },
};
module.exports = orderController;