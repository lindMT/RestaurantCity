const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const orderController = {
    getOrder: function(req, res) {
        res.render('orderTerminal');
    },

    processOrder: function(req, res){
        // Process Order
        var quantityArray = req.body.quantity;
        var dishIdArray = req.body.dishId;
        console.log("QTY ARRAY:");
        console.log(quantityArray);
        console.log("DISH ID ARRAY:");
        console.log(dishIdArray);

        //TODO HERE: 
    // var totalPrice = req.body.totalPrice;
    // console.log(totalPrice);

        // var one = req.body;
        // console.log(one)
        // TODO (Lind):
        //  - screen to show order success / order unfilfilled (display lacking ingredients/dish)
        res.render('orderProcessingLanding');
    }
}

module.exports = orderController;