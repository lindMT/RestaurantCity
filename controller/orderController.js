const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const orderController = {
    getOrder: function(req, res) {
        res.render('orderTerminal');
    },

    processOrder: function(req, res){

        // toggle this to true/false to test
        var orderIsViable = false;

        const lackingIngredients = ["Olive Oil", "Milk", "Peanut", "Truffles", "Caviar"];
        const orderSuccessMessage = "Order fulfilled. Please go back to the order terminal to input more orders.";
        const orderFailMessage = "Order unfulfilled. Please find below the list of insufficient ingredients required for the dishes you requested.";
        var quantityArray = req.body.quantity;
        var dishIdArray = req.body.dishId;
        console.log("Quantity Array:");
        console.log(quantityArray);
        console.log("Dish ID Array:");
        console.log(dishIdArray);

        //TODO:
        // 1) Check if order is feasible
            // Check if
            // If yes: 
                // CALCULATE Total Price (via quantityArray and dishIdArray)
                // INSERT into order table
                // INSERT into order item table
                // SET orderIsViable to true
            // If not:
                // POPULATE String[] of lacking ingredients
                // SET orderIsViable to false


        // Hardcoded for now. Implement logic later.
        if (orderIsViable){
            res.render('orderProcessingLanding', {  orderPrompt: orderSuccessMessage,
                                                    lackingIngredients: []
            });
        } else{
            res.render('orderProcessingLanding', {  orderPrompt: orderFailMessage,
                                                    lackingIngredients: lackingIngredients
            });
        }
        
    }
}

module.exports = orderController;