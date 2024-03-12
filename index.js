import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.listen((req, res) => {
  console.log("Server is running on port " + port + ".");
});
