const User = require('../model/usersSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const bcrypt = require("bcrypt");
const { default: mongoose } = require('mongoose');


const addCategoryController = {
    // for redirecting login and signup
    getAddCategory: async function(req, res) {
        res.render('addCategory');
    },

    postAddCategory: async function(req, res){
        var input = req.body.inputDishCategory.toLowerCase()
        
        // if(input = null){
        //     req.flash('error_msg', 'Please choose a category')
        //     return res.redirect('/addCategory');
        // }
        let category = await DishCategory.findOne({ category:input});
        if(category){
            req.flash('error_msg', 'Category already exists, Please choose a different one')
            console.log("Category already exists")
            return res.redirect('/addCategory');
            
        }

        const data = new DishCategory({
            category:input
        })

        if(await data.save()){
            req.flash('success_msg', 'Successfully Added');
            return res.redirect('/addCategory');
        }
    },


}

module.exports = addCategoryController;