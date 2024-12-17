package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"

	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

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
type CreateUser struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

type Fines struct {
	ID       int     `json:"id"`
	UserID   int     `json:"user_id"`
	BookID   int     `json:"book_id"`
	FineAmt  float64 `json:"fine_amount"`
	FineDate string  `json:"fine_date"`
}

type Borrowings struct {
	ID         int    `json:"id"`
	UserId     int    `json:"user_id"`
	BookId     int    `json:"book_id"`
	BorrowDate string `json:"borrow_date"`
	ReturnDate *string `json:"return_date"`
	DueDate    string `json:"due_date"`
	Renewed    bool   `json:"renewed"`
}

var secretKey []byte
var expirationTime time.Time = time.Now().Add(24 * time.Hour)

func NewApiserver(addr string) *ApiServer {
	return &ApiServer{
		addr: addr,
	}
}

func (s *ApiServer) Run() error {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	secretKey = []byte(os.Getenv("SECRET_KEY"))
	mux := http.NewServeMux()
	mux.HandleFunc("GET /books", getBooks)
	mux.Handle("POST /books", jwtMiddleware(adminMiddleware(http.HandlerFunc(postBooks))))
	mux.Handle("DELETE /books/{id}", jwtMiddleware(adminMiddleware(http.HandlerFunc(deleteBooks))))
	mux.Handle("PUT /books/{id}", jwtMiddleware(adminMiddleware(http.HandlerFunc(updateBooks))))
	mux.Handle("POST /borrow/{id}", jwtMiddleware(http.HandlerFunc(borrow)))
	mux.Handle("POST /return/{id}", jwtMiddleware(http.HandlerFunc(returning)))
	mux.HandleFunc("POST /signup", signUp)
	mux.HandleFunc("POST /login", login)
	mux.HandleFunc("GET /users", getUsers)
	mux.HandleFunc("GET /fines", getFines)
	mux.HandleFunc("GET /borrowings", borrowings)
	// mux.HandleFunc("PUT /update", updateUserDetails)
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Replace with your frontend URL
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Wrap mux with CORS middleware
	handler := corsMiddleware.Handler(mux)
	srv := &http.Server{
		Handler: handler,
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
	w.WriteHeader(http.StatusOK)
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
		log.Printf("Database error: %v", err)
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
		log.Printf("Database error: %v", err)
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
		log.Printf("Database error: %v", err)
		http.Error(w, "Failed to Update", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Book updated successfully"))
}

// // User routes
func signUp(w http.ResponseWriter, r *http.Request) {
	var newUser CreateUser
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusInternalServerError)
		return
	}
	var existingUser string
	query := `SELECT email FROM users WHERE email = $1`
	err = DB.QueryRow(query, newUser.Email).Scan(&existingUser)
	if err == nil {
		log.Printf("Database error: %v", err)
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
		log.Printf("Database error: %v", err)
		http.Error(w, "Unable to Register User", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User created Successfully"))
}

func login(w http.ResponseWriter, r *http.Request) {
	var loginUser CreateUser
	// Parse the user request
	err := json.NewDecoder(r.Body).Decode(&loginUser)
	if err != nil {
		http.Error(w, "Unable to parse json", http.StatusInternalServerError)
		return
	}
	var dbUser User
	// Check with the database
	query := `SELECT id, username, password, role FROM users WHERE username = $1`
	err = DB.QueryRow(query, loginUser.Username).Scan(&dbUser.ID, &dbUser.Username, &dbUser.Password, &dbUser.Role)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			http.Error(w, "Invalid Username or Password", http.StatusUnauthorized)
			return
		}
		log.Printf("Database error: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(loginUser.Password))
	if err != nil {
		http.Error(w, "Invalid Username or Password", http.StatusUnauthorized)
		return
	}
	// Create JWT Token
	tokenStr, err := createToken(dbUser.ID, dbUser.Username, dbUser.Role)
	if err != nil {
		http.Error(w, "Failed to generate Token,", http.StatusInternalServerError)
		return
	}
	cookie := http.Cookie{
		Name:     "token",
		Value:    tokenStr,
		Expires:  expirationTime,
		HttpOnly: true,
	}
	http.SetCookie(w, &cookie)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LoginResponse{Token: tokenStr})

}

func getUsers(w http.ResponseWriter, r *http.Request) {
	var users []User
	query := `SELECT id, email, username, role from users`
	rows, err := DB.Query(query)
	if err != nil {
		http.Error(w, "Unable to query user table", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Role); err != nil {
			http.Error(w, "Unable to scan the user rows", http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(users); err != nil {
		http.Error(w, "Error encoding JSON response", http.StatusInternalServerError)
		return
	}
}

func createToken(userID int, username, role string) (string, error) {

	claims := &Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

func extractUserIDFromCookie(r *http.Request) (int, error) {
	cookies, err := r.Cookie("token")
	if err != nil {
		return 0, fmt.Errorf("no token Cookie")
	}

	tokenString := cookies.Value

	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil || !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}

	return claims.UserID, nil
}

// func updateUserDetails(w http.ResponseWriter, r *http.Request){

// }

// // Borrowing and Returning routes
func borrow(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from cookie
	userID, err := extractUserIDFromCookie(r)
	if err != nil {
		http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// Parse book ID from request path
	idStr := r.PathValue("id") // Assuming r.PathValue is a custom method to extract path variables
	bookId, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	// Check if the book is available
	var availability bool
	query := `SELECT availability FROM books WHERE id = $1`
	err = DB.QueryRow(query, bookId).Scan(&availability)
	if err != nil {
		log.Printf("Error checking book availability: %v", err)
		http.Error(w, "Failed to check book availability", http.StatusInternalServerError)
		return
	}
	if !availability {
		http.Error(w, "Book is already borrowed", http.StatusBadRequest)
		return
	}

	// Update book availability
	query = `UPDATE books SET availability = false WHERE id = $1`
	_, err = DB.Exec(query, bookId)
	if err != nil {
		log.Printf("Error updating book availability: %v", err)
		http.Error(w, "Failed to borrow book", http.StatusInternalServerError)
		return
	}

	// Insert borrowing record
	borrowDate := time.Now()
	dueDate := borrowDate.AddDate(0, 0, 14) // Default borrow duration is 14 days
	renewed := false
	query = `INSERT INTO borrowings (user_id, book_id, borrow_date, due_date, renewed) VALUES ($1, $2, $3, $4, $5)`
	_, err = DB.Exec(query, userID, bookId, borrowDate, dueDate, renewed)
	if err != nil {
		log.Printf("Error inserting borrowing record: %v", err)
		http.Error(w, "Failed to update borrowings", http.StatusInternalServerError)
		return
	}

	// Respond with success
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Successfully borrowed book"))
}

func returning(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	bookId, err := strconv.Atoi(idStr)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	var availability bool
	query := `SELECT availability FROM books WHERE id = $1`
	err = DB.QueryRow(query, bookId).Scan(&availability)
	if err != nil {
		http.Error(w, "Failed to check book availability", http.StatusInternalServerError)
		return
	}
	if availability {
		http.Error(w, "Book is already returned", http.StatusBadRequest)
		return
	}

	// Retrieve the due date and user ID for the book borrowing
	var userID int
	var dueDate time.Time
	query = `SELECT user_id, due_date FROM borrowings WHERE book_id = $1 AND return_date IS NULL`
	err = DB.QueryRow(query, bookId).Scan(&userID, &dueDate)
	if err != nil {
		http.Error(w, "Failed to retrieve borrowing details", http.StatusInternalServerError)
		return
	}

	// Check if the book is overdue
	returnDate := time.Now()
	if returnDate.After(dueDate) {
		// Calculate the number of days overdue
		daysOverdue := int(returnDate.Sub(dueDate).Hours() / 24)
		fineAmount := float64(daysOverdue * 5) // Example: $5 per day overdue

		// Insert fine record into the fines table
		query = `INSERT INTO fines (user_id, book_id, fine_amount, fine_date) VALUES ($1, $2, $3, $4)`
		_, err = DB.Exec(query, userID, bookId, fineAmount, returnDate.Format("2006-01-02"))
		if err != nil {
			log.Printf("Database error: %v", err)
			http.Error(w, "Failed to create fine", http.StatusInternalServerError)
			return
		}
	}

	// Update availability to true
	query = `UPDATE books SET availability = true WHERE id = $1`
	_, err = DB.Exec(query, bookId)
	if err != nil {
		http.Error(w, "Failed to return book", http.StatusInternalServerError)
		return
	}

	query = `UPDATE borrowings SET return_date = $1 WHERE book_id = $2`
	_, err = DB.Exec(query, returnDate, bookId)
	if err != nil {
		log.Printf("failed to update return date %v", err)
		http.Error(w, "Failed to update the return Date", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Successfully returned book"))
}

func getFines(w http.ResponseWriter, r *http.Request) {
	var fines []Fines

	query := `SELECT * FROM fines`
	rows, err := DB.Query(query)
	if err != nil {
		http.Error(w, "Unable to Query Fines Table", http.StatusInternalServerError)
		return
	}

	for rows.Next() {
		var fine Fines
		if err := rows.Scan(&fine.ID, &fine.UserID, &fine.BookID, &fine.FineAmt, &fine.FineDate); err != nil {
			http.Error(w, "Unable to Scan Fines", http.StatusInternalServerError)
			return
		}
		fines = append(fines, fine)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(fines)
}

func borrowings(w http.ResponseWriter, r *http.Request) {
	var borrowings []Borrowings
	// Query to fetch data from the borrowings table
	query := `SELECT id, user_id, book_id, borrow_date, return_date, due_date, renewed FROM borrowings`
	rows, err := DB.Query(query)
	if err != nil {
		log.Printf("Error querying borrowings: %v", err)
		http.Error(w, "Unable to query borrowings", http.StatusInternalServerError)
		return
	}
	defer rows.Close() // Ensure rows are closed after use

	// Iterate through query results
	for rows.Next() {
		var borrow Borrowings
		if err := rows.Scan(&borrow.ID, &borrow.UserId, &borrow.BookId, &borrow.BorrowDate, &borrow.ReturnDate, &borrow.DueDate, &borrow.Renewed); err != nil {
			log.Printf("Error scanning borrowings: %v", err)
			http.Error(w, "Unable to scan borrowings", http.StatusInternalServerError)
			return
		}
		borrowings = append(borrowings, borrow)
	}

	// Check if no borrowings were found
	if len(borrowings) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "No borrowings found"}`))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(borrowings)
}
