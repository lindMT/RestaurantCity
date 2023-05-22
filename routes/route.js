const express = require("express");
const { model } = require("mongoose");

const loginController = require('../controller/loginController.js');
const homeController = require('../controller/homeController.js');
const userController = require('../controller/userController.js');
const salesController = require("../controller/salesController.js");
const orderController = require("../controller/orderController.js");
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
app.get("/viewSales", salesController.getSales)

// Order Terminal
app.get("/orderTerminal", orderController.getOrders)

module.exports = app;