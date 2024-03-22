import express, { request, response } from "express";
import pg from "pg";
import bodyParser from "body-parser";
import "dotenv/config";
import axios from "axios";

const app = express();
const port = 3000;
const apiURL = process.env.API_URL;

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

function shortenBookTitle(title) {
  // Split the title into an array of words
  const words = title.split(" ");
  // Define a list of definite and indefinite articles and other words to filter
  const filterWords = [
    "the",
    "a",
    "an",
    "of",
    "by",
    "can",
    "could",
    "may",
    "might",
    "must",
    "shall",
    "should",
    "will",
    "would",
    "I",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
  ];

  const hyphenIndex = words.indexOf("-");
  const colonIndex = words.indexOf(":");

  // Filter out articles and other specified words from the array of words before the "-" or ":" character
  let filteredWords;
  if (hyphenIndex !== -1) {
    filteredWords = words
      .slice(0, hyphenIndex)
      .filter((word) => !filterWords.includes(word.toLowerCase()));
  } else if (colonIndex !== -1) {
    filteredWords = words
      .slice(0, colonIndex)
      .filter((word) => !filterWords.includes(word.toLowerCase()));
  } else {
    filteredWords = words.filter((word) => !filterWords.includes(word.toLowerCase()));
  }

  // Check for - in the first word after filtering
  for (let i = 0; i < filteredWords.length; i++) {
    const filteredWord = filteredWords[i];

    if (filteredWord.includes("-")) {
      const hyphenIndex = filteredWord.indexOf("-");
      if (hyphenIndex - 1 !== " ") {
        filteredWords[i] = filteredWord.replace("-", "");
      } else {
        filteredWords = filteredWord.slice(0, hyphenIndex);
      }
    } else if (filteredWord.includes(":")) {
      const colonIndex = filteredWord.indexOf(":");
      filteredWords[i] = filteredWord.replace(":", "");
    }
  }
  // Capitalize the first letter of each word and join the words back together

  const shortenedTitle = filteredWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return shortenedTitle;
}

let books = [];

let notes = [];

// const bookCover = "/images/book-cover.webp";
async function getBookCover(booksList) {
  const requests = booksList.map((book, index) => {
    const url = apiURL + "isbn/" + book.isbn + "-M.jpg";
    return axios.get(url);
  });

  try {
    const responses = await Promise.all(requests);
    const covers = responses.map((response) => response.config.url);
    return covers;
  } catch (error) {
    console.log(`Error fetching book covers: ${error.message}`);
    return [];
  }
}

let sortType = "id";
// Prevent sql injection into the DB
function checkSorting(sortCheck) {
  const columnList = ["id", "title", "rating", "date_read"];
  if (columnList.includes(sortCheck)) {
    sortType = sortCheck;
    console.log("we are here " + sortType);
  } else {
    console.log("prevented injection");
    sortType = "id";
  }
}
//https://covers.openlibrary.org/b/$key/$value-$size.jpg
app.get("/", async (req, res) => {
  try {
    const sql = `SELECT * FROM books ORDER BY ${sortType} ASC`;
    const result = await db.query(sql);
    books = result.rows;

    const bookCovers = await getBookCover(books);

    res.render("index.ejs", { books, bookCovers, shortenBookTitle });
  } catch (error) {
    console.log(error);
  }
});

// app.post("/:name", async (req, res)=>{

//   const currentBookId = req.body.id;

//   const result = await db.query('SELECT * FROM books INNER JOIN notes on books.id = notes.book_id where books.id = $1',[currentBookId]);
//   notes = result.rows;
//   const pBooksResult = await db.query('SELECT * FROM books where books.id = $1',[currentBookId]);
//   const selectedBook = pBooksResult.rows[0];
//   console.log(selectedBook);

//   const bookCovers = await getBookCover(books);
//   const bookCover = bookCovers[currentBookId-1]
//   // console.log(notes);
//   res.render("notes.ejs",{notes,bookCover ,selectedBook});
// });

app.get("/:name", async (req, res) => {
  const paramName = req.params.name;
  if (paramName !== "add" && paramName !== "edit") {
    try {
      console.log(`Current route is /${paramName}`);
      const result = await db.query(
        "SELECT * FROM books INNER JOIN notes on books.id = notes.book_id where books.route = $1",
        [paramName]
      );
      notes = result.rows;
      // console.log(notes);

      const pBooksResult = await db.query("SELECT * FROM books where books.route = $1", [
        paramName,
      ]);

      const selectedBook = pBooksResult.rows[0];
      const currentBookId = selectedBook.id;

      const bookCovers = await getBookCover(books);
      // console.log(bookCovers);
      const bookCover = bookCovers[currentBookId - 1];
      // console.log(currentBookId);
      // console.log(selectedBook);
      res.render("notes.ejs", { notes, selectedBook, bookCover });
    } catch (error) {
      console.log(error);
      res.redirect("/");
    }
  } else if (paramName === "add") {
    res.render("add.ejs");
  }
});

app.post("/add", async (req, res) => {
  const { title,author, date_read, review } = req.body;
  const isbn = Number(req.body.isbn);
  const rating = parseInt(req.body.rating);
  const route = shortenBookTitle(title);

  try {
    await db.query(
      "INSERT INTO books (title,author , isbn, rating, date_read, review, route) VALUES($1, $2, $3, $4, $5, $6, $7)",
      [title,author, isbn, rating, date_read, review, route]
    );

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.render("add.ejs");
  }
});

app.post("/edit", async (req, res) => {
  const reviewId = req.body.id;

  const result = await db.query("SELECT review FROM BOOKS WHERE books.id = $1", [reviewId]);
  const oldReview = result.rows[0];

  res.render("editReview.ejs", { oldReview, reviewId });
});

app.post("/submit", async (req, res) => {
  const id = req.body.id;
  const review = req.body.review;

  try {
    const result = await db.query("UPDATE BOOKS SET review = $1 WHERE books.id = $2 RETURNING *", [
      review,
      id,
    ]);
    const currentRoute = result.rows[0].route;
    res.redirect(`/${currentRoute}`);
  } catch (error) {
    console.log(error);
  }
});

app.post("/sort", (req, res) => {
  try {
    sortType = req.body.sort;
    checkSorting(sortType);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete/:id", async (req, res) => {
  const noteId = req.params.id;

  try {
    const result = db.query("DELETE FROM notes WHERE notes.note_id = $1", [noteId]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});
// db.end();

app.listen(port, () => {
  console.log("Server is running on port " + port + ".");
  console.log("http://localhost:3000");
});
