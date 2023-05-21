const express = require("express");
const { model } = require("mongoose");

const logincontroller = require('../controller/logincontroller.js');
const homecontroller = require('../controller/homecontroller.js');
const app = express();

// Login
app.get("/", logincontroller.getLogin);
app.post("/login", logincontroller.checkLogin);
app.get("/logout", logincontroller.getLogout);

// Home
app.get("/home", homecontroller.getHome)


module.exports = app;