const User = require('../model/usersSchema.js');
const Dish = require('../model/dishSchema.js');
const DishRecipe = require('../model/dishRecipeSchema.js');
const bcrypt = require("bcrypt");

const homeController = {
    // for redirecting login and signup
    getHome: async function(req, res) {

        var dishes = await Dish.find({isActive:true});
        var recipe = await DishRecipe.find({isActive:true, isApproved:'for approval'});

        var counter = 0
        var i;
        var j;

        for(i=0; i<dishes.length;i++){
            for(j=0; j<recipe.length; j++){
                if(dishes[i]._id.equals(recipe[j].dishID)){
                    if (dishes[i].isApproved == 'for approval' || recipe[j].isApproved == 'for approval')
                    counter++;
                }
            }
        }

        console.log(counter);
        res.render('home', {dishes, counter});
    },

}

module.exports = homeController