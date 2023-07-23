const { default: mongoose } = require('mongoose');
const User = require('../model/usersSchema.js');
const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Ingredient = require('../model/ingredientsSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Category = require('../model/dishCategorySchema.js');
const Unit = require('../model/unitsSchema.js');
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
          var dishRecipe = await DishRecipe.findOne({ dishID:  dishId });

          // POPULATE ingredientToUse and ingredientQuantityTotal\
          for (var ingredientInRecipe of dishRecipe.ingredients) {
            console.log("Inner Loop (Ingredient per Dish)")
            var ingredientInInventory = await Ingredient.findById(ingredientInRecipe.ingredient);
            var chefUnit =  await Unit.find({unitSymbol: ingredientInRecipe.chefUnitID});
            var invUnit =  await Unit.find({unitSymbol: ingredientInInventory.unitID});
            var chefUnitSymbol = chefUnit.unitSymbol;
            var invUnitSymbol =  invUnit.unitSymbol;
            console.log(chefUnitSymbol + " amd " + invUnitSymbol )
            var netWeight = Convert(ingredientInRecipe.chefWeight).from(chefUnitSymbol).to(invUnitSymbol)

            // if ingredients to use is not empty
            if (ingredientsToUse.length != 0){
              for (var x = 0 ; x < ingredientsToUse.length; x++){
            
                console.log(ingredientInRecipe.ingredient + " AND " + ingredientsToUse[x])
                if (ingredientInRecipe.ingredient == ingredientsToUse[x]){
                  ingredientUnitTotal[x] += netWeight;
                } else{
                  ingredientToUse.push(ingredientInRecipe.ingredient)
                  ingredientUnitTotal.push(netWeight);
                }
              }
            } else{// else add to it
              ingredientToUse.push(ingredientInRecipe.ingredient)
              ingredientUnitTotal.push(netWeight);
            }

          }

        }

        // LOOP THRU TOTAL OF UNIQUE INGREDIENTS AND UNIT TOTAL
        console.log("LEN IS " + ingredientsToUse.length)
        for(var y=0; y<ingredientsToUse.length; y++){
          var ingredientInInventory = await Ingredient.findById(ingredientsToUse[y]);

          if(ingredientUnitTotal[y] < ingredientInInventory.totalNetWeight){
              orderIsViable.push(true);
              console.log("viable");
          } else{
              orderIsViable.push(false);
              lackingIngredients.push(ingredientInInventory.name + "(for " + dish.name + ")");
              console.log("not viable");
          }
        }



        /////////////// --------- end of try --------- /////////////////
      }
      catch(error){
          console.error(error);
      }
    },
};
module.exports = orderController;