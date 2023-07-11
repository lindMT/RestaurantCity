const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Ingredient = require('../model/ingredientsSchema.js');
const IngreVariation = require('../model/ingreVariationsSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Category = require('../model/dishCategorySchema.js');
const Conversion = require('../model/conversionSchema.js');
const ChefUnitsConversion = require('../model/chefUnitsConversionSchema.js');
const { calculateTotalPrice } = require("../public/js/orderTerminal.js");

const bcrypt = require("bcrypt");
const { Types } = mongoose;
// ...


const orderController = {
    getOrder: async function(req, res) {
        try {
            const dishes = await Dish.find({});
            const categories = await Category.find({});
            console.log(dishes)
            console.log(categories)
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
        console.log("Quantity Array:");
        console.log(quantityArray);
        console.log(typeof quantityArray);
        console.log("Dish ID Array:");
        console.log(dishIdArray);
        console.log(typeof dishIdArray);
        //TODO TEREL:
        // 1) Check if order is feasible       

        for(var i = 0; i < dishIdArray.length; i++){
          if (Array.isArray(dishIdArray)) {
            var quantity = quantityArray[i];
            var dishId = dishIdArray[i];
          } 
          else if (typeof dishIdArray === 'string') {
            var quantity = quantityArray;
            var dishId = dishIdArray;
          }
          
          var dishRecipe = await DishRecipe.findOne({ dishID:  dishId });
          
          for (var ingredientInRecipe of dishRecipe.ingredients) {
            var ingredientInInventory = await Ingredient.findById(ingredientInRecipe.ingredient);

            var conversion = await ChefUnitsConversion.findOne({ 
                                                  initialUnitId: ingredientInRecipe.chefUnitID,
                                                  convertedUnitId: ingredientInInventory.unitID
                                                }); 

            var conversionFactor = conversion.conversionFactor;
            console.log("Ingredient in Recipe: " + (ingredientInRecipe.chefWeight * quantity * conversionFactor))
            console.log("Ingredient in Inventory: " + (ingredientInInventory.totalNetWeight))
            console.log("ingredientInInventory.unitID: " + ingredientInInventory.unitID)
            if((ingredientInRecipe.chefWeight * quantity * conversionFactor) < (ingredientInInventory.totalNetWeight)){
                orderIsViable = true;
                console.log("viable");
            } else{
                orderIsViable = false;
                lackingIngredients.push(ingredientInInventory.name);
                console.log("not viable");
            }
          }
        }

         // If yes: 
            // CALCULATE Total Price (via quantityArray and dishIdArray)
            // INSERT into order table
            // INSERT into order item table
            // UPDATE ingredients/stock
        // If not:
            // POPULATE String[] of lacking ingredients

            if (orderIsViable){
              // Calculate Total Price
              var totalPrice = 0; 
  
              for (var i = 0; i < dishIdArray.length; i++) {
                const dishId = dishIdArray[i];
                const dish = await Dish.findById(dishId).exec();
                totalPrice += dish.price * quantityArray[i];
              }
              
              // Create New Order
              var newOrder = new Order({
                  totalPrice: totalPrice,
                  date: new Date(),
                  takenBy: req.session.userName
              });
  
              newOrder.save().then(docs => {
                for (var i = 0; i < dishIdArray.length; i++){
                  var newOrderItem = new OrderItem({
                      orderID: newOrder._id,
                      dishID: dishIdArray[i]
                  });
  
                  newOrderItem.save().then(docs => {
                    // TODO:
                    // UPDATE ingredients/stock
                  });
                }
                // Create New Order Items
                res.render('orderProcessingLanding', {  orderPrompt: orderSuccessMessage,
                  lackingIngredients: []
                });
              });
          } else{
              res.render('orderProcessingLanding', {  orderPrompt: orderFailMessage,
                                                      lackingIngredients: lackingIngredients
              });
          }
      } catch(error){
          console.error(error);
      }
    },

};
module.exports = orderController;