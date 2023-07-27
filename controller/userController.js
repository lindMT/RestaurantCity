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


    getChangeOwnPassword: function(req, res) {
        res.render('changeOwnPassword');
    },

    changeOwnPassword: function(req, res) {
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

    },

    removeUser: function(req, res) {
        var userName = req.params.userName;
        console.log("HEY: " + userName);

        User.updateOne(
            { userName: userName },
            { $set: { status: "inactive" } }
        )
        .catch(err => {
            console.log(err);
        });
        
        res.redirect('/manageUser');

    },
    
}

module.exports = userController;