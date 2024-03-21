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
    isbn: 1542878160,
  },
];

let notes = [
  {
    id: 1,
    book_id: 1,
    note_description:
      "I was within and without, simultaneously enchanted and repelled by the inexhaustible variety of life.",
  },
  {
    id: 2,
    book_id: 1,
    note_description:
      "He smiled understandingly-much more than understandingly. It was one of those rare smiles with a quality of eternal reassurance in it, that you may come across four or five times in life. It faced--or seemed to face--the whole eternal world for an instant, and then concentrated on you with an irresistible prejudice in your favor. It understood you just as far as you wanted to be understood, believed in you as you would like to believe in yourself, and assured you that it had precisely the impression of you that, at your best, you hoped to convey.",
  },
  {
    id: 3,
    book_id: 2,
    note_description:
      "Now I will tell you the answer to my question. It is this. The Party seeks power entirely for its own sake. We are not interested in the good of others; we are interested solely in power, pure power. What pure power means you will understand presently. We are different from the oligarchies of the past in that we know what we are doing. All the others, even those who resembled ourselves, were cowards and hypocrites. The German Nazis and the Russian Communists came very close to us in their methods, but they never had the courage to recognize their own motives.",
  },
];

const bookCover = "/images/book-cover.webp";
// async function getBookCover(booksList) {
//   const requests = booksList.map((book, index) => {
//     const url = apiURL + "isbn/" + book.isbn + "-M.jpg";
//     return axios.get(url);
//   });

//   try {
//     const responses = await Promise.all(requests);
//     const covers = responses.map((response) => response.config.url);
//     return covers;
//   } catch (error) {
//     console.log(`Error fetching book covers: ${error.message}`);
//     return [];
//   }
// }

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

    // const bookCovers = await getBookCover(books);

    res.render("index.ejs", { books, bookCover, shortenBookTitle });
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
      console.log(`Param is: ${paramName}`);
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

      // const bookCovers = await getBookCover(books);
      // console.log(bookCovers);
      // const bookCover = bookCovers[currentBookId - 1];
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
  const { title, date_read, review } = req.body;
  const isbn = Number(req.body.isbn);
  const rating = parseInt(req.body.rating);
  const route = shortenBookTitle(title);

  try {
    await db.query(
      "INSERT INTO books (title, isbn, rating, date_read, review, route) VALUES($1, $2, $3, $4, $5, $6)",
      [title, isbn, rating, date_read, review, route]
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

app.delete("/delete", async (req, res) => {});
// db.end();

app.listen(port, () => {
  console.log("Server is running on port " + port + ".");
  console.log("http://localhost:3000");
});
