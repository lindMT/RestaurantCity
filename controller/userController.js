const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const userController = {

    getAdminConfirmation: function(req, res) {
        res.render('adminConfirmation', {adminConfirmationPrompt: ""} );
    },

    adminConfirmation: function(req, res) {
        const password = req.body.password;

        console.log(req.body.userName)
        User.findOne({ userName: req.session.userName }).then( docs => {
                if (docs != null) { 
                    if (bcrypt.compareSync( password, docs.password)) {
                        res.redirect('/manageUser');
                    } else {
                        res.render('adminConfirmation', {adminConfirmationPrompt: "Wrong Credentials."});
                    }
                }
                else {
                    res.render('adminConfirmation', {adminConfirmationPrompt: "Wrong Credentials."});
                }
            }       
        )
    },

    getUserLanding: function(req, res) {
        res.render('userLanding');
    },

    getChangePassword: function(req, res) {
        res.render('changePassword', {changePrompt: ""});
    },

    changePassword: function(req, res) {
        if(req.session.isAuth) {

            const oldPass = req.body.oldPass;
            const newPass1 = req.body.newPass1;
            const newPass2 = req.body.newPass2;
            User.findOne({ userName: req.session.userName }).then( docs => {
                    if(!bcrypt.compareSync( oldPass, docs.password)){
                        res.render('changePassword', {changePrompt: "Wrong Password."});
                    } 
                    else{
                        if (newPass1 != newPass2){
                            res.render('changePassword', { changePrompt: "Please match the passwords." });
                        } else{
                            var hashedPw = bcrypt.hashSync(newPass1, 10);
                            console.log("newPass1: "+ newPass1);
                            console.log("hashedPw: "+ hashedPw);
                            
                            User.updateOne({ userName: req.session.userName }, { password: hashedPw })
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
        res.render('createUser', {  createUserPrompt: "",
                                    firstName: "",
                                    lastName: "",
                                    position: "",
                                    userName: ""
                                });
    },

    createUser: function(req, res) {
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const position = req.body.position
        const userName = req.body.userName
        const password1 = req.body.password1
        const password2 = req.body.password2
        
        if (password1 != password2){
            res.render('createUser', {createUserPrompt: "Please match the passwords"});
        }
        else {
            var hashedPw = bcrypt.hashSync(password1, 10);

            const user = new User({
                firstName: firstName,
                lastName: lastName,
                position: position,
                userName: userName,
                password: hashedPw
            });

            user.save().then(docs => {
                res.render('createUser', {  createUserPrompt: "Added user successfully.",
                                            firstName: "",
                                            lastName: "",
                                            position: "",
                                            userName: "" });
            })
            .catch(error => {
                if (error.code === 11000) {
                    // Duplicate user error
                    res.render('createUser', {  createUserPrompt: "User already exists.",
                                                firstName: firstName,
                                                lastName: lastName,
                                                position: position,
                                                userName: "" });
                } else {
                    console.log(error);
                    res.render('createUser', {  createUserPrompt: "Error adding user.",
                                                firstName: "",
                                                lastName: "",
                                                position: "",
                                                userName: ""  });
                }
            });



        }
    },

    getManageUser: function(req, res) {

        User.find({}).then(docs => {
            console.log(docs);
            res.render('manageUser', { users: docs });
        })
        .catch(err => {
            console.log(err);
        });
        
    },

    resetPassword: function(req, res) {
        console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOp")
        var userName = req.params.userName;
        var unhashedPassword = req.body['password1' + userName];
        
        console.log("username:" + userName);
        console.log("unhashed password:" + unhashedPassword);


        var hashedPassword = bcrypt.hashSync(unhashedPassword, 10);
        console.log("tite" + hashedPassword);



        User.updateOne(
            { userName: userName },
            { $set: { password: hashedPassword } }
        )
        .catch(err => {
            console.log(err);
        });
        
        res.redirect('/manageUser');

    },
    
}

module.exports = userController;