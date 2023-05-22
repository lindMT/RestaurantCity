const express = require("express");
const { model } = require("mongoose");

const loginController = require('../controller/loginController.js');
const homeController = require('../controller/homeController.js');
const userController = require('../controller/userController.js');
const viewDishesController = require('../controller/viewDishesController.js');
const app = express();

// Login
app.get("/", loginController.getLogin);
app.post("/login", loginController.checkLogin);
app.get("/logout", loginController.getLogout);

// Home
app.get("/home", homeController.getHome)

// User
app.get("/userLanding", userController.getUserLanding)

// View Dishes
app.get("/viewDishes", viewDishesController.getViewDishes)


module.exports = app;