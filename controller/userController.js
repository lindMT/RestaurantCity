const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const userController = {

    getAdminConfirmation: function(req, res) {
        if(req.session.isAuth && req.session.position == "admin"){
            res.render('adminConfirmation', {adminConfirmationPrompt: ""} );
        } else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    adminConfirmation: function(req, res) {
        if(req.session.isAuth && req.session.position == "admin"){
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
        } else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    getChangeOwnPassword: function(req, res) {
        if(req.session.isAuth){
            res.render('changeOwnPassword');
        } else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    changeOwnPassword: function(req, res) {
        if(req.session.isAuth){
            var userName = req.session.userName;
            var unhashedPassword = req.body.password1;
            var hashedPassword = bcrypt.hashSync(unhashedPassword, 10);
            var oldPassword = req.body.oldPass;

            User.findOne({ userName: userName }).then( docs => {
                    if (docs != null) { 
                        if(bcrypt.compareSync( oldPassword, docs.password)) {
                            User.updateOne(
                                { userName: userName },
                                { $set: { password: hashedPassword } }
                            )
                            .catch(err => {
                                console.log(err);
                            });
                        
                            req.flash('success_msg', 'Successfully changed password');
                            return res.redirect('/changeOwnPassword');
                        } else {
                            req.flash('success_msg', null);
                            req.flash('error_msg', 'Wrong password. Please contact the admin if needed.')
                            console.log("Wrong PW")
                            return res.redirect('/changeOwnPassword');
                        }
                    }
                }
            );
        } else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },


    getCreateUser: function(req, res) {
        if(req.session.isAuth && req.session.position == "admin"){
            res.render('createUser', {  createUserPrompt: "",
                                        firstName: "",
                                        lastName: "",
                                        position: "",
                                        userName: ""
                                    });
        } else{
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    createUser: function(req, res) {
        if(req.session.isAuth && req.session.position == "admin"){
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
                    password: hashedPw,
                    status: "active"
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
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    getManageUser: function(req, res) {
        if(req.session.isAuth && req.session.position == "admin"){
            User.find({}).then(docs => {
                console.log(docs);
                res.render('manageUser', { users: docs });
            })
            .catch(err => {
                console.log(err);
            });
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },

    resetPassword: function(req, res) {        
        if(req.session.isAuth && req.session.position == "admin"){
            var userName = req.params.userName;
            var unhashedPassword = req.body['password1' + userName];
            var hashedPassword = bcrypt.hashSync(unhashedPassword, 10);

            User.updateOne(
                { userName: userName },
                { $set: { password: hashedPassword } }
            )
            .catch(err => {
                console.log(err);
            });
            
            res.redirect('/manageUser');
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }

    },

    removeUser: function(req, res) {
        if(req.session.isAuth && req.session.position == "admin"){
            var userName = req.params.userName;

            User.updateOne(
                { userName: userName },
                { $set: { status: "inactive" } }
            )
            .catch(err => {
                console.log(err);
            });
            
            res.redirect('/manageUser');
        } else {
            console.log("Unauthorized access.");
            req.session.destroy();
            return res.render('login', { error_msg: "Unauthorized access. Please refrain from accessing restricted modules without proper authorization or logging in." } );
        }
    },
    
}

module.exports = userController;