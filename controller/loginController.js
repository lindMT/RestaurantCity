const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const loginController = {
    // for redirecting login and signup
    getLogin: function(req, res) {
        res.render('login', {loginPrompt: ""});
    },

    // for redirecting to home page
    checkLogin: function(req, res) {
        const password = req.body.password;

        console.log(req.body.userName)
        User.findOne({ userName: req.body.userName }).then( docs => {
                if (docs != null) { 
                    if(bcrypt.compareSync( password, docs.password)) {
                        req.session.isAuth = true
                        req.session.userName = req.body.userName
                        req.session.firstName = docs.firstName
                        req.session.lastName = docs.lastName
                        req.session.position = docs.position
                        res.redirect('/home');
                        console.log(docs);
                    } else {
                        res.render('login', {loginPrompt: "Wrong Credentials. Please contact the owner if needed."});
                    }
                }
                else {
                    res.render('login', {loginPrompt: "Wrong Credentials. Please contact the owner if needed."});
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