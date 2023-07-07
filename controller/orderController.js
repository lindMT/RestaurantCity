const User = require('../model/usersSchema.js');
const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Ingredient = require('../model/ingredientsSchema.js');
const IngreVariation = require('../model/ingreVariationsSchema.js');
const Dish = require('../model/dishSchema.js')
const { calculateTotalPrice } = require("../public/js/orderTerminal.js");

const bcrypt = require("bcrypt");

const orderController = {
    getOrder: function(req, res) {
        res.render('orderTerminal');
    },

    processOrder: function(req, res){

        // toggle this to true/false to test
        var orderIsViable = true;

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
        const orderController = {
            getOrder: async function(req, res) {
                try{
                    //Retrieve all ingredients from the database
                    const ingredients = await Ingredient.find()
                    res.render()
                }
                catch{}
            }
        }
            
            // If yes: 
                // CALCULATE Total Price (via quantityArray and dishIdArray)
                // INSERT into order table
                // INSERT into order item table
                // UPDATE ingredients/stock
                // SET orderIsViable to true
                const calculateTotalPrice = calculateTotalPrice(quantityArray, dishIdArray)
               
                const newOrder = new Order({
                    totalPrice: calculateTotalPrice(),
                    date: new Date(),
                    takenBy: User.findById(userName)
                });

                Order.findById(orderID)
                OrderItem.findById(orderItemID)

                const newOrderItem = new OrderItem({
                    orderID: Order.findById(orderID),
                    dishID: Dish.findById(DishID)
                });

                orderIsViable = true;

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