const User = require('../model/usersSchema.js');
const Order = require('../model/orderSchema.js');
const OrderItem = require('../model/orderItemSchema.js');
const Ingredient = require('../model/ingredientsSchema.js');
const IngreVariation = require('../model/ingreVariationsSchema.js');
const Dish = require('../model/dishSchema.js')
const Category = require('../model/dishCategorySchema.js');
const { calculateTotalPrice } = require("../public/js/orderTerminal.js");

const bcrypt = require("bcrypt");

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

        //TODO TEREL:
        // 1) Check if order is feasible        



        // TODO LIND:
        // If yes: 
            // CALCULATE Total Price (via quantityArray and dishIdArray)
            // INSERT into order table
            // INSERT into order item table
            // UPDATE ingredients/stock
        // If not:
            // POPULATE String[] of lacking ingredients

        if (orderIsViable){
            // Calculate Total Price
            var totalPrice = 99.99; // temporary * will calculate
            
            // Create New Order
            var newOrder = new Order({
                totalPrice: totalPrice,
                date: new Date(),
                takenBy: req.session.userName
            });

            newOrder.save().then(docs => {
            })

            // Create New Order Items
            for (var i = 0; i < dishIdArray.length; i++){
                var newOrderItem = new OrderItem({
                    orderID: newOrder._id,
                    dishID: dishIdArray[i]
                });

                newOrderItem.save().then(docs => {
                })
            }

            // TODO:
            // UPDATE ingredients/stock

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