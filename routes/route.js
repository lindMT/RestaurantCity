const express = require("express");
const { model } = require("mongoose");

const logincontroller = require('../controller/logincontroller.js');
const app = express();

//Login and Register
app.get("/", logincontroller.getLogin);
app.post("/", logincontroller.getLogin);
app.post("/login", logincontroller.checkLogin);
// app.get("/signup", logincontroller.getRegister);
// app.post("/signup", logincontroller.saveRegister);
// app.get("/logout", logincontroller.getLogout);

module.exports = app;