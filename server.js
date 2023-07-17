const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

mongoose.connect("mongodb://127.0.0.1:27017/restaurantCity", {
    useNewUrlParser: true
})
.then((res) => {
    console.log("MongoDB connected");
});

const store = new mongoDBSession({
    uri: "mongodb://127.0.0.1:27017/restaurantCity",
    collection: "mySessions"
})

app.use(session({
        secret: "RestaurantCitySecretCookieSigner",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	next();
});

const route = require("./routes/route.js")
app.use('/', route);

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
