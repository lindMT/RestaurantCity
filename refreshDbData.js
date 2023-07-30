const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/restaurantCity", {
    useNewUrlParser: true
})
.then((res) => {
    console.log("Refreshed DB successfully, please begin with the demo . . .");
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const route = require("./routes/refreshRoute.js")
app.use('/', route);