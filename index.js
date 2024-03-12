import express from 'express';
import pg from 'pg';
import bodyParser from 'body-parser';


const app = express();
const port = 3000;

app.listen((req, res)=>{
    console.log("Server is running on port "+port+".");
});