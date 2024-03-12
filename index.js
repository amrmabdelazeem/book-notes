import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import 'dotenv/config';

const app = express();
const port = 3000;
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res)=>{
    res.render('index.ejs');
});

db.end();

app.listen(port, () => {
  console.log("Server is running on port " + port + ".");
  console.log('http://localhost:3000');
});
