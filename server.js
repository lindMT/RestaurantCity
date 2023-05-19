const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
// npm init -y
// npm install ejs express express-session body-parser mongoose  
// eto mga wala pa: connect-mongodb-session path fs

mongoose.connect("mongodb://localhost:27017/restaurantCity", {
    useNewUrlParser: true
})
.then((res) => {
    console.log("MongoDB connected");
});

const store = new mongoDBSession({
    uri: "mongodb://localhost:27017/restaurantCity",
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

const route = require("./routes/route.js")
app.use('/', route);

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
