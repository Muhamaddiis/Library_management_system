package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	connstr := os.Getenv("CONNSTR")
	if connstr == "" {
		log.Fatal("CONNSTR environment variable is not set")
	}

	var dbErr error
	DB, dbErr = sql.Open("postgres", connstr)
	if dbErr != nil {
		log.Fatalf("Error opening database connection: %v", dbErr)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatalf("Error pinging the database: %v", err)
	}

	createTables(DB)
}

func createTables(db *sql.DB) {
	createUsersTable(db)
	createBooksTable(db)
	createBorrowingsTable(db)
	createReservationsTable(db)
	createFinesTable(db)
}


func createUsersTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Storing hashed passwords
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin')) -- Role can be 'user' or 'admin'
);`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}

func createBooksTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS Books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    description TEXT,
    availability BOOLEAN DEFAULT TRUE -- TRUE if the book is available, FALSE if borrowed
);`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}

func createBorrowingsTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS Borrowings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    book_id INT REFERENCES Books(id) ON DELETE CASCADE,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE, -- NULL if the book has not been returned
    due_date DATE NOT NULL,
    renewed BOOLEAN DEFAULT FALSE -- TRUE if the book has been renewed
);`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}

func createReservationsTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS Reservations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    book_id INT REFERENCES Books(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled')) -- Reservation status
);`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}

func createFinesTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS Fines (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0), -- Amount of the fine
    paid BOOLEAN DEFAULT FALSE, -- TRUE if the fine has been paid
    due_date DATE NOT NULL
);`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}


