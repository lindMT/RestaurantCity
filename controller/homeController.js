const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const Ingredients = require('../model/ingredientsSchema.js');
const Units = require('../model/unitsSchema.js');
const bcrypt = require("bcrypt");

const homeController = {
    // for redirecting login and signup
    getHome: async function(req, res) {
        if(req.session.isAuth){
            var dishes = await Dish.find({isActive:true});
            var recipe = await DishRecipe.find({isActive:true, isApproved:'for approval'});
            var ingre = await Ingredients.find({});
            var units = await Units.find({});

            var counter = 0;
            var stock = 0;
            if (req.session.position == "admin" || req.session.position == "stockController"){
                for(var i=0; i<dishes.length;i++){
                    for(var j=0; j<recipe.length; j++){
                        if(dishes[i]._id.equals(recipe[j].dishID)){
                            if (dishes[i].isApproved == 'for approval' || recipe[j].isApproved == 'for approval')
                                counter++;
                        }
                    }
                }
                for(var i=0; i<ingre.length;i++){
                    if(ingre[i].totalNetWeight <= ingre[i].reorderPoint){
                        stock++;
                    }
                }
                console.log(stock);
                return res.render('home', {dishes, counter, ingre, stock, units});
            } else if (req.session.position == "chef" ){
                return res.redirect('/manageDishes');
            } else if (req.session.position == "cashier" ){
                return res.redirect('/viewOrderTerminal');
            }    
        } else{
            req.flash('error_msg', 'Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in.');
            console.log("Unauthorized access.");
            return res.redirect('/login');
        }
    },

}

module.exports = homeController