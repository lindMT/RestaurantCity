const User = require('../model/usersSchema.js');
const bcrypt = require("bcrypt");

const logincontroller = {
    // for redirecting login and signup
    getLogin: function(req, res) {
        //render login (it will check the routes for the login step)
        res.render('login', {loginPrompt: ""});
    },

    // for redirecting to home page
    checkLogin: function(req, res) {
        console.log(req.body.userName)
        User.findOne({ userName: req.body.userName, password: req.body.password }).then( docs => {
                if (docs == null){ 
                    res.render('login', {loginPrompt: "Wrong username/password"})
                    console.log("No user found");
                } 
                else{
                    res.render('login', {loginPrompt: "Matching user found"})
                    console.log(docs)
                    // DISREGARD CODES THAT ARE COMMENTED OUT FOR NOW
                    // bcrypt encryption will be implemented last
                    // // use compareSync to compare plaintext to hashed text
                    // if(bcrypt.compareSync( req.body.password, docs.password)){
                    //     // console.log("Logged in successfully.");
                    //     // req.session.isAuth = true;
                    //     // req.session.userName = docs.userName;
                    //     // req.session.id = docs.id;
                    //     // res.redirect('/home');
                    //     // console.log(req.session.userName);
                    // } else{
                    //     res.render('login', {loginPrompt: "Wrong username/password"})
                    //     console.log("Wrong password");
                    // } 
                }
            }       
        )
    },

    // getRegister: function(req, res) {
    //     res.render('signup', {
    //         registerPrompt: ""
    //     });
    // },
    
    // saveRegister: function(req, res) {        
    //     const fname = req.body.fname;
    //     const lname = req.body.lname;
    //     const idNum = req.body.idNum;
    //     const username = req.body.username;
    //     const email = req.body.email;
    //     const pw1 = req.body.pw1;
    //     const pw2 = req.body.pw2;
        
    //     if (pw1 != pw2){
    //         res.render('signup', {registerPrompt: "Please match the passwords"});
    //     }
    //     else {
    //         var plainpassword = pw1;
    //         var hashedpw = bcrypt.hashSync(plainpassword, 10);

    //         const user = new User({
    //             firstName: fname,
    //             lastName: lname,
    //             idNum: idNum,
    //             userName:username,
    //             email: email,
    //             password: hashedpw
    //         });
    //         user.save(function(err) {
    //             if (err){
    //                 res.render('signup', {registerPrompt: "The ID Number/Username/Email you've inputted has already been taken."});
    //             } else{
    //                 res.render('login', {loginPrompt: "You have registered successfully!"});
    //             }
    //         });
    //     }
    // },
    
    // getLogout: function(req, res) {
    //     req.session.destroy();
    //     res.render('login');
    // }    
}

module.exports = logincontroller;