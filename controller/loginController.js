const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");
const sampleData = require("../sampleData/sampleData.js");

// UNCOMMENT TO LOAD DATA
// sampleData.addSamples();

const loginController = {
    // for redirecting login and signup
    getLogin: function(req, res) {
        res.render('login');
    },

    // for redirecting to home page
    checkLogin: function(req, res) {
        const password = req.body.password;

        console.log(req.body.userName)
        User.findOne({ userName: req.body.userName, status: "active" }).then( docs => {
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
                        req.flash('error_msg', 'Wrong password. Please contact the admin if needed.')
                        console.log("Wrong PW")
                        return res.redirect('/login');
                    }
                }
                else {
                    req.flash('error_msg', 'Wrong username or inactive account. Please contact the admin if needed.')
                    console.log("Wrong Username or Inactive Account")
                    return res.redirect('/login');
                }
            }       
        )
    },

    getLogout: function(req, res) {
        req.session.destroy();
        res.redirect('/login');
    },
    
}

module.exports = loginController;