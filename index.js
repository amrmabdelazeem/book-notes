import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import "dotenv/config";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let books = [
  {
    id: 1,
    title: "1984",
    rating: 10,
    review:
      "This was the book that started my love affair with the dystopian genre. And maybe indirectly influenced my decision to do a politics degree. I was only 12 years old when I first read it but I suddenly saw how politics could be taken and manipulated to tell one hell of a scary and convincing story. I'm a lot more well-read now but, back then, this was a game-changer. I started to think about things differently. I started to think about 2 + 2 = 5 and I wanted to read more books that explored the idea of control.",
    date_read: "2024-03-01",
    isbn: 9780452284234,
  },
  {
    id: 2,
    title: "The Great Gatsby",
    rating: 9,
    review:
      "Fitzgerald can set a scene so perfectly, flawlessly. He paints a world of magic and introduces one of the greatest characters of all time, Jay Gatsby. Gatsby is the embodiment of hope, and no one can dissuade him from his dreams. Have you ever had a dream that carried you to heights you could never have dreamed otherwise? When Gatsby is reunited with Daisy Buchanan, he fills the space to the brim with flowers, creating a living dream. How is anyone supposed to compete with that?",
    date_read: "2024-03-13",
    isbn: 9781638434665,
  },
];

app.get("/", (req, res) => {
  res.render("index.ejs", { books });
});

db.end();

app.listen(port, () => {
  console.log("Server is running on port " + port + ".");
  console.log("http://localhost:3000");
});
