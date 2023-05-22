const express = require("express");
const { model } = require("mongoose");

const loginController = require('../controller/loginController.js');
const homeController = require('../controller/homeController.js');
const userController = require('../controller/userController.js');
const salescontroller = require("../controller/salesController.js");
const app = express();

// Login
app.get("/", loginController.getLogin);
app.post("/login", loginController.checkLogin);
app.get("/logout", loginController.getLogout);

// Home
app.get("/home", homeController.getHome)

// User
app.get("/userLanding", userController.getUserLanding)

// View Sales Report
app.get("/viewsalesreport", salescontroller.getSales);

module.exports = app;