const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const loginController = {
    // for redirecting login and signup
    getLogin: function(req, res) {
        res.render('login', {loginPrompt: ""});
    },

    // for redirecting to home page
    checkLogin: function(req, res) {
        console.log(req.body.userName)
        User.findOne({ userName: req.body.userName, password: req.body.password }).then( docs => {
                if (docs == null){ 
                    res.render('login', {loginPrompt: "Wrong Credentials. Please contact the owner if needed."});
                    console.log("No user found");
                } 
                else{
                    req.session.isAuth = true
                    req.session.userName = req.body.userName
                    res.redirect('/home');
                    console.log(docs);
                }
            }       
        )
    },

    getLogout: function(req, res) {
        req.session.destroy();
        res.render('login', {loginPrompt: ""});
    }
}

module.exports = loginController;
