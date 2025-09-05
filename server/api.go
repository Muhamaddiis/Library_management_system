package main

import (
	"context"
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

type UserProfile struct {
	User     User           `json:"user"`
	Books    []BorrowedBook `json:"borrowed_books"`
	Fines    []UserFine     `json:"unpaid_fines"`
}

type Fines struct {
	ID       int     `json:"id"`
	UserID   int     `json:"user_id"`
	BookID   int     `json:"book_id"`
	FineAmt  float64 `json:"fine_amount"`
	FineDate string  `json:"fine_date"`
	Status   string  `json:"status"`
}

type Borrowings struct {
	ID         int     `json:"id"`
	UserId     int     `json:"user_id"`
	BookId     int     `json:"book_id"`
	BorrowDate string  `json:"borrow_date"`
	ReturnDate *string `json:"return_date"`
	DueDate    string  `json:"due_date"`
	Renewed    bool    `json:"renewed"`
}

type BorrowedBook struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Author      string    `json:"author"`
	Image       string    `json:"image"`
	BorrowDate  time.Time `json:"borrow_date"`
	DueDate     time.Time `json:"due_date"`
	Renewed     bool      `json:"renewed"`
}

type UserFine struct {
	ID        int     `json:"id"`
	BookTitle string  `json:"book_title"`
	Amount    float64 `json:"amount"`
	Date      string  `json:"date"`
	Status    string  `json:"status"`
	
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
	mux.HandleFunc("GET /books/{id}", getBookById)
	mux.HandleFunc("POST /books", postBooks)
	mux.HandleFunc("DELETE /books/{id}", deleteBooks)
	mux.HandleFunc("PUT /books/{id}", updateBooks)
	mux.Handle("POST /borrow/{id}", jwtMiddleware(http.HandlerFunc(borrow)))
	mux.Handle("POST /return/{id}", jwtMiddleware(http.HandlerFunc(returning)))
	mux.HandleFunc("POST /signup", signUp)
	mux.HandleFunc("POST /login", login)
	mux.Handle("GET /me", jwtMiddleware(http.HandlerFunc(meHandler)))
	mux.HandleFunc("GET /users", getUsers)
	mux.HandleFunc("GET /users/{id}", getUsersbyId)
	mux.HandleFunc("GET /fines", getFines)
	mux.HandleFunc("GET /fines/{id}", getFinesUserId)
	mux.Handle("GET /profile", jwtMiddleware(http.HandlerFunc(getUserProfile)))
	mux.HandleFunc("PATCH /fines/{id}", updateFinePayment)
	mux.HandleFunc("GET /borrowings", borrowings)
	mux.HandleFunc("PUT /updateUser/{id}", updateUserDetails)
	mux.Handle("GET /profile/books", jwtMiddleware(http.HandlerFunc(getUserBorrowedBooks)))
	mux.Handle("GET /profile/fines", jwtMiddleware(http.HandlerFunc(getUserFines)))
	mux.Handle("POST /profile/renew/{id}", jwtMiddleware(http.HandlerFunc(renewBook)))
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Replace with your frontend URL
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
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

func getBookById(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id < 0 {
		http.NotFound(w, r)
		return
	}
	var book Book
	query := `SELECT * FROM books WHERE id = $1`
	err = DB.QueryRow(query, id).Scan(&book.ID, &book.Title, &book.Author, &book.Genre, &book.Description, &book.Availability, &book.Image)
	if err != nil {
		http.Error(w, "Failed to fetch book", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(book)
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
	// Create a context with a timeout (e.g., 5 seconds)
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel() // Always call cancel to release resources

	var newUser CreateUser
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest) // 400 Bad Request
		return
	}
	if newUser.Role == "" {
		newUser.Role = "user"
	}
	// Check if the email already exists
	var existingUser string
	query := `SELECT email FROM users WHERE email = $1`
	err = DB.QueryRowContext(ctx, query, newUser.Email).Scan(&existingUser)
	if err == nil {
		http.Error(w, "Email already in use", http.StatusConflict) // 409 Conflict
		return
	} else if err != sql.ErrNoRows {
		log.Printf("Database error: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError) // 500 Internal Server Error
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash password: %v", err)
		http.Error(w, "Failed to hash the password", http.StatusInternalServerError) // 500 Internal Server Error
		return
	}

	// Insert the new user into the database
	query = `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`
	_, err = DB.ExecContext(ctx, query, newUser.Username, newUser.Email, hashedPassword, newUser.Role)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "Unable to register user", http.StatusInternalServerError) // 500 Internal Server Error
		return
	}

	// Respond with success message
	w.WriteHeader(http.StatusCreated) // 201 Created
	w.Write([]byte("User created successfully"))
}

