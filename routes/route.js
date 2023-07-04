const express = require("express");
const { model } = require("mongoose");

const loginController = require('../controller/loginController.js');
const homeController = require('../controller/homeController.js');
const userController = require('../controller/userController.js');
const viewInvController = require('../controller/viewInvController.js');
const addIngreController = require('../controller/addIngreController.js');
const recordAddtlController = require('../controller/recordAddtlController.js')
const manageDishesController = require('../controller/manageDishesController.js');
const viewStockController = require('../controller/viewStockController.js');
const addDishController = require('../controller/addDishController.js');
const addCategoryController = require('../controller/addCategoryController.js');
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
app.post("/resetPassword/:userName", userController.resetPassword);
app.post("/removeUser/:userName", userController.removeUser);

// View Inventory
app.get("/viewInventory", viewInvController.getViewInventory)

// Add New Ingredients
app.get("/addNewIngredient", addIngreController.getAddIngre)

// Record Addt'l Purchase
app.get("/recordAddtl", recordAddtlController.getRecAddtl)

// View Dishes
app.get("/manageDishes", manageDishesController.getManageDishes)

// Add Dish
app.get("/addDish", addDishController.getaddDish)

// Add Category
app.get("/addCategory", addCategoryController.getAddCategory)

// View Stock Report
app.get("/viewStockReport", viewStockController.getStock)

// View Periodical Report
app.get("/viewPeriodical", viewStockController.getPeriodical)

// View Custom Report   
app.get("/viewCustom", viewStockController.getCustom)

// View Detailed Report
// To revise /Milk, will be ingredient id once may db na
app.get("/detailedReport/Milk", viewStockController.getDetailed)

// Input Physical Count
app.get("/inputPhysicalCount", inputPhysicalController.getInputPhysCount)

// Order Terminal
app.get("/viewOrderTerminal", orderController.getOrder)
app.post("/processOrder", orderController.processOrder);

module.exports = app;