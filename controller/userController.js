const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const userController = {

    getUserLanding: function(req, res) {
        res.render('userLanding');
    },

    getChangePassword: function(req, res) {
        res.render('changePassword', {changePrompt: ""});
    },

    confirmChangePassword: function(req, res) {
        if(req.session.isAuth) {

            const oldPass = req.body.oldPass;
            const newPass1 = req.body.newPass1;
            const newPass2 = req.body.newPass2;
            console.log("session user: " + req.session.userName)
            console.log("olddpass: " + oldPass)
            console.log("new pass1: " + newPass1)
            console.log("new pass2: " + newPass2)
            User.findOne({ userName: req.session.userName, password: oldPass }).then( docs => {
                    if (docs == null){ 
                        res.render('changePassword', {changePrompt: "Wrong Password."});
                    } 
                    else{
                        if (newPass1 != newPass2){
                            res.render('changePassword', {changePrompt: "Please match the passwords."});
                        } else{
                            console.log("ok pasok")
                            
                            User.updateOne({ userName: req.session.userName }, { password: newPass1 })
                            .then(() => {
                                res.render('changePassword', { changePrompt: "Password changed successfully." });
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                        

                        }
                    }
                }       
            )
            
        } else {
            res.render('login');
        }
    },

    getCreateUser: function(req, res) {
        res.render('createUser', {createUserPrompt: ""});
    },

    getManageUser: function(req, res) {
        res.render('manageUser', {manageUserPrompt: ""});
    },

}

module.exports = userController;