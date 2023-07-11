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
            // console.log(dishes)
            // console.log(categories)
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
        var orderIsViable = true;

        const lackingIngredients = []; //Removed default value
        const orderSuccessMessage = "Order fulfilled. Please go back to the order terminal to input more orders.";
        const orderFailMessage = "Order unfulfilled. Please find below the list of insufficient ingredients required for the dishes you requested.";
        var quantityArray = req.body.quantity;
        var dishIdArray = req.body.dishId;
        // console.log("Quantity Input::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
        // console.log(typeof quantityArray);
        // console.log(quantityArray.length);
        // console.log(quantityArray);
        // console.log("Dish Input::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
        // console.log(typeof dishIdArray);
        // console.log(dishIdArray.length);
        // console.log(dishIdArray);
        

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

          for (var ingredientInRecipe of dishRecipe.ingredients) {
            console.log("inner loop1")
            var ingredientInInventory = await Ingredient.findById(ingredientInRecipe.ingredient);

            // INGREDIENT IN RECIPE:
            // metricWeight      "150.5"
            // metricUnitID      "64a5804ea792248175d204e7" // GRAMS IN .UNITS
            // chefWeight        "200.25"
            // chefUnitID        "64a451bb9a494ecb0fd7216b"
            
            // INGREDIENT IN INVENTORY:
            // _id              "64a6b7b31731ba58e9a55822"
            // name             "carrots"
            // category         "dry"
            // unitID           "64a5804ea792248175d204e8" // KG IN .UNITS
            // totalNetWeight   "1"
            // reorderPoint     "0"
            var conversion = await ChefUnitsConversion.findOne({ 
                                                  initialUnitId: ingredientInRecipe.chefUnitID,
                                                  convertedUnitId: ingredientInInventory.unitID
                                                }); //ForDishInInv
            var conversionFactor = conversion.conversionFactor;
            console.log("Ingredient in Recipe: " + (ingredientInRecipe.chefWeight * quantity * conversionFactor))
            console.log("Ingredient in Inventory: " + (ingredientInInventory.totalNetWeight))

            if((ingredientInRecipe.chefWeight * quantity * conversionFactor) < (ingredientInInventory.totalNetWeight)){
                orderIsViable = true;
                console.log("viable");
            } else{
                lackingIngredients.push(ingredientInInventory.name);
                console.log("not viable");
            }
          }
        }











      }
      catch(error){
          console.error(error);
      }
    
    
    },

};
module.exports = orderController;