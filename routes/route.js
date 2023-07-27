const express = require("express");
const { model } = require("mongoose");

const loginController = require('../controller/loginController.js');
const homeController = require('../controller/homeController.js');
const userController = require('../controller/userController.js');
const viewInvController = require('../controller/viewInvController.js');
const addIngreController = require('../controller/addIngreController.js');
const recordFirstController = require('../controller/recordFirstController.js')
const recordAddtlController = require('../controller/recordAddtlController.js')
const manageDishesController = require('../controller/manageDishesController.js');
const approveDishesController = require('../controller/approveDishesController.js');
const revertDishesController = require('../controller/revertDishesController.js');
const editDishController = require('../controller/editDishController.js');
const viewReportController = require('../controller/viewReportController.js');
const viewOrderReportController = require("../controller/viewOrderReportController.js");
const addDishController = require('../controller/addDishController.js');
const addCategoryController = require('../controller/addCategoryController.js');
const inputPhysicalController = require('../controller/inputPhysicalController.js');
const orderController = require("../controller/orderController.js");
const addUnitController = require("../controller/addUnitController.js");
const manageConversionsController = require("../controller/manageConversionsController.js");

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
// app.get("/changePassword", userController.getChangePassword)
// app.post("/changePassword", userController.changePassword)
// Self Account Management
app.get("/changeOwnPassword", userController.getChangeOwnPassword)
app.post("/changeOwnPassword", userController.changeOwnPassword)

app.get("/createUser", userController.getCreateUser)
app.post("/createUser", userController.createUser)
app.get("/manageUser", userController.getManageUser)
app.post("/resetPassword/:userName", userController.resetPassword);
app.post("/removeUser/:userName", userController.removeUser);

// View Inventory
app.get("/viewInventory", viewInvController.getViewInventory);

// Discard
app.get("/discard/p1", viewInvController.getDiscard);
app.post("/discard/p2", viewInvController.postDiscard1);
app.post("/discard/p2/process", viewInvController.postDiscard2);

// Add New Ingredients
app.get("/addNewIngredient", addIngreController.getAddIngre);
app.post("/addNewIngredient/process", addIngreController.postAddIngre);
// app.post("/addNewIngredient/p2", addIngreController.postAddIngre1);
// app.post("/addNewIngredient/p2a/process", addIngreController.postAddIngre2a);
// app.post("/addNewIngredient/p2b/process", addIngreController.postAddIngre2b);

// Record First Purchase
app.get("/recordFirst/p1", recordFirstController.getRecFirst);
app.post("/recordFirst/p2", recordFirstController.postRecFirst1);
app.post("/recordFirst/p2/process", recordFirstController.postRecFirst2);

// Record Addt'l Purchase
app.get("/recordAddtl/p1", recordAddtlController.getRecAddtl);
app.post("/recordAddtl/p2", recordAddtlController.postRecAddtl1);
app.post("/recordAddtl/p2/process", recordAddtlController.postRecAddtl2);

// Manage Dishes
app.get("/manageDishes", manageDishesController.getManageDishes);
app.post("/manageDishes/process", manageDishesController.postManageDishes);

app.get("/approveDishes", approveDishesController.getApproveDishes);
app.post("/approveDish/process", approveDishesController.postApproveDish)

// Revert Dishes
app.get("/revertDishes", revertDishesController.getRevertDishes);
app.post("/revertDish/process", revertDishesController.postRevertDishes)

// Add Dish
app.get("/addDish", addDishController.getAddDish)
app.post("/addDish/process", addDishController.postAddDish)

// Edit Dish
app.get("/editDish", editDishController.getEditDish)
app.post("/editDish/process", editDishController.postEditDish)

// Add Category
app.get("/addCategory", addCategoryController.getAddCategory)
app.post("/addCategory/process", addCategoryController.postAddCategory)

// Add Unit
app.get("/addUnit", addUnitController.getAddUnit)
app.post("/addUnit/process", addUnitController.postAddUnit)

// Add Conversion
app.get("/manageConversions", manageConversionsController.getManageConversions)
app.get("/viewConversions/:ingreID", manageConversionsController.viewConversions)
app.get("/addConversion/:ingreID", manageConversionsController.addConversion)
app.post("/addConversion/:ingreID/process", manageConversionsController.postAddConversion)

// Periodical Stock Report
app.get("/viewStockReport", viewReportController.getPeriodical)
app.post("/viewPeriodical", viewReportController.postPeriodical)

// Custom Stock Report
app.get("/viewCustom", viewReportController.getCustom)
app.post("/viewCustom", viewReportController.postCustom)

// Detailed Stock Report
app.post("/detailedReport/:reportType", viewReportController.getDetailed)

// Periodical Order Report
app.get("/viewOrderReport/Periodical", viewOrderReportController.getPeriodical);
app.post("/viewOrderReport/Periodical", viewOrderReportController.postPeriodical);

// Stock Order Report
app.get("/viewOrderReport/Custom", viewOrderReportController.getCustom);
app.post("/viewOrderReport/Custom", viewOrderReportController.postCustom);

// Detailed Order Report
app.post("/viewOrderReport/Detailed", viewOrderReportController.getDetailed);

// Input Physical Count
app.get("/inputPhysicalCount", inputPhysicalController.getInputPhysCount)
app.post("/inputPhysicalCount/process", inputPhysicalController.postInputPhysCount)
// app.post("/inputPhysicalCount/p2", inputPhysicalController.postInputPhysCount1)
// app.post("/inputPhysicalCount/p2/process", inputPhysicalController.postInputPhysCount2)

// Order Terminal
app.get("/viewOrderTerminal", orderController.getOrder)
app.post("/processOrder", orderController.processOrder);

module.exports = app;