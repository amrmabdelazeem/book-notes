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
  const words = title.split(' ');
  // Define a list of definite and indefinite articles and other words to filter
    const filterWords = ['the', 'a', 'an', 'by', 'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would', 'I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];

  const hyphenIndex = words.indexOf('-');

  // Filter out articles and other specified words from the array of words before the "-" character
  let filteredWords;
  if (hyphenIndex !== -1) {
      filteredWords = words.slice(0, hyphenIndex).filter(word => !filterWords.includes(word.toLowerCase()));
  } else {
      filteredWords = words.filter(word => !filterWords.includes(word.toLowerCase()));
  }

  // Check for - in the first word after filtering
  for (let i = 0; i < filteredWords.length; i++) {
    const filteredWord = filteredWords[i];
    if (filteredWord.includes('-')) {
        const hyphenIndex = filteredWord.indexOf('-');
        
        filteredWords[i] = filteredWord.replace('-', '');
    }
}
  // Capitalize the first letter of each word and join the words back together
  const shortenedTitle = filteredWords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
  return shortenedTitle;
}

// const originalTitle = "E-Myth Revisited - by Michael Gerber";
// const shortenedTitle = shortenBookTitle(originalTitle);

// console.log(shortenedTitle);

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

async function getBookCover(booksList){
  const requests = booksList.map((book, index) => {
    const url = apiURL+'isbn/'+book.isbn+'-M.jpg';
    return axios.get(url);
    });

    try{
      const responses = await Promise.all(requests);
      const covers = responses.map(response => response.config.url);
      return covers;
    }catch(error){
      console.log(`Error fetching book covers: ${error.message}`);
      return[];
    }
}

//https://covers.openlibrary.org/b/$key/$value-$size.jpg 
app.get("/", async(req, res) => {
  
  try {
    const result = await db.query('SELECT * FROM books ORDER BY id ASC');
    books = result.rows;
    
    const bookCovers = await getBookCover(books);
    
    res.render("index.ejs", { books, notes, bookCovers , shortenBookTitle});
  } catch (error) {
    console.log(error);
  }

});

// app.get("/notes", (req, res)=>{
//   res.render("notes.ejs");
// });

app.post("/:name", async (req, res)=>{

  const currentBookId = req.body.id;
  
  const result = await db.query('SELECT * FROM books INNER JOIN notes on books.id = notes.book_id where books.id = $1',[currentBookId]);
  notes = result.rows;
  const pBooksResult = await db.query('SELECT * FROM books where books.id = $1',[currentBookId]);
  const selectedBook = pBooksResult.rows[0];
  console.log(selectedBook);
  // console.log(notes);
  res.render("notes.ejs",{notes, selectedBook});
});

// db.end();

app.listen(port, () => {
  console.log("Server is running on port " + port + ".");
  console.log("http://localhost:3000");
});
