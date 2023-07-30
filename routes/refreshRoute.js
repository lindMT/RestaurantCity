const express = require("express");
const { model } = require("mongoose");

const refreshController = require('../controller/refreshController.js');

const app = express();

// Login
app.get("/", refreshController.getRefresh);

module.exports = app;