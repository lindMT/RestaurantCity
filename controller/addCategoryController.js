const User = require('../model/usersSchema.js');
const DishCategory = require('../model/dishCategorySchema.js');
const bcrypt = require("bcrypt");
const { default: mongoose } = require('mongoose');


const addCategoryController = {
    // for redirecting login and signup
    getAddCategory: async function(req, res) {
        if(req.session.isAuth && (req.session.position == 'admin' || req.session.position == 'chef') ){
            res.render('addCategory');
        } else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    postAddCategory: async function(req, res){
        var input = req.body.inputDishCategory.toLowerCase()
        
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