DROP TABLE IF EXISTS books, notes;

CREATE TABLE books(
	id SERIAL PRIMARY KEY,
	ISBN INTEGER,
	title VARCHAR(50) NOT NULL,
	rating INTEGER,
	date_read DATE NOT NULL,
	review TEXT,
	route VARCHAR(50) UNIQUE
);

CREATE TABLE notes(
	note_id SERIAL PRIMARY KEY,
	book_id INTEGER REFERENCES books(id),
	note_description TEXT
);

INSERT INTO books(title, rating, review, date_read, isbn)
	VALUES('1984',10, 'This was the book that started my love affair with the dystopian genre. And maybe indirectly influenced my decision to do a politics degree. I was only 12 years old when I first read it but I suddenly saw how politics could be taken and manipulated to tell one hell of a scary and convincing story. I''m a lot more well-read now but, back then, this was a game-changer. I started to think about things differently. I started to think about 2 + 2 = 5 and I wanted to read more books that explored the idea of control.', '2024-03-01',9780452284234)
	,('The Great Gatsby',9, 'Fitzgerald can set a scene so perfectly, flawlessly. He paints a world of magic and introduces one of the greatest characters of all time, Jay Gatsby. Gatsby is the embodiment of hope, and no one can dissuade him from his dreams. Have you ever had a dream that carried you to heights you could never have dreamed otherwise? When Gatsby is reunited with Daisy Buchanan, he fills the space to the brim with flowers, creating a living dream. How is anyone supposed to compete with that?', '2024-03-13',9781638434665)
	,('Design for Living',7, 'The actual facts are so simple. I love you. You love me. You love Otto. I love Otto. Otto loves you. Otto loves me. There now! Start to unravel from there.', '2023-04-12',9781432585891);


