const express = require("express");
const { model } = require("mongoose");

const loginController = require('../controller/loginController.js');
const homeController = require('../controller/homeController.js');
const userController = require('../controller/userController.js');
const viewInvController = require('../controller/viewInvController.js');
const addIngreController = require('../controller/addIngreController.js');
const recordAddtlController = require('../controller/recordAddtlController.js')
const manageDishesController = require('../controller/manageDishesController.js');
const viewReportController = require('../controller/viewReportController.js');
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
app.get("/viewInventory", viewInvController.getViewInventory);
app.get("/viewInventory/discard/p1", viewInvController.getDiscard);
app.post("/viewInventory/discard/p2", viewInvController.postDiscard1);
app.post("/viewInventory/discard/p2/process", viewInvController.postDiscard2);

// Add New Ingredients
app.get("/addNewIngredient", addIngreController.getAddIngre);
app.post("/addNewIngredient/process", addIngreController.postAddIngredientAndVariation);

// Record Addt'l Purchase
app.get("/recordAddtl/p1", recordAddtlController.getRecAddtl);
app.post("/recordAddtl/p2", recordAddtlController.postRecAddtl1);
app.post("/recordAddtl/p2/process", recordAddtlController.postRecAddtl2);

// View Dishes
app.get("/manageDishes", manageDishesController.getManageDishes)

// Add Dish
app.get("/addDish", addDishController.getAddDish)
app.post("/addDish/process", addDishController.postAddDish)

// Add Category
app.get("/addCategory", addCategoryController.getAddCategory)

// View Stock Report
app.get("/viewStockReport", viewReportController.getStock)

// View Periodical Report
app.get("/viewPeriodical", viewReportController.getPeriodical)

// View Custom Report   
app.get("/viewCustom", viewReportController.getCustom)

// View Detailed Report
// To revise /Milk, will be ingredient id once may db na
app.get("/detailedReport/Milk", viewReportController.getDetailed)

// Input Physical Count
app.get("/inputPhysicalCount", inputPhysicalController.getInputPhysCount)

// Order Terminal
app.get("/viewOrderTerminal", orderController.getOrder)
app.post("/processOrder", orderController.processOrder);

module.exports = app;