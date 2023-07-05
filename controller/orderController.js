const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const orderController = {
    getOrder: function(req, res) {
        res.render('orderTerminal');
    },

    processOrder: function(req, res){

        var quantityArray = req.body.quantity;
        var dishIdArray = req.body.dishId;
        console.log("Quantity Array:");
        console.log(quantityArray);
        console.log("Dish ID Array:");
        console.log(dishIdArray);

        //TODO:
        // 1) Check if order is feasible
            // If yes: 
                // calculate Total Price (via quantityArray and dishIdArray)
                // insert into orders table
                // send to order processing landing with positive prompt
            // If not:
                // send to order processing landing with negative prompt + String[] of lacking ingredients

        res.render('orderProcessingLanding');
        
    }
}

module.exports = orderController;