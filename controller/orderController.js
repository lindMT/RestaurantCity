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
        var orderIsViable = true;

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
          console.log("inside loop")
          console.log(dishIdArray)
          
          if (Array.isArray(dishIdArray)) {
            console.log('dishIdArray is an array.');
            var quantity = quantityArray[i];
            var dishId = dishIdArray[i];
          } else if (typeof dishIdArray === 'string') {
            var quantity = quantityArray;
            var dishId = dishIdArray;
          }
          console.log("inside loop222222222222")
          console.log(dishId)

          console.log("TATATATATATATATATATATATATATATATATATATA")
          
          var dishRecipe = await DishRecipe.findOne({ dishID:  dishId });
          console.log("HERES THE RECIPE")
          console.log(dishRecipe)
          
          for (var ingredientInRecipe of dishRecipe.ingredients) {
            console.log("RARARARARARARARARARARARARARAR")
            console.log(ingredientInRecipe)
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
            
            // FOR UNITS CONVERSION:
            // initialUnitId
            // 64a5804ea792248175d204e7
            // convertedUnitId
            // 64a5804ea792248175d204ec
            console.log("THE INGRE IN INV IS ")
            console.log(ingredientInInventory)
            console.log("THE INGRE IN Recipe IS ")
            console.log(ingredientInRecipe)


            var conversion = await ChefUnitsConversion.findOne({ 
                                                  initialUnitId: ingredientInRecipe.chefUnitID,
                                                  convertedUnitId: ingredientInInventory.unitID
                                                }); //ForDishInInv
            var conversionFactor = conversion.conversionFactor;
            console.log("TEREL CRISOSTOMO:")
            console.log(conversion)

            if((ingredientInRecipe.metricWeight * quantity * conversionFactor) < (ingredientInInventory.totalNetWeight)){
                orderIsViable = false;
                lackingIngredients.push(ingredient.name);
                console.log(" GUDS");
            } else{
                console.log(" NOT GUDS");
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