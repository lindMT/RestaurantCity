const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const logincontroller = {
    // for redirecting login and signup
    getLogin: function(req, res) {
        //render login (it will check the routes for the login step)
        res.render('login', {loginStatus: ""});
    },

    // for redirecting to home page
    checkLogin: function(req, res) {
        console.log(req.body.userName)
        User.findOne({ userName: req.body.userName, password: req.body.password }).then( docs => {
                if (docs == null){ 
                    res.render('login', {loginStatus: "Wrong"});
                    console.log("No user found");
                } 
                else{
                    req.session.userName = req.body.userName
                    res.redirect('/home');
                    console.log(docs);
                }
            }       
        )
    },

    getLogout: function(req, res) {
        req.session.destroy();
        res.render('login', {loginStatus: ""});
    }
}

module.exports = logincontroller;
