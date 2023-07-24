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
        let ingredientsToUse = []; // from Ingredients._id
        let ingredientUnitTotal = []; // totalWeight

        const lackingIngredients = []; //Removed default value
        const orderSuccessMessage = "Order fulfilled. Please go back to the order terminal to input more orders.";
        const orderFailMessage = "Order unfulfilled. Please find below the list of insufficient ingredients required for the dishes you requested.";
        var quantityArray = req.body.quantity;
        var dishIdArray = req.body.dishId;

        // LOOP THRU SELECTED DISHES
        for(var i = 0; i < quantityArray.length; i++){
          console.log("Main Loop (Dish)")
          if (Array.isArray(dishIdArray)) {
            var quantity = quantityArray[i];
            var dishId = dishIdArray[i];
          } else {
            var quantity = quantityArray;
            var dishId = dishIdArray;
          }

          var dishRecipe = await DishRecipe.findOne({ dishID: dishId });
          console.log(dishRecipe)

          for (var ingredientInRecipe of dishRecipe.ingredients) {
            console.log("Check Ingredient in Recipe loop")
            var ingredientInInventory = await Ingredient.findById(ingredientInRecipe.ingredient);
        
            var fixedUnitConversion = await FixedConversion.findOne({
              initialUnitId: ingredientInRecipe.chefUnitID,
              convertedUnitId: ingredientInInventory.unitID
            });
        
            var ingreUnitConversion = await IngreConversion.findOne({
              initialUnitId: ingredientInRecipe.chefUnitID,
              convertedUnitId: ingredientInInventory.unitID
            });
        
            const conversionFactor = ingreUnitConversion ? ingreUnitConversion.conversionFactor : fixedUnitConversion.conversionFactor;
        
            if (ingredientsToUse.length != 0) {
              for (var j = 0; j < ingredientsToUse.length; j++) {
                console.log(ingredientInRecipe.ingredient + " AND " + ingredientsToUse[j])
                if (ingredientInRecipe.ingredient == ingredientsToUse[j]) {
                  ingredientUnitTotal[j] += ingredientInInventory.totalNetWeight;
                } else {
                  ingredientsToUse.push(ingredientInRecipe.ingredient)
                  ingredientUnitTotal.push(ingredientInInventory.totalNetWeight);
                }
              }
            } else { // else add to it
              ingredientsToUse.push(ingredientInRecipe.ingredient)
              ingredientUnitTotal.push(ingredientInInventory.totalNetWeight);
            }
        
            if ((ingredientInRecipe.chefWeight * quantity * conversionFactor) < (ingredientUnitTotal[j])) {
              orderIsViable.push(true);
              console.log("viable");
            } else {
              orderIsViable.push(false);
              lackingIngredients.push(ingredientInInventory.name + "(for " + dish.name + ")");
              console.log("not viable");
            }
          }
        }
        
      //Putting this here for sample code to insert data to db
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
          
          //Create New Order
          var newOrder = new Order({
              totalPrice: totalPrice,
              date: new Date(),
              takenBy: req.session.userName
          });

          newOrder.save().then(async (docs) => {
            if (Array.isArray(dishIdArray)) {
              for (var i = 0; i < dishIdArray.length; i++){
                console.log("Index:", i);
                console.log("dishIdArray:", dishIdArray[i]);
                console.log("quantityArray:", quantityArray[i]);
                var newOrderItem = new OrderItem({
                    orderID: newOrder._id,
                    dishID: dishIdArray[i],
                    qty: quantityArray[i]
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
        }

        //Insert Here: Update of Inventory after ordering
      }
      catch(error){
          console.error(error);
      }
    },
};
module.exports = orderController;