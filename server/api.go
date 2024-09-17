package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

type ApiServer struct {
	addr string
}
type CreateBook struct {
	Title        string `json:"title"`
	Author       string `json:"author"`
	Genre        string `json:"genre"`
	Description  string `json:"description"`
	Availability bool   `json:"availability"`
	Image        string `json:"image"`
}
type Book struct {
	ID           int    `JSON:"id"`
	Title        string `json:"title"`
	Author       string `json:"author"`
	Genre        string `json:"genre"`
	Description  string `json:"description"`
	Availability bool   `json:"availability"`
	Image        string `json:"image"`
}
type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	jwt.StandardClaims
}

func NewApiserver(addr string) *ApiServer {
	return &ApiServer{
		addr: addr,
	}
}

func (s *ApiServer) Run() error {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /books", getBooks)
	mux.HandleFunc("POST /books", postBooks)
	mux.HandleFunc("DELETE /books/{id}", deleteBooks)
	mux.HandleFunc("PUT /books/{id}", updateBooks)
	mux.HandleFunc("POST /borrow/{id}", borrow)
	mux.HandleFunc("POST /return/{id}", returning)
	mux.HandleFunc("POST /signup", signUp)
	// mux.HandleFunc("POST /login", login)
	// mux.HandleFunc("PUT /", updateUserDetails)

	srv := &http.Server{
		Handler: mux,
		Addr:    s.addr,
	}

	fmt.Printf("---Server running on--- port:%v", srv.Addr)

	return srv.ListenAndServe()
}

// Book Routes
func getBooks(w http.ResponseWriter, r *http.Request) {
	var books []Book
	query := `SELECT * FROM books`
	rows, err := DB.Query(query)
	if err != nil {
		http.Error(w, "Internal server Error Unable to fetch Books", http.StatusInternalServerError)
		return
	}
	for rows.Next() {
		var book Book
		if err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.Genre, &book.Description, &book.Availability, &book.Image); err != nil {
			http.Error(w, "Unable to scan the rows", http.StatusInternalServerError)
			return
		}
		books = append(books, book)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusFound)
	json.NewEncoder(w).Encode(books)
}

func postBooks(w http.ResponseWriter, r *http.Request) {
	var newBook CreateBook

	err := json.NewDecoder(r.Body).Decode(&newBook)
	if err != nil {
		http.Error(w, "Failed to parse json", http.StatusBadRequest)
		return
	}
	var id int
	query := `INSERT INTO books (title, author, genre, description, availability, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	err = DB.QueryRow(query, newBook.Title, newBook.Author, newBook.Genre, newBook.Description, newBook.Availability, newBook.Image).Scan(&id)
	if err != nil {
		http.Error(w, "Failed to insert book", http.StatusInternalServerError)
		return
	}

	// Create a response with the new book's ID and details
	book := Book{
		ID:           id,
		Title:        newBook.Title,
		Author:       newBook.Author,
		Genre:        newBook.Genre,
		Description:  newBook.Description,
		Availability: newBook.Availability,
		Image:        newBook.Image,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(book)
}

func deleteBooks(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id < 0 {
		http.NotFound(w, r)
		return
	}
	query := `DELETE FROM books WHERE id = $1`
	_, err = DB.Exec(query, id)
	if err != nil {
		http.Error(w, "Failed to delete book", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Book deleted successfully"))
}

func updateBooks(w http.ResponseWriter, r *http.Request) {
	var updatedBook CreateBook
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	err = json.NewDecoder(r.Body).Decode(&updatedBook)
	if err != nil {
		http.Error(w, "Failed to Parse json", http.StatusInternalServerError)
		return
	}
	query := `UPDATE books 
        SET title = $1, author = $2, genre = $3, description = $4, availability = $5, image = $6
        WHERE id = $7`
	_, err = DB.Exec(query, updatedBook.Title, updatedBook.Author, updatedBook.Genre, updatedBook.Description, updatedBook.Availability, updatedBook.Image, id)
	if err != nil {
		http.Error(w, "Failed to Update", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Book updated successfully"))
}

// // User routes
func signUp(w http.ResponseWriter, r *http.Request) {
	var newUser User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusInternalServerError)
		return
	}
	var existingUser string
	query := `SELECT email FROM users WHERE email = $1`
	err = DB.QueryRow(query, newUser.Email).Scan(&existingUser)
	if err == nil {
		http.Error(w, "Email already in use", http.StatusConflict) // 409 Conflict
		return
	} else if err != sql.ErrNoRows {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash the password", http.StatusInternalServerError)
		return
	}
	query = `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`
	_, err = DB.Exec(query, newUser.Username, newUser.Email, hashedPassword, newUser.Role)
	if err != nil {
		http.Error(w, "Unable to Register User", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User created Successfully"))
}

// func login(w http.ResponseWriter, r *http.Request){

// }

// func updateUserDetails(w http.ResponseWriter, r *http.Request){

// }

// // Borrowing and Returning routes
func borrow(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	// Check if the book is already borrowed
	var availability bool
	query := `SELECT availability FROM books WHERE id = $1`
	err = DB.QueryRow(query, id).Scan(&availability)
	if err != nil {
		http.Error(w, "Failed to check book availability", http.StatusInternalServerError)
		return
	}
	if !availability {
		http.Error(w, "Book is already borrowed", http.StatusBadRequest)
		return
	}

	// Update availability to false
	query = `UPDATE books SET availability = false WHERE id = $1`
	_, err = DB.Exec(query, id)
	if err != nil {
		http.Error(w, "Failed to borrow book", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Successfully borrowed book"))
}

func returning(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	var availability bool
	query := `SELECT availability FROM books WHERE id = $1`
	err = DB.QueryRow(query, id).Scan(&availability)
	if err != nil {
		http.Error(w, "Failed to check book availability", http.StatusInternalServerError)
		return
	}
	if availability {
		http.Error(w, "Book is already returned", http.StatusBadRequest)
		return
	}

	// Update availability to true
	query = `UPDATE books SET availability = true WHERE id = $1`
	_, err = DB.Exec(query, id)
	if err != nil {
		http.Error(w, "Failed to return book", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Successfully returned book"))
}
