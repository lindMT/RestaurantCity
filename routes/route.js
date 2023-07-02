const express = require("express");
const { model } = require("mongoose");

const loginController = require('../controller/loginController.js');
const homeController = require('../controller/homeController.js');
const userController = require('../controller/userController.js');
const viewDishesController = require('../controller/viewDishesController.js');

const viewStockController = require('../controller/viewStockController.js');

const addDishController = require('../controller/addDishController.js');

const inputPhysicalController = require('../controller/inputPhysicalController.js');
const orderController = require("../controller/orderController.js");
const app = express();

// Login
app.get("/", loginController.getLogin);
app.get("/login", loginController.getLogin);
app.post("/login", loginController.checkLogin);
app.get("/logout", loginController.getLogout);

// Home
app.get("/home", homeController.getHome)

// User Account Management
app.get("/adminConfirmation", userController.getAdminConfirmation)
app.post("/adminConfirmation", userController.adminConfirmation)
app.get("/userLanding", userController.getUserLanding)
app.get("/changePassword", userController.getChangePassword)
app.post("/changePassword", userController.changePassword)
app.get("/createUser", userController.getCreateUser)
app.post("/createUser", userController.createUser)
app.get("/manageUser", userController.getManageUser)

// View Dishes
app.get("/viewDishes", viewDishesController.getViewDishes)

// Add Dish
app.get("/addDish", addDishController.getaddDish)

// View Stock Report
app.get("/viewStockReport", viewStockController.getStock)

// Input Physical Count
app.get("/inputPhysicalCount", inputPhysicalController.getInputPhysCount)

// Order Terminal
app.get("/viewOrderTerminal", orderController.getOrders)

module.exports = app;