func login(w http.ResponseWriter, r *http.Request) {
	// Create a context with a timeout (e.g., 5 seconds)
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel() // Always call cancel to release resources

	// Parse the user request
	var loginUser CreateUser
	err := json.NewDecoder(r.Body).Decode(&loginUser)
	if err != nil {
		http.Error(w, "Unable to parse JSON", http.StatusBadRequest) // 400 Bad Request
		return
	}

	// Check if the username exists in the database
	var dbUser User
	query := `SELECT id, username, password, role FROM users WHERE username = $1`
	err = DB.QueryRowContext(ctx, query, loginUser.Username).Scan(&dbUser.ID, &dbUser.Username, &dbUser.Password, &dbUser.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid Username or Password", http.StatusUnauthorized) // 401 Unauthorized
			return
		}
		log.Printf("Database error: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError) // 500 Internal Server Error
		return
	}

	// Compare the provided password with the hashed password in the database
	err = bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(loginUser.Password))
	if err != nil {
		http.Error(w, "Invalid Username or Password", http.StatusUnauthorized) // 401 Unauthorized
		return
	}

	// Create JWT Token
	tokenStr, err := createToken(dbUser.ID, dbUser.Username, dbUser.Role)
	if err != nil {
		log.Printf("Failed to generate token: %v", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError) // 500 Internal Server Error
		return
	}

	// Set the token in a cookie
	expirationTime := time.Now().Add(24 * time.Hour) // Token expires in 24 hours
	cookie := http.Cookie{
		Name:     "token",
		Value:    tokenStr,
		Expires:  expirationTime,
		HttpOnly: true,
		Secure:   false, // ❗ MUST be false on localhost
		SameSite: http.SameSiteNoneMode, // Use Lax for GET requests like /me
	}
	http.SetCookie(w, &cookie)
	

	// Respond with the token in JSON format
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
		if err := rows.Scan(&user.ID, &user.Email, &user.Username, &user.Role); err != nil {
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
func getUsersbyId(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		log.Println("Missing ID in URL")
		http.Error(w, `{"error": "Missing user ID"}`, http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		log.Printf("Invalid ID: %v", err)
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var user User
	query := `SELECT id, email, username, role FROM users WHERE id = $1`
	log.Printf("Executing query: %s with ID: %d", query, id)

	err = DB.QueryRow(query, id).Scan(&user.ID, &user.Email, &user.Username, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("User not found with ID: %d", id)
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
		} else {
			log.Printf("Database error: %v", err)
			http.Error(w, `{"error": "Failed to fetch user"}`, http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}
func getUserProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := extractUserIDFromCookie(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var user User
	query := `SELECT id, username, email, password, role FROM users WHERE id = $1`
	err = DB.QueryRow(query, userID).Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Role)
	if err != nil {
		http.Error(w, "Failed to fetch user details", http.StatusInternalServerError)
		return
	}

	// Get borrowed books
	bookQuery := `
		SELECT b.id, b.title, b.author, b.image, br.borrow_date, br.due_date, br.renewed
		FROM borrowings br
		JOIN books b ON br.book_id = b.id
		WHERE br.user_id = $1 AND br.return_date IS NULL
	`
	bookRows, err := DB.Query(bookQuery, userID)
	if err != nil {
		http.Error(w, "Failed to fetch borrowed books", http.StatusInternalServerError)
		return
	}
	defer bookRows.Close()

	var books []BorrowedBook
	for bookRows.Next() {
		var book BorrowedBook
		if err := bookRows.Scan(&book.ID, &book.Title, &book.Author, &book.Image, &book.BorrowDate, &book.DueDate, &book.Renewed); err == nil {
			books = append(books, book)
		}
	}

	// Get unpaid fines
	fineQuery := `
		SELECT f.id, b.title, f.fine_amount, f.fine_date, f.status
		FROM fines f
		JOIN books b ON f.book_id = b.id
		WHERE f.user_id = $1 AND f.status = 'Unpaid'
	`
	fineRows, err := DB.Query(fineQuery, userID)
	if err != nil {
		http.Error(w, "Failed to fetch fines", http.StatusInternalServerError)
		return
	}
	defer fineRows.Close()

	var fines []UserFine
	for fineRows.Next() {
		var fine UserFine
		if err := fineRows.Scan(&fine.ID, &fine.BookTitle, &fine.Amount, &fine.Date, &fine.Status); err == nil {
			fines = append(fines, fine)
		}
	}

	profile := map[string]interface{}{
        "user":          user,
        "borrowedBooks": books,
        "fines":         fines,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(profile)
}


func meHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil {
		http.Error(w, "Missing token", http.StatusUnauthorized)
		return
	}

	claims := &Claims{}
	tokenStr := cookie.Value
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id":  claims.UserID,
		"username": claims.Username,
		"role":     claims.Role,
	})
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

func updateUserDetails(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var updatedUser User
	if err := json.NewDecoder(r.Body).Decode(&updatedUser); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Validate role
	if updatedUser.Role != "admin" && updatedUser.Role != "user" {
		http.Error(w, `{"error": "Invalid role"}`, http.StatusBadRequest)
		return
	}

	query := `UPDATE users SET email = $1, username = $2, role = $3 WHERE id = $4 RETURNING id, email, username, role`
	var user User
	err = DB.QueryRow(query, updatedUser.Email, updatedUser.Username, updatedUser.Role, id).Scan(&user.ID, &user.Email, &user.Username, &user.Role)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, `{"error": "Failed to update user"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

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
func getUserBorrowedBooks(w http.ResponseWriter, r *http.Request) {
    userID, err := extractUserIDFromCookie(r)
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    query := `
        SELECT b.id, b.title, b.author, b.image, 
               br.borrow_date, br.due_date, br.renewed
        FROM borrowings br
        JOIN books b ON br.book_id = b.id
        WHERE br.user_id = $1 AND br.return_date IS NULL
    `
    rows, err := DB.Query(query, userID)
    if err != nil {
        http.Error(w, "Failed to fetch borrowed books", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var books []BorrowedBook
    for rows.Next() {
        var book BorrowedBook
        err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.Image, 
                         &book.BorrowDate, &book.DueDate, &book.Renewed)
        if err != nil {
            log.Printf("Error scanning book row: %v", err)
            continue
        }
        books = append(books, book)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(books)
}
func returning(w http.ResponseWriter, r *http.Request) {
	userID, err := extractUserIDFromCookie(r)
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Parse book ID from request
    bookId, err := strconv.Atoi(r.PathValue("id"))
    if err != nil {
        http.Error(w, "Invalid book ID", http.StatusBadRequest)
        return
    }

    // Check if this user is the one who borrowed the book
    var borrowingUserID int
    query := `SELECT user_id FROM borrowings WHERE book_id = $1 AND return_date IS NULL`
    err = DB.QueryRow(query, bookId).Scan(&borrowingUserID)
    
    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "No active borrowing record found for this book", http.StatusNotFound)
        } else {
            http.Error(w, "Database error", http.StatusInternalServerError)
        }
        return
    }

    // Verify the current user is the borrower
    if userID != borrowingUserID {
        http.Error(w, "You can only return books you borrowed", http.StatusForbidden)
        return
    }
	var availability bool
	query = `SELECT availability FROM books WHERE id = $1`
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
		if err := rows.Scan(&fine.ID, &fine.UserID, &fine.BookID, &fine.FineAmt, &fine.FineDate, &fine.Status); err != nil {
			http.Error(w, "Unable to Scan Fines", http.StatusInternalServerError)
			return
		}
		fines = append(fines, fine)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(fines)
}
func getUserFines(w http.ResponseWriter, r *http.Request) {
    userID, err := extractUserIDFromCookie(r)
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    query := `
        SELECT f.id, b.title, f.fine_amount, f.fine_date, f.status
        FROM fines f
        JOIN books b ON f.book_id = b.id
        WHERE f.user_id = $1 AND f.status = 'Unpaid'
    `
    rows, err := DB.Query(query, userID)
    if err != nil {
        http.Error(w, "Failed to fetch fines", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var fines []UserFine
    for rows.Next() {
        var fine UserFine
        err := rows.Scan(&fine.ID, &fine.BookTitle, &fine.Amount, &fine.Date, &fine.Status)
        if err != nil {
            log.Printf("Error scanning fine row: %v", err)
            continue
        }
        fines = append(fines, fine)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(fines)
}
func getFinesUserId(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid User ID", http.StatusBadRequest)
		return
	}

	var fines []Fines
	query := `SELECT * FROM fines WHERE user_id = $1`
	rows, err := DB.Query(query, id)
	if err != nil {
		http.Error(w, "Failed to query fines", http.StatusInternalServerError)
		log.Printf("Error querying fines: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var fine Fines
		if err := rows.Scan(&fine.ID, &fine.UserID, &fine.BookID, &fine.FineAmt, &fine.FineDate, &fine.Status); err != nil {
			http.Error(w, "Failed to scan fines", http.StatusInternalServerError)
			return
		}
		fines = append(fines, fine)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(fines)
}

func updateFinePayment(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid User ID: %s", idStr)
		http.Error(w, "Invalid User ID", http.StatusBadRequest)
		return
	}

	var fine Fines
	if err := json.NewDecoder(r.Body).Decode(&fine); err != nil {
		log.Printf("Invalid request body: %v", err)
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	log.Printf("Updating fine: ID=%d, Status=%s", id, fine.Status)
	if fine.Status != "Paid" && fine.Status != "Unpaid" {
		log.Printf("Invalid status: %s", fine.Status)
		http.Error(w, `{"error": "Invalid status. Allowed values: Paid, Unpaid"}`, http.StatusBadRequest)
		return
	}

	query := `UPDATE fines SET status = $1 WHERE id = $2 RETURNING id, user_id, book_id, fine_amount, fine_date, status`
	err = DB.QueryRow(query, fine.Status, id).Scan(&fine.ID, &fine.UserID, &fine.BookID, &fine.FineAmt, &fine.FineDate, &fine.Status)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No fine found for User ID: %d", id)
			http.Error(w, `{"error": "Fine not found"}`, http.StatusNotFound)
		} else {
			log.Printf("Failed to update fine status: %v", err)
			http.Error(w, `{"error": "Failed to update fine status"}`, http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fine)
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
func renewBook(w http.ResponseWriter, r *http.Request) {
    userID, err := extractUserIDFromCookie(r)
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    bookID, err := strconv.Atoi(r.PathValue("id"))
    if err != nil {
        http.Error(w, "Invalid book ID", http.StatusBadRequest)
        return
    }

    // Check if book is already renewed
    var renewed bool
    err = DB.QueryRow(
        "SELECT renewed FROM borrowings WHERE user_id = $1 AND book_id = $2 AND return_date IS NULL",
        userID, bookID,
    ).Scan(&renewed)
    
    if err != nil {
        http.Error(w, "Book not found or already returned", http.StatusNotFound)
        return
    }

    if renewed {
        http.Error(w, "Book already renewed", http.StatusBadRequest)
        return
    }

    // Update due date (add 14 more days) and mark as renewed
    _, err = DB.Exec(
        "UPDATE borrowings SET due_date = due_date + INTERVAL '14 days', renewed = true WHERE user_id = $1 AND book_id = $2",
        userID, bookID,
    )
    
    if err != nil {
        http.Error(w, "Failed to renew book", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Book renewed successfully"))
}