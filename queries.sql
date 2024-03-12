DROP TABLE books, notes IF EXISTS;

CREATE TABLE books(
	id SERIAL PRIMARY KEY,
	title VARCHAR(50) NOT NULL,
	rating INTEGER,
	review TEXT,
	date_read DATE NOT NULL,
	ISBN INTEGER
);

CREATE TABLE notes(
	note_id SERIAL PRIMARY KEY,
	book_id INTEGER REFERENCES books(id),
	note_description TEXT
);