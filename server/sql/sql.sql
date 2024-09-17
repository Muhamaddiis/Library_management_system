CREATE TABLE Users (
    id  PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Storing hashed passwords
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin')) -- Role can be 'user' or 'admin'
);


CREATE TABLE Books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    description TEXT,
    availability BOOLEAN DEFAULT TRUE -- TRUE if the book is available, FALSE if borrowed
);

CREATE TABLE Borrowings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    book_id INT REFERENCES Books(id) ON DELETE CASCADE,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE, -- NULL if the book has not been returned
    due_date DATE NOT NULL,
    renewed BOOLEAN DEFAULT FALSE -- TRUE if the book has been renewed
);

CREATE TABLE Reservations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    book_id INT REFERENCES Books(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled')) -- Reservation status
);

CREATE TABLE Fines (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0), -- Amount of the fine
    paid BOOLEAN DEFAULT FALSE, -- TRUE if the fine has been paid
    due_date DATE NOT NULL
);

