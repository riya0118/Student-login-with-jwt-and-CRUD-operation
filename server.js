const express = require("express");
const app = express();
require("dotenv").config();
const StudentRoute = require("./routers/StudentRouter");

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use("/students", StudentRoute);

app.listen(8000);
console.log("App is listening on port 8000");